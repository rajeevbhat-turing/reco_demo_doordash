/**
 * Side-effect import that loads the parent repo's `.env` into
 * `process.env` for keys that aren't already set. Lets the CLI and
 * server be invoked without a `set -a; source .env; set +a` prefix:
 *
 *   ./node_modules/.bin/tsx src/run.ts '{...}'   # just works
 *
 * No external dependency — parses a minimal `KEY=VALUE` shape that
 * matches our `.env.example`. Lines starting with `#` and blank lines
 * are ignored; values are not unquoted (we don't write quoted values
 * here). Production deploys can rely on real env injection; this
 * helper is a no-op when the file doesn't exist.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const envPath = path.resolve(
  url.fileURLToPath(new URL('.', import.meta.url)),
  '../../../.env'
);

if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1);
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
