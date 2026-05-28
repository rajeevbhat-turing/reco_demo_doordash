#!/usr/bin/env bash
# Seed Gorse after the demo stack is up. Idempotent.
#
# Usage (from repo root on the VM):
#   ./scripts/deploy-seed-gorse.sh
#   ENV_FILE=/etc/reco-demo/env ./scripts/deploy-seed-gorse.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT}/config/docker-compose.demo.yaml}"
ENV_FILE="${ENV_FILE:-${ROOT}/deploy/env.demo.example}"
GORSE_URL="${RECO_GORSE_URL:-http://127.0.0.1:8088}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
  GORSE_URL="${RECO_GORSE_URL:-${GORSE_URL}}"
fi

echo "Waiting for Gorse at ${GORSE_URL} ..."
ready=0
for _ in $(seq 1 90); do
  if curl -sf "${GORSE_URL}/" >/dev/null 2>&1 || curl -sf "${GORSE_URL}/api/status" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [[ "${ready}" -ne 1 ]]; then
  echo "Gorse did not become reachable at ${GORSE_URL}" >&2
  exit 1
fi

cd "${ROOT}"

if [[ -d "${ROOT}/node_modules" ]] && command -v "${ROOT}/scripts/n.sh" >/dev/null 2>&1; then
  echo "Seeding via host Node (${GORSE_URL}) ..."
  export RECO_GORSE_URL="${GORSE_URL}"
  export LIBSQL_URL="${LIBSQL_URL:-file:${ROOT}/data/db/dashdoor.db}"
  "${ROOT}/scripts/n.sh" npx -y tsx scripts/seed-gorse.ts
else
  echo "Seeding via docker compose profile seed (${GORSE_URL}) ..."
  export ENV_FILE="${ENV_FILE}"
  docker compose -f "${COMPOSE_FILE}" --profile seed run --rm gorse-seed
fi

echo "Gorse seed complete."
