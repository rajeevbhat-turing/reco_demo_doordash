# Execution — Phase 4: LLM-agent track

The gym's second product goal: an LLM drives the real Dashdoor UI,
and its trajectory is scored against the same ground truth the engine
track uses. The engine track ships as-is; nothing here changes
`/home`, `/store`, or `/reco-eval` for non-agent runs.

> Previous EXECUTION.md content is archived in
> `docs/execution-phase-0.md`, `docs/execution-phase-2-code.md`, and
> `docs/execution-phase-3.md`. Phase 3 verification artifacts (e2e +
> screenshots) moved to `parallel_work.md` Track A.

Tick checkboxes the moment a step is done, per `CLAUDE.md`.

---

## 0. Pre-flight

- [ ] Branch off `main` as `phase4-agent` (or continue on `reco`).
- [ ] `npm run dev` clean; `/reco-eval` works; at least one of
      `lightfm` or `implicit` healthy so the agent has a non-trivial
      engine row to be compared against.
- [ ] LLM provider chosen for v1: **Claude** (Anthropic). Env:
      `RECO_AGENT_PROVIDER=claude`, `ANTHROPIC_API_KEY`. OpenAI
      adapter can land as a follow-up; keep the LLM call behind a
      thin interface from day one.

---

## 1. Decisions (lock before coding)

- [ ] **Driver tech:** Playwright (headed in dev, headless in CI),
      reusing the e2e harness's browser context where possible.
- [ ] **Agent run input:** `{ taskId, startUrl, model, maxSteps }`.
- [ ] **Agent run output:** `{ actions, verifierEvents, recommendation }`
      where `recommendation` is the same `RecommendationResponse` shape
      engines emit — so the scorer doesn't care which track produced it.
- [ ] **Action vocabulary v1:** `goto`, `clickByTestId`, `clickBySelector`,
      `type`, `scroll`, `read`, `addToCart`, `finish`. Higher-level than
      raw CDP so the LLM prompt stays readable.
- [ ] **Trajectory → recommendation mapping:**
  - `home_feed` surface: first N distinct `restaurant_id`s the agent
    navigated into via a card click → ranked list.
  - `store_items` surface: items added to cart in click order → top-1;
    fall back to items the agent expanded if cart is empty.
  - Final ordered restaurant/items (verifier-store `orderPlaced`) →
    top-1 hard target overlay.
- [ ] **Step budget:** `maxSteps` default 25; reaching it forces a
      `finish`. Per-task wall-clock timeout default 120s.
- [ ] **Scoring path:** the agent is exposed as a pseudo-engine
      (`lib/reco/engines/agent.ts`) so `runner.ts` and `metrics.ts`
      stay unchanged.

---

## 2. Agent contract + scaffolding (4.1)

- [ ] `lib/reco/agent/types.ts` — `AgentAction`, `AgentInput`,
      `AgentOutput`, `AgentStepRecord`.
- [ ] `tools/reco-agent/` directory:
  - [ ] `package.json` (TypeScript, so types are shared with the rest
        of the repo via a path mapping or workspace).
  - [ ] `src/driver.ts` — Playwright launch + page lifecycle.
  - [ ] `src/actions.ts` — vocabulary dispatcher.
  - [ ] `src/llm/index.ts` + `src/llm/claude.ts` — provider interface
        and first adapter. `openai.ts` stub left empty for now.
  - [ ] `src/observe.ts` — DOM serialization for the prompt (selector
        tree + text excerpts, capped in size).
  - [ ] `src/run.ts` — entry: `(AgentInput) → Promise<AgentOutput>`.
  - [ ] `src/server.ts` — FastAPI-equivalent (`fastify`/`hono`) exposing
        `POST /recommend` that matches `docs/reco-http-contract.md`, so
        the agent can register as an engine via `http.ts`.

---

## 3. Driver + action loop (4.2)

- [ ] `driver.ts` exports `launch({ startUrl, headless }) → { page,
      close, screenshot, domSnapshot }`.
- [ ] Action loop tick:
  1. Serialize current DOM via `observe.ts` (selector tree + visible
     text, truncated to ~8 KB).
  2. Call the LLM with: task statement, action vocabulary, current DOM
     digest, last K actions (default K=5).
  3. Parse the response into an `AgentAction`; dispatch via
     `actions.ts`. On `finish` exit.
  4. Mirror `verifier-store` events for the step. Cheapest path: add a
     read-only `GET /api/verifier-state` route the agent polls
     between actions, or expose `window.__verifier` if same-origin
     is fine.
