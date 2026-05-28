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
  // Phase 5 BYO — passed through to the agent engine via RecoContext;
  // library engines drop these fields.
  agentLlmUrl?: string;
  agentLlmApiKey?: string;
  // Phase 5 BYO — adds a transient `custom` engine to this run only.
  customEngineUrl?: string;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
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
  // Trim BYO fields — Chrome's autofill loves to drop usernames here.
  // A whitespace-only value (or a non-URL like an email) is treated as
  // "not provided", so the agent falls back to its server-side default.
  const llmUrl = body.agentLlmUrl?.trim() || undefined;
  const llmApiKey = body.agentLlmApiKey?.trim() || undefined;
  const customUrl = body.customEngineUrl?.trim() || undefined;
  if (engineNames.length === 0) {
    return NextResponse.json({ error: 'engineNames is required' }, { status: 400 });
  }
  if (taskSet !== 'seed' && taskSet !== 'history') {
    return NextResponse.json({ error: 'taskSetId must be "seed" or "history"' }, { status: 400 });
  }
  if (engineNames.includes('byo-agent')) {
    if (!llmUrl) {
      return NextResponse.json(
        { error: 'byo-agent is selected — agentLlmUrl is required' },
        { status: 400 }
      );
    }
    if (!isValidUrl(llmUrl)) {
      return NextResponse.json(
        { error: 'agentLlmUrl must be a valid http(s) URL' },
        { status: 400 }
      );
    }
    if (!llmApiKey) {
      return NextResponse.json(
        { error: 'byo-agent is selected — agentLlmApiKey is required' },
        { status: 400 }
      );
    }
  }
  if (engineNames.includes('byo-engine')) {
    if (!customUrl) {
      return NextResponse.json(
        { error: 'byo-engine is selected — customEngineUrl is required' },
        { status: 400 }
      );
    }
    if (!isValidUrl(customUrl)) {
      return NextResponse.json(
        { error: 'customEngineUrl must be a valid http(s) URL' },
        { status: 400 }
      );
    }
  }

  try {
    const report = await runEval({
      engineNames,
      taskSet,
      k: body.k,
      historyLimit: body.historyLimit,
      agentLlmUrl: llmUrl,
      agentLlmApiKey: llmApiKey,
      customEngineUrl: customUrl,
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
