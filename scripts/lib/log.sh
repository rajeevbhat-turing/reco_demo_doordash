# Shell logging helper, sourced by scripts/deploy.sh and scripts/deploy_local.sh.
#
# Provides:
#   log_init <prefix>     — set up a per-run log file at /tmp/reco-demo-<prefix>-<ts>.log
#                           and redirect stdout+stderr through `tee` so everything
#                           lands in both the terminal and the file.
#   log info|warn|error   — timestamped log lines.
#   step "title"          — visually-distinct step header (also logged).
#   trap_errors           — installs an ERR trap that prints the failing line.
#
# Usage in a script:
#   set -euo pipefail
#   ROOT="$(cd "$(dirname "$0")/.." && pwd)"
#   . "${ROOT}/scripts/lib/log.sh"
#   log_init "deploy-local"
#   trap_errors
#
#   step "1. Prereqs"
#   log info "checking docker"
#   docker --version

LOG_FILE=""

__log_ts() { date +'%Y-%m-%d %H:%M:%S'; }

log() {
  local lvl="$1"; shift
  case "${lvl}" in
    info)  printf '[%s] [INFO ] %s\n' "$(__log_ts)" "$*" ;;
    warn)  printf '[%s] [WARN ] %s\n' "$(__log_ts)" "$*" >&2 ;;
    error) printf '[%s] [ERROR] %s\n' "$(__log_ts)" "$*" >&2 ;;
    *)     printf '[%s] [%s] %s\n'   "$(__log_ts)" "${lvl}" "$*" ;;
  esac
}

step() {
  printf '\n'
  printf '%s\n' '──────────────────────────────────────────────────────────────'
  printf '[%s] ▶ %s\n' "$(__log_ts)" "$*"
  printf '%s\n' '──────────────────────────────────────────────────────────────'
}

log_init() {
  local prefix="${1:-deploy}"
  LOG_FILE="/tmp/reco-demo-${prefix}-$(date +%Y%m%d-%H%M%S).log"
  # Send stdout + stderr through `tee -a` so everything is captured to
  # the log file AND still streams to the terminal (or to gcloud-ssh's
  # captured stdout in the deploy case).
  exec > >(tee -a "${LOG_FILE}") 2>&1
  log info "log file: ${LOG_FILE}"
}

trap_errors() {
  trap 'log error "FAILED at ${BASH_SOURCE[0]}:${LINENO}: \"${BASH_COMMAND}\" (exit $?)"; log error "see ${LOG_FILE} for full trail"; exit 1' ERR
}
