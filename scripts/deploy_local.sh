#!/usr/bin/env bash
#
# One-shot LOCAL deploy of the demo stack on the laptop. Idempotent —
# safe to re-run. Wraps the same `config/docker-compose.demo.yaml`
# that the VM uses (see `scripts/deploy.sh` for the VM equivalent).
#
# Logs everything to `/tmp/reco-demo-deploy-local-<timestamp>.log`
# (path printed at start) and streams to your terminal at the same time.
#
# Usage:
#   ./scripts/deploy_local.sh
#
# After it returns:
#   open http://localhost:3000/demo

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${ROOT}/config/docker-compose.demo.yaml"
TEMPLATE="${ROOT}/deploy/env.demo.local.example"
ENV_FILE="${ROOT}/deploy/env.demo.local"
LAPTOP_ENV="${ROOT}/.env"

# shellcheck source=lib/log.sh
. "${ROOT}/scripts/lib/log.sh"
log_init "deploy-local"
trap_errors

log info "local deploy starting"
log info "host: $(hostname)  user: ${USER}  cwd: ${ROOT}"

step "1. Prereqs"
docker --version
docker compose version

step "2. Env file"
if [[ ! -f "${ENV_FILE}" ]]; then
  if [[ ! -f "${TEMPLATE}" ]]; then
    log error "missing both ${ENV_FILE} and ${TEMPLATE}"
    exit 1
  fi
  cp "${TEMPLATE}" "${ENV_FILE}"
  log info "created ${ENV_FILE} from template"
else
  log info "${ENV_FILE} already exists; leaving its current values alone"
fi

inject() {
  local key="$1"
  if [[ ! -f "${LAPTOP_ENV}" ]]; then return; fi
  # `|| true` so a missing key in the laptop .env is a silent skip
  # rather than a pipefail-triggered exit (which set -e would swallow
  # inside this command substitution, killing the script with no log).
  local laptop_val
  laptop_val="$(grep -E "^${key}=" "${LAPTOP_ENV}" | head -1 | cut -d= -f2- || true)"
  [[ -z "${laptop_val}" ]] && { log info "${key}: not set in ${LAPTOP_ENV}, skipping"; return; }
  local target_val
  target_val="$(grep -E "^${key}=" "${ENV_FILE}" | head -1 | cut -d= -f2- || true)"
  if [[ -z "${target_val}" ]]; then
    if grep -q "^${key}=" "${ENV_FILE}"; then
      sed -i.bak "s|^${key}=.*|${key}=${laptop_val}|" "${ENV_FILE}"
      rm -f "${ENV_FILE}.bak"
    else
      echo "${key}=${laptop_val}" >> "${ENV_FILE}"
    fi
    log info "${key}: injected from ${LAPTOP_ENV}"
  else
    log info "${key}: already set in ${ENV_FILE} (left as-is)"
  fi
}
inject OPENAI_API_KEY
chmod 600 "${ENV_FILE}"

step "3. Port 3000 — clear any stray dev server"
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  PID="$(lsof -t -nP -iTCP:3000 -sTCP:LISTEN | head -1)"
  CONTAINER="$(docker ps --filter "publish=3000" --format '{{.Names}}' | head -1 || true)"
  if [[ -n "${CONTAINER}" ]]; then
    log info "port 3000 is owned by docker container ${CONTAINER}; leaving for compose to manage"
  else
    log warn "killing PID ${PID} on :3000 (likely 'next dev')"
    kill -TERM "${PID}" 2>/dev/null || true
    sleep 2
    if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
      kill -KILL "${PID}" 2>/dev/null || true
      sleep 2
    fi
  fi
else
  log info ":3000 free"
fi

step "4a. Pre-seed Gorse (snapshot SQLite into deploy/gorse-seed/)"
# Snapshots cache.db + data.db from a throwaway upstream Gorse so the
# reco-demo-gorse image can bake them in. Idempotent: skipped if the
# snapshot is already newer than data/db/dashdoor.db.
"${ROOT}/scripts/preseed-gorse.sh"

step "4b. Build images (10–20 min first time; cached afterwards)"
cd "${ROOT}"
__BUILD_START=$(date +%s)
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" --profile seed build 2>&1 | tail -40
log info "build elapsed: $(( $(date +%s) - __BUILD_START ))s"

step "5. Start stack"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d
sleep 5
docker compose -f "${COMPOSE_FILE}" ps

step "6. Wait for dashdoor health (up to 120 s)"
for i in $(seq 1 24); do
  code="$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/reco/engines 2>/dev/null || echo 000)"
  log info "$(printf 'attempt %02d: HTTP %s' "$i" "${code}")"
  [[ "${code}" = "200" ]] && break
  sleep 5
done

# (Removed: runtime Gorse seed step. The reco-demo-gorse image ships
# pre-seeded via scripts/preseed-gorse.sh + deploy/Dockerfile.gorse-seeded.
# Manual reseed still available: `docker compose -f ${COMPOSE_FILE}
# --env-file ${ENV_FILE} --profile seed run --rm gorse-seed`.)

step "7. Smoke"
log info "engines:"
curl -sS http://127.0.0.1:3000/api/reco/engines | head -c 600 ; echo
echo
for path in /demo /reco-eval /home; do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000${path}" 2>/dev/null || echo 000)"
  log info "  ${path} → HTTP ${code}"
done

step "done"
log info "log file: ${LOG_FILE}"
log info "open: http://localhost:3000/demo"
log info "open: http://localhost:3000/reco-eval"
log info "open: http://localhost:3000/home   (login: john.doe@example.com / password)"
log info "tear down: ENV_FILE=${ENV_FILE} ${ROOT}/scripts/demo-down.sh"
