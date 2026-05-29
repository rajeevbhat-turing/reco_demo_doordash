# Execution — Phase 5: Trajectory visibility

**Goal:** every engine emits a `RecoTrajectory` alongside its ranked
results, and `/reco-eval` shows a drilldown modal for each result row
so you can see *why* an engine ranked the way it did.

When this phase exits, clear this file's body and replace it with
Phase 6's detailed steps. Then tick Phase 5 in `plan.md`.

---

## 1. Types

- [ ] **1.1** `RecoTrajectory` is already in `lib/reco/types.ts` —
      verify the shape matches what the OpenSearch engine emits and
      adjust if needed. No new file needed.

## 2. OpenSearch engine — full trajectory via `_explain`

- [ ] **2.1** In `tools/reco-engines/opensearch/recommend.ts`, call
      `_explain` on each hit and attach per-item score breakdowns to
      the trajectory's `score` step (`scores` map: restaurant_id →
      `_score`, plus a `raw_explain` field on `RecoTrajectory` for the
      full OpenSearch payload).
- [ ] **2.2** Confirm the `trajectory` field appears in the `POST
      /recommend` response and matches the `RecoTrajectory` type.

## 3. Other engines — thin trajectory contract

- [ ] **3.1** Document the minimum trajectory contract in
      `docs/reco-trajectory-shape.md`: engines must emit at least
      `candidate_gen` and `final` steps. OpenSearch additionally emits
      `query`, `score`. This makes the drilldown degrade gracefully for
      engines that only have the thin shape.

## 4. `/reco-eval` drilldown modal

- [ ] **4.1** Add a "Details" button (or clickable row) to the results
      table in `app/reco-eval/reco-eval-client.tsx`. Clicking it opens
      an inline modal/drawer showing the trajectory steps for that run.
- [ ] **4.2** The modal renders each `TrajectoryStep` as a collapsible
      row: `stage` label + `restaurant_ids` count + optional `scores`
      table + optional `notes`. For OpenSearch, expand `raw_explain`
      into readable score contributions (field name → weight → value).
- [ ] **4.3** Store the last trajectory result in component state
      alongside `ranked_ids` so the modal can be opened/closed without
      re-fetching.

## Exit criteria

**Setup (do this first):**

```bash
docker compose -f config/docker-compose.demo.yaml up -d opensearch
npx tsx scripts/seed-opensearch.ts
(cd tools/reco-engines/opensearch && npm start) &     # serves :4001
NEXT_PUBLIC_RECO_DEMO=1 npm run dev                   # serves :3000
```

Login IDs (seeded users 3101–3110, password is literally `password`):
- **Persona:** `alice.tran@personas.demo` / `password`. `/reco-eval`
  itself needs no login (it reads personas from disk); login is only
  needed if you also re-check the `/home` sections from Phase 4.
- **Non-persona control:** `john.doe@example.com` / `password`.

- [ ] **`trajectory` in raw response** — `POST /recommend` for
      alice-tran returns a `trajectory` with at least `candidate_gen`,
      `score`, and `final` steps:
      ```bash
      curl -s -X POST http://localhost:4001/recommend \
        -H 'Content-Type: application/json' \
        -d '{"personaId":"alice-tran","topK":5}' \
        | jq '{ranked_ids, steps: [.trajectory.steps[].stage]}'
      ```
      Expect `steps` to include `candidate_gen`, `score`, `final`.
- [ ] **"Details" button works** — open `http://localhost:3000/reco-eval`,
      keep OpenSearch (baseline), pick alice-tran, click **Run**, then
      click **Details** on a result row → drilldown modal opens.
- [ ] **Score contributions render** — in that modal, the OpenSearch
      `_explain` breakdown shows field weights (field name → weight →
      value) for at least one restaurant.
- [ ] **Types clean** — `npx tsc --noEmit` passes with no errors.
- [ ] **Unit tests green** — `npm run test:unit` still passes.

> **On exit:** when every box above is checked, tick **Phase 5** in
> `plan.md`, clear this file's body, and replace it with Phase 6's
> detailed steps.
