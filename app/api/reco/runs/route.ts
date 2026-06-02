import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { RecoRun } from '@/store/reco-selection-store';

const ROOT = process.cwd();
const RUNS_FILE = join(ROOT, 'data/reco-traces/runs.json');

function readRuns(): RecoRun[] {
  try {
    return JSON.parse(readFileSync(RUNS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeRuns(runs: RecoRun[]): void {
  mkdirSync(join(ROOT, 'data/reco-traces'), { recursive: true });
  writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2));
}

export async function GET() {
  const runs = readRuns();
  runs.sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1));
  return NextResponse.json(runs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    personaId,
    personaUserId,
    personaName,
    engineId,
    label,
    model,
    ranked_ids,
    scores,
  } = body as Omit<RecoRun, 'id' | 'capturedAt'>;

  const id = `${personaUserId}:${engineId}:${model ?? ''}`;
  const capturedAt = new Date().toISOString();
  const record: RecoRun = {
    id,
    personaId,
    personaUserId,
    personaName,
    engineId,
    label,
    ...(model !== undefined ? { model } : {}),
    ranked_ids,
    ...(scores !== undefined ? { scores } : {}),
    capturedAt,
  };

  const runs = readRuns();
  const idx = runs.findIndex((r) => r.id === id);
  if (idx >= 0) {
    runs[idx] = record;
  } else {
    runs.push(record);
  }
  writeRuns(runs);

  return NextResponse.json(record);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    const runs = readRuns().filter((r) => r.id !== id);
    writeRuns(runs);
  } else {
    writeRuns([]);
  }
  return NextResponse.json({ ok: true });
}
