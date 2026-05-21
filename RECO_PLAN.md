# Recommendation Engine Gym — Plan

This document tracks the work to turn the Dashdoor RL gym into an evaluation
harness for **recommendation engines** — both library/service engines plugged
in over an API, and LLM-based agents that drive the UI directly. It is a
phased, checkbox-style plan. Each phase has a goal, deliverables, and an exit
criterion. See `EXECUTION.md` for the detailed step-by-step plan of the
**current** phase only.

---

## Goals

1. **Engine plug-in track.** Let any recommendation engine implement a small
   adapter contract, plug into the gym, and be scored end-to-end on the same
   tasks with the same metrics.
2. **LLM-agent track.** Let an LLM-based agent drive the existing Dashdoor UI
   (the same surfaces a human sees) and be scored against the same expected
   recommendations.
3. **Demo-ready.** Everything ships as a single Docker image deployable to a
   VM, with a demo UI to run an eval, show metrics, and replay sessions.

A "recommendation" here is a ranked list of `restaurant_id`s or
`menu_item_id`s for a given user/context, scored against an expected set that
the gym either knows from task definitions or derives from order history.

---

## Phase 0 — Foundation: contract, harness, baselines, Gorse demo

> Phase 0 used to be a paper "decisions" doc — that's now Phase 1. We
> start with code because most decisions are easier to make once the
> contract and metrics exist.

**Goal:** an offline evaluation loop where three engines — `random`,
`popularity`, and **Gorse** — score a small fixed set of recommendation
tasks against ground truth, with results visible at a `/reco-eval` demo
page. No LLM agent yet, no UI re-ranking yet.

- [x] **0.1 Define the `RecommendationEngine` adapter contract**
  - [x] TypeScript interface `RecommendationEngine` with
        `recommend(ctx) → RecommendationResponse`
  - [x] HTTP variant: POST `/recommend` JSON contract for external engines
  - [x] Context payload: user id, address/lat-lng, surface, candidate pool,
        optional time/date, optional recent orders
- [x] **0.2 Build the in-repo engine registry**
  - [x] `lib/reco/engines/index.ts` registry
  - [x] `lib/reco/engines/popularity.ts` baseline (uses
        `/api/restaurants/popular-items` logic)
  - [x] `lib/reco/engines/random.ts` sanity-check baseline
  - [x] `lib/reco/engines/http.ts` adapter for any external HTTP engine
  - [x] `lib/reco/engines/gorse.ts` — Gorse-shaped adapter hitting
        `/api/recommend/{user}` and `/api/popular`. Feedback push on
        order-completion deferred to Phase 0 §0.7 alongside the seed
        script.
- [x] **0.3 Ground-truth + task set**
  - [x] 10 seed tasks pre-resolved into `data/reco-tasks/seed.json` —
        simplest single-restaurant-name lookups from
        `tasks/dashdoor.csv`. (40 such tasks exist; we keep 10 for the
        demo.)
  - [x] Order-history leave-one-out splitter in
        `lib/reco/eval/history-split.ts`.
- [x] **0.4 Metrics**
  - [x] `lib/reco/metrics.ts` — Hit@K, NDCG@K, MRR, Recall@K, Coverage.
  - [x] Per-task (`scoreTask`) and aggregate (`aggregate`) reporting.
  - [x] 14 unit tests, all green.
- [x] **0.5 Eval runner**
  - [x] `lib/reco/eval/runner.ts` — engine × task → `EvalReport`, with
        per-task error capture so one bad engine never aborts a run.
  - [x] Persist runs to `data/reco-runs/<runId>.json` via
        `lib/reco/eval/storage.ts`.
- [x] **0.6 Eval API + minimal demo UI**
  - [x] `POST /api/reco/eval` — runs synchronously, returns
        `{ runId, report }` (seed set is small enough).
  - [x] `GET  /api/reco/runs/[id]` — fetches a saved `EvalReport`.
  - [x] `GET  /api/reco/engines` — lists registered engines.
  - [x] `app/reco-eval/page.tsx` (server gate, `RECO_DEMO=1`) +
        `reco-eval-client.tsx` (interactive table + drilldown).
- [x] **0.7 Docker + Gorse sidecar**
  - [x] `Dockerfile.prod` build under the new code — verified via
        `docker compose -f config/docker-compose.reco.yaml up --build`
        (May 2026; see `gorse_work.md`).
  - [x] `RECO_DEMO=1` env flag gates `/reco-eval` (server-component
        `notFound()` if unset).
  - [x] Gorse service in **separate** `config/docker-compose.reco.yaml`
        (kept apart from `config/docker-compose.yaml` so the demo
        opt-in is explicit). Ports `:8087` dashboard, `:8088` API.
  - [x] `scripts/seed-gorse.ts` — restaurants → `/api/items`, users →
        `/api/users`, orders → `/api/feedback`. Idempotent.
  - [x] `RECO_GORSE_URL` env var consumed by `lib/reco/engines/gorse.ts`
        (default `http://gorse:8088`).

