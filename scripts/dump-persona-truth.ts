/**
 * Dumps the rule-derived ExpectedTask for each persona.
 *
 * - Reads data/reco-personas/personas.json + overrides.json
 * - Queries data/db/dashdoor.db via better-sqlite3
 * - Prints a readable summary per persona
 * - Writes data/reco-personas/expected.json (array of ExpectedTask)
 *
 * Run: npx tsx scripts/dump-persona-truth.ts
 */

// @ts-expect-error — better-sqlite3 ships without types.
import Database from 'better-sqlite3';
import { readFileSync, writeFileSync } from 'fs';

import type { ExpectedOverride, Persona } from '../lib/reco/types';
import { buildExpectedWithOverrides } from '../lib/reco/eval/persona-truth';

const ROOT = process.cwd();
const DB_PATH = `${ROOT}/data/db/dashdoor.db`;
const PERSONAS_PATH = `${ROOT}/data/reco-personas/personas.json`;
const OVERRIDES_PATH = `${ROOT}/data/reco-personas/overrides.json`;
const OUT_PATH = `${ROOT}/data/reco-personas/expected.json`;

const personas: Persona[] = JSON.parse(readFileSync(PERSONAS_PATH, 'utf8'));
const overrides: Record<string, ExpectedOverride> = JSON.parse(
  readFileSync(OVERRIDES_PATH, 'utf8'),
);

const db = new Database(DB_PATH, { readonly: true });

const nameOf = db.prepare(`SELECT name, cuisine FROM restaurants WHERE id = ?`);

const all = personas.map((p) => {
  const exp = buildExpectedWithOverrides(p, db, overrides);

  console.log(`\n${p.id} (user ${p.user_id}) — ${p.display_name}`);
  if (exp.sections.length === 0) {
    console.log('  (no hot cuisines passed the threshold)');
  }
  for (const sec of exp.sections) {
    console.log(`  ▸ ${sec.label}  [${sec.ranked_restaurant_ids.length}]  novelty_index=${sec.novelty_index}`);
    sec.ranked_restaurant_ids.forEach((rid, i) => {
      const r = nameOf.get(rid) as { name: string; cuisine: string } | undefined;
      const tag = i === sec.novelty_index ? '🆕 new' : 'familiar';
      console.log(`      ${i}. (${tag}) #${rid} ${r?.name ?? '?'}`);
    });
  }
  if (exp.blocked_restaurant_ids.length > 0) {
    const blocked = exp.blocked_restaurant_ids.map((rid) => {
      const r = nameOf.get(rid) as { name: string } | undefined;
      return `#${rid} ${r?.name ?? '?'}`;
    });
    console.log(`  ⛔ Blocked: ${blocked.join(', ')}`);
  }
  return exp;
});

writeFileSync(OUT_PATH, JSON.stringify(all, null, 2));
console.log(`\nWrote ${OUT_PATH}`);
