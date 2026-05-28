#!/usr/bin/env bash
# Set all demo DB passwords to "password" (plaintext; see app/api/auth/login).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

sqlite3 "${ROOT}/data/db/dashdoor.db" "UPDATE users SET password='password'; SELECT 'dashdoor users', changes();"
sqlite3 "${ROOT}/data/db/delivery.db" "UPDATE delivery_partners SET password='password'; SELECT 'delivery_partners', changes();"
sqlite3 "${ROOT}/data/db/merchant.db" "UPDATE merchants SET password='password'; SELECT 'merchants', changes();"

echo "Done. Consumer/merchant/delivery login password is: password"
