import { NextRequest, NextResponse } from 'next/server';
import { loadReport, listRunIds } from '@/lib/reco/eval/storage';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === '_index') {
    return NextResponse.json({ runIds: listRunIds() });
  }
  const report = loadReport(id);
  if (!report) {
    return NextResponse.json({ error: `run ${id} not found` }, { status: 404 });
  }
  return NextResponse.json({ report });
}
