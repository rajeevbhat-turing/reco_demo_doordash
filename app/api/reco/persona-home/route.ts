import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
// @ts-expect-error — better-sqlite3 ships without types
import Database from 'better-sqlite3';
import type { Persona } from '@/lib/reco/types';
import { buildExpectedWithOverrides } from '@/lib/reco';

const ROOT = process.cwd();

function loadPersonas(): Persona[] {
  return JSON.parse(readFileSync(join(ROOT, 'data/reco-personas/personas.json'), 'utf8'));
}

function loadOverrides(): Record<string, any> {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'data/reco-personas/overrides.json'), 'utf8'));
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_RECO_DEMO) {
    return NextResponse.json({ sections: [], blocked_restaurant_ids: [] });
  }

  const userId = parseInt(request.nextUrl.searchParams.get('userId') ?? '0', 10);
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const personas = loadPersonas();
  const persona = personas.find(p => p.user_id === userId);
  if (!persona) {
    return NextResponse.json({ sections: [], blocked_restaurant_ids: [] });
  }

  const dbPath = join(ROOT, 'data/db/dashdoor.db');
  const sqlite = new Database(dbPath, { readonly: true });
  try {
    const overrides = loadOverrides();
    const task = buildExpectedWithOverrides(persona, sqlite, overrides);
    return NextResponse.json({
      sections: task.sections,
      blocked_restaurant_ids: task.blocked_restaurant_ids,
    });
  } finally {
    sqlite.close();
  }
}
