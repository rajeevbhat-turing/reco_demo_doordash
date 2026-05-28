#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ENV_FILE="${ENV_FILE:-${ROOT}/deploy/env.demo.example}"
COMPOSE_FILE="${COMPOSE_FILE:-${ROOT}/config/docker-compose.demo.yaml}"

cd "${ROOT}"
docker compose -f "${COMPOSE_FILE}" down
