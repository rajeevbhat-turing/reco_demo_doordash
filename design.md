# Design — Persona-driven recommendation eval

## Goal

Let a client **bring their own ranking model** and A/B it against
**persona-aware ground truth**, with **OpenSearch as the named
baseline**. The client's ranker scores the same candidate set the
baseline saw (Shopify-style: retrieve candidates → rank by features);
two BYO paths — a client-hosted `/recommend` endpoint, or their LLM
key/endpoint driving our ranking prompt. The same persona logic drives
the `/home` UI, and every engine emits a **trajectory** so we can see
*why* it ranked the way it did. (The open-source Python engines and the
agentic-browse path are out — see `plan.md` Phase 7.)

## 10 personas

Ten consumers seeded as real users in `data/db/dashdoor.db` (rows
3101–3110). Each persona has:

- A seven-dimension preference profile (below).
- 8–20 seeded orders consistent with their preferences.
- 5–15 seeded reviews — **at least 2 are ≤ 2★** so the "avoid
  negative reviews" rule has something to bite on.

**Five of the ten** also have a family block.

## Preferences — seven dimensions

| Dimension | Type | Example |
|---|---|---|
| `cuisine_affinity` | `map<cuisine, 0..1>` | `{ "Thai": 0.9, "Vietnamese": 0.6 }` |
| `price_tier` | `budget` \| `mid` \| `premium` | `mid` |
| `dietary` | `string[]` | `["no-pork", "halal"]` |
| `spice_tolerance` | `mild` \| `medium` \| `hot` | `hot` |
| `novelty_appetite` | `0..1` (homebody → explorer) | `0.7` |
| `delivery_time_tolerance` | `quick` \| `flexible` | `quick` |
| `promo_sensitivity` | `low` \| `mid` \| `high` | `mid` |

`spice_tolerance` is kept in the schema but ignored by the rule until
a corresponding `menu_items.spice_level` field exists. The other six
all map onto existing `restaurants` columns (`cuisine`, `price_range`,
`dash_pass`, `discount_percentage`, the computed delivery time, plus
the categories tables for dietary).

**Address is not a preference dimension.** The persona's
`address.lat`/`lng` drives candidate-pool retrieval at the engine
level, the same way `/home` already uses `defaultAddress` today — so
location filtering happens before the rule runs.

## Family block (5 of 10 personas)

| Field | Type |
|---|---|
| `adults` | int |
| `kids` | int |
| `kid_ages` | `int[]` |
| `shared_dietary` | `string[]` |
| `kid_friendly_required` | bool |

## Reviews (existing schema, reused)

`user_reviews` already exists in `dashdoor.db` (63k rows, `rating`
0–5). We seed 5–15 per persona; ≥ 2 of each persona's reviews carry
`rating ≤ 2`. The ground-truth rule treats those restaurants as
**blocked** — they cannot appear in any section.

## Ground truth — rule + hand overrides

A pure function turns (persona attributes + order history + review
history) into an expected ranked list. Hand overrides patch the rule
per persona, per surface.

**Rule (home_feed):**

0. **Clean the order signal first (Phase 8a):** drop basket-size
   outliers (robust median + `OUTLIER_BASKET_MAD_K`·MAD over each
   persona's order subtotals — a one-off catering order shouldn't make
   a cuisine "hot") and treat cuisines with fewer than
   `MIN_CUISINE_SUPPORT` distinct orders as one-offs (not familiar).
   Excluded orders are recorded in `ExpectedTask.filters` with a reason
   so the demo can *show* the cleaning.
1. Compute *hot cuisines* from the **cleaned** orders:
   `affinity × historical_order_count`. Keep cuisines above threshold
   (default `2.0`, tunable).
2. For each hot cuisine, build a **section of `SECTION_SIZE` (4)
   restaurants**, split by `novelty_appetite` (Phase 8b):
   - **familiar** (`SECTION_SIZE − exploreCount(appetite)` slots): top
     by past orders for this persona, matching price tier, not rated
     ≤ 2★.
   - **explore** (`exploreCount(appetite)` slots): prefer new
     restaurants in the loved cuisine, then **adjacent** cuisines the
     persona hasn't tried (Phase 8c, via the cuisine-adjacency map),
     same constraints. The valid explore set per section is precomputed
     into `explore_valid_ids` so scoring stays DB-free.
   - `novelty_indices` lists which slot positions are explore slots.
