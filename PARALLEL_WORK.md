# Parallel work tracker

Side tracks that can run alongside whatever phase `EXECUTION.md`
currently scopes. Update **Status** + **Owner** when a track changes
hands. Finer-grained work lives in the track's own section below.

---

## Tracks

| # | Track | Status | Owner | Doc / location |
|---|---|---|---|---|
| A | Phase 3 verification artifacts (e2e + screenshots) | Open (e2e triage in flight) | unassigned | this doc §A |
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
      box. **Not green yet** — triage started on branch
      `fix/e2e-storage-and-login` (see §A e2e triage).
- [x] E2e triage pass 1 — storage clearing + login user + Playwright
      `webServer` (branch `fix/e2e-storage-and-login`, commits
      `9e43af5`, `cb4f8ce`). Details in §A e2e triage.
- [ ] Manual visual smoke: `RECO_DEMO=1 npm run dev`, open `/home`,
      cycle the header picker through `random`, `popularity`, `gorse`,
      `lightfm`, `implicit`. Confirm the grid visibly reorders and the
      "re-ranked by {engine}" pill updates.
- [ ] Screenshots per non-baseline engine, saved as
      `docs/screenshots/phase3-rerank-<engine>.png` (one for each of
      `gorse`, `lightfm`, `implicit`; baselines optional). **Captured
      locally** (`phase3-rerank-{gorse,lightfm,implicit}.png`); not yet
      committed to the repo.
- [ ] Update `RECO_PLAN.md` Phase 3 exit block — drop the "screenshots
      deferred" qualifier once the PNGs land.

**Touches:** `tests/e2e/`, `docs/screenshots/`, `RECO_PLAN.md`.
Zero code overlap with Phase 4.

### E2E gate — separate triage pass (why Track A does not close it)

**Baseline (pre-triage, May 2026):** `test:e2e:chromium` → **32 passed,
~118 failed**, exit code 1. That outcome does **not** indicate a Phase 3
reco regression — no `/reco-eval` or engine-picker coverage in the suite;
failures were test-harness and fixture drift, not reco code.

**Triage pass 1 (done on `fix/e2e-storage-and-login`, pushed):**

| Change | Files / notes |
|--------|----------------|
| Document deferral | `PARALLEL_WORK.md`, `docs/execution-phase-3.md`, `RECO_PLAN.md` (`9e43af5`) |
| `clearBrowserStorage(page)` navigates to app origin before touching `localStorage` | `tests/e2e/utils/test-helpers.ts`; all specs that cleared storage in `beforeEach` |
| Login user `john.doe@example.com` | `tests/e2e/constants.ts`, `test-credentials.example.ts`, fundamentals specs |
| DB seed for login user | `data/db/schema/e2e_user_seed.sql`, `data/db/dashdoor.db` (id 3001) |
| Playwright `webServer` from repo root + default `LIBSQL_*` env | `tests/e2e/playwright.config.ts` |
| `/auth` login suite fixes (tab navigation, repeat login after storage clear) | `tests/e2e/page-objects/auth.page.ts`, `tests/development/auth/login.spec.ts` |

**Verified after pass 1** (prod server on port 3000, `reuseExistingServer`):

| Suite | Result |
|-------|--------|
| `test:e2e:address` | **16/16** (was 0/16 — `SecurityError` on `about:blank`) |
| `test:e2e:auth:signin` | **10/10** (was failing on `test@example.com` / missing OTP) |
| `test:e2e:fundamentals` | **11 passed / 10 failed** (modal signup/login, reorder, checkout) |
| Full `test:e2e:chromium` | **Not re-green** — checkout, reorder, reviews, store, orders still red |

**Still failing (pass 2+):**

- **Fundamentals** — landing-modal auth (signup tab, validation copy, modal OTP flow).
- **Checkout / reorder / reviews / store** — cart/dialog selectors, food-category clicks, order e2e.
- **Orders** (confirmed) — add-to-cart modal timeout on full flow.

Playwright uses its **own** production server (`npm run build &&
npm run start` on port 3000 per `tests/e2e/playwright.config.ts`), not
the `RECO_DEMO=1` dev server. Phase 3 sign-off for reco still rests on
unit tests (1677 passing), `tsc` clean, manual `/home` picker smoke, and
`docs/screenshots/phase3-rerank-{gorse,lightfm,implicit}.png`.

**Apply seed on a fresh clone:**

```bash
sqlite3 data/db/dashdoor.db < data/db/schema/e2e_user_seed.sql
```

Artifacts: `tests/e2e/test-results/`, `tests/e2e/playwright-report`.
PR branch: `fix/e2e-storage-and-login` → https://github.com/rajeevbhat-turing/reco_demo_doordash/tree/fix/e2e-storage-and-login

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

- `docs/overview-flowchart.md` — what the reco gym does (product flow, no
  parallel-track detail).
- `RECO_PLAN.md` — phased plan with phase-level checkboxes.
- `EXECUTION.md` — detailed checklist for the *current* phase.
- `CLAUDE.md` — orientation + checkbox discipline rules.
- `HOW_TO_TEST.md` — testing each of the two product goals.
- `docs/execution-phase-0.md`, `docs/execution-phase-2-code.md`,
  `docs/execution-phase-3.md` — archived phase checklists.
