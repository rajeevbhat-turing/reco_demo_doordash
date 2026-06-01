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

- [x] **1.1** Add a candidate builder in `lib/reco/` (e.g.
      `candidates.ts`): given a persona, return the radius-filtered
      candidate pool (reuse `CANDIDATE_RADIUS_MILES`) — the *same* set
      OpenSearch ranks, so the A/B is apples-to-apples.
- [x] **1.2** Define the per-candidate feature vector: cuisine-affinity
      match, price-tier match, distance (mi), avg rating, persona
      past-order count, promo/discount, `dash_pass`. Type it in
      `lib/reco/types.ts` (`CandidateFeatures`, `RecommendRequest`,
      `RecommendResponse`).
- [x] **1.3** Recreate `docs/reco-http-contract.md` documenting the
      `POST /recommend` request (`{ personaId, topK, candidates }`) and
      response (`{ engine, personaId, ranked_ids, scores?, trajectory }`).
      design.md already references this file — make it real.
- [x] **1.4** Update the OpenSearch sidecar (`tools/reco-engines/opensearch/`)
      to accept the candidates payload (rank within the provided set)
      rather than retrieving its own pool, so baseline + BYO rank the
      identical candidate set. Keep `_explain` → `raw_explain`.

## 2. Metrics

- [x] **2.1** Port `lib/reco/metrics.ts` from `519ac1e`: `scoreTask`
      (precision@k, recall@k, NDCG@k, overlap) + `aggregate`. Score
      against `buildExpected(persona).flat_ranked_ids`.
- [x] **2.2** Add a `blocked_restaurant_ids` penalty: any blocked ID in
      the ranked output is a hard miss (surface as its own metric, e.g.
      `blocked_hits`).
- [x] **2.3** Unit tests in `tests/unit/reco/` — exact ranking →
      perfect scores; shuffled, partial, and blocked-hit cases.

## 3. Path B — LLM re-ranker sidecar

- [x] **3.1** Scaffold `tools/reco-engines/llm-ranker/` (mirror the
      opensearch sidecar layout: `server.ts`, `recommend.ts`,
      `package.json`, `tsconfig.json`). Serve `:4002`, with `/health`.
- [x] **3.2** Implement the ranking prompt: persona profile + order
      history + the candidate list (id, name, cuisine, price, rating,
      distance) → model returns candidate IDs in ranked order. Constrain
      output to the provided candidate set; validate/repair the IDs.
- [x] **3.3** BYO routing: read `llm:{ baseUrl, apiKey, model }` from the
      request; fall back to a server-default key from env when absent.
      Set `source: 'byo-gateway' | 'server-default'` + `gatewayHost` in
      the response. **Never log or persist the key.**
- [x] **3.4** Emit a thin trajectory: `query` (the prompt), `candidate_gen`
      (candidate IDs), `final` (ranked IDs); include returned `scores`.

## 4. Path A — transient client endpoint

- [x] **4.1** Port `makeHttpEngine` (`lib/reco/engines/http.ts`): wrap an
      arbitrary `/recommend` URL as an engine with a timeout.
- [x] **4.2** `/reco-eval` accepts a client-hosted URL and registers it
      as a transient `custom` engine for that run only (not written to
      `config/reco-engines.json`).

## 5. BYO panel UI (`/reco-eval`)

- [x] **5.1** Add a BYO panel with two tabs: **"Use my endpoint"** (URL)
      and **"Use my LLM"** (base URL + API key + model). State clearly
      that the key is request-scoped and never stored.
- [x] **5.2** Wire panel inputs into the run request; clear the key field
      from state after the run.

## 6. Multi-engine fan-out + A/B table

- [x] **6.1** Change `handleRun` to fan out to **all** selected engines +
      any BYO engine concurrently (today it runs only the first selected
      engine). Collect a result per engine.
- [x] **6.2** Render a **comparison table**: rows = metrics
      (precision@k, recall@k, NDCG@k, blocked_hits), columns = engines,
      **OpenSearch column highlighted** as the line to beat.
- [x] **6.3** Per-section win/loss: for each persona section, show which
      engine matched the expected familiar/explore slots.

## 7. Score attribution in drilldown

- [x] **7.1** Keep the OpenSearch `_explain` breakdown (already present).
- [x] **7.2** For BYO engines, render the returned per-candidate `scores`
      in the trajectory modal so "why did this rank here" works for any
      engine, not just OpenSearch.

## 8. Registry + docs + demo cleanup

- [x] **8.1** `config/reco-engines.json` = opensearch (baseline) +
      llm-ranker (byo). Remove any Python-engine references from docs.
