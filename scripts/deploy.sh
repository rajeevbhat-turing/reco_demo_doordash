#!/usr/bin/env bash
#
# Build the reco demo images on this laptop (linux/amd64), ship them to
# the GCP VM as one tarball, and bring the stack up there behind Caddy/TLS.
#
# Usage (from the laptop, repo root):
#   ./scripts/deploy.sh
#
# Overrides via env:
#   VM, ZONE, PROJECT, PUBLIC_HOST
#
# Reads OPENAI_API_KEY from ./.env so it can be injected into
# /etc/reco-demo/env on the VM. (Anthropic is no longer plumbed —
# sidecar speaks OpenAI only.)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/log.sh
. "${ROOT}/scripts/lib/log.sh"
log_init "deploy"
trap_errors

VM="${VM:-rb-reco-engine-eval}"
ZONE="${ZONE:-us-central1-c}"
PROJECT="${PROJECT:-turing-delivery-rl-gym}"
PUBLIC_HOST="${PUBLIC_HOST:-reco-demo.turing.com}"

COMPOSE_FILE="${ROOT}/config/docker-compose.demo.yaml"
# reco-demo-gorse is the pre-seeded Gorse image built from
# deploy/Dockerfile.gorse-seeded after scripts/preseed-gorse.sh runs.
IMAGES=(reco-demo-dashdoor reco-demo-lightfm reco-demo-implicit reco-demo-reco-agent reco-demo-gorse reco-demo-gorse-seed)
IMAGES_TAR=/tmp/reco-demo-images.tar.gz
REPO_TAR=/tmp/reco-demo.tar.gz

log info "deploying ${VM} (${ZONE}, ${PROJECT}) → https://${PUBLIC_HOST}/"
log info "follow live: tail -f ${LOG_FILE}"

# Per-step timing — printed as a summary at the end.
declare -a STEP_NAMES=() STEP_SECS=()
__step_t0=0
__step_name=""
begin_step() {
  __step_name="$1"
  __step_t0=$(date +%s)
  step "${__step_name}"
}
end_step() {
  local dur=$(( $(date +%s) - __step_t0 ))
  STEP_NAMES+=("${__step_name}")
  STEP_SECS+=("${dur}")
  log info "${__step_name} took ${dur}s"
}

# Pull OpenAI key from local .env so we can pass it through.
# Anthropic is no longer plumbed — the sidecar speaks OpenAI only.
LAPTOP_ENV="${ROOT}/.env"
OPENAI_API_KEY="$(grep -E '^OPENAI_API_KEY=' "${LAPTOP_ENV}" 2>/dev/null | head -1 | cut -d= -f2- || true)"
[[ -z "${OPENAI_API_KEY}" ]] && log warn "OPENAI_API_KEY missing from ${LAPTOP_ENV}"

begin_step "1a. Pre-seed Gorse (snapshot SQLite into deploy/gorse-seed/)"
# This populates deploy/gorse-seed/{cache,data}.db so step 1b can bake
# them into the reco-demo-gorse image. Cached: skips itself if the
# snapshot is already newer than data/db/dashdoor.db.
"${ROOT}/scripts/preseed-gorse.sh"
end_step

begin_step "1b. Build images locally for linux/amd64"
cd "${ROOT}"
# Stream build output directly to the log (tee already captured by
# log_init) so `tail -f /tmp/reco-demo-deploy-*.log` shows live progress.
# Force plain progress so each line is timestamped one-shot, not a TTY
# spinner that vanishes when re-rendered.
DOCKER_DEFAULT_PLATFORM=linux/amd64 BUILDKIT_PROGRESS=plain docker compose \
  -f "${COMPOSE_FILE}" --profile seed build
end_step

begin_step "2. Save all images → single gzip tar"
log info "saving: ${IMAGES[*]}"
docker save "${IMAGES[@]}" | gzip > "${IMAGES_TAR}"
log info "wrote ${IMAGES_TAR} ($(du -h "${IMAGES_TAR}" | cut -f1))"
end_step