- [ ] Resilience: catch action failures, surface as `actionError`
      records, let the LLM retry up to 2x per logical step before the
      loop counts a forced `finish`.
- [ ] `tools/reco-agent/` runs both as a one-shot CLI and an HTTP
      server (`src/server.ts`), so it can be invoked from the runner
      *and* from `/reco-eval/agent`.

---

## 4. Trajectory → recommendation mapping (4.3)

- [ ] `lib/reco/agent/extract.ts` —
      `extractRecommendation(actions, verifierEvents, surface, k):
      RecommendationResponse`.
  - `home_feed`: first `k` distinct restaurant_ids visited via card click.
  - `store_items`: items added to cart in click order; fall back to
    items whose description was expanded.
  - Always emit `k` items; pad short trajectories with `null` rank.
- [ ] `lib/reco/engines/agent.ts` — HTTP adapter pointing at the agent
      sidecar's `POST /recommend`. Registry entry name: `agent`.
- [ ] `lib/reco/eval/runner.ts` — per-task timeout knob (default 120s)
      so a slow agent never wedges the whole run.
- [ ] Unit tests for `extract.ts` covering each surface + the
      short-trajectory padding case.

---

## 5. Persisted traces (4.4)

- [ ] `data/reco-agent-runs/<runId>/` layout:
  - `actions.json` — ordered `AgentStepRecord[]`.
  - `step-N.dom.html`, `step-N.png` — per-step DOM + screenshot.
  - `verifier-events.json` — full verifier-store event log.
  - `result.json` — final `AgentOutput` + scored `RecommendationResponse`.
- [ ] `lib/reco/agent/storage.ts` — `saveTrace(runId, trace)` /
      `loadTrace(runId)`, mirroring `lib/reco/eval/storage.ts`'s style.
- [ ] Trace size budget: cap screenshots at 5 per run by default; raise
      via `RECO_AGENT_MAX_SCREENSHOTS` env if a longer trace is needed.

---

## 6. Demo page (4.5)

- [ ] `app/api/reco/agent/route.ts` — `POST { taskId, model, maxSteps }`
      kicks off an agent run; returns `{ runId }`. Background work is
      driven by the agent sidecar; the API just enqueues and returns.
- [ ] `app/api/reco/agent/[id]/route.ts` — `GET` returns the persisted
      trace + score (or in-progress status).
- [ ] `app/reco-eval/agent/page.tsx` — pick task + model + maxSteps, hit
      Run, jump to the replay page.
- [ ] `app/reco-eval/agent/[id]/page.tsx` — replay UI: action list
      (left) + current DOM/screenshot (right) + score footer.
- [ ] Both pages gated by `RECO_DEMO=1` server-side (`notFound()`
      otherwise), same as `/reco-eval`.

---

## 7. Tests

- [ ] Unit: `extract.test.ts` (each surface, padding, no-verifier-events).
- [ ] Unit: `actions.test.ts` (dispatcher, failure paths, retry limit).
- [ ] Unit: `storage.test.ts` (round-trip a trace).
- [ ] E2E (slow lane, tag `@agent`, skipped by default): one seed task
      end-to-end with a **stub LLM** that picks the first card every
      step — proves the wiring without burning real API tokens in CI.

---

## 8. Regression

- [ ] Engine track unchanged: `/reco-eval` runs the same five engines,
      same metrics, same numbers (within noise) before and after.
- [ ] `RECO_DEMO` unset: `/reco-eval/agent` returns 404; no agent code
      is loaded on `/home` or `/store`.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] Full unit suite still green (currently 1677 passing / 3 skipped).

---

## Definition of done

| Criterion | Status |
|-----------|:------:|
| One seed task runs end-to-end with Claude as the agent and produces an `AgentOutput` | TODO |
| Agent shows up next to the five engines in `/reco-eval` with a Hit@K metric | TODO |
| Trace is persisted and replayable at `/reco-eval/agent/<runId>` | TODO |
| Engine-track regression — existing `/reco-eval` flow unchanged | TODO |
| Unit suite + tsc green; new tests for `extract`, `actions`, `storage` | TODO |
| `RECO_PLAN.md` Phase 4 exit block updated | TODO |

After this ships, the next `EXECUTION.md` becomes **Phase 5 — Demo
polish & VM deployment** per `RECO_PLAN.md`. Parallel hygiene tracks
(`parallel_work.md` A/B/C) can be pulled in whenever someone has
bandwidth.
