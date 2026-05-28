# Execution — Phase 5: BYO LLM/engine plumbing + local deploy

Bring-your-own-LLM and bring-your-own-engine, exposed on the deployed
`/reco-eval` UI. Client never shares keys; they host a tiny
OpenAI-compatible gateway on their side and give us only its URL.
Same image works on the VM and locally so changes can be smoke-tested
before redeploying.

> Phase 4 (LLM-agent track) archived at `docs/execution-phase-4.md`.
> Verification artifacts for earlier phases stay in
> `parallel_work.md`.

Tick boxes the moment a step is done, per `CLAUDE.md`.

---

## 0. Pre-flight

- [ ] Working tree clean enough to push (or accept that uncommitted
      Phase 4 work goes along for the ride).
- [ ] Local stack builds: `docker compose -f config/docker-compose.demo.yaml --env-file deploy/env.demo.example build`
      runs to completion. Skip if it already worked once.

---

## 1. Decisions (lock before coding)

- [x] **BYO LLM contract**: client hosts an OpenAI-compatible chat-
      completions endpoint. Gym agent uses it as the LLM for every
      tick. Their provider key stays on their gateway; we send just
      the chat messages.
- [x] **BYO engine contract**: client hosts any service that speaks
      the wire contract in `docs/reco-http-contract.md` (`POST
      /recommend` → `RecommendationResponse`). Same shape LightFM /
      Implicit / Gorse use.
- [x] **Surface**: both URLs are entered in a collapsible "Bring your
      own" panel on `/reco-eval`. Closed by default — the basic flow
      is unchanged.
- [x] **Privacy**: BYO LLM URL + key are sent to the agent sidecar
      per request, not persisted server-side. Trace files redact the
      Bearer token. Document the privacy boundary.
- [x] **Same image locally**: the existing `config/docker-compose.demo.yaml`
      + `scripts/demo-up.sh` work for `localhost` too — just point
      `ENV_FILE` at a local copy of `deploy/env.demo.example`.

---

## 2. Type + wire contract extensions

- [x] `lib/reco/types.ts` — extend `RecoContext` with optional
      `agentLlmUrl?: string`, `agentLlmApiKey?: string`. Plain engines
      ignore them.
- [x] `tools/reco-agent/src/wire.ts` — mirror the additions.
- [ ] `docs/reco-http-contract.md` — note the new optional fields and
      that they are *agent-only*; library engines drop them.

---

## 3. Agent providers — accept a custom endpoint

- [x] `tools/reco-agent/src/llm/openai.ts` — already accepts
      `endpoint` + `apiKey` ✓ (verified; no code change needed).
- [x] `tools/reco-agent/src/llm/claude.ts` — `baseURL` option flows
      to `new Anthropic({ baseURL })`.
- [x] `tools/reco-agent/src/run.ts` `pickProvider`: accepts
      `{ llmUrl, llmApiKey }` overrides, passes through to provider
      factory. Model-prefix rule unchanged.
- [x] `tools/reco-agent/src/run.ts` `runAgent`: takes
      `RunAgentOverrides`, threads to `pickProvider`.
- [x] `tools/reco-agent/src/server.ts` `/recommend`: validates and
      reads `agentLlmUrl`/`agentLlmApiKey` from the body, passes to
      `runAgent`.

---

## 4. Eval API — BYO fields end-to-end

- [x] `app/api/reco/eval/route.ts` — body accepts `agentLlmUrl`,
      `agentLlmApiKey`, `customEngineUrl`. Malformed http(s) URLs
      rejected.
- [x] `lib/reco/eval/runner.ts` `runEval`: `RunEvalOptions` extended;
      threads BYO LLM fields into per-task ctx; builds transient
      `custom` HTTP engine when `customEngineUrl` is set.
- [x] Engine row labelled `custom` in aggregate + per-task tables.

---

## 5. UI — collapsible "Bring your own" panel

- [x] `app/reco-eval/reco-eval-client.tsx`: `<details>` panel between
      controls and progress card, with the three inputs + show/hide
      key toggle + "Remember this key" checkbox.
