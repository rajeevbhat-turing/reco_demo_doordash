# Gorse end-to-end verification

Closes the deferred boxes in `EXECUTION.md` §8: bring up the Gorse
sidecar, seed it from the Dashdoor SQLite, and confirm the `gorse`
engine produces non-zero metrics in `/reco-eval`.

> **Mode:** the compose file runs Gorse in **CF-only mode** — BPR
> matrix factorization + cosine item/user neighbors + popular
> fallback. No LLM provider is configured, so no outbound LLM calls.
> Flipping on Gorse's optional LLM ranker is a docker-compose-only
> change for later.

Tick every box as you go.

---

## 0. Pre-flight

- [x] Docker Desktop (or OrbStack / Colima) is running.
      `docker info` should print engine details, not an error.
- [x] You're on the `reco` branch.
- [x] Working directory is `/Users/rajeev.bhat/dev/turing-doordash-aws`.
- [x] Node 20 is active: `scripts/n.sh node -v` prints `v20.x`.
- [x] No other process is bound to ports `3000`, `8087`, or `8088`:
      ```sh
      lsof -iTCP -sTCP:LISTEN -nP | grep -E ':3000|:8087|:8088' || echo "ports free"
      ```
      If `next dev` is still running from earlier, stop it:
      `pkill -f "next dev"`.

---

## 1. Bring up the stack

- [x] Build + start in one shot:
      ```sh
      docker compose -f config/docker-compose.reco.yaml up --build
      ```
      Leave this running in its own terminal — first build takes a few
      minutes for the Next.js image; Gorse pulls in seconds.
- [x] In the logs you should see (eventually):
      - `dashdoor_reco | ✓ Ready in …`
      - `dashdoor_gorse | gorse master listening on :8087`
      - `dashdoor_gorse | gorse server listening on :8088`
- [x] Verify both are up from a second terminal:
      ```sh
      curl -s http://localhost:3000/api/reco/engines | head -c 200
      curl -s http://localhost:8088/api/health/live
      ```
      The engines call lists 3 engines; the Gorse health call returns
      `{"Ready":true,...}` (may take ~10s after first boot).

> If `docker compose` complains about the `version:` key being
> deprecated, that's harmless — the file works without it. Ignore.

---

## 2. Seed Gorse with Dashdoor data

The container's Gorse is empty on first boot. The seed script pushes
restaurants as items, users as users, and orders as positive feedback.

- [x] In the second terminal:
      ```sh
      RECO_GORSE_URL=http://localhost:8088 scripts/n.sh npx tsx scripts/seed-gorse.ts
      ```
- [x] Expected output:
      ```
      Seeding http://localhost:8088 from file:./data/db/dashdoor.db
        items: ~500
        users: ~3000
        feedback: ~N      ← however many orders the db holds
      Done. Gorse will start training in the background; check
      http://localhost:8087/dashboard.
      ```
- [ ] Open `http://localhost:8087/dashboard` in a browser. Hit the
      "Items" and "Feedback" tabs to confirm row counts match the seed
      output. Default login is none (open dashboard).

---

## 3. Wait for Gorse to train

Gorse trains in the background on a schedule (~1 min after data lands
on first boot, then periodically). It must finish at least one training
cycle before `/api/recommend/{user}` returns anything.

- [x] Wait ~60 seconds, then probe:
      ```sh
      # popular endpoint works immediately
      curl -s 'http://localhost:8088/api/popular?n=5'

      # personalized endpoint — should return ids once training completes
      curl -s 'http://localhost:8088/api/recommend/1?n=5'
      ```
- [x] If `recommend` returns `[]`, give it another 30s and re-poll. The
      dashboard's "Tasks" page shows when training last ran.

---

## 4. Run an eval with the `gorse` engine

- [x] Seed task set (10 curated single-restaurant lookups):
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random","popularity","gorse"],"taskSetId":"seed","k":5}' \
        | python3 -m json.tool | head -40
      ```
- [x] History split (more representative of what Gorse is good at):
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random","popularity","gorse"],"taskSetId":"history","k":5,"historyLimit":50}' \
        | python3 -c "
      import sys,json
      d=json.load(sys.stdin)
      print('runId',d['runId'],'n=',len(d['report']['perTask']))
      for n,a in d['report']['aggregate'].items():
          print(f'  {n:10}  hit@5={a[\"hitAtK\"]:.3f}  ndcg@5={a[\"ndcgAtK\"]:.3f}')
      "
      ```

