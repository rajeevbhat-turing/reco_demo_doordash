# How to test the recommendation gym

Two product goals, each with its own end-to-end test loop. Run through
the checkboxes for whichever goal you're validating. Both loops assume
you've completed `GORSE_VERIFY.md` (or are running with just the
built-in `random` + `popularity` engines for the offline path).

| Goal | Status | Section |
|------|--------|---------|
| 1. Plug in recommendation engines and measure performance | **Built (Phase 0)** — random, popularity, Gorse wired up | [§1](#goal-1-engine-plug-in-track) |
| 2. LLM-based agent uses the UI; we measure its performance | **Not yet built** — designed in Phase 4 of `RECO_PLAN.md`. Manual fallback works today. | [§2](#goal-2-llm-agent-track) |

---

## Goal 1: engine plug-in track

Verify that any recommendation engine can be plugged in and scored
against ground truth.

### 1.1 Pre-flight

- [ ] On branch `reco`, working dir is the repo root.
- [ ] Node 20 active: `scripts/n.sh node -v` → `v20.x`.
- [ ] `data/db/dashdoor.db` exists (ships with the repo).
- [ ] `data/reco-tasks/seed.json` exists and has ≥ 5 entries:
      ```sh
      python3 -c "import json; print(len(json.load(open('data/reco-tasks/seed.json'))))"
      ```

### 1.2 Unit-test layer (offline, fastest)

- [ ] All 19 reco unit tests pass:
      ```sh
      scripts/n.sh npm run test:unit -- tests/unit/reco/
      ```
      Expected: `Test Files 2 passed (2)`, `Tests 19 passed (19)`.
- [ ] If one fails, the failure is the regression. Don't move on until it's green.

### 1.3 In-repo engines end-to-end

The two engines that need zero external infra: `random` and
`popularity`. They're the smoke test for the harness itself.

- [ ] Start the gym:
      ```sh
      RECO_DEMO=1 scripts/n.sh npm run dev
      ```
- [ ] In another shell, list engines:
      ```sh
      curl -s http://localhost:3000/api/reco/engines | python3 -m json.tool
      ```
      Expected: 3 entries (`random`, `popularity`, `gorse`). Gorse may
      respond but error on actual `/recommend` calls if its sidecar
      isn't up — that's fine for this test.
- [ ] Run an eval on the curated seed:
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random","popularity"],"taskSetId":"seed","k":5}'
      ```
      Expected: `random` Hit@5 ≈ 0.1, `popularity` Hit@5 ≈ 0.0
      (the seed favors needle-in-haystack named lookups).
- [ ] Run an eval on history:
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random","popularity"],"taskSetId":"history","k":5,"historyLimit":30}'
      ```
      Expected: `popularity` Hit@5 ≥ `random` Hit@5. If not, the
      catalog or history splitter changed — investigate before moving on.
- [ ] Persistence check — fetch the saved report:
      ```sh
      LAST=$(ls -t data/reco-runs/ | head -1 | sed 's/.json//')
      curl -s "http://localhost:3000/api/reco/runs/$LAST" | head -c 400
      ```
      Expected: same JSON shape as the in-memory response.

### 1.4 External engine (Gorse) end-to-end

- [ ] Follow `GORSE_VERIFY.md` end-to-end first.
- [ ] At its §4 step, you've already done this test.
- [ ] Success bar: `gorse` Hit@5 ≥ `random` Hit@5 on the **history**
      task set. (Not vs popularity — popularity is a strong baseline.)

### 1.5 Plug in a *new* engine (this is the real test of the contract)

If the next person can add an engine in < 10 minutes, the harness works.

- [ ] Create `lib/reco/engines/my-engine.ts`. Minimal stub:
      ```ts
      import type { RecommendationEngine } from '@/lib/reco/types';
      export const myEngine: RecommendationEngine = {
        name: 'my-engine',
        version: '0.0.1',
        description: 'returns the first k items in the candidate pool',
        async recommend(ctx) {
          const start = performance.now();
          const items = (ctx.candidatePool ?? []).slice(0, ctx.k).map((id, i) => ({
            id,
            score: 1 - i / Math.max(ctx.k, 1),
            kind: 'restaurant' as const,
          }));
          return {
            items,
            engine: 'my-engine',
            version: '0.0.1',
            latencyMs: performance.now() - start,
          };
        },
      };
      ```
- [ ] Register it in `lib/reco/engines/index.ts` — add to the
      `builtin` array.
- [ ] Restart the dev server.
- [ ] `curl -s http://localhost:3000/api/reco/engines` now shows 4
      engines. ✓ contract works.
- [ ] Run an eval including `my-engine`. It should not error; metrics
      will likely be near-zero since it ignores the request. ✓ runner
      works with arbitrary engines.

### 1.6 Visual check in the demo UI

- [ ] Open `http://localhost:3000/reco-eval`.
- [ ] All engines appear in the checkbox list.
- [ ] "Run eval" → aggregate table populates, per-task drilldowns
      expand and show predicted ids.
- [ ] Errors (e.g. Gorse down) appear in the drilldown as
      `error: …` strings; the rest of the run completes.

### 1.7 Regression check on the rest of Dashdoor

The reco harness must not break the existing UI.

- [ ] `/home` loads: `curl -sI http://localhost:3000/home` → 200.
- [ ] `/store/202` loads (or any valid restaurant id).
- [ ] The full unit suite still passes:
      `scripts/n.sh npm run test:unit` — count should be unchanged
      from baseline.
- [ ] Chromium e2e (longer, only run before PR):
      `scripts/n.sh npm run test:e2e:chromium`.

---

## Goal 2: LLM-agent track

**Status: not yet built.** The agent driver, action loop, and
score-extraction are scheduled for Phase 4 of `RECO_PLAN.md`. This
section describes (a) what the test *will* look like once Phase 4
ships, and (b) a **manual fallback** you can run today by piloting the
UI yourself in place of the agent.

### 2.1 Future automated test (after Phase 4 lands)

When Phase 4 is implemented, this section will read:

- [ ] Start the gym: `RECO_DEMO=1 scripts/n.sh npm run dev`
      (or via the compose file).
- [ ] Pick a task from `data/reco-tasks/seed.json`. Note its
      `taskId`, `userEmail`, and `expectedItemIds`.
- [ ] Launch the agent against that task:
      ```sh
      scripts/n.sh npx tsx tools/reco-agent/run.ts \
        --task <taskId> --model claude-opus-4-7 --headed
      ```
- [ ] The agent drives the UI via Playwright. The verifier store
      captures each click/view/cart-add as an event.
- [ ] When the agent finishes (or hits a step cap), the runner builds
      a `RecommendationResponse` from the agent's actions:
      - First N restaurants visited → ranked list
      - Items added to cart → top-1
      - Final ordered restaurant/items → hard target
- [ ] The same metrics (Hit@K, NDCG@K, MRR) from Goal 1 are applied to
      that response.
- [ ] Trace is saved under `data/reco-agent-runs/<runId>/` with
      screenshots, DOM snapshots, and the action log.
- [ ] Open `/reco-eval/agent/<runId>` to replay the trace and see the
      score next to the engine-track scores.

**Tracking checkbox:** none of the above paths exist yet. The
`RecoTask` shape (`lib/reco/eval/task-loader.ts`) is already
agent-ready — it carries the user email, lat/lng, statement, and
expected ids.

### 2.2 Manual test you can run today

You can validate the *measurement* half of Goal 2 without the agent:
a human plays the role of the agent and we observe whether the
existing verifier captures enough to score them.

- [ ] Start the gym: `RECO_DEMO=1 scripts/n.sh npm run dev`.
- [ ] Pick a seed task — for example:
      ```sh
      python3 -c "import json; t = json.load(open('data/reco-tasks/seed.json'))[0]; print(t)"
      ```
      You'll get something like:
      ```
      taskId: item-addon-order-001
      user: xavier.ingram898@mail.test
      expected: ['202']   # West Diner
      statement: Order mac & cheese from West diner, select the extra cheese add on
      ```
- [ ] Open `http://localhost:3000` in a private/incognito window.
- [ ] Log in as that user (passwords are in the user db; for synthetic
      users they're often documented in `MERCHANT_README.md` or can be
      pulled by `sqlite3 data/db/dashdoor.db 'SELECT email, password FROM users WHERE email = ?'`).
- [ ] Follow the `statement` literally — you are now the agent.
- [ ] When you order, the verifier store records the order:
      `recordOrderCompletion({ orderId, storeName, items, ... })`. Open
      DevTools and check: `localStorage.getItem('verifier-state')` —
      `lastOrderInfo.storeName` should be "West Diner".
- [ ] Score yourself the same way the future agent will be scored:
      did the store you ordered from match `expectedItemIds`?
      That's Hit@1 for the agent track on that task.

This proves: the **signal** the agent track needs (which store/item
the user committed to) is already being captured by the existing
verifier store; only the driver is missing.

### 2.3 Smoke test for the agent-track plumbing that exists

Even pre-Phase-4, some pieces are testable.

- [ ] `RecoTask` shape carries everything an agent needs:
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random"],"taskSetId":"seed","k":5}' \
        | python3 -c "
      import sys,json
      d=json.load(sys.stdin)
      for row in d['report']['perTask'][:3]:
          print(row['taskId'], 'expects', row['expectedItemIds'], '-', row['statement'][:80])
      "
      ```
      Each row contains task id, statement, expected ids — that's the
      full agent input.
- [ ] `tasks/dashdoor.csv` has the rich version (start_url,
      `simulator_config.bootstrap_data`, full grader config). Phase 4
      will read both.

---

## What "passing" means for each goal

| Goal | Pass when… |
|------|------------|
| 1 | `random`, `popularity`, and a third (new or external) engine all run via `/api/reco/eval` without error, return metrics, and a stakeholder can read them off `/reco-eval`. |
| 2 | A Playwright-driven LLM agent (Phase 4) finishes ≥ 1 task from `data/reco-tasks/seed.json` and gets a Hit@1 ≥ 0 score that appears next to the engine scores in `/reco-eval`. **Until Phase 4 ships, the manual fallback in §2.2 is the test.** |

---

## Related docs

- `RECO_PLAN.md` — phased plan, where each goal sits.
- `EXECUTION.md` — current phase's detailed steps.
- `GORSE_VERIFY.md` — bringing up + verifying the Gorse external engine.
- `lib/reco/README.md` — adapter contract for new engines.
- `docs/reco-decisions.md` — Phase 1 decisions, including the metric
  definitions used by both goals.
