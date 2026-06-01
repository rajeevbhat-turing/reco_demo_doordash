import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
// @ts-expect-error — better-sqlite3 ships without types
import Database from 'better-sqlite3';
import type { Persona } from '@/lib/reco/types';
import { buildCandidates } from '@/lib/reco/candidates';
import { buildExpectedWithOverrides } from '@/lib/reco';

const ROOT = process.cwd();

function loadPersonas(): Persona[] {
  return JSON.parse(readFileSync(join(ROOT, 'data/reco-personas/personas.json'), 'utf8'));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadOverrides(): Record<string, any> {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'data/reco-personas/overrides.json'), 'utf8'));
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const personaId = request.nextUrl.searchParams.get('personaId');
  if (!personaId) {
    return NextResponse.json({ error: 'personaId required' }, { status: 400 });
  }

  const personas = loadPersonas();
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) {
    return NextResponse.json({ error: `persona '${personaId}' not found` }, { status: 404 });
  }

  const db = new Database(join(ROOT, 'data/db/dashdoor.db'), { readonly: true });
  try {
    const candidates = buildCandidates(persona, db);
    const overrides = loadOverrides();
    const expected = buildExpectedWithOverrides(persona, db, overrides);
    return NextResponse.json({ candidates, expected });
  } finally {
    db.close();
  }
}