begin_step "3. Tar repo (compose file, Caddyfile, env template, scripts, DBs)"
tar --exclude=node_modules --exclude=.next --exclude=.git \
    --exclude=tools/reco-agent/node_modules \
    --exclude=data/reco-runs --exclude=data/reco-agent-runs \
    --exclude=playwright-report --exclude=test-results \
    -czf "${REPO_TAR}" .
log info "wrote ${REPO_TAR} ($(du -h "${REPO_TAR}" | cut -f1))"
end_step

begin_step "4. SCP both tarballs to ${VM}:/tmp/"
# gcloud compute scp doesn't expose a progress flag, and scp itself
# silences its progress bar when stdout isn't a TTY (we tee into a log
# file). Workaround: run scp in the background, poll the in-flight
# file size on the VM, and print one line every 15 s.
__local_images=$(wc -c < "${IMAGES_TAR}" | tr -d ' ')
__local_repo=$(wc -c < "${REPO_TAR}" | tr -d ' ')
log info "shipping $(( __local_images / 1024 / 1024 )) MB (images) + $(( __local_repo / 1024 / 1024 )) MB (repo)"
gcloud compute scp --zone "${ZONE}" --project "${PROJECT}" \
  "${IMAGES_TAR}" "${REPO_TAR}" "${VM}:/tmp/" &
__scp_pid=$!
__poll_t0=$(date +%s)
while kill -0 "${__scp_pid}" 2>/dev/null; do
  sleep 15
  # Stat the in-flight images tarball (the dominant transfer). The
  # repo tarball arrives in seconds and isn't worth tracking.
  __remote=$(
    gcloud compute ssh --zone "${ZONE}" --project "${PROJECT}" "${VM}" \
      --command="stat -c%s /tmp/reco-demo-images.tar.gz 2>/dev/null || echo 0" \
      2>/dev/null | tr -dc '0-9' || echo 0
  )
  __remote=${__remote:-0}
  __elapsed=$(( $(date +%s) - __poll_t0 ))
  if [ "${__remote}" -gt 0 ] && [ "${__local_images}" -gt 0 ]; then
    __pct=$(( __remote * 100 / __local_images ))
    __mbps=$(( __remote / 1024 / 1024 / (__elapsed > 0 ? __elapsed : 1) ))
    log info "  scp: $(( __remote / 1024 / 1024 )) / $(( __local_images / 1024 / 1024 )) MB (${__pct}%) — ${__mbps} MB/s avg"
  else
    log info "  scp running... (${__elapsed}s elapsed)"
  fi
done
wait "${__scp_pid}"
end_step

begin_step "5. Run VM-side bring-up (load + compose up + Caddy + smoke)"
gcloud compute ssh --zone "${ZONE}" --project "${PROJECT}" "${VM}" \
  --command="OPENAI_API_KEY='${OPENAI_API_KEY}' PUBLIC_HOST='${PUBLIC_HOST}' bash -s" \
  <<'VM_EOF'
set -euo pipefail

APP_DIR=/opt/reco-demo
ENV_DIR=/etc/reco-demo
ENV_FILE="$ENV_DIR/env"
REPO_TAR=/tmp/reco-demo.tar.gz
IMAGES_TAR=/tmp/reco-demo-images.tar.gz
COMPOSE_FILE="$APP_DIR/config/docker-compose.demo.yaml"
CADDY_SRC="$APP_DIR/deploy/caddy/Caddyfile"
CADDY_DST=/etc/caddy/Caddyfile

log()  { printf '[%s] %s\n' "$(date +'%H:%M:%S')" "$*"; }
step() { printf '\n──── %s ────\n' "$*"; }

step "[vm] 5.1 Extract repo → $APP_DIR"
sudo mkdir -p "$APP_DIR" "$ENV_DIR"
sudo chown "$USER":"$USER" "$APP_DIR" "$ENV_DIR"
sudo chmod 700 "$ENV_DIR"
tar -xzf "$REPO_TAR" -C "$APP_DIR"

