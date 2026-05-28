#!/usr/bin/env bash
# Start the reco demo stack (local or VM). See deploy_plan.md.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${ROOT}/deploy/env.demo.example}"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT}/config/docker-compose.demo.yaml}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi

cd "${ROOT}"
docker compose -f "${COMPOSE_FILE}" up -d --build

echo ""
echo "Stack starting. After healthy:"
echo "  ./scripts/deploy-seed-gorse.sh"
echo ""
echo "App (localhost only): http://127.0.0.1:3000/demo"
echo "With Caddy + DNS:     https://reco-demo.turing.com/demo"