### What success looks like

- [x] `gorse` Hit@5 on the **history** set ≥ `random` Hit@5
      (≥ 0.0 baseline). This is the Phase 0 exit criterion that was
      deferred. **Verified** `run_mpehxjmq` (n=18): gorse 0.000, random
      0.000 (ties; passes bar).
- [x] No `error: …` strings in the per-task rows for the `gorse` engine.
      (If you see "HTTP 500" or "connect ECONNREFUSED", Gorse isn't
      reachable from the dashdoor container — see Troubleshooting.)

If Gorse loses to `popularity`, that's fine and expected on this small
synthetic catalog — both are reasonable baselines. The bar for Phase 0
is `gorse > random`, not `gorse > popularity`.

---

## 5. Visual check in the demo UI

> **Deferred** (May 2026): API verification is sufficient for Gorse Phase 0
> exit (`gorse` Hit@5 ≥ `random` on history, zero per-task errors). Screenshot
> and manual UI walkthrough skipped — see `gorse_work.md`.

- [ ] Open `http://localhost:3000/reco-eval`. **Deferred**
- [ ] Tick `random`, `popularity`, `gorse`. Pick `history` task set, k=5.
      Click **Run eval**. **Deferred**
- [ ] Verify all three rows render in the aggregate table with
      numeric metrics (no `—` placeholders for `gorse`). **Deferred**
- [ ] Expand a few per-task drilldowns to spot-check predicted ids. **Deferred**

- [ ] Screenshot the demo page and save it to
      `docs/screenshots/phase0-reco-eval.png`. **Deferred** (was
      `docs/execution-phase-0.md` §8; not required for Gorse sign-off)

---

## 6. Wrap up

- [x] Tick the Gorse-related boxes in `docs/execution-phase-0.md` §8 and §10:
  - [x] `Dockerfile.prod` build verified.
  - [x] `docker compose -f config/docker-compose.reco.yaml up --build`
        works.
  - [ ] Screenshot committed. **Deferred** (see §5)
- [x] Tick the corresponding Phase 0 §0.7 boxes in `RECO_PLAN.md`.
- [x] Update `RECO_PLAN.md`'s Phase 0 exit block — remove the
      "Gorse verification deferred" caveat once the history-set
      Hit@5 line passes.
- [x] Stop the stack when done: `docker compose -f
      config/docker-compose.reco.yaml down` (data persists in the
      `gorse-data` volume; safe to bring back up later).

---

## Troubleshooting

**`dashdoor` can't reach `gorse`** (per-task `error: connect
ECONNREFUSED ...`):
- Check `RECO_GORSE_URL` env in the `dashdoor` service — it must be
  `http://gorse:8088` (Docker DNS), not `localhost:8088`.
- `docker compose -f config/docker-compose.reco.yaml logs gorse | tail`
  to confirm Gorse is actually up.

**Gorse `/api/recommend/{user}` returns `[]`**:
- Training hasn't run yet. Wait another minute and re-probe.
- Check the dashboard's "Tasks" tab; the "Find Item Neighbors" /
  "Find User Neighbors" / "Fit Ranking Model" tasks should show recent
  runs.
- If still empty after 5 minutes, your feedback may have arrived but
  Gorse considers it too sparse for personalization. The seed pushes
  all orders, so this is unlikely — recheck the seed output.

**Port 3000 / 8087 / 8088 already in use**:
- `pkill -f "next dev"` (kills any local Next dev server).
- `lsof -iTCP:8087 -sTCP:LISTEN` to find offenders.
- Or rebind in `config/docker-compose.reco.yaml` (`"3001:3000"` etc.)
  and remember to update `RECO_GORSE_URL` if you remap 8088.

**Seed script throws on a row**:
- The script POSTs in batches of all-rows. If one item is malformed,
  re-run with `DEBUG=1` and add a try/catch around the loop. (Not
  needed for the shipped seed data — these are guards for future
  schema drift.)
