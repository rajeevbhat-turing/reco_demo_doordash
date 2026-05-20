import { NextRequest, NextResponse } from 'next/server';
import { runEval, type TaskSetId } from '@/lib/reco/eval/runner';
import { saveReport } from '@/lib/reco/eval/storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RunBody {
  engineNames?: string[];
  taskSetId?: TaskSetId;
  k?: number;
  historyLimit?: number;
}

export async function POST(request: NextRequest) {
  let body: RunBody;
  try {
    body = (await request.json()) as RunBody;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const engineNames = body.engineNames ?? [];
  const taskSet: TaskSetId = body.taskSetId ?? 'seed';
  if (engineNames.length === 0) {
    return NextResponse.json({ error: 'engineNames is required' }, { status: 400 });
  }
  if (taskSet !== 'seed' && taskSet !== 'history') {
    return NextResponse.json({ error: 'taskSetId must be "seed" or "history"' }, { status: 400 });
  }

  try {
    const report = await runEval({
      engineNames,
      taskSet,
      k: body.k,
      historyLimit: body.historyLimit,
    });
    saveReport(report);
    return NextResponse.json({ runId: report.runId, report });
  } catch (err) {
    console.error('❌ /api/reco/eval failed', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
