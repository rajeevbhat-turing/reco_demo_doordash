#!/usr/bin/env bash
# Deploy the latest commit to the remote GCP VM.
#
# What it does:
#   1. Builds a production Docker image locally (or on the VM)
#   2. SSHes to the VM, pulls the latest git commit
#   3. Rebuilds and restarts only the dashdoor container
#   4. Optionally pushes env vars (API keys) from local .env
#
# Usage (from repo root):
#   ./scripts/deploy.sh               # full deploy (git pull + rebuild + restart)
#   DRY_RUN=1 ./scripts/deploy.sh     # print commands without running them
#
# Overrides:
#   VM=…  ZONE=…  PROJECT=…  BRANCH=…  ./scripts/deploy.sh
set -euo pipefail

VM="${VM:-rb-reco-engine-eval}"
ZONE="${ZONE:-us-central1-c}"
PROJECT="${PROJECT:-turing-delivery-rl-gym}"
BRANCH="${BRANCH:-opensearch}"
APP_DIR="${APP_DIR:-/opt/reco-demo}"
ENV_FILE="${ENV_FILE:-/etc/reco-demo/env}"
COMPOSE_FILE="$APP_DIR/config/docker-compose.demo.yaml"
DRY_RUN="${DRY_RUN:-0}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LAPTOP_ENV="${ROOT}/.env"

hr() { printf '\n\033[1;36m== %s ==\033[0m\n' "$*"; }
run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

hr "Deploy → $VM ($ZONE) branch=$BRANCH"

# ── 1. Push any local env vars the VM needs ─────────────────────────────────────
if [[ -f "$LAPTOP_ENV" ]]; then
  hr "1. Syncing env vars from local .env"
  # Extract keys we care about (never commit secrets)
  for KEY in OPENAI_API_KEY ANTHROPIC_API_KEY; do
    VAL="$(grep -E "^${KEY}=" "$LAPTOP_ENV" | head -1 | cut -d= -f2- || true)"
    if [[ -n "$VAL" ]]; then
      echo "   → pushing $KEY (${VAL:0:8}…)"
      run gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$VM" \
        --command="bash -c 'sudo sed -i \"s|^${KEY}=.*||g\" $ENV_FILE 2>/dev/null; echo \"${KEY}=${VAL}\" | sudo tee -a $ENV_FILE >/dev/null && echo \"  set $KEY\"'"
    fi
  done
else
  echo "   (no local .env found — skipping env sync)"
fi

# ── 2. Pull latest commit on VM ─────────────────────────────────────────────────
hr "2. git pull on VM"
run gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$VM" \
  --command="cd $APP_DIR && sudo git fetch origin && sudo git checkout $BRANCH && sudo git pull origin $BRANCH && echo '   pulled:' \$(git log --oneline -1)"

# ── 3. Rebuild the dashdoor image on the VM ─────────────────────────────────────
hr "3. Docker build (dashdoor)"
run gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$VM" \
  --command="cd $APP_DIR && sudo docker build -f Dockerfile.prod -t dashdoor:latest . --load 2>&1 | tail -5 && echo 'build OK'"

# ── 4. Restart dashdoor container (sidecars untouched) ──────────────────────────
hr "4. Restarting dashdoor container"
run gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$VM" \
  --command="cd $APP_DIR && sudo docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --force-recreate --no-deps dashdoor && echo 'restarted'"

# ── 5. Health check ─────────────────────────────────────────────────────────────
hr "5. Health check"
run gcloud compute ssh --zone "$ZONE" --project "$PROJECT" "$VM" \
  --command="for i in \$(seq 1 20); do code=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 || true); echo \"  attempt \$i: HTTP \$code\"; [ \"\$code\" = '200' ] && break; sleep 3; done"

hr "Done — $(date)"
echo "If HTTP 200 above, the deploy is live."