**Exit:** ✓ achieved (May 2026).

- `scripts/n.sh npm run dev` with `RECO_DEMO=1` boots; `/reco-eval`
  HTTP 200, all three engines listed, eval API returns metrics.
- Seed task set: `random` Hit@5=0.100, `popularity` Hit@5=0.000 (seed
  intentionally favors specific-restaurant lookups — popularity's miss
  is the correct signal).
- History split (n=18): `popularity` Hit@5=0.056 > `random` 0.000 ✓.
- Gorse compose verification (May 2026): `docker compose -f
  config/docker-compose.reco.yaml up --build`, seed script, history eval
  `run_mpehxjmq` with `gorse` Hit@5=0.000 ≥ `random` 0.000, zero
  per-task errors. Details in `gorse_work.md`.

> **The detailed checkboxes for this phase live in `docs/execution-phase-0.md`.**

---

## Phase 1 — Scope-firming after the foundation lands  *(½ day)*

Once Phase 0 is real, use it to lock the decisions that paper-only
scoping would otherwise have guessed at.

- [x] Surfaces in scope: `home_feed` (UI + engines) and `store_items`
      (engines only, no UI surface in Phase 0). `home_promo` and
      `search` deferred to Phase 2.
- [x] Ground-truth sources:
  - [x] Curated seed (`data/reco-tasks/seed.json`, 10 single-restaurant
        tasks).
  - [x] Order-history leave-one-out (`lib/reco/eval/history-split.ts`,
        uses the **order's** address, not the user's current default).
  - [x] Hand-curated personas — not needed.
