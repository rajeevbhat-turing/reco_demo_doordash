#!/usr/bin/env npx tsx
/**
 * Outputs the candidate set for a persona as JSON on stdout.
 * Used by smoke tests that need to call engine sidecars without the Next.js app.
 *
 * Usage: npx tsx scripts/build-candidates.ts [personaId]
 *        Default personaId: alice-tran
 */
import { readFileSync } from 'fs';
import { join } from 'path';
// @ts-expect-error — better-sqlite3 ships without types
import Database from 'better-sqlite3';
import type { Persona } from '../lib/reco/types';
import { buildCandidates } from '../lib/reco/candidates';

const personaId = process.argv[2] ?? 'alice-tran';
const ROOT = process.cwd();

const personas: Persona[] = JSON.parse(
  readFileSync(join(ROOT, 'data/reco-personas/personas.json'), 'utf8')
);
const persona = personas.find((p) => p.id === personaId);
if (!persona) {
  process.stderr.write(`Persona '${personaId}' not found\n`);
  process.exit(1);
}

const db = new Database(join(ROOT, 'data/db/dashdoor.db'), { readonly: true });
const candidates = buildCandidates(persona, db);
db.close();

process.stdout.write(JSON.stringify(candidates));
