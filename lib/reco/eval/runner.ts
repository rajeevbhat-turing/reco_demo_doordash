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
}

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
  if (opts.customEngineUrl) {
    transientEngines.push(
      makeHttpEngine({
        name: 'custom',
        version: 'byo',
        description: `Client-hosted engine at ${opts.customEngineUrl}`,
        endpoint: opts.customEngineUrl,
        timeoutMs: 30_000,
      })
    );
  }
  const engines: RecommendationEngine[] = [...registeredEngines, ...transientEngines];
  if (engines.length === 0) {
    throw new Error('no valid engines selected');
  }

  const tasks = await loadTasks(opts.taskSet, opts.historyLimit);

  const catalogSize = await getCatalogSize();
  const perTask: PerTaskRow[] = [];
  const allPredictedByEngine: Record<string, string[]> = Object.fromEntries(
    engines.map(e => [e.name, []])
  );
  const perTaskMetricsByEngine: Record<string, PerTaskMetrics[]> = Object.fromEntries(
    engines.map(e => [e.name, []])
  );

  // Build user-id lookup for tasks that reference an email.
  const userIdByEmail = await loadUserIdsByEmail(tasks);

  for (const task of tasks) {
    const ctx: RecoContext = {
      userId: task.userEmail ? userIdByEmail.get(task.userEmail) : undefined,
      lat: task.userLat,
      lng: task.userLng,
      surface: task.surface,
      k,
      // Forwarded for the agent engine; plain engines ignore them.
      taskId: task.taskId,
      // BYO LLM passthrough — request-scoped, never persisted.
      ...(opts.agentLlmUrl ? { agentLlmUrl: opts.agentLlmUrl } : {}),
      ...(opts.agentLlmApiKey ? { agentLlmApiKey: opts.agentLlmApiKey } : {}),
    };

    const row: PerTaskRow = {
      taskId: task.taskId,
      statement: task.statement,
      expectedItemIds: task.expectedItemIds,
      expectedNames: task.expectedNames,
      perEngine: {},
    };

    for (const engine of engines) {
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
      } catch (err) {
        const msg =
          err instanceof RecoEngineError ? err.message : `${(err as Error).message}`;
        row.perEngine[engine.name] = {
          predicted: [],
          latencyMs: 0,
          error: msg,
        };
      }
    }
    perTask.push(row);
  }

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
