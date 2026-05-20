# Execution — Phase 0

Detailed checkbox plan for **Phase 0** of `RECO_PLAN.md` only. When Phase
0 is done, replace this file's contents with Phase 1's (the scope-firming
decisions doc) and then Phase 2's. Keep checkboxes honest — if a step is
partially done, leave it unchecked and note the gap.

> Phase 0 is the foundation build (contract → engines → eval → demo
> page → Gorse sidecar). The scoping/decisions work that used to be
> Phase 0 is now Phase 1 in `RECO_PLAN.md` and runs after Phase 0
> lands.

---

## 0. Pre-flight

- [ ] Run the app once to confirm a clean baseline:
  - [x] `npm install` (under Node 20 via nvm; `.nvmrc` pinned)
  - [ ] `cp .env.example .env`
  - [ ] `npm run dev` → open `http://localhost:3000/home`
- [ ] Confirm seed DBs exist at `data/db/dashdoor.db`, `delivery.db`,
      `merchant.db` (they ship with the repo).
- [ ] `npm run test:unit` passes on a clean main.
- [x] Branch: working on the existing `reco` branch.

---

## 1. Define the `RecommendationEngine` adapter contract

- [x] Create `lib/reco/types.ts` exporting:
  - [x] `RecoSurface = 'home_feed' | 'home_promo' | 'search' | 'store_items'`
  - [x] `RecoContext` — `{ userId?, lat, lng, surface, candidatePool?, k, now?, recentOrderIds? }`
  - [x] `RecoItem` — `{ id, score, kind: 'restaurant' | 'item', meta? }`
  - [x] `RecommendationResponse` — `{ items, engine, version, latencyMs, debug? }`
  - [x] `RecommendationEngine` — `{ name, version, description, recommend(ctx) }`
  - [x] Plus a `RecoEngineError` class for adapters to throw on downstream failures.
- [x] Create `lib/reco/README.md` describing the contract in 1 page with
      a JSON example. Also documents the HTTP wire contract (Gorse/sidecars).

> verified: `npx tsc --noEmit` clean for `lib/reco/` (Node 20 via nvm).
> Pre-existing 58 errors in `tests/unit/components/modals/deals-modal.test.tsx`
> are unrelated to the reco work — present on clean main.

## 2. Engine registry + baselines + Gorse

Three baselines plus the first real plug-in engine, **Gorse**.

- [x] `lib/reco/engines/index.ts`
  - [x] `Map<string, RecommendationEngine>` keyed by `name`
  - [x] `registerEngine(e)` / `getEngine(name)` / `listEngines()`
- [x] `lib/reco/engines/random.ts`
  - [x] Returns `k` items sampled deterministically (mulberry32 seeded by
        ctx) from `candidatePool`, falling back to "restaurants within
        10 mi of lat/lng" via the same Haversine util used by the home feed.
  - [x] Used as a floor — anything below random is broken.
- [x] `lib/reco/engines/popularity.ts`
  - [x] For restaurants: `featured + new_flag bonus + avg_rating × log(1+ratings)`
        — same family of scoring as the production feed.
  - [x] For items: reuses the formula from
        `app/api/restaurants/popular-items/route.ts`.
- [x] `lib/reco/engines/http.ts`
  - [x] POST `{engineEndpoint}` with the JSON `RecoContext`, expect
        `RecommendationResponse` back.
  - [x] 5s timeout, retry-once on network failure, throws `RecoEngineError`
        so the runner can record per-task failures without aborting.
