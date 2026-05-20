# Parallel work tracker

The reco gym has several work streams that can move independently. This
file is the at-a-glance picture of what's in flight, what's available
to pick up, and what's blocked.

Update the **Status** and **Owner** columns as tracks change hands.
Tick boxes inside a track only when the whole track ships; finer-grained
work lives in the track's own doc.

---

## Tracks

| # | Track                                 | Status      | Owner   | Doc / location                       |
|---|---------------------------------------|-------------|---------|---------------------------------------|
| 1 | Gorse end-to-end verification         | Done   | (other) | `gorse_work.md` + `GORSE_VERIFY.md`   |
| 2 | Phase 2 sidecar bring-up (LightFM + Implicit) | Code done, docker verify pending | unassigned | `EXECUTION.md` §8 |
| 3 | Phase 4 LLM-agent track               | Not started | unassigned | `RECO_PLAN.md` Phase 4               |
| 4 | Demo polish (run history, e2e spec)   | Not started | unassigned | this doc §4                          |
| 5 | Ground-truth expansion                | Not started | unassigned | this doc §5                          |
| 6 | Repo hygiene (58 pre-existing tsc errors) | Done | agent | this doc §6                       |

Done so far (no longer parallel candidates):

- Phase 0 foundation — code complete (`docs/execution-phase-0.md`).
- Phase 1 decisions doc — `docs/reco-decisions.md`.
- Phase 2 code — adapters, sidecars, contract doc, runtime config.

---

## Dependency map

```
Phase 0 (done) ──┬─→ Track 1 (Gorse verify)            ─┐
                 ├─→ Track 2 (Phase 2 verify)           ├─→ Phase 3 (live UI re-rank, optional)
                 ├─→ Track 4 (Demo polish)              ┘
                 ├─→ Track 5 (Ground-truth expansion)
                 └─→ Track 3 (Phase 4 LLM agent)        ─→ Phase 5 (deploy)
```

- **Tracks 1, 2, 3, 4, 5, 6 can all run in parallel today.** None
  block each other; none block Phase 0 from shipping.
- Phase 3 (re-ranking the live `/home` feed) needs Tracks 1 *or* 2
  to have finished, since that's when there's something to re-rank
  with.
- Phase 5 (VM deploy + landing page) waits on Phase 4 if you want
  the deployed demo to include the LLM-agent track, otherwise it
  can ship after Phase 2 verify.

---

## Track 1 — Gorse end-to-end verification

- **Goal:** close the deferred Gorse boxes from Phase 0.
- **Owner:** see `gorse_work.md`.
- **Doc:** `GORSE_VERIFY.md` (step-by-step checklist).
- **Exit:** `gorse` Hit@5 ≥ random on the history split; per-task rows
  have no error strings; screenshot saved (or explicitly skipped).
- **Touches:** `config/docker-compose.reco.yaml`, `scripts/seed-gorse.ts`,
  `lib/reco/engines/gorse.ts`. No overlap with Tracks 2–6.

---

## Track 2 — Phase 2 sidecar bring-up

- **Goal:** stand up the LightFM + Implicit containers, confirm the
  five-engine eval works end-to-end.
- **Doc:** `EXECUTION.md` §8 (smoke + tests). The code work
  (§§1–7) is already done.
- **Steps:**
  - [ ] `docker compose -f config/docker-compose.reco.yaml up --build`
        — confirm both sidecars build and `GET /health` returns 200.
  - [ ] First boot of LightFM takes ~30–60s (training). Implicit
        boots faster.
  - [ ] `curl /api/reco/eval` with all 5 engines on `taskSetId:
        history` returns metrics for every engine.
  - [ ] At least one of {lightfm, implicit} beats `popularity` on
        Hit@5.
  - [ ] (Optional) write a `PHASE_2_VERIFY.md` mirroring
        `GORSE_VERIFY.md` if you want a reusable checklist.
- **Exit:** code merge + a sample 5-engine report under
  `docs/samples/`.
- **Touches:** `tools/reco-engines/{common,lightfm,implicit}/`,
  `config/docker-compose.reco.yaml`,
  `lib/reco/engines/{lightfm,implicit,index}.ts`.

---

## Track 3 — Phase 4 LLM-agent track

- **Goal:** the gym's second product goal — an LLM-based agent uses
  the UI, we score it against the same ground truth.
- **Doc:** `RECO_PLAN.md` Phase 4. No EXECUTION.md scoped to it
  yet — switch `EXECUTION.md` when this track becomes the primary.
- **Steps (skeleton, not done):**
  - [ ] `tools/reco-agent/` directory layout.
  - [ ] Playwright driver against the running gym (headed or
        headless). One action loop tick = read DOM → ask LLM what to
        click → click → record verifier-store event.
  - [ ] Trajectory → `RecommendationResponse` mapping (clicks/cart/
        order → ranked list).
  - [ ] Same `lib/reco/metrics.ts` reused — already agent-ready.
  - [ ] `/reco-eval/agent/<runId>` replay page (screenshots, DOM
        snapshots, action log).
