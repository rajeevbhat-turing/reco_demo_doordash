# Execution — Phase 2

Detailed checkbox plan for **Phase 2** of `RECO_PLAN.md`: LightFM and
Implicit sidecars, shared HTTP contract doc, runtime engine config.
Phase 0's checklist is archived at `docs/execution-phase-0.md`.

> Phase 0 (foundation build) is code-complete. Gorse end-to-end
> verification is being tracked separately in `gorse_work.md`. Phase 1
> (decisions doc, `docs/reco-decisions.md`) is done.

Keep checkboxes honest. Tick boxes in the same commit as the change.
For partial work, leave `[ ]` and add a `> note: …` under it.

---

## 0. Pre-flight

- [ ] On branch `reco` (or a child branch `reco/phase-2-sidecars` if you
      want PR isolation).
- [ ] Node 20 active: `scripts/n.sh node -v`.
- [ ] Python 3.11 is pinned **inside** the LightFM/Implicit container
      images (LightFM has no wheels for 3.12+ and was archived in 2023).
      Host Python doesn't matter for the docker-compose flow. Optional
      local dev: `brew install python@3.11`, then
      `python3.11 -m venv .venv` per sidecar.
- [ ] Docker daemon running (sidecars ship as containers).
- [ ] Existing reco unit tests still pass:
      `scripts/n.sh npm run test:unit -- tests/unit/reco/`.

---

## 1. Lay down the shared layout

- [x] Directory tree under `tools/reco-engines/{common,lightfm,implicit}/`.
- [x] `tools/reco-engines/common/contract.py` — Pydantic mirror of
      `lib/reco/types.ts`. Both sidecars import from here.
- [x] `tools/reco-engines/common/db.py` — SQLite reader returning a
      `Catalog` dataclass: `(user/item id↔idx maps, interactions CSR,
      item_features CSR, item lat/lng, popularity prior)`. Includes
      `haversine_miles` and `restrict_indices` helpers used by both
      sidecars.

---

## 2. Document the HTTP wire contract

- [x] `docs/reco-http-contract.md`
  - [x] Request body = TypeScript `RecoContext`, shown as JSON, every
        field with type/required/notes.
  - [x] Response body = `RecommendationResponse` with `RecoItem` table.
  - [x] Error policy section: prefer 200 + `debug.error`, examples for
        unknown user / empty pool / cold model / bad request.
  - [x] Latency budget (5 s default, < 1 s p95 target), version
        handshake, health endpoint convention.
- [x] Cross-linked from `lib/reco/README.md`.

---

## 3. LightFM sidecar

### 3.1 Code

- [x] `tools/reco-engines/lightfm/requirements.txt` pins fastapi,
      uvicorn, lightfm==1.17, numpy<2, scipy, pydantic 2.
- [x] `tools/reco-engines/lightfm/app.py`
  - [x] FastAPI app with `POST /recommend` and `GET /health`.
  - [x] At startup: load catalog via `common.db.load_catalog`,
        train `LightFM(loss='warp', no_components=32)` for 30 epochs.
  - [x] Handler restricts to `candidatePool` → 10mi radius filter →
        `model.predict()` over the remaining indices → top-k.
  - [x] Cold-start: unknown `userId` → popularity prior;
        `debug.fallback = "popularity (unknown user)"`.
  - [x] `store_items` surface returns `kind=item` (same predict path;
        kind flips based on surface). Item-to-item neighbors are an
        implicit-only feature.
  - [ ] Model persistence to `/app/models/lightfm.npz` — **deferred**.
        Training is fast on this catalog (~ few seconds); cold start
        repeats it. Add persistence if first-boot latency becomes a
        problem.
- [x] `tools/reco-engines/lightfm/Dockerfile` — `python:3.11-slim`,
      build deps, copy `common/` + `app.py`, expose `:8001`.
      `LIBSQL_URL` defaults to `file:/data/dashdoor.db` (mount-point).
- [ ] Smoke locally before containerizing — **deferred**, no
      host-side Python 3.11. Containerized build is the smoke test.

### 3.2 Wire into the Next.js registry

- [x] `lib/reco/engines/lightfm.ts` — `makeHttpEngine` wrapper,
      `RECO_LIGHTFM_URL` env, 10s timeout for cold first calls.
- [x] Registered in `lib/reco/engines/index.ts` (and now driven by
      `config/reco-engines.json` — see §5).
- [ ] `tests/unit/reco/engines.lightfm.test.ts` — **deferred**. The
      adapter is a 1-line `makeHttpEngine()` call; existing
      `http.ts` coverage applies. Real-model tests will live next to
      the sidecar (pytest) when added.

### 3.3 Compose

- [x] `lightfm` service in `config/docker-compose.reco.yaml`,
      builds from `tools/reco-engines/lightfm/Dockerfile`, exposes
      `:8001`, mounts `../data/db:/data:ro` for the SQLite catalog.
