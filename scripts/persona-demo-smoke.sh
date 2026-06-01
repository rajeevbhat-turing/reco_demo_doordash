#!/usr/bin/env bash
# Smoke test for the persona-demo stack.
# Exits 0 on success, 1 on any failure.
# Requires: docker (running), node, npx.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SIDECAR_PID=""
LLM_SIDECAR_PID=""

cleanup() {
  [[ -n "$SIDECAR_PID" ]] && kill "$SIDECAR_PID" 2>/dev/null || true
  [[ -n "$LLM_SIDECAR_PID" ]] && kill "$LLM_SIDECAR_PID" 2>/dev/null || true
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

# ── 3. OpenSearch sidecar ─────────────────────────────────────────────────────
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

# ── 4. OpenSearch recommend (backwards-compat: no candidates) ─────────────────
echo "==> POST /recommend for alice-tran (no candidates — baseline compat)"
RESPONSE=$(curl -s -X POST http://localhost:4001/recommend \
  -H 'Content-Type: application/json' \
  -d '{"personaId":"alice-tran","topK":20}')

RANKED_LEN=$(echo "$RESPONSE" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const r=JSON.parse(d);
    process.stdout.write(String((r.ranked_ids||[]).length));
  });
")
[[ "$RANKED_LEN" -gt 0 ]] || fail "ranked_ids is empty (got $RANKED_LEN)"
ok "ranked_ids has $RANKED_LEN entries"

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

# ── 5. Build candidate set ─────────────────────────────────────────────────────
echo "==> building candidate set for alice-tran"
CANDIDATES=$(npx tsx scripts/build-candidates.ts alice-tran)
CAND_LEN=$(echo "$CANDIDATES" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const r=JSON.parse(d);
    process.stdout.write(String(r.length));
  });
")
[[ "$CAND_LEN" -gt 0 ]] || fail "candidate set is empty"
ok "candidate set has $CAND_LEN restaurants"

# ── 6. OpenSearch recommend with candidate set (A/B path) ─────────────────────
echo "==> POST /recommend for alice-tran with candidate set (A/B path)"
AB_RESPONSE=$(echo "$CANDIDATES" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end', async ()=>{
    const candidates = JSON.parse(d);
    const res = await fetch('http://localhost:4001/recommend', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({personaId:'alice-tran', topK:20, candidates}),
    });
    const body = await res.json();
    process.stdout.write(JSON.stringify(body));
  });
")
AB_LEN=$(echo "$AB_RESPONSE" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
    const r=JSON.parse(d);
    process.stdout.write(String((r.ranked_ids||[]).length));
  });
")
[[ "$AB_LEN" -gt 0 ]] || fail "A/B ranked_ids is empty (got $AB_LEN)"
ok "A/B ranked_ids has $AB_LEN entries"

# ── 7. LLM ranker sidecar (server-default key) ────────────────────────────────
if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "  skip: ANTHROPIC_API_KEY not set — skipping llm-ranker A/B"
else
  echo "==> starting llm-ranker sidecar on :4002"
  npm run reco:llm-ranker &>/tmp/reco-llm-ranker.log &
  LLM_SIDECAR_PID=$!

  echo "==> waiting for llm-ranker /health (up to 30 s)"
  for i in $(seq 1 30); do
    if curl -s http://localhost:4002/health | grep -q '"ok"'; then
      ok "llm-ranker healthy after ${i}s"
      break
    fi
    sleep 1
    [[ $i -eq 30 ]] && fail "llm-ranker did not become healthy within 30 s"
  done

  echo "==> POST /recommend to llm-ranker (server-default key)"
  LLM_RESPONSE=$(echo "$CANDIDATES" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end', async ()=>{
      const candidates = JSON.parse(d);
      const res = await fetch('http://localhost:4002/recommend', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({personaId:'alice-tran', topK:20, candidates}),
      });
      const body = await res.json();
      process.stdout.write(JSON.stringify(body));
    });
  ")
  LLM_LEN=$(echo "$LLM_RESPONSE" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const r=JSON.parse(d);
      process.stdout.write(String((r.ranked_ids||[]).length));
    });
  ")
  [[ "$LLM_LEN" -gt 0 ]] || fail "llm-ranker ranked_ids is empty (got $LLM_LEN)"
  ok "llm-ranker ranked_ids has $LLM_LEN entries"

  LLM_SOURCE=$(echo "$LLM_RESPONSE" | node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const r=JSON.parse(d);
      process.stdout.write(r.source||'');
    });
  ")
  [[ "$LLM_SOURCE" == "server-default" ]] || fail "expected source=server-default, got '$LLM_SOURCE'"
  ok "llm-ranker source=server-default"

  ok "A/B result: opensearch=$AB_LEN ids, llm-ranker=$LLM_LEN ids"
fi

echo ""
echo "PASS: all checks green"
