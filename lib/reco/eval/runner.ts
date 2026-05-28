import { db } from '@/lib/db';
import { RecoEngineError, type RecoContext, type RecommendationEngine } from '@/lib/reco/types';
import { getEngine, listEngines } from '@/lib/reco/engines';
import { makeHttpEngine } from '@/lib/reco/engines/http';
import {
  scoreTask,
  aggregate,
  type PerTaskMetrics,
  type AggregateMetrics,
} from '@/lib/reco/metrics';
import { loadSeedTasks, type RecoTask } from './task-loader';
import { loadHistorySplitTasks } from './history-split';

export type TaskSetId = 'seed' | 'history';

export interface PerTaskRow {
  taskId: string;
  statement: string;
  expectedItemIds: string[];
  expectedNames?: string[];
  perEngine: Record<
    string,
    {
      predicted: string[];
      latencyMs: number;
      metrics?: PerTaskMetrics;
      error?: string;
      debug?: Record<string, unknown>;
    }
  >;
}

export interface EvalReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  k: number;
  taskSet: TaskSetId;
  engines: { name: string; version: string; description: string }[];
  perTask: PerTaskRow[];
  /** Aggregate metrics per engine. */
  aggregate: Record<string, AggregateMetrics>;
}

export interface RunEvalOptions {
  engineNames: string[];
  taskSet: TaskSetId;
  k?: number;
  /** Cap on history tasks (history can be huge). */
  historyLimit?: number;
  /**
   * Phase 5 BYO — forwarded to the agent engine via the `RecoContext`
   * the runner builds per task. Library engines drop them. The key
   * never persists; it's request-scoped.
   */
  agentLlmUrl?: string;
  agentLlmApiKey?: string;
  /**
   * Phase 5 BYO — when set, adds a transient `custom` engine for this
   * run only. Same HTTP wire contract as LightFM / Implicit.
   */
  customEngineUrl?: string;
  /**
   * Optional progress sink. Called synchronously inside the run loop
   * for each task/engine boundary so the streaming /api/reco/eval/stream
   * route can forward events to the eval UI in real time. The shape is
   * stable enough for callers to render directly.
   */
  onProgress?: (event: ProgressEvent) => void;
}

export type ProgressEvent =
  | {
      type: 'run-start';
      engines: string[];
      taskCount: number;
      k: number;
      taskSet: TaskSetId;
    }
  | {
      type: 'task-start';
      taskId: string;
      statement: string;
      index: number;
      total: number;
    }
  | { type: 'engine-start'; taskId: string; engine: string }
  | {
      type: 'engine-ok';
      taskId: string;
      engine: string;
      latencyMs: number;
      itemCount: number;
      hit: boolean;
    }
  | {
      type: 'engine-error';
      taskId: string;
      engine: string;
      latencyMs: number;
      error: string;
    }
  | { type: 'run-end'; durationMs: number };

/**
 * Run all selected engines across all tasks in the chosen task set.
 * Engines run sequentially per task to keep logs readable; tasks are
 * processed in a small parallel pool to keep latency reasonable.
 */