- [x] Metric set confirmed: Hit@K, Recall@K, NDCG@K, MRR, Coverage. No
      conversion-proxy (engines don't simulate clicks yet).
- [x] LLM-agent driver: Playwright + CDP. Re-confirm when Phase 4
      starts; no code yet.
- [x] Three free engines: Gorse (wired up), LightFM + Implicit (Phase 2).
- [x] Plus `random` (sanity floor) and `popularity` baselines, both
      committed and tested.

**Exit:** ✓ one-page decisions doc committed at
`docs/reco-decisions.md` (May 2026), reflecting what's actually in the
Phase 0 build.

---

## Phase 2 — Plug in LightFM and Implicit via FastAPI sidecars

Two real ML engines, each in its own small Python sidecar, each fronted by
the same `/recommend` HTTP contract used by Gorse in Phase 1.

- [x] **2.1 LightFM sidecar** (`tools/reco-engines/lightfm/`)
  - [x] FastAPI app exposing `POST /recommend` (contract from
        `docs/reco-http-contract.md`).
  - [x] Trains at startup from the Dashdoor SQLite (orders
        interaction matrix + item features: cuisine, price tier,
        dashpass, restaurant_categories).
  - [x] WARP loss by default, configurable via `LIGHTFM_LOSS`.
        Persistence to disk deferred (training is fast).
  - [x] Dockerfile (`python:3.11-slim`), wired into
        `config/docker-compose.reco.yaml` as service `lightfm:8001`.
  - [x] Registered in the Next.js engine registry as `lightfm` via
        `http.ts`.
- [x] **2.2 Implicit sidecar** (`tools/reco-engines/implicit/`)
  - [x] FastAPI app exposing the same `POST /recommend` contract.
  - [x] ALS (default) + BPR (env-toggled). Item-to-item neighbors via
        `model.similar_items` on the `store_items` surface.
  - [x] Same DB-at-startup training pattern as LightFM.
  - [x] Dockerfile, wired into `config/docker-compose.reco.yaml` as
        service `implicit:8002`.
  - [x] Registered in the Next.js engine registry as `implicit` via
        `http.ts`.
- [x] **2.3** `docs/reco-http-contract.md` documents the shared
      request/response shape, error policy, version handshake, and
      health endpoint convention.
- [x] **2.4** `config/reco-engines.json` lets each engine be enabled/
      disabled and URL-overridden at runtime. Registry honors it
      transparently; missing file → all built-ins with defaults.
- [x] **2.5** `/reco-eval` already supports multi-select up to N
      engines and renders one row per engine. No UI changes needed —
      verified the existing markup handles 5 columns without
      overflow on viewing.
- [ ] **2.6** Optional Recombee vendor stub — **skipped** for now,
      easy follow-up via `makeHttpEngine` if the demo wants a hosted
      SaaS comparison.

**Exit:** ✓ achieved (May 2026).

- [x] Five engines all serve `/reco-eval` without errors (0/90 per-task
      errors on history split).
- [x] **Both** LightFM (Hit@5 = 0.333) and Implicit (Hit@5 = 0.556)
      beat `popularity` (Hit@5 = 0.056) decisively. Sample report:
      `docs/samples/reco-report-5engines.json`.

> Gorse coverage is low (0.010) — it's hitting its popular-items
> fallback instead of personalizing. Tracked separately in
> `gorse_work.md`; doesn't block Phase 2.

---

## Phase 3 — Live re-ranking of the UI  **(active — `EXECUTION.md`)**

Engines stop being a `/reco-eval`-only feature. The demo header gets
an engine picker; the actual `/home` feed visibly re-orders when the
user changes it. Currently active — full checklist in `EXECUTION.md`.

- [x] **3.1** Header engine picker
      (`components/reco-engine-picker.tsx`), gated by
      `NEXT_PUBLIC_RECO_DEMO=1`. Reads from `/api/reco/engines`;
      writes to `store/app-store.ts` `activeRecoEngine`, persisted.
- [x] **3.2** `useReco({ engine, ctx })` hook
      (`lib/reco/hooks/use-reco.ts`) + `POST /api/reco/predict`
      endpoint. Engine-side failures fall back to `items: []` so
      `/home` never breaks.
- [x] **3.3** `app/home/page.tsx` applies the ranking via
      `applyRanking(baseRestaurants, recoRankedIds)`. Re-rank flows
      through *every* section automatically (sections all derive
      from the renamed `actualRestaurants`). Never drops items.
- [x] **3.4** Replaced "via {engine}" per-card badge with a single
      header-level status pill ("re-ranked by {engine}"). Same demo
      signal, smaller blast radius — no edits to the shared
      restaurant card component.
- [x] **3.5** Production-mode regression verified by dev-server smoke:
      with `RECO_DEMO` unset, no picker testid, no badge, no
      `/api/reco/predict` calls.

**Exit:** ✓ achieved (May 2026).

- Header picker re-orders `/home`; status pill confirms which engine
  is active.
- Production flow (no `RECO_DEMO`) bit-identical to before; full unit
  suite **1677 passing / 3 skipped / 0 failed**, `tsc` clean.
- Visual screenshots: `docs/screenshots/phase3-rerank-{gorse,lightfm,implicit}.png`
  (local; commit when ready).
- **Full e2e suite green:** deferred to a **separate triage pass** — May
  2026 `test:e2e:chromium` was 32 passed / 118 failed (address/auth/checkout
  dominated; not reco-related). See `PARALLEL_WORK.md` §A.

Detailed regression matrix lives in `EXECUTION.md` §5.

---

## Phase 4 — LLM-agent track

- [ ] **4.1** Define the agent interface: input = task statement +
      `start_url`; output = a sequence of UI actions and a final
      "recommendation set" extracted from what it clicked/ordered.
- [ ] **4.2** Build the agent driver (`tools/reco-agent/`):
  - [ ] Headless browser session (Playwright) with the running container
  - [ ] DOM observation + action loop (click, type, scroll, navigate)
  - [ ] Hook into the existing verifier-store events so we know what the agent
        actually selected
- [ ] **4.3** Score the agent run with the same metrics as Phase 1 by mapping
      the agent's actions to a recommendation set:
  - [ ] First-N restaurants the agent visits → ranked list
  - [ ] Item(s) the agent added to cart → top-1
  - [ ] Final ordered restaurant/items → top-1 hard target
- [ ] **4.4** Persist agent traces (screenshots + DOM snapshots + actions) for
      replay in the demo UI.
- [ ] **4.5** Demo page: `/reco-eval/agent` — pick a task, pick a model, run,
      watch the trace, see the score.

**Exit:** kick off an LLM-agent eval from the demo UI, watch it drive the
Dashdoor UI, and get a score on the same Hit@K/NDCG@K board as the engine
track.

---

## Phase 5 — Demo polish & VM deployment

- [ ] **5.1** Single `docker run` brings up everything (Next.js + DBs + demo
      UI). No external services required for the popularity-baseline demo.
- [ ] **5.2** Compose file (`config/docker-compose.yaml`) for the cases where
      an external recommendation engine or LLM provider is needed.
- [ ] **5.3** Landing page at `/` (or `/demo`) that explains the two tracks
      and links to the eval pages.
- [ ] **5.4** Lock down: no auth required for demo, but rate-limit eval kickoff
      and log API keys only from env.
- [ ] **5.5** Deploy doc (`docs/deploy.md`) — VM setup, ports, env vars,
      seeding the DB, smoke test.
- [ ] **5.6** Pre-canned demo scripts (`scripts/demo-*.sh`) for the most-likely
      live demos.

**Exit:** stakeholder can open a URL, pick a task + engines (and optionally an
LLM agent), hit "Run", and see a live evaluation with metrics and traces.

---

## Out of scope (for now)

- Training new recommendation models inside the gym.
- A/B testing against real users.
- Multi-tenant auth, billing, quotas.
- Merchant- and delivery-side recommendation surfaces (only consumer is in
  scope until Phase 5 ships).

---

## Pointer

- **What we're doing & where to find it:** `CLAUDE.md`
- **Current phase, step by step:** `EXECUTION.md`