step "[vm] 5.2 Env file + inject API keys"
[ -f "$ENV_FILE" ] || sudo cp "$APP_DIR/deploy/env.demo.example" "$ENV_FILE"
sudo chown "$USER":"$USER" "$ENV_FILE"
sudo chmod 600 "$ENV_FILE"
inject() {
  local k="$1" v="${2:-}"
  [ -z "$v" ] && { log "$k: skip (not provided)"; return; }
  if grep -q "^${k}=" "$ENV_FILE"; then sed -i "s|^${k}=.*|${k}=${v}|" "$ENV_FILE"
  else echo "${k}=${v}" >> "$ENV_FILE"
  fi
  log "$k: injected"
}
inject OPENAI_API_KEY "${OPENAI_API_KEY:-}"

step "[vm] 5.3 Install + reload Caddy (TLS for $PUBLIC_HOST)"
if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg >/dev/null
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y caddy >/dev/null
fi
log "caddy: $(caddy version | head -1)"
sudo mkdir -p /etc/caddy /etc/systemd/system/caddy.service.d
sudo cp "$CADDY_SRC" "$CADDY_DST"
sudo tee /etc/systemd/system/caddy.service.d/restart.conf >/dev/null <<'DROP'
[Service]
Restart=on-failure
RestartSec=5s
DROP
sudo systemctl daemon-reload
sudo caddy validate --config "$CADDY_DST" --adapter caddyfile >/dev/null
sudo systemctl enable --now caddy >/dev/null 2>&1 || true
sudo systemctl reload caddy || sudo systemctl restart caddy

step "[vm] 5.4 Load images from $IMAGES_TAR"
[ -f "$IMAGES_TAR" ] || { echo "missing $IMAGES_TAR"; exit 1; }
log "image tarball: $(du -h "$IMAGES_TAR" | cut -f1)"
__T0=$(date +%s)
gunzip -c "$IMAGES_TAR" | docker load
log "docker load: $(( $(date +%s) - __T0 ))s"
docker image ls --format '  {{.Repository}}:{{.Tag}}  {{.Size}}' | grep '^  reco-demo' || true

step "[vm] 5.5 Compose up (no build — uses loaded images)"
cd "$APP_DIR"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
sleep 5
docker compose -f "$COMPOSE_FILE" ps

step "[vm] 5.6 Wait for dashdoor (up to 120s)"
for i in $(seq 1 24); do
  code=$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/reco/engines || echo 000)
  log "attempt $i: HTTP $code"
  [ "$code" = "200" ] && break
  sleep 5
done

# (Removed: VM-side Gorse seed. The reco-demo-gorse image ships
# pre-seeded via scripts/preseed-gorse.sh + deploy/Dockerfile.gorse-seeded.
# scripts/deploy-seed-gorse.sh is still on disk for manual reseeds.)

step "[vm] 5.7 HTTPS smoke via $PUBLIC_HOST"
for path in /demo /reco-eval /home /api/reco/engines; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "https://${PUBLIC_HOST}${path}" || echo 000)
  log "  https://${PUBLIC_HOST}${path} → HTTP $code"
done

step "[vm] 5.8 Cleanup"
rm -f "$IMAGES_TAR" "$REPO_TAR"
log "done — Public URL: https://${PUBLIC_HOST}/demo"
VM_EOF
end_step

step "done"
log info "Public URL: https://${PUBLIC_HOST}/demo"
log info "Full log: ${LOG_FILE}"

# Per-step timing summary so you don't have to scroll the whole log.
echo
printf '%s\n' '── per-step timing ──────────────────────────────────'
for i in "${!STEP_NAMES[@]}"; do
  printf '  %4ss   %s\n' "${STEP_SECS[$i]}" "${STEP_NAMES[$i]}"
done
printf '%s\n' '─────────────────────────────────────────────────────'
