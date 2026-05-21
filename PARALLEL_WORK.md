# Parallel work tracker

Side tracks that can run alongside whatever phase `EXECUTION.md`
currently scopes. Update **Status** + **Owner** when a track changes
hands. Finer-grained work lives in the track's own section below.

---

## Tracks

| # | Track | Status | Owner | Doc / location |
|---|---|---|---|---|
| A | Phase 3 verification artifacts (e2e + screenshots) | Open | unassigned | this doc §A |
| B | Demo polish (run history, latency col, e2e spec, Dockerfile flag) | Open | unassigned | this doc §B |
| C | Ground-truth expansion | Open | unassigned | this doc §C |

Active phase (not parallel — drives `EXECUTION.md`):
- **Phase 4 — LLM-agent track.**

Done so far (no longer parallel candidates):
- Phase 0 foundation — `docs/execution-phase-0.md`.
- Phase 1 decisions — `docs/reco-decisions.md`.
- Phase 2 code + sidecar bring-up — LightFM Hit@5=0.333, Implicit
  Hit@5=0.556, both beat popularity (Hit@5=0.056). Sample at
  `docs/samples/reco-report-5engines.json`.
- Gorse end-to-end verification — `gorse_work.md`.
- Phase 3 code (live re-rank on `/home`) — May 2026; archived at
  `docs/execution-phase-3.md`. Verification artifacts moved to Track A.
- Repo hygiene — 58 pre-existing tsc errors fixed; `npm run typecheck:ci`
  guards 0 errors in CI.

---

## Dependency map

```
Phase 4 (active) ──┐
                   ├─→ Phase 5 (deploy polish)
Track A (Phase 3 verify) ─┘   ↑
Track B (demo polish)  ───────┤
Track C (ground truth) ───────┘
```

- Tracks A, B, C are independent of each other and of Phase 4.
- Phase 5 (deploy) ideally waits for Phase 4 if the deployed demo
  should include the agent track; otherwise it can ship after
  Tracks A + B.

---

## Track A — Phase 3 verification artifacts

Code for Phase 3 is shipped (engine picker, `POST /api/reco/predict`,
live re-rank on `/home`, status pill, production-mode regression
verified). What remains is user-side proof.

- [ ] Run the full e2e suite: `scripts/n.sh npm run test:e2e:chromium`.
      Must stay green; production flow (no `RECO_DEMO`) is the
      must-not-break surface. Ticks `EXECUTION.md` (archived) §5 e2e
      box. **Not done in Track A** — needs a **separate triage pass**
      (see below).
- [ ] Manual visual smoke: `RECO_DEMO=1 npm run dev`, open `/home`,
      cycle the header picker through `random`, `popularity`, `gorse`,
      `lightfm`, `implicit`. Confirm the grid visibly reorders and the
      "re-ranked by {engine}" pill updates.
- [ ] Screenshots per non-baseline engine, saved as
      `docs/screenshots/phase3-rerank-<engine>.png` (one for each of
      `gorse`, `lightfm`, `implicit`; baselines optional).
- [ ] Update `RECO_PLAN.md` Phase 3 exit block — drop the "screenshots
      deferred" qualifier once the PNGs land.

**Touches:** `tests/e2e/`, `docs/screenshots/`, `RECO_PLAN.md`.
Zero code overlap with Phase 4.

### E2E gate — separate triage pass (why Track A does not close it)

A full run was attempted (`test:e2e:chromium`, May 2026): **32 passed,
118 failed**, exit code 1. That outcome does **not** indicate a Phase 3
reco regression — there is no `/reco-eval` or engine-picker coverage in
the suite yet, and failures cluster in unrelated areas:

- **Address** specs — immediate failures; many hits
  `SecurityError: Failed to read the 'localStorage' property` (wrong
  document/origin or redirect before the app shell loads).
