#!/usr/bin/env bash
# Run on the GCP VM after the repo is at /opt/reco-demo (see deploy_plan.md).
#
#   gcloud compute ssh --zone us-central1-c rb-reco-engine-eval \
#     --project turing-delivery-rl-gym
#   cd /opt/reco-demo && ./scripts/vm-first-deploy.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_DST="${ENV_DST:-/etc/reco-demo/env}"

if [[ ! -f "${ROOT}/config/docker-compose.demo.yaml" ]]; then
  echo "Run from repo root (expected ${ROOT}/config/docker-compose.demo.yaml)" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Install Docker first: https://docs.docker.com/engine/install/ubuntu/" >&2
  exit 1
fi

if [[ ! -f "${ENV_DST}" ]]; then
  echo "Creating ${ENV_DST} from deploy/env.demo.example ..."
  sudo mkdir -p /etc/reco-demo
  sudo cp "${ROOT}/deploy/env.demo.example" "${ENV_DST}"
  sudo chmod 600 "${ENV_DST}"
  echo "Edit ${ENV_DST} and add ANTHROPIC_API_KEY and/or OPENAI_API_KEY, then re-run."
  exit 1
fi

if grep -q '^ANTHROPIC_API_KEY=$' "${ENV_DST}" 2>/dev/null && grep -q '^OPENAI_API_KEY=$' "${ENV_DST}" 2>/dev/null; then
  if ! grep -qE '^(ANTHROPIC_API_KEY|OPENAI_API_KEY)=.+' "${ENV_DST}"; then
    echo "Warning: no LLM API keys in ${ENV_DST} — agent runs will fail until you add one." >&2
  fi
fi

cd "${ROOT}"
ENV_FILE="${ENV_DST}" ./scripts/demo-up.sh
ENV_FILE="${ENV_DST}" ./scripts/deploy-seed-gorse.sh

echo ""
echo "Smoke (on VM):"
curl -sf -o /dev/null -w "  /api/reco/engines → HTTP %{http_code}\n" http://127.0.0.1:3000/api/reco/engines || true
curl -sf -o /dev/null -w "  /demo → HTTP %{http_code}\n" http://127.0.0.1:3000/demo || true

if command -v caddy >/dev/null 2>&1 && [[ -f /etc/caddy/Caddyfile ]]; then
  echo "  Caddy: sudo systemctl reload caddy after DNS for reco-demo.turing.com"
else
  echo "  TLS: sudo cp ${ROOT}/deploy/caddy/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy"
fi

echo "  App: http://127.0.0.1:3000/demo (public: https://reco-demo.turing.com after DNS+Caddy)"