export async function runEval(opts: RunEvalOptions): Promise<EvalReport> {
  const k = opts.k ?? 5;
  const startedAt = new Date().toISOString();
  const runId = `run_${Date.now().toString(36)}`;

  const registeredEngines = opts.engineNames
    .map(n => getEngine(n))
    .filter((e): e is NonNullable<ReturnType<typeof getEngine>> => !!e);
  const transientEngines: RecommendationEngine[] = [];

  // byo-engine — caller's HTTP endpoint, same wire as LightFM / Implicit.
  if (opts.engineNames.includes('byo-engine')) {
    if (!opts.customEngineUrl) {
      throw new Error('byo-engine is selected but customEngineUrl is missing');
    }
    transientEngines.push(
      makeHttpEngine({
        name: 'byo-engine',
        version: 'byo',
        description: `Client-hosted engine at ${opts.customEngineUrl}`,
        endpoint: opts.customEngineUrl,
        timeoutMs: 30_000,
      })
    );
  }

  // byo-agent — the same agent sidecar as the default `agent` engine,
  // but every call's RecoContext carries the BYO LLM URL/key so the
  // sidecar routes tick calls through the caller's gateway instead of
  // its server-side default. Implemented as a wrapper around the
  // registered HTTP-agent engine so we don't duplicate retry/timeout
  // handling.
  if (opts.engineNames.includes('byo-agent')) {
    if (!opts.agentLlmUrl) {
      throw new Error('byo-agent is selected but agentLlmUrl is missing');
    }
    const base = getEngine('agent');
    if (!base) {
      throw new Error(
        'byo-agent is selected but the agent sidecar is not configured (RECO_AGENT_URL unset)'
      );
    }
    const llmUrl = opts.agentLlmUrl;
    const llmKey = opts.agentLlmApiKey;
    transientEngines.push({
      name: 'byo-agent',
      version: 'byo',
      description: 'Agent sidecar driven by your BYO LLM gateway.',
      recommend: ctx =>
        base.recommend({
          ...ctx,
          agentLlmUrl: llmUrl,
          ...(llmKey ? { agentLlmApiKey: llmKey } : {}),
        }),
    });
  }

  const engines: RecommendationEngine[] = [...registeredEngines, ...transientEngines];
  if (engines.length === 0) {
    throw new Error('no valid engines selected');
  }

  const tasks = await loadTasks(opts.taskSet, opts.historyLimit);
  const runStartMs = Date.now();
  const emit = opts.onProgress ?? (() => undefined);

  const catalogSize = await getCatalogSize();
  const perTask: PerTaskRow[] = [];
  const allPredictedByEngine: Record<string, string[]> = Object.fromEntries(
    engines.map(e => [e.name, []])
  );
  const perTaskMetricsByEngine: Record<string, PerTaskMetrics[]> = Object.fromEntries(
    engines.map(e => [e.name, []])
  );

  emit({
    type: 'run-start',
    engines: engines.map(e => e.name),
    taskCount: tasks.length,
    k,
    taskSet: opts.taskSet,
  });

  // Build user-id lookup for tasks that reference an email.
  const userIdByEmail = await loadUserIdsByEmail(tasks);

  for (let taskIdx = 0; taskIdx < tasks.length; taskIdx++) {
    const task = tasks[taskIdx]!;
    emit({
      type: 'task-start',
      taskId: task.taskId,
      statement: task.statement,
      index: taskIdx,
      total: tasks.length,
    });
    const ctx: RecoContext = {
      userId: task.userEmail ? userIdByEmail.get(task.userEmail) : undefined,
      lat: task.userLat,
      lng: task.userLng,
      surface: task.surface,
      k,
      // Forwarded for the agent engine; plain engines ignore it.
      taskId: task.taskId,
      // BYO LLM URL/key are *not* injected here — only the byo-agent
      // transient engine (above) carries them. The default `agent` row
      // always runs against the sidecar's server-default LLM.
    };

    const row: PerTaskRow = {
      taskId: task.taskId,
      statement: task.statement,
      expectedItemIds: task.expectedItemIds,
      expectedNames: task.expectedNames,
      perEngine: {},
    };

    for (const engine of engines) {
      emit({ type: 'engine-start', taskId: task.taskId, engine: engine.name });
      const engineStartMs = Date.now();
      try {
        const res = await engine.recommend(ctx);
        const predicted = res.items.map(it => it.id);
        const metrics = scoreTask(predicted, task.expectedItemIds, k);
        row.perEngine[engine.name] = {
          predicted,
          latencyMs: res.latencyMs,
          metrics,
          ...(res.debug ? { debug: res.debug } : {}),
        };
        allPredictedByEngine[engine.name].push(...predicted);
        perTaskMetricsByEngine[engine.name].push(metrics);
        emit({
          type: 'engine-ok',
          taskId: task.taskId,
          engine: engine.name,
          latencyMs: res.latencyMs,
          itemCount: predicted.length,
          hit: metrics.anyHit,
        });
      } catch (err) {
        const msg =
          err instanceof RecoEngineError ? err.message : `${(err as Error).message}`;
        row.perEngine[engine.name] = {
          predicted: [],
          latencyMs: 0,
          error: msg,
        };
        emit({
          type: 'engine-error',
          taskId: task.taskId,
          engine: engine.name,
          latencyMs: Date.now() - engineStartMs,
          error: msg,
        });
      }
    }
    perTask.push(row);
  }
  emit({ type: 'run-end', durationMs: Date.now() - runStartMs });

  const aggMap: Record<string, AggregateMetrics> = {};
  for (const e of engines) {
    aggMap[e.name] = aggregate(
      perTaskMetricsByEngine[e.name],
      allPredictedByEngine[e.name],
      catalogSize
    );
  }

  return {
    runId,
    startedAt,
    finishedAt: new Date().toISOString(),
    k,
    taskSet: opts.taskSet,
    engines: engines.map(e => ({
      name: e.name,
      version: e.version,
      description: e.description,
    })),
    perTask,
    aggregate: aggMap,
  };
}

async function loadTasks(taskSet: TaskSetId, historyLimit?: number): Promise<RecoTask[]> {
  if (taskSet === 'seed') return loadSeedTasks();
  return loadHistorySplitTasks(historyLimit ?? 50);
}

async function loadUserIdsByEmail(tasks: RecoTask[]): Promise<Map<string, string>> {
  const emails = [...new Set(tasks.map(t => t.userEmail).filter((e): e is string => !!e))];
  if (emails.length === 0) return new Map();
  const placeholders = emails.map(() => '?').join(',');
  const rows = await db.query<{ id: number; email: string }>(
    `SELECT id, email FROM users WHERE email IN (${placeholders})`,
    emails
  );
  return new Map(rows.map(r => [r.email, String(r.id)]));
}

async function getCatalogSize(): Promise<number> {
  const row = await db.queryOne<{ n: number }>(
    'SELECT COUNT(*) AS n FROM restaurants'
  );
  return row?.n ?? 0;
}

export { listEngines };
