# reco-agent

LLM-driven browser agent for the Dashdoor reco gym (Phase 4 of
`RECO_PLAN.md`). Speaks the same `POST /recommend` contract
(`docs/reco-http-contract.md`) as the LightFM / Implicit sidecars, so
it plugs into `lib/reco/engines/agent.ts` and shows up next to the
other engines in `/reco-eval` when `RECO_AGENT_URL` is set.

## Status

Phase 4 §0–§2 scaffolding only. Files exist; the action loop and
LLM adapters are stubs that throw `not implemented`. §3–§4 wires
them up against Playwright + Claude.

## Layout

```
src/
  types.ts        action vocabulary, AgentInput / AgentOutput shapes
  wire.ts         RecoContext / RecommendationResponse wire types (duplicated)
  observe.ts      DOM serialization for the LLM prompt
  actions.ts      action dispatcher (Playwright bindings)
  driver.ts       Playwright launch + page lifecycle
  llm/
    index.ts      provider interface
    claude.ts     Anthropic SDK adapter
    stub.ts       deterministic stub (picks first card every step)
  run.ts          single-run entry: (AgentInput) → AgentOutput
  server.ts       hono HTTP server exposing POST /recommend
```

## Run (once §3–§4 land)

```
npm install
npx playwright install chromium
ANTHROPIC_API_KEY=... npm run dev     # server on :8003
```

Then in the parent repo:

```
RECO_AGENT_URL=http://localhost:8003/recommend npm run dev
```

## Wire contract

Same as the other sidecars — see `docs/reco-http-contract.md`. The
agent's response is the trajectory mapped to a `RecommendationResponse`
via `lib/reco/agent/extract.ts` (Phase 4 §4); the request body is the
standard `RecoContext`, with `meta.taskId` used to look up the task
statement.