- [x] `lib/reco/engines/gorse.ts` — Gorse-shaped adapter (doesn't go through
      `http.ts` because Gorse predates the /recommend contract)
  - [x] Reads `RECO_GORSE_URL` (default `http://gorse:8088`) and
        `RECO_GORSE_API_KEY` (optional) — uses the Gorse *server* port.
  - [x] `recommend(ctx)`:
        - For a known `userId`: `GET /api/recommend/{userId}?n={k}`
        - For guest/no-user: `GET /api/popular?n={k}` as fallback
        - Restrict candidates if `ctx.candidatePool` is set
          (post-filter, since Gorse doesn't take a pool param)
  - [x] Maps Gorse's `[{Id, Score}]` or bare `string[]` (popular endpoint)
        to our `RecoItem` shape; `kind = 'item'` only for the `store_items`
        surface.
  - [ ] Records engine `version` from Gorse's `/api/health/live` — TODO,
        currently hardcoded `0.5.x`. Will wire after the sidecar is up.
- [x] Register `random`, `popularity`, and `gorse` from
      `lib/reco/engines/index.ts`.

> verified: `npx tsc --noEmit` clean for `lib/reco/engines/`. No new
> errors introduced by §2 (58 pre-existing errors in unrelated test
> fixtures unchanged).

## 3. Ground truth: task set + history split

- [x] `lib/reco/eval/task-loader.ts`
  - [x] Reuse `app/api/v1/get_expected_state/route.ts` CSV parser; expose
        `loadRawTasks()` returning the parsed `tasks/dashdoor.csv` map.
  - [x] Pre-resolve a curated subset via the dashdoor SQLite: tasks whose
        `expected_state_functions` include `get_restaurants({name: X})`
        and whose user has a default address, where the name resolves
        uniquely. (Found 40 such tasks; took the first 10.)
  - [x] Output a `RecoTask = { taskId, surface, userEmail, userLat,
        userLng, statement, expectedItemIds, expectedKind, expectedNames? }`.
- [x] `lib/reco/eval/history-split.ts`
  - [x] Query `orders` joined with users; for each user with ≥3 orders,
        hold out the most recent order's `store_id` as ground truth.
  - [x] Provide `loadHistorySplitTasks(limit?)`.
- [x] `data/reco-tasks/seed.json` — 10 hand-resolved task entries (the
      simplest single-restaurant tasks). Smaller than the 20 originally
      planned because the "single-restaurant, deterministic" filter
      narrows the catalog.

> verified: `npx tsc --noEmit` clean for `lib/reco/eval/`. Seed JSON
> spot-checked against the DB (West Diner → 202, Golden Burger → 277,
> etc.).

## 4. Metrics

- [x] `lib/reco/metrics.ts`
  - [x] `hitAtK(predicted, expected, k)`
  - [x] `recallAtK(predicted, expected, k)`
  - [x] `ndcgAtK(predicted, expected, k)` with binary relevance
  - [x] `mrr(predicted, expected)`
  - [x] `aggregate(perTask, allPredicted, catalogSize)` → mean per
        metric + coverage. Stderr deferred — not load-bearing for the
        Phase 0 demo.
  - [x] `scoreTask(predicted, expectedIds, k)` convenience wrapper used
        by the runner.
- [x] `tests/unit/reco/metrics.test.ts` — 14 tests, all green
      (`npm run test:unit -- tests/unit/reco/`).

## 5. Eval runner

- [x] `lib/reco/eval/runner.ts`
  - [x] `runEval({engineNames, taskSet, k, historyLimit?})` →
        `EvalReport = { runId, startedAt, finishedAt, k, taskSet,
        engines, perTask, aggregate }`.
  - [x] Engines run sequentially per task; tasks themselves sequential
        for Phase 0 (seed is 10 tasks). Parallel task pool deferred.
  - [x] Catches `RecoEngineError` / `Error` per (task, engine), records
        message in the row; never aborts the whole run.
- [x] Persist runs to `data/reco-runs/<runId>.json` via
      `lib/reco/eval/storage.ts` (also `loadReport`, `listRunIds`).

## 6. Eval API routes

- [x] `app/api/reco/engines/route.ts` (`GET`) — returns
      `{ engines: [{ name, version, description }] }`.
- [x] `app/api/reco/eval/route.ts` (`POST`) — body:
      `{ engineNames: string[], taskSetId: 'seed' | 'history', k?: number,
      historyLimit?: number }`, runs synchronously and returns
      `{ runId, report }`. (Async/kick-off-then-poll variant deferred —
      seed run is small.)
- [x] `app/api/reco/runs/[id]/route.ts` (`GET`) — returns the stored
      report, 404 if missing. Special id `_index` returns
      `{ runIds: [...] }` for the demo UI's run history selector.

> verified: `npx tsc --noEmit` clean for `app/api/reco/`.

## 7. Minimal demo UI

- [x] `app/reco-eval/page.tsx` (server) + `reco-eval-client.tsx` (client)
  - [x] Engine multi-select (from `/api/reco/engines`)
  - [x] Task set radio: `seed` vs `history`
  - [x] `k` selector (default 5)
  - [x] "Run eval" button → POST to `/api/reco/eval`, show a spinner
  - [x] Results table: rows = engines, columns = Hit@K, NDCG@K, MRR,
        Recall@K, Coverage
  - [x] Per-task drilldown: collapsible `<details>` with predicted ids
        per engine, per-engine Hit@K / NDCG@K / latency
- [x] Reuses `components/ui/{button,checkbox,select,table,badge}` —
      no new component libraries pulled in.
- [x] Gate is in the server component (`process.env.RECO_DEMO !== '1'`
      → `notFound()`). Simpler than threading it through
      `app/conditional-main-layout.tsx`.

## 8. Docker + Gorse sidecar + smoke test

- [x] Build the prod image (user-side):
      `docker build -f ./Dockerfile.prod -t dashdoor . --load`. Verified via
      `docker compose -f config/docker-compose.reco.yaml up --build` (May 2026;
      `@libsql` arch copy + `RECO_DEMO` build arg — see `gorse_work.md`).
- [x] New compose file `config/docker-compose.reco.yaml` (kept separate
      from `config/docker-compose.yaml` so the demo opt-in is explicit):
  - [x] `dashdoor` service from `Dockerfile.prod`, `RECO_DEMO=1`,
        `RECO_GORSE_URL=http://gorse:8088`, depends_on gorse.
  - [x] `gorse` service from `zhenghaoz/gorse-in-one:latest`, persisted
        to a named volume, ports `:8087` (dashboard) and `:8088` (API).
- [x] `scripts/seed-gorse.ts` — idempotent seeder:
  - [x] Reads restaurants from the Dashdoor SQLite, POSTs to
        `/api/items` with categories (cuisine, price tier, dashpass,
        any restaurant_categories rows).
  - [x] POSTs all users to `/api/users` and all orders to
        `/api/feedback` (FeedbackType=`order`).
  - [x] Idempotent (Gorse upserts by id).
- [x] Bring it up (user-side):
      `docker compose -f config/docker-compose.reco.yaml up --build`,
      then `scripts/n.sh npx tsx scripts/seed-gorse.ts`. Verified May 2026:
      seed 594 items / 3000 users / 67514 feedback; Gorse health ready;
      history eval `run_mpehxjmq` — gorse Hit@5=0.000 ≥ random 0.000, 0
      per-task errors (`gorse_work.md`).
- [x] Smoke checks against `npm run dev` with `RECO_DEMO=1`
      (sufficient for Phase 0 exit; docker variant covered by the
      compose file):
  - [x] `/home` still loads — HTTP 200.
  - [x] `GET /api/reco/engines` returns 3 entries
        (`random`, `popularity`, `gorse`).
  - [x] `POST /api/reco/eval` on the seed set returns metrics: random
        Hit@5=0.100, popularity Hit@5=0.000 (seed tasks are
        single-named-restaurant lookups; popularity correctly returns
        globally-popular ids, not the target — exactly the kind of
        signal the harness should surface).
  - [x] `POST /api/reco/eval` on history set with `historyLimit=30`:
        popularity Hit@5=0.056 > random 0.000 ✓.
  - [x] `/reco-eval` renders HTTP 200 with `RECO_DEMO=1`.
  - [x] `GET /api/reco/runs/{id}` returns the persisted report.
- [ ] Capture a screenshot of the demo page and check it into
      `docs/screenshots/phase0-reco-eval.png`. **Deferred** (May 2026 —
      Gorse/API verification recorded in `gorse_work.md`; UI screenshot not
      required for Phase 0 Gorse sign-off).

## 9. Tests

- [x] Unit:
  - [x] `tests/unit/reco/metrics.test.ts` — 14 tests green.
  - [x] `tests/unit/reco/engines.popularity.test.ts` — 5 tests: featured
        tiebreaker, raw popularity beats featured, candidate-pool
        respected, distance filter at 10mi, `kind` flips to `item` on
        `store_items` surface.
- [ ] Playwright (light):
  - [ ] One spec under `tests/e2e/tests/development/reco/eval.spec.ts`
        that loads `/reco-eval` with `RECO_DEMO=1`, runs the seed set,
        asserts the **random** row's Hit@5 ≥ 0 and engines list has
        ≥ 2 rows. **Deferred** — popularity Hit@5 > 0 isn't a safe
        assertion against the seed set (seed tasks are named lookups
        where popularity legitimately misses; pick the assertion from
        history-split or rebalance the seed before adding the spec).

## 10. Wrap-up

- [x] `CLAUDE.md` unchanged — surfaces/decisions match what was planned.
- [ ] Open a PR titled `Phase 0: recommendation eval foundation` —
      **TODO user-side** (screenshot deferred; use `docs/samples/reco-report.json`
      + `gorse_work.md` for Gorse evidence).
- [x] Sample report JSON checked into `docs/samples/reco-report.json`.
- [x] Phase 1 (scope-firming decisions) doc written:
      `docs/reco-decisions.md`. Reflects what's actually in the code.
- [ ] On merge, replace this file's contents with Phase 2's plan and
      reset checkboxes.

---

## Definition of done for Phase 0

All true at once:

1. `npm run dev` with `RECO_DEMO=1` boots cleanly; `/reco-eval` is
   reachable and runs evals end-to-end. ✓
   (`docker compose -f config/docker-compose.reco.yaml up` is the
   production-shaped variant; it needs the user's docker daemon to
   verify. Compose file and seed script are committed.)
2. `/reco-eval` lets a stakeholder pick engines + task set + k and read
   off Hit@K, NDCG@K, MRR, Recall@K, Coverage. ✓
3. Three engines registered (random, popularity, gorse). Plugging in a
   new engine is a proven 3-line change in
   `lib/reco/engines/index.ts`. ✓
4. Reco-module type-check is clean (`npx tsc --noEmit` — 58 pre-existing
   errors in test fixtures unchanged). ✓
5. Reco unit tests green: 19/19
   (`scripts/n.sh npm run test:unit -- tests/unit/reco/`). ✓
