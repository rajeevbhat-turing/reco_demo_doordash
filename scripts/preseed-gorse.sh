#!/usr/bin/env bash
#
# Pre-seed Gorse locally so the deploy doesn't pay the seed cost at
# bring-up time. Spins up a throwaway upstream `gorse-in-one` on
# 127.0.0.1:${GORSE_PRESEED_PORT:-18088}, runs scripts/seed-gorse.ts
# against it (host node), snapshots /var/lib/gorse/{cache,data}.db to
# deploy/gorse-seed/, and tears down.
#
# The snapshot is then baked into reco-demo-gorse by
# deploy/Dockerfile.gorse-seeded at compose-build time.
#
# Idempotent: if deploy/gorse-seed/*.db already exists and is newer
# than data/db/dashdoor.db, the seed is skipped. Force a refresh with
# `FORCE_PRESEED=1 ./scripts/preseed-gorse.sh`.
#
# Called by:
#   scripts/deploy.sh        (before the linux/amd64 image build)
#   scripts/deploy_local.sh  (before the local-arch image build)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SEED_OUT="${ROOT}/deploy/gorse-seed"
SRC_DB="${ROOT}/data/db/dashdoor.db"
CONFIG_TOML="${ROOT}/config/gorse-config.toml"
TMP_CONTAINER="${GORSE_PRESEED_CONTAINER:-reco-demo-gorse-prebake}"
PORT="${GORSE_PRESEED_PORT:-18088}"

# shellcheck source=lib/log.sh
. "${ROOT}/scripts/lib/log.sh"
log_init "preseed-gorse"
trap_errors

log info "Gorse pre-seed: ${SRC_DB} → ${SEED_OUT}"

# ─── 0. Cache check ────────────────────────────────────────────────
if [[ -z "${FORCE_PRESEED:-}" ]] \
   && [[ -f "${SEED_OUT}/cache.db" ]] \
   && [[ -f "${SEED_OUT}/data.db" ]] \
   && [[ "${SEED_OUT}/cache.db" -nt "${SRC_DB}" ]]; then
  log info "snapshot already up-to-date — skipping (set FORCE_PRESEED=1 to override)"
  exit 0
fi

mkdir -p "${SEED_OUT}"

cleanup() {
  log info "cleanup: removing ${TMP_CONTAINER}"
  docker rm -f "${TMP_CONTAINER}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

step "1. Spin up throwaway Gorse on 127.0.0.1:${PORT}"
docker rm -f "${TMP_CONTAINER}" >/dev/null 2>&1 || true
docker run -d --name "${TMP_CONTAINER}" \
  -v "${CONFIG_TOML}:/etc/gorse/config.toml:ro" \
  -e GORSE_CACHE_STORE=sqlite:///var/lib/gorse/cache.db \
  -e GORSE_DATA_STORE=sqlite:///var/lib/gorse/data.db \
  -p "127.0.0.1:${PORT}:8088" \
  zhenghaoz/gorse-in-one:latest >/dev/null

step "2. Wait for Gorse to come up (up to 60 s)"
__ready=0
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1 \
     || curl -sf "http://127.0.0.1:${PORT}/api/dashboard/cluster" >/dev/null 2>&1; then
    log info "gorse ready in ${i}s"
    __ready=1
    break
  fi
  sleep 1
done
[[ "${__ready}" = "1" ]] || { log error "gorse did not come up on :${PORT}"; exit 1; }

step "3. Run scripts/seed-gorse.ts against the temp instance"
cd "${ROOT}"
RECO_GORSE_URL="http://127.0.0.1:${PORT}" \
LIBSQL_URL="file:${SRC_DB}" \
  npx -y tsx scripts/seed-gorse.ts

step "4. Flush + snapshot SQLite files"
# Give Gorse a moment to flush its in-memory state to the SQLite file
# before we copy. Empirically 3 s is plenty; 10 s for safety.
sleep 10
docker cp "${TMP_CONTAINER}:/var/lib/gorse/cache.db" "${SEED_OUT}/cache.db"
docker cp "${TMP_CONTAINER}:/var/lib/gorse/data.db"  "${SEED_OUT}/data.db"
log info "snapshot: cache.db $(du -h "${SEED_OUT}/cache.db" | cut -f1), data.db $(du -h "${SEED_OUT}/data.db" | cut -f1)"

# Stamp the source DB mtime onto the snapshot so the cache check above
# accepts it without insisting we re-seed within the same second.
touch -r "${SRC_DB}" "${SEED_OUT}/cache.db" "${SEED_OUT}/data.db"

step "5. Done"
log info "next build of reco-demo-gorse will bake this snapshot via deploy/Dockerfile.gorse-seeded"
