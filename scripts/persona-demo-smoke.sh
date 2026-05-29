#!/usr/bin/env bash
# Smoke test for the persona-demo stack.
# Exits 0 on success, 1 on any failure.
# Requires: docker (running), node, npx.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIDECAR_PID=""

cleanup() {
  if [[ -n "$SIDECAR_PID" ]]; then
    kill "$SIDECAR_PID" 2>/dev/null || true
  fi
  # Stop the opensearch container we may have started
  docker compose -f "$REPO_ROOT/config/docker-compose.demo.yaml" stop opensearch &>/dev/null || true
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
ok()   { echo "  ok: $*"; }

cd "$REPO_ROOT"

# ── 1. OpenSearch ──────────────────────────────────────────────────────────────
echo "==> starting OpenSearch"
docker compose -f config/docker-compose.demo.yaml up -d opensearch

echo "==> waiting for OpenSearch on :9200 (up to 60 s)"
for i in $(seq 1 60); do
  if curl -s -o /dev/null http://localhost:9200; then
    ok "OpenSearch ready after ${i}s"
    break
  fi
  sleep 1
  [[ $i -eq 60 ]] && fail "OpenSearch did not come up within 60 s"
done

# ── 2. Seed ────────────────────────────────────────────────────────────────────
echo "==> seeding OpenSearch index"
npx tsx scripts/seed-opensearch.ts
ok "seed complete"

# ── 3. Sidecar ────────────────────────────────────────────────────────────────
echo "==> starting reco sidecar on :4001"
npm run reco:opensearch &>/tmp/reco-sidecar.log &
SIDECAR_PID=$!

echo "==> waiting for sidecar /health (up to 30 s)"
for i in $(seq 1 30); do
  if curl -s http://localhost:4001/health | grep -q '"ok"'; then
    ok "sidecar healthy after ${i}s"
    break
  fi
  sleep 1
  [[ $i -eq 30 ]] && fail "sidecar did not become healthy within 30 s"
done

# ── 4. Recommend call ─────────────────────────────────────────────────────────
echo "==> POST /recommend for alice-tran"
RESPONSE=$(curl -s -X POST http://localhost:4001/recommend \
  -H 'Content-Type: application/json' \
  -d '{"personaId":"alice-tran","topK":20}')

# ranked_ids must be a non-empty array
RANKED_LEN=$(echo "$RESPONSE" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const r=JSON.parse(d);
    process.stdout.write(String((r.ranked_ids||[]).length));
  });
")
[[ "$RANKED_LEN" -gt 0 ]] || fail "ranked_ids is empty (got $RANKED_LEN)"
ok "ranked_ids has $RANKED_LEN entries"

# trajectory.steps must include candidate_gen, score, final
for STAGE in candidate_gen score final; do
  HAS=$(echo "$RESPONSE" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const r=JSON.parse(d);
      const stages=(r.trajectory?.steps||[]).map(s=>s.stage);
      process.stdout.write(stages.includes('$STAGE') ? 'yes' : 'no');
    });
  ")
  [[ "$HAS" == "yes" ]] || fail "trajectory.steps missing stage '$STAGE'"
  ok "trajectory includes stage '$STAGE'"
done

echo ""
echo "PASS: all checks green"
