# Plan — Persona-driven recommendation eval

Six phases. Each row below maps to a phase. Detailed steps for the
**active** phase live in `execution_plan.md`; when a phase ends,
`execution_plan.md` is cleared and replaced with the next phase's
steps. See `design.md` for what we're building.

When a task finishes, tick the box in both files in the same commit.

---

## Phase 1 — Persona seed + data shapes documented

- [x] 10 personas in `data/reco-personas/personas.json` (5 with family)
- [x] `data/db/schema/personas_schema.sql` + `personas_seed.sql`
- [x] Seeded orders + reviews (≥ 2 negative per persona)
- [x] `/home` loads cleanly when logged in as any persona
- [x] `docs/reco-persona-shape.md` + `docs/reco-family-shape.md`

## Phase 2 — Rule-derived ground truth

- [x] `lib/reco/types.ts` — `ExpectedTask` / `ExpectedSection` types
- [x] `lib/reco/eval/persona-truth.ts` — pure `buildExpected(persona)` rule
- [x] `data/reco-personas/overrides.json` — hand-override file + merge logic
- [x] `scripts/dump-persona-truth.ts` — CLI to print the rule's output per persona
- [x] Unit tests for the rule (hot-cuisines, sectioning, block list, family constraints, override merge)

## Phase 3 — OpenSearch baseline engine

- [x] OpenSearch sidecar in `config/docker-compose.demo.yaml`
- [x] `tools/reco-engines/opensearch/` implements `POST /recommend`
- [x] `scripts/seed-opensearch.ts` loads from SQLite (idempotent)
- [x] Engine registered in `config/reco-engines.json` (`baseline: true`)

## Phase 4 — Persona-aware UI sections

- [x] `/reco-eval` page — engine picker, results table, opensearch pinned as baseline
- [x] `components/cuisine-section.tsx` (3 familiar + 1 new)
- [x] `/home` renders sections when logged in as a persona
- [x] Non-persona users see untouched home feed

### How to test Phase 4

Login IDs (seeded users 3101–3110, password is literally `password`):
- **Persona:** `alice.tran@personas.demo` / `password` (Thai-heavy, no
  family). Any of the 10 `<first>.<last>@personas.demo` users works.
- **Non-persona control:** `john.doe@example.com` / `password`.

Steps:

1. Seed + start OpenSearch (baseline engine), then the app:
   ```bash
   sqlite3 data/db/dashdoor.db < data/db/schema/personas_seed.sql   # if not already seeded
   docker compose -f config/docker-compose.demo.yaml up -d opensearch
   npx tsx scripts/seed-opensearch.ts
   (cd tools/reco-engines/opensearch && npm start) &              # serves :4001
   npm run dev                                                    # serves :3000
   ```
2. **`/reco-eval`:** open `http://localhost:3000/reco-eval`. OpenSearch
   shows a "baseline" badge and cannot be unchecked. Pick a persona
   (default alice-tran), click **Run** → ranked table of restaurant
   names + cuisine appears.
3. **Persona sections:** sign in at `/login` as
   `alice.tran@personas.demo` / `password`, open `/home`. Labeled
   cuisine sections ("More Thai for you", etc.) render above the normal
   feed; one card per section is tagged "Try something new".
4. **Non-persona control:** sign in as `john.doe@example.com` /
   `password`, open `/home` → no cuisine sections, standard feed only.
   Personalization keys off whether the logged-in user is a persona
   (user_id 3101–3110), so non-personas always see the stock feed.

> ⚠️ Phase 4 code is implemented and working but **not yet committed**
> (`app/reco-eval/`, `app/api/reco/`, `components/cuisine-section.tsx`
> are untracked; `app/home/page.tsx` + `components/header.tsx` modified).
> Commit before moving Phase 5 forward.

## Phase 5 — Trajectory visibility

- [x] `RecoTrajectory` type added to `lib/reco/types.ts`
- [x] OpenSearch emits full trajectory via `_explain`
- [x] Other engines emit thin trajectories (candidate-gen + final)
- [x] `/reco-eval` drilldown modal renders the steps

## Phase 6 — Smoke + demo polish

