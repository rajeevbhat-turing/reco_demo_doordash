#!/usr/bin/env bash
# Run a command under the project's pinned Node version (see .nvmrc).
# Usage: scripts/n.sh <cmd> [args...]
#
# Each Claude Code Bash call starts a fresh shell, so sourcing nvm every
# time is noisy. This wrapper is the One Place.
set -euo pipefail
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use --silent "$(cat .nvmrc 2>/dev/null || echo 20)" >/dev/null
exec "$@"
