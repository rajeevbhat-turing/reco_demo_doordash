import { NextRequest } from 'next/server';
import { runEval, type ProgressEvent, type TaskSetId } from '@/lib/reco/eval/runner';
import { saveReport } from '@/lib/reco/eval/storage';

export const dynamic = 'force-dynamic';
// Eval-with-agent can take several minutes; bump the function ceiling.
// Library-only runs finish well under 30 s; the 600 s cap is for the
// agent track (LLM-bounded, ~30–60 s per task in browser time).
export const maxDuration = 600;

interface RunBody {
  engineNames?: string[];
  taskSetId?: TaskSetId;
  k?: number;
  historyLimit?: number;
  agentLlmUrl?: string;
  agentLlmApiKey?: string;
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

/**
 * Streaming variant of POST /api/reco/eval. Emits one NDJSON line per
 * progress event (run-start, task-start, engine-start, engine-ok,
 * engine-error, run-end) while the run is in flight, then a final
 * `{type:"report", runId, report}` line with the full aggregate report
 * — same shape the non-streaming endpoint returns. Validation errors
 * land as `{type:"error", error}` lines.
 *
 * Client reads via `fetch(...).body.getReader()` + a newline splitter
 * (see `runEval()` in reco-eval-client.tsx).
 */
export async function POST(request: NextRequest) {
  let body: RunBody;
  try {
    body = (await request.json()) as RunBody;
  } catch {
    return jsonLine(400, { type: 'error', error: 'invalid JSON body' });
  }

  const engineNames = body.engineNames ?? [];
  const taskSet: TaskSetId = body.taskSetId ?? 'seed';
  const llmUrl = body.agentLlmUrl?.trim() || undefined;
  const llmApiKey = body.agentLlmApiKey?.trim() || undefined;
  const customUrl = body.customEngineUrl?.trim() || undefined;

  if (engineNames.length === 0) {
    return jsonLine(400, { type: 'error', error: 'engineNames is required' });
  }
  if (taskSet !== 'seed' && taskSet !== 'history') {
    return jsonLine(400, { type: 'error', error: 'taskSetId must be "seed" or "history"' });
  }
  if (engineNames.includes('byo-agent')) {
    if (!llmUrl) {
      return jsonLine(400, {
        type: 'error',
        error: 'byo-agent is selected — agentLlmUrl is required',
      });
    }
    if (!isValidUrl(llmUrl)) {
      return jsonLine(400, {
        type: 'error',
        error: 'agentLlmUrl must be a valid http(s) URL',
      });
    }
    if (!llmApiKey) {
      return jsonLine(400, {
        type: 'error',
        error: 'byo-agent is selected — agentLlmApiKey is required',
      });
    }
  }
  if (engineNames.includes('byo-engine')) {
    if (!customUrl) {
      return jsonLine(400, {
        type: 'error',
        error: 'byo-engine is selected — customEngineUrl is required',
      });
    }
    if (!isValidUrl(customUrl)) {
      return jsonLine(400, {
        type: 'error',
        error: 'customEngineUrl must be a valid http(s) URL',
      });
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };
      const onProgress = (event: ProgressEvent) => write(event);

      try {
        const report = await runEval({
          engineNames,
          taskSet,
          k: body.k,
          historyLimit: body.historyLimit,
          agentLlmUrl: llmUrl,
          agentLlmApiKey: llmApiKey,
          customEngineUrl: customUrl,
          onProgress,
        });
        saveReport(report);
        write({ type: 'report', runId: report.runId, report });
      } catch (err) {
        console.error('❌ /api/reco/eval/stream failed', err);
        write({ type: 'error', error: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      // Caddy & nginx default to buffering responses; turn it off so
      // the events reach the browser as they're emitted.
      'x-accel-buffering': 'no',
    },
  });
}

function jsonLine(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload) + '\n', {
    status,
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8' },
  });
}