- **Auth** (login/signup OTP) — ~6s timeouts on modal/OTP steps.
- **Checkout** — broad failures across the checkout spec file.
- **Store** — mixed (many passed; some food-category clicks timed out).
- **Orders** (confirmed e2e) — end-to-end order flow failed.

Playwright uses its **own** production server (`npm run build &&
npm run start` on port 3000 per `tests/e2e/playwright.config.ts`), not
the `RECO_DEMO=1` dev server. Phase 3 sign-off for reco instead rests on
unit tests (1677 passing), `tsc` clean, manual `/home` picker smoke, and
`docs/screenshots/phase3-rerank-{gorse,lightfm,implicit}.png`.

**Follow-up for the e2e gate:** dedicated triage (likely auth credentials,
address/localStorage setup, and baseline flake inventory on `main`) before
ticking the §5 e2e box or claiming “full suite green.” Artifacts:
`tests/e2e/test-results/`, `tests/e2e/playwright-report`.

---

## Track B — Demo polish

Low-risk, high-leverage hygiene that makes the demo more shippable.
Independent of any model work.

- [ ] **Run-history UI.** Wire `GET /api/reco/runs/_index` into a
      dropdown on `/reco-eval` so users can re-load a prior run instead
      of re-running.
- [ ] **Latency column.** `/reco-eval` already collects `latencyMs` per
      (engine, task). Add a "p50 / p95 ms" column to the aggregate
      table.
- [ ] **Engine description tooltip.** Engine `description` is in
      `/api/reco/engines` already; surface it as a hover tooltip next to
      each engine name in the picker.
- [ ] **`/reco-eval` playwright spec.** One light spec under
      `tests/e2e/tests/development/reco/eval.spec.ts` that loads
      `/reco-eval` with `RECO_DEMO=1`, runs random+popularity on the
      seed set, asserts the aggregate table renders ≥ 2 rows.
- [ ] **`RECO_DEMO` baked into `Dockerfile.prod`.** Currently set via
      compose `args`; baking it means `docker run -e RECO_DEMO=1
      dashdoor` Just Works.

**Touches:** `app/reco-eval/`, `Dockerfile.prod`, `tests/e2e/`. Zero
overlap with Phase 4 or Tracks A, C.

---

## Track C — Ground-truth expansion

Today's seed (10 tasks) is intentionally a needle-in-haystack set —
popularity legitimately loses on it. The history split helps, but both
still produce small absolute numbers. Sharpening the eval makes engine
differences more visible (and gives the agent track a fairer comparison).

- [ ] Add ~10 seed tasks of the *item* class (use the `get_items`
      expected-state function in `tasks/dashdoor.csv`).
- [ ] Add ~10 "find a restaurant matching X" tasks — looser than the
      named-restaurant tasks; popularity has a chance.
- [ ] Per-task `candidatePool` filter: scope each task to "restaurants
      within 5 mi of user" so engines compete on a realistic pool.
- [ ] Tag tasks by category (`needle`, `category`, `repeat-purchase`)
      and break out aggregate metrics by tag in the demo UI.

**Touches:** `data/reco-tasks/seed.json` (or split into multiple files),
`lib/reco/eval/task-loader.ts`, `lib/reco/eval/runner.ts`, optionally
`app/reco-eval/reco-eval-client.tsx`. Some UI overlap with Track B —
coordinate via this doc.

---

## How to claim a track

1. Edit the **Owner** column in §Tracks to your name/handle.
2. Set **Status** to "In flight" with a date.
3. When the track ships, set Status to "Done", link the PR, and move
   the row into the "Done so far" list above.

---

## See also

- `RECO_PLAN.md` — phased plan with phase-level checkboxes.
- `EXECUTION.md` — detailed checklist for the *current* phase.
- `CLAUDE.md` — orientation + checkbox discipline rules.
- `HOW_TO_TEST.md` — testing each of the two product goals.
- `docs/execution-phase-0.md`, `docs/execution-phase-2-code.md`,
  `docs/execution-phase-3.md` — archived phase checklists.
