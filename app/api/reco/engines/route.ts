import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const enginesPath = join(process.cwd(), 'config/reco-engines.json');
  const engines = JSON.parse(readFileSync(enginesPath, 'utf8'));
  return NextResponse.json(engines);
}