- [x] `scripts/persona-demo-smoke.sh` end-to-end
- [x] `docs/PERSONA_DEMO.md` walkthrough
- [ ] `/demo` landing page updated with the persona story
- [x] **Make `/reco-eval` reachable without login.** Two client-side
      gates had to be exempted, both **unconditionally** (no flag):
      the redirect guard in `app/main-layout.tsx` and the
      `shouldShowContent` content gate in `components/layout-wrapper.tsx`
      (the latter was rendering an empty `<main>` for anon users).
- [x] ~~**Skip the OTP screen (demo only).**~~ Dropped — personas use
      the standard auth flow; no demo-only login path. The
      `NEXT_PUBLIC_RECO_DEMO` flag was removed entirely (it never
      propagated reliably to the Next dev worker).

## Phase 7 — BYO re-ranker, A/B vs. baseline

**Client story:** a prospect who wants to *improve their ranking model*
points their ranker at our gym. We hand it the **same candidate set the
baseline saw, plus per-candidate features**; their model returns an
ordered list (+ scores); we **score it against the persona ground truth
and show it side-by-side with OpenSearch** on `/reco-eval`, with
per-section win/loss and score attribution. This mirrors how real
catalog rankers work (Shopify-style: retrieve candidates → learned
ranker orders by features), so there's no "our system doesn't work like
that" gap.

Two ways to plug in, same A/B table:
- **Path A — BYO re-ranker endpoint (headline):** client hosts a
  `POST /recommend` that receives `{ personaId, topK, candidates:[{id,
  features}] }` and returns `{ ranked_ids, scores, trajectory }`.
- **Path B — BYO LLM key (on-ramp):** client supplies base URL + API
  key + model; *we* run a ranking prompt over the same candidates and
  route the call to **their** model. Key is **request-scoped, never
  persisted**.

> **Scope change (2026-05-29):** open-source Python engines (Gorse /
> LightFM / Implicit) are **dropped** — they don't serve the
> ranking-model client. The **agentic browse** path (LLM drives the
> app) is **shelved** as a separate later "AI shopping agent" demo, not
> the spine here: a ranking-model buyer ships a ranker, not an agent,
> and the agent's ranking is implicit + noisy to score. Reference code
> to port: commit `519ac1e` — `lib/reco/metrics.ts`,
> `lib/reco/eval/runner.ts`, `lib/reco/engines/` (incl. `makeHttpEngine`
> + the `customEngineUrl` / `agentLlmUrl` BYO passthrough).

- [ ] **Candidate + features payload** — define the candidate set the
      baseline retrieves (radius pool) and the per-candidate feature
      vector (cuisine-affinity match, price-tier match, distance, avg
      rating, persona past-order count, promo). Document the
      `POST /recommend` request/response contract in
      `docs/reco-http-contract.md` (recreate; design.md references it
      but it doesn't exist).
- [ ] **Metrics** — `lib/reco/metrics.ts`: score `ranked_ids` against
      `buildExpected(persona).flat_ranked_ids` (precision@k, recall@k,
      NDCG@k, overlap) + penalty for any `blocked_restaurant_ids` hit.
      Unit tests. (Port from `519ac1e`.)
- [ ] **Path B LLM re-ranker sidecar** — `tools/reco-engines/llm-ranker/`
      speaking the candidate+features contract, routing the ranking
      prompt to a BYO base URL / key / model (falls back to a
      server-default key). Emits `ranked_ids` + a thin trajectory
      (prompt as `query`, candidates as `candidate_gen`, picks as
      `final`). `:400X/health`.
- [ ] **Path A transient endpoint** — `/reco-eval` accepts a
      client-hosted `/recommend` URL; registered as a transient
      `custom` engine for that run only (port `makeHttpEngine` +
      `customEngineUrl`).
- [ ] **BYO panel UI** — `/reco-eval` panel with two tabs: "Use my
      endpoint" (URL) and "Use my LLM" (base URL + key + model).
      Request-scoped; UI states the key is never stored.
- [ ] **Multi-engine fan-out + A/B table** — `/reco-eval` runs baseline
      + BYO concurrently (today it only runs the first selected engine);
      comparison table with metric columns, **baseline column
      highlighted** as the line to beat, and per-section win/loss.
- [ ] **Score attribution in drilldown** — keep the OpenSearch `_explain`
      breakdown; for BYO show the returned per-candidate `scores` so the
      modal answers "why did this rank here" for any engine.
- [ ] **Engine registry + docs cleanup** — drop Python engines from
      `design.md`; `reco-engines.json` = opensearch (baseline) +
      llm-ranker (byo).
- [ ] **Demo + smoke** — extend `scripts/persona-demo-smoke.sh` to bring
      up the llm-ranker sidecar (server-default key) and assert a scored
      A/B result for alice-tran; update `docs/PERSONA_DEMO.md` and
      `/demo` with the BYO-ranker A/B story.

### Carried from Phase 6 (still open)

- [ ] `/demo` landing page updated with the persona story (rolls into
      the Phase 7 demo-copy step above).
- [ ] Smoke script exit criterion — `bash scripts/persona-demo-smoke.sh`
      exits 0 (Phase 7 extends this script, so verify at Phase 7 exit).

## Phase 8 — Label quality: outlier cleaning + adaptive exploration

Makes the ground truth (and therefore the A/B scores) smarter. All in
`lib/reco/eval/persona-truth.ts`; each addition is exposed as a tunable
constant and surfaced in the trajectory so the demo can *show* the
cleaning. These refine the labels the BYO ranker is graded against — and
double as eval scenarios ("did your model get fooled by the outlier?").

### 8a — Outlier / misattribution removal (before deriving hot cuisines)

Stop one-off or anomalous orders from polluting the preference signal.

- [ ] **Basket-size outliers** — flag orders whose item count / total is
      far above the persona's own distribution (robust: median + K·MAD,
      `OUTLIER_BASKET_MAD_K` default `3.0`). E.g. a 2× catering order
      shouldn't inflate that restaurant/cuisine's weight. Excluded from
      hot-cuisine and familiar-slot computation.