- [x] localStorage persistence for URL and engine URL (always);
      LLM key only when "Remember" is ticked.
- [x] Help text on each input references `BYO_LLM.md` and the wire
      contract doc.
- [x] Runtime estimate now counts `custom` engine when its URL is set.

---

## 6. Tests

- [ ] `tests/unit/reco/eval-runner.byo.test.ts` (new):
  - Custom engine URL → transient engine appears in the report.
  - `agentLlmUrl`/`agentLlmApiKey` propagate into the ctx the runner
    hands to each engine.
- [ ] `tests/unit/reco/agent-extract.test.ts` — re-confirm no
      regression (existing 6 tests).
- [ ] Sidecar unit (optional): `pickProvider` picks the right
      provider when given a custom URL.

---

## 7. Local-deployable smoke

- [x] `deploy/env.demo.local.example` — local-run template with the
      cp / ENV_FILE recipe at the top.
- [x] `.gitignore` — `deploy/env.demo.local` excluded.
- [x] `scripts/demo-up.sh` — already honors `ENV_FILE`; no code
      change. Verified.
- [x] `deploy_plan.md` §7.1.5 documents the local-run recipe
      (kept out of `how_to_use.md` per its no-tech-info charter).
- [ ] Operator smoke (you run by hand):
  - `cp deploy/env.demo.local.example deploy/env.demo.local`
  - fill `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY`
  - `ENV_FILE=deploy/env.demo.local ./scripts/demo-up.sh`
  - `curl localhost:3000/api/reco/engines` → 6 engines including `agent`
  - tick `agent` on `/reco-eval`, paste your gateway URL in the BYO
    panel, run on `seed` (1 task), confirm score lands

---

## 8. BYO docs

- [x] `BYO_LLM.md` — gateway example, plug-in flow, privacy boundary,
      pointer to `Custom engine URL` for non-LLM clients.
- [ ] `docs/reco-http-contract.md` — note custom-engine URL pattern;
      same wire contract as LightFM / Implicit.
- [x] `/demo` landing: LLM-agent card updated to point at
      `BYO_LLM.md`. (Operator-notes block removed per separate
      request.)

---

## 9. Cleanup / cross-doc updates

- [x] `future_ideas.md` — Enterprise LLM gateway entry marked promoted
      to Phase 5 with a pointer to `BYO_LLM.md`.
- [ ] `RECO_PLAN.md` — flip Phase 5 to include BYO; update Phase 5
      exit criteria.
- [ ] `demo_setup.md` — mention the BYO panel and `BYO_LLM.md`.

---

## 10. Regression

- [x] `npx tsc --noEmit` → 0 errors (main + sidecar).
- [x] Reco unit suite — 30 / 30 green (no regression).
- [x] `/reco-eval` with the BYO panel closed: omits BYO fields from
      the request body (verified in `runEval` body — `...spread` only
      when the inputs are non-empty).
- [x] Sidecar `/run` path unchanged (no `agentLlmUrl`/`ApiKey` on
      `AgentInputSchema`); `/recommend` path defaults to env-driven
      provider when BYO fields are absent.

---

## Definition of done

| Criterion | Status |
|-----------|:------:|
| Client can paste an LLM gateway URL on `/reco-eval`, tick `agent`, hit Run, and the deployed sidecar's LLM calls land on their URL | TODO |
| Client can paste a custom engine URL on `/reco-eval`, hit Run, and a `custom` row appears in the metric table | TODO |
| `/etc/reco-demo/env` / our `.env` never see the client's API key | TODO |
| Operator can `cp deploy/env.demo.local.example deploy/env.demo.local` + `ENV_FILE=... ./scripts/demo-up.sh` and smoke the whole stack on `localhost` before pushing to the VM | TODO |
| `BYO_LLM.md` has a working gateway example | TODO |
| `tsc` + unit tests green | TODO |
| `RECO_PLAN.md` Phase 5 exit block updated | TODO |