3. **Block list:** every restaurant the persona has rated ≤ 2★ — not
   allowed anywhere in the expected output.
4. **Family constraints** (if `family` is set): exclude restaurants
   that violate `shared_dietary`; if `kid_friendly_required`,
   restrict to ones with kid-friendly items.

The hand-override file (`data/reco-personas/overrides.json`) is the
same shape as the rule's output; the runner merges
`rule_output ⊕ override` with override winning on present fields.

### Rule constants and v1 heuristics

These are exported as named constants from
`lib/reco/eval/persona-truth.ts` so they're tunable in one place.
Each carries a documented default; push back here when the demo
needs different numbers.

| Constant | Default | Purpose |
|---|---|---|
| `HOT_CUISINE_THRESHOLD` | `2.0` | A cuisine becomes "hot" when `affinity × historical_order_count ≥ 2.0`. Below this, no section is emitted. |
| `CANDIDATE_RADIUS_MILES` | `25` | Haversine distance from the persona's `address.lat`/`lng` — restaurants outside this are not candidates. |
| `SECTION_SIZE` | `4` | Cards per cuisine section. |
| `FAMILIAR_COUNT` | `3` | **Deprecated (Phase 8b)** — superseded by `exploreCount(appetite)`. Kept for back-compat only. |
| `OUTLIER_BASKET_MAD_K` | `6.0` | Phase 8a. An order is a basket-size outlier when `subtotal > median + K·MAD` over the persona's own orders. K=6 isolates true anomalies (e.g. catering) without clipping a persona's normal larger orders when spending is bimodal. |
| `MIN_CUISINE_SUPPORT` | `2` | Phase 8a. Distinct kept orders a cuisine needs to seed a *familiar* section; below this it's a one-off. |
| `EXPLORE_HI` / `EXPLORE_LO` | `0.66` / `0.33` | Phase 8b. `novelty_appetite` thresholds: explorer (≥HI) → 3 explore / 1 familiar, mid → 2/2, homebody (<LO) → 1/3. |

**Phase 8 in progress — see `execution_plan.md` for steps.** It changes
three documented contracts, reflected above and in the type/data tables:

- `ExpectedSection.novelty_index: number` → **`novelty_indices: number[]`**
  (multiple explore slots), plus a new **`explore_valid_ids: number[]`**
  (loved + adjacent in-pool candidates) so set-level explore scoring in
  `metrics.ts` needs no DB.
- `ExpectedTask` gains **`filters?: { order_id?, cuisine?, reason }[]`** —
  the orders/cuisines the 8a cleaning dropped, rendered as an
  expected-side `filter` panel on `/reco-eval`.
- New data file **`data/reco-personas/cuisine-adjacency.json`** +
  `lib/reco/adjacency.ts`.

**Other rule choices (v1, called out so they're easy to revisit):**

- **Sections require both familiar and explore.** A cuisine with no
  familiar match, or no in-pool explore match, is dropped rather than
  emitted as a partial section. This keeps the section story honest.
- **Insufficient familiar candidates** are topped up with the
  highest-rated cuisine matches from the candidate pool (computed
  from `user_reviews` aggregates; `featured` flag is the tiebreak
  when there are no reviews). Explore slots are always positioned
  after any filler — `novelty_indices` lists those trailing positions.
- **`family.kid_friendly_required` is deferred in v1.** The original
  heuristic (any `menu_items.name LIKE '%kid%'` or category) matched
  only 55 of 594 restaurants — too narrow, collapsing family-persona
  sections to zero. The rule currently ignores `kid_friendly_required`.
  Re-enable once the catalog has a real `is_kid_friendly` tag.
- **Dietary filtering at restaurant level — not enforced in v1.**
  The schema has no restaurant-level dietary tag today, so the rule
  ignores `preferences.dietary` and `family.shared_dietary` as
  positive filters. The persona's own ≤ 2★ block list (which they
  built up by trying places that violated their diet) carries the
  most signal until a tag column lands. **TODO:** add restaurant
  dietary tags and re-enable.
- **Avg-rating source:** `AVG(rating)` over `user_reviews` where
  `store_category = 'restaurant'` AND `approval_status = 'approved'`,
  including the persona's own reviews. The persona's negative
  reviews then naturally pull a restaurant's score down without
  needing a separate hard-block path (the explicit block list is
  belt + suspenders).