- **Exit:** an agent finishes one seed task end-to-end and shows up
  next to the engines in `/reco-eval` with a Hit@1.
- **Touches:** new `tools/reco-agent/`, new
  `app/reco-eval/agent/[id]/page.tsx`, no changes to existing reco
  engine code. **Zero overlap with Tracks 1, 2.**

---

## Track 4 — Demo polish

Low-risk, high-leverage hygiene that makes the demo more shippable.
Independent of any model work.

- [ ] **Run-history UI.** Wire `GET /api/reco/runs/_index` into a
      dropdown on `/reco-eval` so users can re-load a prior run
      instead of re-running.
- [ ] **Latency column.** `/reco-eval` already collects `latencyMs`
      per (engine, task). Add a "p50 / p95 ms" column to the aggregate
      table.
- [ ] **Engine description tooltip.** Engine `description` is in
      `/api/reco/engines` already; surface it as a hover tooltip
      next to each engine name in the picker.
- [ ] **Playwright spec.** One light spec under
      `tests/e2e/tests/development/reco/eval.spec.ts` that loads
      `/reco-eval` with `RECO_DEMO=1`, runs random+popularity on the
      seed set, asserts the aggregate table renders ≥ 2 rows.
- [ ] **`RECO_DEMO` baked into `Dockerfile.prod`.** Currently set in
      compose `args`; baking it into the Dockerfile means
      `docker run -e RECO_DEMO=1 dashdoor` Just Works.

**Touches:** `app/reco-eval/`, `Dockerfile.prod`, `tests/e2e/`. **Zero
overlap with Tracks 1, 2, 3.**

---

## Track 5 — Ground-truth expansion

Today's seed (10 tasks) is intentionally a needle-in-haystack set —
popularity legitimately loses on it. The history split helps, but
both still produce small absolute numbers. Sharpening the eval
makes engine differences more visible.

- [ ] Add ~10 seed tasks of the *item* class (use the `get_items`
      expected-state function in `tasks/dashdoor.csv`).
- [ ] Add ~10 "find a restaurant matching X" tasks — looser than the
      named-restaurant tasks; popularity has a chance.
- [ ] Per-task `candidatePool` filter: scope each task to "restaurants
      within 5 mi of user" so engines compete on a realistic pool.
- [ ] Tag tasks by category (`needle`, `category`, `repeat-purchase`)
      and break out aggregate metrics by tag in the demo UI.

**Touches:** `data/reco-tasks/seed.json` (or split into multiple
files), `lib/reco/eval/task-loader.ts`, `lib/reco/eval/runner.ts`,
optionally `app/reco-eval/reco-eval-client.tsx`. **Some overlap with
Track 4** if the UI changes coincide — coordinate via this doc.

---

## Track 6 — Repo hygiene

The repo carried 58 pre-existing tsc errors in deals-related unit test
fixtures (missing `isRestaurantOpen`). Fixed May 2026; full
`npx tsc --noEmit` is now 0 errors.

- [x] Fix the fixtures so `npx tsc --noEmit` is 0 errors.
  - `tests/unit/components/modals/deals-modal.test.tsx` (11)
  - `tests/unit/components/modals/deal-modal.test.tsx` (4)
  - `tests/unit/components/deals/deals.test.tsx` (28)
  - Plus 15 other latent errors (checkout, merchant reviews, assertion stub,
    filter-url-params, playwright reporter, e2e credentials import).
- [x] CI guard: `npm run typecheck:ci` → `scripts/check-tsc.mjs` (fails on
      any tsc error). `npm run typecheck` runs `tsc --noEmit` directly.

**Touches:** deals test fixtures (primary), small fixes elsewhere for a
green global baseline. **Zero overlap with reco tracks.**

---

## How to claim a track

1. Edit the **Owner** column in §Tracks to your name/handle.
2. Set **Status** to "In flight" with a date.
3. Spawn the track's working doc if it doesn't have one yet
   (e.g. `PHASE_4_WORK.md`).
4. When the track ships, set Status to "Done", link the PR, and
   move it to the "Done so far" list.

If a track is blocking another (rare — the dependency map is
designed to keep them independent), say so in the track's row.

---

## See also

- `RECO_PLAN.md` — phased plan with phase-level checkboxes.
- `EXECUTION.md` — detailed checklist for the *current* phase.
- `CLAUDE.md` — orientation + checkbox discipline rules.
- `HOW_TO_TEST.md` — testing each of the two product goals.
- `GORSE_VERIFY.md` — Track 1 detail.
- `docs/execution-phase-0.md` — archived Phase 0 checklist (for
  reference if Track 4/5 needs to look back).
