#!/usr/bin/env bash
# Bring up the local persona-demo dev environment. Idempotent: safe to
# run repeatedly. Cleans up only what it owns and never touches Docker
# Desktop itself.
set -euo pipefail

cd "$(dirname "$0")"

COMPOSE_FILE="config/docker-compose.demo.yaml"

# ── Free a host port without killing Docker Desktop ─────────────────────────────
# Docker Desktop's backend itself LISTENs on published ports (it proxies
# them to containers), so "kill whatever listens on :PORT" would kill
# Docker. Instead: stop any container publishing the port, then kill only
# a leftover *local* (non-Docker) listener.
free_port() {
  local port=$1

  # 1. Stop containers publishing this host port (leaves Docker running).
  local cids
  cids=$(docker ps --filter "publish=${port}" -q 2>/dev/null || true)
  if [[ -n "$cids" ]]; then
    echo "→ stopping container(s) publishing :${port}"
    docker stop $cids >/dev/null 2>&1 || true
  fi

  # 2. Kill a stale local listener (e.g. a previous npm dev / sidecar),
  #    but never com.docker.backend.
  local pids
  pids=$(lsof -nP -iTCP:"${port}" -sTCP:LISTEN -t 2>/dev/null || true)
  local pid cmd
  for pid in $pids; do
    cmd=$(ps -p "$pid" -o comm= 2>/dev/null | tr -d ' ' || true)
    case "$cmd" in
      *docker*|*Docker*) continue ;;  # never kill Docker Desktop's proxy
    esac
    echo "→ killing stale listener on :${port} (PID $pid, ${cmd:-?})"
    kill "$pid" 2>/dev/null || true
  done
}

# ── 1. Ensure Docker daemon is up ───────────────────────────────────────────────
if ! docker info >/dev/null 2>&1; then
  echo "→ Docker daemon not running; launching Docker Desktop…"
  open -a Docker 2>/dev/null || true
  for _ in $(seq 1 60); do
    docker info >/dev/null 2>&1 && break
    sleep 2
  done
  docker info >/dev/null 2>&1 || { echo "ERROR: Docker did not come up"; exit 1; }
fi
echo "→ Docker daemon ready"

# ── 2. Free the ports we need (3000 = Next.js, 4001 = sidecar) ──────────────────
free_port 3000
free_port 4001
sleep 1

# ── 3. OpenSearch via Docker (idempotent) ───────────────────────────────────────
echo "→ starting OpenSearch"
docker compose -f "$COMPOSE_FILE" up -d opensearch

echo "→ waiting for OpenSearch on :9200…"
for i in $(seq 1 60); do
  if curl -s -o /dev/null http://localhost:9200; then
    echo "   ready"
    break
  fi
  sleep 1
  [[ $i -eq 60 ]] && { echo "ERROR: OpenSearch did not come up within 60s"; exit 1; }
done

# ── 4. Seed (idempotent — index is recreated each run) ──────────────────────────
echo "→ seeding OpenSearch"
npx tsx scripts/seed-opensearch.ts

# ── 5. Start the reco sidecar on :4001 ──────────────────────────────────────────
echo "→ starting reco sidecar on :4001"
npm run reco:opensearch &
SIDECAR_PID=$!
echo "   sidecar PID $SIDECAR_PID"

# ── 6. Start Next.js on :3000 (foreground; Ctrl-C tears down the sidecar) ───────
echo "→ starting Next.js on :3000"
trap "kill $SIDECAR_PID 2>/dev/null || true; exit" INT TERM
npm run dev