- [x] `dashdoor` service now has `depends_on: [gorse, lightfm,
      implicit]` and `RECO_LIGHTFM_URL=http://lightfm:8001/recommend`.

---

## 4. Implicit sidecar

Mirror of §3 with `implicit.als.AlternatingLeastSquares` (default) or
`implicit.bpr.BayesianPersonalizedRanking` (env-toggled).

- [x] `tools/reco-engines/implicit/requirements.txt` pins fastapi,
      uvicorn, implicit==0.7.2, numpy<2, scipy, pydantic 2.
- [x] `tools/reco-engines/implicit/app.py`
  - [x] Trains user × item CSR from orders, no content features.
  - [x] Env knobs: `IMPLICIT_MODEL=als|bpr` (default `als`),
        `IMPLICIT_FACTORS=64`, `IMPLICIT_ITERATIONS=15`.
  - [x] `store_items` surface returns `model.similar_items(anchor)`
        where anchor = most recent ordered item (or globally popular
        if none).
  - [x] Cold-start unknown user → popularity prior, same as LightFM.
- [x] `tools/reco-engines/implicit/Dockerfile` (python:3.11-slim,
      port `:8002`).
- [ ] Smoke locally — **deferred** (same Python 3.11 reason as §3).
- [x] `lib/reco/engines/implicit.ts` adapter via `makeHttpEngine`,
      registered, `RECO_IMPLICIT_URL=http://implicit:8002/recommend`.
- [x] Compose service `implicit:` on `8002`, builds from the sidecar
      Dockerfile, mounts `../data/db:/data:ro`.

---

## 5. Runtime engine config

- [x] `config/reco-engines.json` with `enabled` + optional `url` per
      engine.
- [x] `lib/reco/engines/index.ts` reads the file at module load
      (server-only). `enabled: false` skips registration; `url`
      rebuilds the HTTP/Gorse engine pointed at the override.
- [x] Missing/unparseable file → safe fallback: all built-ins
      registered with defaults (warned to stderr if unparseable).

---

## 6. Side-by-side comparison

- [ ] `/reco-eval` engine picker now shows 5 engines. Pre-select all
      five by default; user un-ticks any they don't want.
- [ ] Aggregate table has one row per selected engine, columns same as
      Phase 0.
- [ ] Per-task drilldown shows each engine's predicted ids and
      per-engine latency. The drilldown already supports this — only
      verify it still renders cleanly with 5 columns.

---

## 7. (Optional) Recombee vendor stub

Skip unless the demo specifically wants a hosted-SaaS comparison.

- [ ] `lib/reco/engines/recombee.ts` — `makeHttpEngine` pointed at
      Recombee's REST API, gated by `RECO_RECOMBEE_DB_ID` /
      `RECO_RECOMBEE_API_TOKEN`.
- [ ] Document in `docs/reco-http-contract.md` that vendor engines
      can map their native response shape to the contract inside the
      adapter (Recombee's response isn't quite `RecommendationResponse`
      out of the box).

---

## 8. Smoke + tests

- [ ] Bring everything up:
      `docker compose -f config/docker-compose.reco.yaml up --build`.
- [ ] Each sidecar's `GET /health` returns 200.
- [ ] `/api/reco/engines` lists 5 (or 6 with Recombee).
- [ ] `POST /api/reco/eval` with all five engine names on `taskSet:
      "history"` returns metrics for every engine; no `error: …`
      rows on the happy path.
- [ ] Re-run `scripts/n.sh npm run test:unit -- tests/unit/reco/` — still green.
- [ ] Sidecar tests:
      `cd tools/reco-engines/lightfm && pytest` (write at least one
      test that hits `/recommend` with a fixture DB).

---

## 9. Wrap-up

- [ ] Tick all Phase 2 boxes in `RECO_PLAN.md`.
- [ ] Update `RECO_PLAN.md` Phase 2 exit block with actual aggregate
      metrics (LightFM vs Implicit vs popularity on history split).
- [ ] Replace this file with Phase 3's plan (live re-ranking) or
      Phase 4's (LLM agent) depending on what's next.
- [ ] Open PR `Phase 2: LightFM + Implicit sidecars`.

---

## Definition of done for Phase 2

All true at once:

1. `docker compose -f config/docker-compose.reco.yaml up` brings up
   dashdoor + gorse + lightfm + implicit cleanly.
2. `/reco-eval` runs an eval with all 5 engines side-by-side and
   produces a comparable metrics table.
3. At least one of {lightfm, implicit} beats `popularity` on the
   history split's Hit@5.
4. Sidecar smoke tests + Next.js unit tests both green.
5. `docs/reco-http-contract.md` exists and links from
   `lib/reco/README.md`.
