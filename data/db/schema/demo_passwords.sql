-- Demo-only: plaintext password "password" for all consumer users (dashdoor.db).
-- Apply per database:
--   sqlite3 data/db/dashdoor.db   "UPDATE users SET password='password';"
--   sqlite3 data/db/delivery.db   "UPDATE delivery_partners SET password='password';"
--   sqlite3 data/db/merchant.db    "UPDATE merchants SET password='password';"
-- Or: ./scripts/demo-passwords.sh

UPDATE users SET password = 'password';
