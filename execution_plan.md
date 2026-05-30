# Execution — Phase 7: BYO re-ranker, A/B vs. baseline

**Goal:** a client who wants to improve their ranking model points it at
the gym and A/Bs it against the OpenSearch baseline on persona ground
truth. We hand the ranker the **same candidate set the baseline saw,
plus per-candidate features**; it returns an ordered list (+ scores); we
score against `buildExpected(persona)` and render baseline vs. BYO
side-by-side on `/reco-eval`, with per-section win/loss and score
attribution.

Two BYO paths, one A/B table:
- **Path A — BYO endpoint (headline):** client hosts `POST /recommend`
  receiving `{ personaId, topK, candidates:[{id, features}] }`.
- **Path B — BYO LLM key (on-ramp):** client gives base URL + key +
  model; we run the ranking prompt over the same candidates against
  *their* model. Key is request-scoped, never persisted.

Reference code to port (commit `519ac1e` on `main`):
`lib/reco/metrics.ts`, `lib/reco/eval/runner.ts`, `lib/reco/engines/`
(`makeHttpEngine`, `customEngineUrl`/`agentLlmUrl` passthrough).

> Out of scope here: agentic browse (shelved), Python engines (dropped),
> and all Phase 8 label-quality work (outliers, adaptive exploration).

When this phase exits, clear this file's body and replace it with
Phase 8's detailed steps, then tick **Phase 7** in `plan.md`.

---

## 1. Candidate + features contract (everything keys off this)

- [ ] **1.1** Add a candidate builder in `lib/reco/` (e.g.
      `candidates.ts`): given a persona, return the radius-filtered
      candidate pool (reuse `CANDIDATE_RADIUS_MILES`) — the *same* set
      OpenSearch ranks, so the A/B is apples-to-apples.
- [ ] **1.2** Define the per-candidate feature vector: cuisine-affinity
      match, price-tier match, distance (mi), avg rating, persona
      past-order count, promo/discount, `dash_pass`. Type it in
      `lib/reco/types.ts` (`CandidateFeatures`, `RecommendRequest`,
      `RecommendResponse`).
- [ ] **1.3** Recreate `docs/reco-http-contract.md` documenting the
      `POST /recommend` request (`{ personaId, topK, candidates }`) and
      response (`{ engine, personaId, ranked_ids, scores?, trajectory }`).
      design.md already references this file — make it real.
- [ ] **1.4** Update the OpenSearch sidecar (`tools/reco-engines/opensearch/`)
      to accept the candidates payload (rank within the provided set)
      rather than retrieving its own pool, so baseline + BYO rank the
      identical candidate set. Keep `_explain` → `raw_explain`.

## 2. Metrics

- [ ] **2.1** Port `lib/reco/metrics.ts` from `519ac1e`: `scoreTask`
      (precision@k, recall@k, NDCG@k, overlap) + `aggregate`. Score
      against `buildExpected(persona).flat_ranked_ids`.
- [ ] **2.2** Add a `blocked_restaurant_ids` penalty: any blocked ID in
      the ranked output is a hard miss (surface as its own metric, e.g.
      `blocked_hits`).
- [ ] **2.3** Unit tests in `lib/reco/__tests__/` — exact ranking →
      perfect scores; shuffled, partial, and blocked-hit cases.

## 3. Path B — LLM re-ranker sidecar

- [ ] **3.1** Scaffold `tools/reco-engines/llm-ranker/` (mirror the
      opensearch sidecar layout: `server.ts`, `recommend.ts`,
      `package.json`, `tsconfig.json`). Serve `:4002`, with `/health`.
- [ ] **3.2** Implement the ranking prompt: persona profile + order
      history + the candidate list (id, name, cuisine, price, rating,
      distance) → model returns candidate IDs in ranked order. Constrain
      output to the provided candidate set; validate/repair the IDs.
- [ ] **3.3** BYO routing: read `llm:{ baseUrl, apiKey, model }` from the
      request; fall back to a server-default key from env when absent.
      Set `source: 'byo-gateway' | 'server-default'` + `gatewayHost` in
      the response. **Never log or persist the key.**
- [ ] **3.4** Emit a thin trajectory: `query` (the prompt), `candidate_gen`
      (candidate IDs), `final` (ranked IDs); include returned `scores`.

## 4. Path A — transient client endpoint

- [ ] **4.1** Port `makeHttpEngine` (`lib/reco/engines/http.ts`): wrap an
      arbitrary `/recommend` URL as an engine with a timeout.
- [ ] **4.2** `/reco-eval` accepts a client-hosted URL and registers it
      as a transient `custom` engine for that run only (not written to
      `config/reco-engines.json`).

## 5. BYO panel UI (`/reco-eval`)

- [ ] **5.1** Add a BYO panel with two tabs: **"Use my endpoint"** (URL)
      and **"Use my LLM"** (base URL + API key + model). State clearly
      that the key is request-scoped and never stored.
- [ ] **5.2** Wire panel inputs into the run request; clear the key field
      from state after the run.

## 6. Multi-engine fan-out + A/B table

- [ ] **6.1** Change `handleRun` to fan out to **all** selected engines +
      any BYO engine concurrently (today it runs only the first selected
      engine). Collect a result per engine.
- [ ] **6.2** Render a **comparison table**: rows = metrics
      (precision@k, recall@k, NDCG@k, blocked_hits), columns = engines,
      **OpenSearch column highlighted** as the line to beat.
- [ ] **6.3** Per-section win/loss: for each persona section, show which
      engine matched the expected familiar/explore slots.

## 7. Score attribution in drilldown

- [ ] **7.1** Keep the OpenSearch `_explain` breakdown (already present).
- [ ] **7.2** For BYO engines, render the returned per-candidate `scores`
      in the trajectory modal so "why did this rank here" works for any
      engine, not just OpenSearch.

## 8. Registry + docs + demo cleanup

- [ ] **8.1** `config/reco-engines.json` = opensearch (baseline) +
      llm-ranker (byo). Remove any Python-engine references from docs.
- [ ] **8.2** Extend `scripts/persona-demo-smoke.sh`: bring up the
      llm-ranker sidecar with a server-default key; assert a scored A/B
      result for alice-tran (baseline + llm-ranker both return
      `ranked_ids`, metrics computed).
- [ ] **8.3** Update `docs/PERSONA_DEMO.md` and the `/demo` landing page
      with the BYO-ranker A/B story (closes the two Phase 6 carry-overs).

## Exit criteria

- [ ] **A/B works end-to-end** — on `/reco-eval`, selecting OpenSearch +
      a BYO engine for a persona and clicking Run produces a comparison
      table with metrics for both, baseline highlighted.
- [ ] **BYO LLM path** — pasting a base URL + key + model ranks via that
      model; response shows `source: 'byo-gateway'`; key is not persisted
      anywhere.
- [ ] **Smoke passes** — `bash scripts/persona-demo-smoke.sh` exits 0,
      including the llm-ranker A/B assertion.
- [ ] **Types clean** — `npx tsc --noEmit` passes.
- [ ] **Unit tests green** — `npm run test:unit` (incl. new metrics
      tests) passes.

> **On exit:** tick **Phase 7** in `plan.md`, clear this file's body,
> replace with Phase 8 (label quality) steps.