- **DB client:** `better-sqlite3` (sync) for offline rule code; the
  Next.js app continues to use libsql. The two clients open the same
  `.db` file; no cross-traffic.

## OpenSearch as baseline

OpenSearch runs as a sidecar in the demo stack
(`config/docker-compose.demo.yaml`), speaking the same `POST
/recommend` contract as the BYO engines
(`docs/reco-http-contract.md`). It is **the named baseline**:

- Always selected on `/reco-eval` — can't be unchecked.
- Its column is highlighted in the metric table — the "line to beat".
- `/demo` copy: "your ranking model is scored against OpenSearch."

## Cuisine sections — UI

When a persona is signed in, `/home` renders one **labeled section
per hot cuisine** ("More Thai for you"). Each section is **4 cards**;
the familiar/explore split is driven by `novelty_appetite` (Phase 8b) —
an explorer (alice-tran, eli-nakamura) sees 3 "Try something new" cards,
a homebody (ben-kowalski) sees 1. Every explore-slot card (positions in
`novelty_indices`) is tagged. The **applied engine's** ranking fills the
slots (see "Apply a reco to the home feed" below) — with no applied
engine, the ground-truth rule order is used.

Non-persona users see today's standard home feed, untouched.
Personalization keys off whether the signed-in user is a persona
(user_id 3101–3110) — there is no feature flag. Any non-persona user
gets a feed bit-identical to today's.

## Apply a reco to the home feed

The reco lab is a **loop**, not a one-way report: evaluate engines on
`/reco-eval` → **pick a winner** → see the *actual home feed* that engine
produces. This closes the gap between "your model scored X" and "here's
what your customer would see."

**Flow:**

1. Run an A/B on `/reco-eval` (baseline + LLM ranker + any BYO engine,
   one or more models).
2. Each engine column gets an **"Apply to home feed"** action. Clicking
   it captures *that engine's result for that persona* into a persisted
   selection (one per persona).
3. `/home`, for that persona, now fills its cuisine-section slots from
   the applied engine's ranking and shows a banner:
   *"Home feed personalized by **LLM Ranker · gpt-4o-mini** — your pick
   from Reco Eval (2026-06-01). [Reset to default]"*.
4. **Reset** clears the selection → home returns to the ground-truth rule.

**What is persisted — and what is not.** We store the engine's **captured
ranked output** (`engineId`, `label`, `model?`, `ranked_ids`, `scores?`,
`capturedAt`), keyed by `personaId`, in a Zustand store backed by
`localStorage` (`store/reco-selection-store.ts`). We deliberately do
**not** persist credentials: a BYO LLM key is request-scoped (see
Phase 7), so re-calling the model from `/home` is impossible by design.
Replaying the *snapshot* the eval already produced sidesteps that
entirely — it's faster (no engine round-trip on home load), deterministic
(home shows exactly the reco you evaluated), and keeps the key in the one
request that needed it.