- [ ] **Cuisine one-offs** — a cuisine needs ≥ `MIN_CUISINE_SUPPORT`
      (default `2`) orders to count as *established/familiar*; a single
      order from a normally-uneaten cuisine is treated as noise, not a
      familiar cuisine (it may still seed an *explore* slot).
- [ ] **Affinity vs. behavior mismatch** — high order_count but ~0 stated
      affinity ⇒ possible misattribution (flag); high affinity but low
      order_count ⇒ stated-but-unproven (good explore candidate, not
      familiar).
- [ ] **Transparency** — excluded orders appear in the trajectory as a
      `filter` step with a reason ("order #X: 3.2× median basket —
      treated as outlier"). Unit tests for each rule.
- [ ] **Outlier eval scenario** — seed a known outlier into one
      persona's history; assert the cleaned rule ignores it, and use it
      as a demo case ("baseline ignored alice's one-time office order;
      did your model?").

### 8b — Adaptive exploration ratio (novelty_appetite drives explore/exploit)

Replace the fixed "3 familiar + 1 new" with a ratio driven by the
persona's `novelty_appetite` (0..1).

- [ ] **Ratio function** — `exploreCount(appetite)` over `SECTION_SIZE`:
      explorer (≥ `EXPLORE_HI`, default `0.66`) → 3 explore / 1 familiar;
      mid → 2 / 2; homebody (< `EXPLORE_LO`, default `0.33`) → 1 explore
      / 3 familiar. Replaces the `FAMILIAR_COUNT` constant.
- [ ] **UI** — `cuisine-section.tsx` tags *all* explore-slot cards "Try
      something new" (not just one); `novelty_index` generalizes to a
      set of explore indices.

### 8c — Complementary / next-order novelty (relevant exploration)

Make the explore slots *relevant* instead of random: "you ordered X →
here's a related Y to try."

- [ ] **Cuisine-adjacency map** — `data/reco-personas/cuisine-adjacency.json`
      (hand-curated v1: Thai↔Vietnamese↔Malaysian, Italian↔Mediterranean,
      …). Optionally derived later from cross-user co-order patterns.
- [ ] **Explore-slot fill** — explore slots prefer (1) new restaurants in
      the loved cuisine, then (2) restaurants in *adjacent* cuisines the
      persona hasn't tried, subject to the same block list / price /
      family constraints.
- [ ] **Set-level scoring for explore slots** — exploratory picks have no
      single right answer, so score explore slots as a *category/set*
      match (did the engine put a valid adjacent-cuisine candidate
      there?) rather than exact-ID, to avoid over-penalizing reasonable
      exploration. (Update `lib/reco/metrics.ts`.)
