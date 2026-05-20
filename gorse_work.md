# Gorse verification work log

Branch: `main`. Compose: `config/docker-compose.reco.yaml`. Mode:
CF-only (BPR + neighbors + popular fallback; no LLM).

**Last updated:** 2026-05-20 — personalization fix applied (feedback type +
config); Phase 0 bar still passes; quality still weak vs LightFM/Implicit.

---

## Status

| Section                | Status     |
|------------------------|-----------|
| §0–§3 (boot + seed + train) | Done   |
| §4 Eval API (Phase 0 exit)  | Done — `gorse` Hit@5 ≥ `random` (0.000 ≥ 0.000) |
| §5 Visual + screenshot      | Deferred — API sign-off only |
| §6 Wrap-up                  | Done |
| **Personalization fix**     | **Applied** — see below; offline recs still nearly identical |

---

## Fix applied (2026-05-20)

### 1. Seed feedback type (`scripts/seed-gorse.ts`)

Changed `FeedbackType: 'order'` → `'star'` so rows match Gorse’s positive
feedback types when config is loaded.

### 2. Gorse config (`config/gorse-config.toml`)

Mounted at `/etc/gorse/config.toml` in compose. Without it, logs showed
`positive_feedback_types: null` and **all feedback was ignored**.

```toml
[recommend.data_source]
positive_feedback_types = ["star"]

[recommend.collaborative]
type = "mf"
fit_period = "2m"
fit_epoch = 30

[recommend.ranker]
type = "none"

[recommend.fallback]
recommenders = ["collaborative"]
```

### 3. Re-verify commands

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
docker compose -f config/docker-compose.reco.yaml down -v   # first time after type change
docker compose -f config/docker-compose.reco.yaml up --build -d
RECO_GORSE_URL=http://localhost:8088 scripts/n.sh npx tsx scripts/seed-gorse.ts
# wait ~2m for fit bpr + ranking (watch: docker logs dashdoor_gorse -f)
```

### 4. Confirmation (hypothesis)

| Check | Result |
|-------|--------|
| `GET /api/feedback/order` | `[]` |
| `GET /api/feedback/star` | rows present |
| `GET /api/user/71/feedback` | star rows for items 60, 104, … |
| Logs after config | `positive_feedback_types":["star"]`, `fit bpr complete`, `ranking … n_working_users=3000` |
| `GET /api/recommend/71` vs `99` | Still mostly `["596","595","594","593","592"]` — **weak differentiation** |

Sample diversity (14 users): **2** unique top-1 ids, **6** unique ids in top-5.
Eval coverage for `gorse` on history split remains **~0.010**.

---

## Eval results after fix

**5-engine** history (k=5, n=18), run `run_mpeja8d8`:

| Engine     | Hit@5 | NDCG@5 | Coverage |
|------------|-------|--------|----------|
| random     | 0.000 | 0.000  | 0.131    |
| popularity | 0.056 | 0.028  | 0.035    |
| gorse      | 0.000 | 0.000  | **0.010** |
| lightfm    | 0.333 | 0.270  | 0.125    |
| implicit   | 0.556 | 0.403  | 0.123    |

**3-engine** history (Phase 0 bar): `gorse` Hit@5 = random = 0.000, 0 errors.

Gorse is no longer “disconnected” (BPR trains on 67k star feedback rows) but
offline `/api/recommend/{user}` cache still behaves like a global trending list
(high item ids 592–596). **Does not block** Phase 0 or Phase 2 (LightFM +
Implicit carry quality).

### Follow-ups (optional)

- Online/session recommend API if we need per-request personalization.
- Tune `[recommend.non-personalized]` / neighbor recommenders in
  `gorse-config.toml`.
- Shorter `fit_period` only helps iteration, not homogenization.

---

## Known docker-side gotcha

`/reco-eval` returns 404 in the prod compose image even with `RECO_DEMO=1`.
Workaround: `RECO_DEMO=1 scripts/n.sh npm run dev -- -p 3001` alongside compose.
Sign-off is API-only; screenshot deferred.

---

## Commands reference

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd /Users/rajeev.bhat/dev/turing-doordash-aws

docker compose -f config/docker-compose.reco.yaml up --build -d
docker compose -f config/docker-compose.reco.yaml down
docker compose -f config/docker-compose.reco.yaml down -v   # drop gorse-data

RECO_GORSE_URL=http://localhost:8088 scripts/n.sh npx tsx scripts/seed-gorse.ts

curl -s http://localhost:8088/api/health/live
curl -s 'http://localhost:8088/api/recommend/71?n=5'

curl -s -X POST http://localhost:3000/api/reco/eval \
  -H 'content-type: application/json' \
  -d '{"engineNames":["random","popularity","gorse","lightfm","implicit"],
       "taskSetId":"history","k":5,"historyLimit":50}'
```
