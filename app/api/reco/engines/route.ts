import { NextResponse } from 'next/server';
import { listEngines } from '@/lib/reco/engines';

export const dynamic = 'force-dynamic';

export async function GET() {
  const engines = listEngines().map(e => ({
    name: e.name,
    version: e.version,
    description: e.description,
  }));
  return NextResponse.json({ engines });
}