- [ ] **8.2** Extend `scripts/persona-demo-smoke.sh`: bring up the
      llm-ranker sidecar with a server-default key; assert a scored A/B
      result for alice-tran (baseline + llm-ranker both return
      `ranked_ids`, metrics computed).
      > note: smoke script extended (steps 5–7); ANTHROPIC_API_KEY guard
      > added. Full A/B assertion runs only when key is set.
- [ ] **8.3** Update `docs/PERSONA_DEMO.md` and the `/demo` landing page
      with the BYO-ranker A/B story (closes the two Phase 6 carry-overs).

## Exit criteria

### EC-1 — A/B works end-to-end

**Recommended persona: `alice-tran`** (strong Thai/Vietnamese preference, clear order history — best signal for visible metrics differences).

**Setup** — run once in a terminal, leave it running:
```bash
./run.sh                        # starts OpenSearch, sidecar :4001, Next.js :3000
# in a second terminal:
npm run reco:llm-ranker          # starts LLM ranker sidecar :4002
```

**Steps:**

1. Open `http://localhost:3000/reco-eval` (no login needed).
2. In the **Engines** row: both `OpenSearch` (baseline) and `LLM Ranker` pills should be visible. OpenSearch has a blue `baseline` badge and is locked on. Toggle **LLM Ranker** on (dark pill).
3. In **Persona**, select `Alice Tran — alice-tran`.
4. Click **Run**.
5. ✅ **Pass** if:
   - An **A/B Comparison** table appears with columns for both engines and rows for Precision@k, Recall@k, NDCG@k, Overlap, Blocked hits.
   - The OpenSearch column has a blue left border.
   - The best value in each metric row is **bold green**.
   - A **Section win/loss** section appears below with ✓/✗ grids per cuisine section.
   - Per-engine ranked tables appear at the bottom.

- [x] **A/B works end-to-end** — comparison table with metrics for both engines, baseline highlighted.

---

### EC-2 — BYO LLM path (`source: 'byo-gateway'`, key not persisted)

**Requires:** an OpenAI-compatible API key (OpenAI, Anthropic, etc.) and the LLM ranker sidecar running on `:4002`.

**Steps:**

1. Same page: `http://localhost:3000/reco-eval`.
2. Toggle the **BYO Ranker** switch on (red toggle below the Persona picker).
3. Click the **"Use my LLM"** tab.
4. Fill in:
   - **Base URL**: `https://api.openai.com/v1` (or your provider's OpenAI-compatible URL)
   - **API Key**: your key
   - **Model**: `gpt-4o-mini` (or any model your endpoint accepts)
5. Ensure **LLM Ranker** engine is toggled **off** in the engine pills (the BYO LLM panel sends to LLM ranker anyway — toggling it on would also run it with the server-default key separately).
6. Click **Run**.
7. ✅ **Pass** if:
   - A `BYO (gpt-4o-mini)` or similar column appears in the comparison table.
   - Clicking `details` on any result row, opening the trajectory modal for the BYO engine, shows `source=byo-gateway gateway=api.openai.com` in the `final` step notes.
   - After Run completes, the API Key field is **empty** (cleared from React state).

To confirm the key is never persisted: check the Next.js server logs in the terminal — the key should not appear anywhere. The key only travels Browser → LLM Ranker sidecar → BYO LLM API; it is never sent to the Next.js server.

- [ ] **BYO LLM path** — `source: 'byo-gateway'` in trajectory; key field cleared after run.

---

### EC-3 — Smoke test passes

**Requires:** Docker running, `node`, `npx`. Bring down any running sidecars first (the smoke script starts its own).

```bash
bash scripts/persona-demo-smoke.sh
```

Without `ANTHROPIC_API_KEY` set: steps 1–6 run (OpenSearch + A/B candidate path verified). The llm-ranker step is skipped with a clear "skip:" message.

With `ANTHROPIC_API_KEY` set: all steps run including the llm-ranker A/B assertion (`source=server-default`).

✅ **Pass** if the final line is `PASS: all checks green` and exit code is 0.

```bash
echo $?   # should print 0
```

- [ ] **Smoke passes** — `bash scripts/persona-demo-smoke.sh` exits 0.

---

### EC-4 — Types clean ✅ (already verified)

```bash
npx tsc --noEmit    # should print nothing and exit 0
```

- [x] **Types clean** — `npx tsc --noEmit` passes.

---

### EC-5 — Unit tests green ✅ (already verified)

```bash
npm run test:unit   # 101 files, 1674 tests — all pass
```

- [x] **Unit tests green** — `npm run test:unit` passes.

---

> **On exit:** tick **Phase 7** in `plan.md`, clear this file's body,
> replace with Phase 8 (label quality) steps.
