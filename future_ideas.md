# Future ideas

Deferred from the active plan. Move an item out of this file when it
becomes scoped enough to land in `EXECUTION.md` or a track in
`parallel_work.md`.

---

## Demo polish — items cut from v1 (deferred 2026-05-21)

Moved out of `demo_setup.md` to keep the v1 demo to ~3–4 days of work.
Pick these back up after a client has actually used the v1 demo and
told us what they need.

- **Dedicated `/reco-eval/agent` kickoff page** — task/model/maxSteps
  form, status polling, "view trace" link. v1 just uses the existing
  `/reco-eval` with the `agent` engine selected; per-run config lives
  on the sidecar env.
- **`GET /api/demo/status`** — preflight that returns
  `{dashdoor, gorse, lightfm, implicit, agent, llmProvider,
  llmKeyPresent}` so `/demo` can grey out broken modes. Nice-to-have,
  not blocking — a 404 on a card is acceptable for a first demo.
- **`/reco-eval` preset profiles + "load last run"** — "Benchmark
  (history)", "Needle tasks (seed)" pre-checked, plus a dropdown to
  re-load a prior run from `data/reco-runs/`. Today's checkbox UI works
  for a guided demo.
- **Mode 4 — Compare-on-one-task wizard** — `/demo/compare?taskId=…`
  flow that runs engines first (fast) then the agent (slow) and shows
  three rows side-by-side. Strongest sales demo when it exists, but
  it's a wizard, not a small feature.
- ~~**Enterprise LLM gateway provider**~~ — **promoted to Phase 5**;
  see `BYO_LLM.md` and `EXECUTION.md` Phase 5. The agent providers now
  accept a custom `baseURL` / `endpoint` so clients can point at any
  OpenAI- or Anthropic-compatible gateway. Their key never reaches our
  backend.
- **Basic auth on `/demo`** — for VMs exposed to a wider audience than
  internal/VPN. v1 trusts the network boundary.
- **Custom task upload** — let clients POST a `RecoTask[]` JSON to add
  their own tasks. v1 is seed-only; custom tasks are a power-user
  feature.
- **Concurrent agent run queueing** — sidecar runs one task at a time
  today (browser is a singleton). Once clients want parallel evals,
  add a queue with visible state on `/demo`.
- **Trace download** — `data/reco-agent-runs/<id>.zip` so clients can
  inspect a failed run without us. Lives between v1 (JSON to stdout)
  and the full replay page.

---

## Agent replay page (deferred 2026-05-21)

Was Phase 4 §5 + §6 in `EXECUTION.md`. Cut because the JSON trace from
`runAgent` is enough for debugging today; pretty replay only matters
once we're showing the agent to non-technical viewers.

**What it is:** a per-step scrubber at `/reco-eval/agent/<runId>` —
left pane lists the agent's actions, right pane shows the screenshot
+ DOM the LLM saw + the action it emitted. Footer carries the final
Hit@K score against the task's expected ids.

**Why it helps:** when an agent scores 0, the JSON tells you it didn't
click the right card; the replay tells you *why* (DOM missing testid,
scroll didn't lazy-load, wrong "Add" button, etc.).

**Sketch of what to build when we pick this up:**
- `lib/reco/agent/storage.ts` — `saveTrace(runId, trace)` /
  `loadTrace(runId)`. Lay out `data/reco-agent-runs/<runId>/` with
  `actions.json`, `step-N.dom.html`, `step-N.png`,
  `verifier-events.json`, `result.json`.
- `app/api/reco/agent/route.ts` + `[id]/route.ts` — kickoff + fetch.
- `app/reco-eval/agent/page.tsx` — task/model/maxSteps form.
- `app/reco-eval/agent/[id]/page.tsx` — scrubber UI.
- Sidecar `run.ts` already captures the data; just wire the writes
  via `storage.ts`.
- Both pages gated by `RECO_DEMO=1`, same as `/reco-eval`.

Rough size: one solid day. Independent of Phase 5 (deploy) — could
land any time after the agent itself is proven on a real task.