**Section scaffolding vs. slot fill.** The section structure — which hot
cuisines, the familiar/explore split, `novelty_indices`,
`explore_valid_ids`, labels — always comes from the rule (`buildExpected`,
Phase 8). It is the engine-independent *task definition*, so two engines
are visually comparable. The **applied engine only decides which
restaurants land in the slots and in what order**: each section reorders
its cuisine's candidates by the engine's captured `ranked_ids` (familiar
slots take the engine's top in-cuisine picks the persona has ordered,
explore slots its top picks they haven't), falling back to rule order for
any id the engine didn't rank. The reorder happens client-side from the
selection store, so no credential ever leaves the original eval request.

**Multiple models, one loop.** Because a single `/reco-eval` run fans out
to every selected engine plus the BYO panel (which can target different
models across runs), the user can line up `gpt-4o-mini` vs `gpt-4o` vs
OpenSearch in the A/B table, then apply each in turn and flip to `/home`
to *see* the difference — not just read the metric delta. The applied
selection is the bridge between the scored table and the lived feed.

## Reco run history + home-feed switcher (Phase 10)

Extends "Apply a reco to the home feed" so the persona can switch between any past run without going back to `/reco-eval`.

### Persistent run history

The store changes from a single active selection per persona to a **run history**, keyed by `personaId` → `RecoRunEntry[]`:

```ts
type RecoRunEntry = {
  engineId: string;          // "opensearch" | "llm-ranker" | "custom"
  label: string;             // "OpenSearch" | "LLM Ranker" | "BYO (my-server.com)"
  model?: string;            // "gpt-4o-mini" etc. — undefined for OpenSearch
  ranked_ids: number[];
  scores?: Record<number, number>;
  capturedAt: string;        // ISO — used as the display timestamp
  runKey: string;            // engineId + ":" + (model ?? "") — dedup key
};
```

On every **"Apply to home feed"** click the store:
1. Computes `runKey = engineId + ":" + (model ?? "")`.
2. Upserts into the array — replaces an existing entry with the same `runKey` (keeping only the latest run for each engine-model combo), appends otherwise.
3. Sets `activeRunKey` for that persona to this `runKey`.

Storage is still `localStorage` via Zustand `persist` (`store/reco-selection-store.ts`). Credentials are never stored — same invariant as Phase 9.

**Why per-combo dedup:** A second `gpt-4o-mini` run replaces the first; a `gpt-4o` run is kept separately. A prospect demoing three models ends up with exactly three history entries for their persona — clean, no unbounded growth.

### Home-feed switcher UI

When a persona is signed in and at least one run exists for them, a **switcher row** replaces the plain Phase 9 banner. It lives directly above the cuisine sections (same position as the banner):

```
[ OpenSearch ▼ ]  ·  Personalized by OpenSearch — 6/2/2026    Reset to default
```

The leftmost element is a **`<select>` dropdown** listing every entry in the run history for this persona, plus a leading "— Rule default —" option:

```
— Rule default —
OpenSearch  (6/2/2026)
LLM Ranker · gpt-4o-mini  (6/2/2026)
LLM Ranker · gpt-4o  (6/1/2026)
```

- Entries are sorted newest-first.
- The currently active run is pre-selected.
- "— Rule default —" maps to no active run (same as clicking Reset).

Selecting a different entry immediately updates `activeRunKey` in the store; `effectiveSections` in the home page re-derives from the newly selected run's `ranked_ids` — no network request, instant.

The inline text to the right of the dropdown mirrors Phase 9's banner text so context is always visible without opening the dropdown. **Reset to default** is a link that sets activeRunKey to `null`.

**Placement**: the switcher row is part of the persona sections area (inside the `<div className="flex flex-col gap-3 mb-6">` block), not the site header. The header already has a **Reco Eval** pill for navigation; the switcher on `/home` is the complementary "which run is live here" control.

### Store API changes

```ts
// existing (Phase 9) — removed
applyEngine(personaKey, payload)  →  single selection per persona

// new (Phase 10)
applyRun(personaKey, entry)       →  upsert into history by runKey, set activeRunKey
setActiveRun(personaKey, runKey | null)  →  switch without adding a new entry
clearHistory(personaKey)          →  drop all history + active
```

## Header eval switcher + persisted runs (Phase 11 — supersedes Phase 10 UI)

Phases 9–10 produced **two** overlapping controls — the client-only
per-persona selection store and the in-feed `RecoSwitcher` — that drift out
of sync. Phase 11 collapses them into **one** control and moves run storage
to the backend.

**What changes from Phase 10:**

1. **Runs persist server-side, globally.** Instead of a per-persona
   `localStorage` history, each `/reco-eval` run is written to
   `data/reco-traces/runs.json` via `POST /api/reco/runs`. The list is shared
   across browsers and personas — "all available evals" is now a real global
   list, not a per-browser artifact. The client store shrinks to a single
   persisted pointer: `{ activeRunId: string | null }`.

2. **The switcher moves to the site header, always visible.** It replaces the
   Phase 10 note above (line 299): the dropdown is no longer part of the
   persona sections area. The header `<select>` lists every saved run as
   `Persona · Engine · model (time)` plus "— Rule default —", regardless of
   login state.

3. **The selected eval drives the persona shown on `/home`.** Because a run's
   `ranked_ids` are over one persona's candidate pool, picking a run makes
   `/home` render *that run's* persona sections (`activeRun.personaUserId`),
   reordered by the run — decoupled from who is logged in. With no run
   selected, `/home` keeps its prior login-driven behavior.

4. **The banner stays, slimmed, on `/home`.** When a run is active:
   *"Showing {Persona}'s feed ranked by {Engine} · {model} — run
   {date, time}. [Clear]"*. `[Clear]` sets `activeRunId = null`.

### Persisted run record

```ts
type RecoRun = {
  id: string;            // `${personaUserId}:${engineId}:${model ?? ''}` — upsert key, latest wins
  personaId: string;
  personaUserId: number; // 3101..3110 — used to fetch persona-home
  personaName: string;   // display_name — dropdown label
  engineId: string;
  label: string;
  model?: string;
  ranked_ids: number[];
  scores?: Record<number, number>;
  capturedAt: string;    // ISO — server-set; the banner/dropdown timestamp
};
```

### API — `app/api/reco/runs/route.ts`

- `GET` → all runs, newest-first by `capturedAt`.
- `POST` → payload minus `id`/`capturedAt`; server computes `id`, sets
  `capturedAt`, upserts (replace same-`id`), writes file.
- `DELETE ?id=` → remove one; no param → clear all (optional, for reset).

Credentials are never persisted — same invariant as Phases 9–10; only the
captured `ranked_ids`/`scores` are stored.

`components/reco-switcher.tsx` is deleted; its role is split between the
header dropdown and the slim `/home` banner.

`useRecoSelection(personaKey)` continues to return the currently-applied `RecoRunEntry | undefined` (derived from `activeRunKey`). `useRecoHistory(personaKey)` returns the sorted `RecoRunEntry[]`. The home page only needs `useRecoSelection`; the switcher dropdown uses `useRecoHistory`.

### Data shapes

| What | Where |
|---|---|
| Run history store | `store/reco-selection-store.ts` — replaces Phase 9 single-selection shape |
| Switcher component | `components/reco-switcher.tsx` (new) — renders the dropdown + inline text + Reset |

## Trajectories

Every engine emits a `RecoTrajectory` alongside its `/recommend`
response. The implemented shape (`lib/reco/types.ts`) is:

```ts
type RecoTrajectory = {
  engine: string;
  steps: TrajectoryStep[];   // query → candidate_gen → filter → score → rerank → final
  raw_explain?: unknown;     // OpenSearch _explain tree, rendered as score contributions
};

type TrajectoryStep = {
  stage: 'query' | 'candidate_gen' | 'filter' | 'score' | 'rerank' | 'final';
  restaurant_ids: number[];
  scores?: Record<number, number>;
  notes?: string;            // query DSL / prompt as JSON string, or a filter reason
};
```

OpenSearch fills this out fully via `_explain` (→ `raw_explain`). BYO
engines emit what they have — a thin `query` (prompt) + `candidate_gen`
+ `final`, plus their per-candidate `scores`. The `/reco-eval` drilldown
modal renders the steps; the score contributions panel reads
`raw_explain` for OpenSearch and `scores` for BYO engines.

## Data shapes — where things live

| What | Where |
|---|---|
| Personas (source of truth) | `data/reco-personas/personas.json` |
| Hand overrides | `data/reco-personas/overrides.json` |
| Cuisine adjacency map (Phase 8c) | `data/reco-personas/cuisine-adjacency.json` |
| Candidate builder + HTTP contract | `lib/reco/candidates.ts`, `docs/reco-http-contract.md` |
| Metrics (scoreTask / aggregate) | `lib/reco/metrics.ts` |
| LLM ranker (BYO) engine | `tools/reco-engines/llm-ranker/` |
| Precomputed expected output | `data/reco-personas/expected.json` |
| Applied-reco selection store (Phase 9) | `store/reco-selection-store.ts` (localStorage-backed) |
| Preference + family schema | `data/db/schema/personas_schema.sql` |
| Persona DB seed | `data/db/schema/personas_seed.sql` |
| Persona shape doc | `docs/reco-persona-shape.md` |
| Family shape doc | `docs/reco-family-shape.md` |
| Trajectory shape doc | `docs/reco-trajectory-shape.md` |
| OpenSearch index doc | `docs/reco-opensearch-index-shape.md` |
| Ground-truth rule | `lib/reco/eval/persona-truth.ts` |
| Cuisine section component | `components/cuisine-section.tsx` |
| Persona home API | `app/api/reco/persona-home/route.ts` |
| OpenSearch engine | `tools/reco-engines/opensearch/` |
| Trajectory traces | `data/reco-traces/<runId>/<engine>/<task>.json` |

## Out of scope (for now)

- Surfaces beyond `home_feed` (search, store, promotions).
- Training models inside the gym.
- Multi-tenant or live-user telemetry.
- Persona evolution mid-session.
- Production-grade OpenSearch (no security plugin, single-node).
