# How to test

Three flavors, fastest first.

## 1. Type check

```
npx tsc --noEmit
```

Zero errors expected. If you touched `scripts/gen-personas-seed.ts`,
the `better-sqlite3` import has an `// @ts-expect-error` on it — the
package ships without types and the script is a one-shot generator.

## 2. Unit tests

```
npm run test:unit
```

Vitest. Watch mode: `npm run test:unit -- --watch`.

## 3. Persona smoke (Phase 1 §6)

The persona slice (users 3101–3110) is seeded in `data/db/dashdoor.db`.
Verify it loads end-to-end:

```
# (one tab) boot dev
npm run dev

# (another tab) checks
curl -s -o /dev/null -w "/home  HTTP %{http_code}\n" http://localhost:3000/home
curl -s http://localhost:3000/api/users/email/alice.tran@personas.demo | jq '.data.name, .data.addresses[0].street'
curl -s http://localhost:3000/api/users/3107 | jq '.data.name, .data.id'

curl -s -X POST -H 'content-type: application/json' \
  -d '{"email":"alice.tran@personas.demo","password":"password"}' \
  http://localhost:3000/api/auth/login | jq '.success, .data.name, .data.addresses[0].street'
```

Both user endpoints wrap the payload as `{ success, data: { ... } }`,
so use `.data.<field>` in jq (not `.<field>`).

Expected:

- `/home` returns 200.
- The email lookup returns `"Alice Tran"` + `"1525 Mission St"`.
- `/api/users/3107` returns `"Gabe Jensen"` and `"3107"`.
- The login POST returns a successful auth response.

Then in a browser at `http://localhost:3000/login`:

1. Sign in with `alice.tran@personas.demo` / `password`.
2. Land on `/home` — confirm the address is "1525 Mission St" and
   no console errors.
3. Repeat with `gabe.jensen@personas.demo` (a family persona) to
   confirm no family-specific path breaks.

If the persona is missing from the DB, re-seed:

```
npx tsx scripts/gen-personas-seed.ts
sqlite3 data/db/dashdoor.db < data/db/schema/personas_seed.sql
```

## 4. OpenSearch engine smoke (Phase 3)

The OpenSearch recommend service is separate from the Next.js app — three
things must be running before you can hit it.

**Why not `npm run dev`?** `npm run dev` starts Next.js on :3000. The
recommend engine is a standalone Express server on :4001 that needs a live
OpenSearch instance to query. They are independent processes.

### Start everything

```bash
# Terminal 1 — start OpenSearch (wait ~30 s for the health-check to go green)
docker compose -f config/docker-compose.demo.yaml up

# Terminal 2 — seed the index (idempotent, run once per OpenSearch start)
npm run seed:opensearch

# Terminal 2 — then start the engine server
npm run reco:opensearch
```

### Smoke test

```bash
curl -s -X POST http://localhost:4001/recommend \
  -H 'Content-Type: application/json' \
  -d '{"personaId":"alice-tran","topK":10}' | jq .
```

Expected:
- `ranked_ids` is a non-empty array of integers.
- Thai restaurants appear near the top (alice-tran has `Thai: 0.9` affinity).
- `trajectory.steps` has 4 steps: `query`, `candidate_gen`, `score`, `final`.

Quick summary view:

```bash
curl -s -X POST http://localhost:4001/recommend \
  -H 'Content-Type: application/json' \
  -d '{"personaId":"alice-tran","topK":10}' \
  | jq '{ranked_ids, step_count: (.trajectory.steps | length)}'
```

Health check (no OpenSearch needed):

```bash
curl -s http://localhost:4001/health
# → {"status":"ok","engine":"opensearch"}
```

### Try all personas

```bash
for id in alice-tran ben-kowalski chloe-okafor diego-mendoza eli-nakamura \
           fatima-rashid gabe-jensen hana-park idris-mensah julia-volkov; do
  count=$(curl -s -X POST http://localhost:4001/recommend \
    -H 'Content-Type: application/json' \
    -d "{\"personaId\":\"$id\",\"topK\":10}" | jq '.ranked_ids | length')
  echo "$id → $count results"
done
```

All 10 should return `10`.

## 5. End-to-end (Playwright)

```
npm run test:e2e:chromium
```

Boots its own server. Suite is independent of the persona work —
use it to make sure base Dashdoor flows still pass after a change.

## 6. Reco Eval UI (Phase 4)

These features are always on (no feature flag):
- A **"Reco Eval"** link in the header → `/reco-eval`
- **Persona-aware cuisine sections** on `/home` for signed-in persona users (IDs 3101–3110)

```bash
# Make sure OpenSearch is running and seeded (see §4 above), then:
npm run dev
```

**Test `/reco-eval` (no login required):**
1. Open `http://localhost:3000/reco-eval` — it loads even with no session.
2. OpenSearch is pre-selected with a "baseline" badge — it cannot be unchecked.
3. Select a persona (default: alice-tran) and click **Run**.
4. A ranked results table appears with restaurant names and cuisine.

**Test persona sections on `/home`:**
1. Sign in as `alice.tran@personas.demo` / `password` (standard auth flow).
2. Open `http://localhost:3000/home`
3. Cuisine sections (e.g. "More Thai for you") appear above the regular feed.

**Test non-persona user:**
1. Sign in as `john.doe@example.com`
2. Open `/home` — no cuisine sections, normal feed only. Personalization
   keys off whether the signed-in user is a persona (user_id 3101–3110).

## Re-running the persona seed

The seed is **idempotent**: it deletes the persona slice (users
3101–3110 and their child rows) and rewrites it. Safe to re-run
whenever `data/reco-personas/personas.json` changes.

```
npx tsx scripts/gen-personas-seed.ts                            # JSON → SQL
sqlite3 data/db/dashdoor.db < data/db/schema/personas_seed.sql  # apply
```

Verification queries (from `.scratch/phase1_apply_verify.sh`):

```
sqlite3 data/db/dashdoor.db "SELECT COUNT(*) FROM users WHERE id BETWEEN 3101 AND 3110;"   -- 10
sqlite3 data/db/dashdoor.db "SELECT COUNT(*) FROM user_preferences;"                       -- 10
sqlite3 data/db/dashdoor.db "SELECT COUNT(*) FROM user_family;"                            --  5
sqlite3 data/db/dashdoor.db "SELECT user_id, COUNT(*) FROM orders WHERE user_id BETWEEN 3101 AND 3110 GROUP BY user_id;"
sqlite3 data/db/dashdoor.db "SELECT user_id, SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) FROM user_reviews WHERE user_id BETWEEN 3101 AND 3110 GROUP BY user_id;"
```
