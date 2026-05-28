'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Engine = { name: string; version: string; description: string };
type AggregateMetrics = {
  hitAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  mrr: number;
  coverage: number;
  n: number;
};
type AgentLlmDebug = {
  provider?: string;
  model?: string;
  source?: 'byo-gateway' | 'server-default';
  gatewayHost?: string;
};

type PerTaskRow = {
  taskId: string;
  statement: string;
  expectedItemIds: string[];
  expectedNames?: string[];
  perEngine: Record<
    string,
    {
      predicted: string[];
      latencyMs: number;
      metrics?: {
        hitAtK: number;
        recallAtK: number;
        ndcgAtK: number;
        mrr: number;
        anyHit: boolean;
      };
      error?: string;
      debug?: { llm?: AgentLlmDebug; steps?: number };
    }
  >;
};

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function formatAgentLlm(debug?: AgentLlmDebug): string | null {
  if (!debug?.provider) return null;
  const where =
    debug.source === 'byo-gateway'
      ? debug.gatewayHost
        ? `BYO gateway (${debug.gatewayHost})`
        : 'BYO gateway'
      : 'server default';
  return `${debug.provider} · ${debug.model} · ${where}`;
}

function displayEngineName(name: string): string {
  switch (name) {
    case 'agent':
      return 'default agent';
    case 'byo-agent':
      return 'BYO agent';
    case 'byo-engine':
      return 'BYO engine';
    default:
      return name;
  }
}

function isValidHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function agentLlmFromReport(report: Report): AgentLlmDebug | null {
  for (const row of report.perTask) {
    const llm = row.perEngine.agent?.debug?.llm ?? row.perEngine['byo-agent']?.debug?.llm;
    if (llm?.provider) return llm;
  }
  return null;
}

type EvalEvent =
  | { type: 'run-start'; engines: string[]; taskCount: number; k: number; taskSet: 'seed' | 'history' }
  | { type: 'task-start'; taskId: string; statement: string; index: number; total: number }
  | { type: 'engine-start'; taskId: string; engine: string }
  | { type: 'engine-ok'; taskId: string; engine: string; latencyMs: number; itemCount: number; hit: boolean }
  | { type: 'engine-error'; taskId: string; engine: string; latencyMs: number; error: string }
  | { type: 'run-end'; durationMs: number }
  | { type: 'report'; runId: string; report: Report }
  | { type: 'error'; error: string };

function formatLine(evt: EvalEvent): string | null {
  const ts = new Date().toLocaleTimeString(undefined, { hour12: false });
  switch (evt.type) {
    case 'run-start':
      return `[${ts}] ▶ run-start: ${evt.engines.join(', ')} on ${evt.taskSet} (${evt.taskCount} tasks, k=${evt.k})`;
    case 'task-start': {
      const stmt =
        evt.statement.length > 80
          ? evt.statement.slice(0, 80) + '…'
          : evt.statement;
      return `[${ts}] ── [${evt.index + 1}/${evt.total}] ${evt.taskId} — ${stmt}`;
    }
    case 'engine-start':
      // Skip the start event — it's superseded by the ok/error line.
      return null;
    case 'engine-ok':
      return `[${ts}]      ${evt.engine}: ${evt.itemCount} items in ${formatDuration(evt.latencyMs)} ${evt.hit ? '✓ hit' : '✗ miss'}`;
    case 'engine-error':
      return `[${ts}]      ${evt.engine}: error after ${formatDuration(evt.latencyMs)} — ${evt.error}`;
    case 'run-end':
      return `[${ts}] ✔ run-end (${formatDuration(evt.durationMs)})`;
    case 'error':
      return `[${ts}] ✗ ${evt.error}`;
    case 'report':
      return null;
  }
}

/**
 * Consume an NDJSON stream from `/api/reco/eval/stream`. Parses each
 * line as a `EvalEvent`, calls `onLine` with a human-readable formatted
 * line per event, and returns the final report (or `null` if the stream
 * closed without one — caller surfaces this as an error).
 */
async function consumeEvalStream(
  body: ReadableStream<Uint8Array>,
  onLine: (line: string) => void
): Promise<Report | null> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let report: Report | null = null;
  let errorMsg: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      let evt: EvalEvent;
      try {
        evt = JSON.parse(trimmed) as EvalEvent;
      } catch {
        onLine(`[parse-error] ${trimmed.slice(0, 200)}`);
        continue;
      }
      if (evt.type === 'report') {
        report = evt.report;
      } else if (evt.type === 'error') {
        errorMsg = evt.error;
        const line = formatLine(evt);
        if (line) onLine(line);
      } else {
        const line = formatLine(evt);
        if (line) onLine(line);
      }
    }
  }

  if (errorMsg) throw new Error(errorMsg);
  return report;
}
type Report = {
  runId: string;
  startedAt: string;
  finishedAt: string;
  k: number;
  taskSet: 'seed' | 'history';
  engines: Engine[];
  perTask: PerTaskRow[];
  aggregate: Record<string, AggregateMetrics>;
};

// Empirical per-task costs (ms) per engine. Library engines are
// CPU-bound and finish in tens of ms; the agent runs a real headless
// browser + LLM tick so each task takes ~30–60 s. Used purely to
// estimate runtime for the progress bar — server timing isn't
// streamed back today.
const ENGINE_MS: Record<string, number> = {
  random: 80,
  popularity: 150,
  gorse: 300,
  lightfm: 350,
  implicit: 350,
  agent: 45_000,
  // BYO rows: the agent track is LLM-bounded so use the same ~45 s
  // budget; the BYO engine row is an opaque HTTP call — assume 500 ms.
  'byo-agent': 45_000,
  'byo-engine': 500,
};
const DEFAULT_ENGINE_MS = 500;

const TASK_COUNT: Record<'seed' | 'history', number> = {
  seed: 10,
  history: 50,
};

function estimateMs(engineNames: string[], taskSet: 'seed' | 'history'): number {
  const tasks = TASK_COUNT[taskSet];
  const perTaskSum = engineNames.reduce(
    (sum, name) => sum + (ENGINE_MS[name] ?? DEFAULT_ENGINE_MS),
    0
  );
  // Add a small constant overhead for the eval API round-trip.
  return perTaskSum * tasks + 500;
}

function formatDuration(ms: number): string {
  if (ms < 1) return `<1 ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default function RecoEvalPage() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taskSet, setTaskSet] = useState<'seed' | 'history'>('seed');
  const [k, setK] = useState<number>(5);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress state for the run-in-flight bar.
  const [startTs, setStartTs] = useState<number | null>(null);
  const [estimatedMs, setEstimatedMs] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  // Live log lines streamed from /api/reco/eval/stream while a run is
  // in flight. Each line is one formatted progress event.
  const [logLines, setLogLines] = useState<string[]>([]);

  // Seed task list shown under the task-set picker so the user can see
  // exactly what's being scored without grepping the seed file.
  const [seedTasks, setSeedTasks] = useState<
    Array<{ taskId: string; surface: string; statement: string; expectedNames: string[] }>
  >([]);

  // What was actually sent on the most recent run (shown next to the
  // report header so the operator can see whether BYO took effect).
  const [lastRunConfig, setLastRunConfig] = useState<{
    agentLlmUrl: string | null;
    customEngineUrl: string | null;
    engines: string[];
    estimatedMs: number;
    actualMs: number;
  } | null>(null);

  // BYO panel state — see prompts/agent.md + BYO_LLM.md.
  // BYO rows (`byo-agent`, `byo-engine`) are checkbox entries in the
  // engine list. Their URL/key inputs below are required iff the row
  // is selected; otherwise inputs are inert.
  // The API key is *not* persisted to localStorage unless the user
  // opts in via the "Remember this key" checkbox.
  const [agentLlmUrl, setAgentLlmUrl] = useState('');
  const [agentLlmApiKey, setAgentLlmApiKey] = useState('');
  const [customEngineUrl, setCustomEngineUrl] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = {
      url: localStorage.getItem('reco-eval.byo.agentLlmUrl') ?? '',
      key: localStorage.getItem('reco-eval.byo.agentLlmApiKey') ?? '',
      engine: localStorage.getItem('reco-eval.byo.customEngineUrl') ?? '',
      remember: localStorage.getItem('reco-eval.byo.rememberKey') === '1',
    };
    if (stored.url) setAgentLlmUrl(stored.url);
    if (stored.engine) setCustomEngineUrl(stored.engine);
    if (stored.remember) {
      setRememberKey(true);
      if (stored.key) setAgentLlmApiKey(stored.key);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('reco-eval.byo.agentLlmUrl', agentLlmUrl);
  }, [agentLlmUrl]);
  useEffect(() => {
    localStorage.setItem('reco-eval.byo.customEngineUrl', customEngineUrl);
  }, [customEngineUrl]);
  useEffect(() => {
    localStorage.setItem('reco-eval.byo.rememberKey', rememberKey ? '1' : '0');
    if (rememberKey) {
      localStorage.setItem('reco-eval.byo.agentLlmApiKey', agentLlmApiKey);
    } else {
      localStorage.removeItem('reco-eval.byo.agentLlmApiKey');
    }
  }, [rememberKey, agentLlmApiKey]);

  useEffect(() => {
    if (!loading || !startTs) return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startTs);
    }, 200);
    return () => clearInterval(id);
  }, [loading, startTs]);

  const selectedEngines = [...selected];
  const trimmedLlmUrl = agentLlmUrl.trim();
  const trimmedLlmKey = agentLlmApiKey.trim();
  const trimmedCustomUrl = customEngineUrl.trim();

  // Selection-driven BYO: ticking the byo-* row means "this runs".
  // Run is blocked until the required fields are present.
  const byoAgentSelected = selected.has('byo-agent');
  const byoEngineSelected = selected.has('byo-engine');

  const upcomingEstimateMs = estimateMs(selectedEngines, taskSet);
  const progressFraction = loading && estimatedMs > 0
    ? Math.min(0.99, elapsedMs / estimatedMs)
    : 0;

  // Validation derived from selection + fields. Inline-rendered beside
  // the offending input, plus disables the Run button until cleared.
  const byoAgentUrlError = byoAgentSelected
    ? !trimmedLlmUrl
      ? 'BYO agent is selected — LLM gateway URL is required'
      : !isValidHttpUrl(trimmedLlmUrl)
        ? 'URL must be http:// or https://'
        : null
    : null;
  const byoAgentKeyError =
    byoAgentSelected && !trimmedLlmKey
      ? 'BYO agent is selected — gateway bearer token is required'
      : null;
  const byoEngineUrlError = byoEngineSelected
    ? !trimmedCustomUrl
      ? 'BYO engine is selected — endpoint URL is required'
      : !isValidHttpUrl(trimmedCustomUrl)
        ? 'URL must be http:// or https://'
        : null
    : null;
  const byoHasError = !!(byoAgentUrlError || byoAgentKeyError || byoEngineUrlError);

  useEffect(() => {
    fetch('/api/reco/engines')
      .then(r => r.json())
      .then((d: { engines: Engine[] }) => {
        // BYO rows are client-side pseudo-engines — they aren't
        // registered server-side because they need request-scoped
        // config (URL/key). `byo-agent` is only meaningful when the
        // sidecar (the registered `agent` row) is also reachable.
        const hasAgent = d.engines.some(e => e.name === 'agent');
        const byoRows: Engine[] = [];
        if (hasAgent) {
          byoRows.push({
            name: 'byo-agent',
            version: 'byo',
            description:
              'Same agent sidecar as default agent, but driven by your BYO LLM gateway.',
          });
        }
        byoRows.push({
          name: 'byo-engine',
          version: 'byo',
          description:
            'Your HTTP engine endpoint — same wire contract LightFM and Implicit use.',
        });
        setEngines([...d.engines, ...byoRows]);
        // Default to library engines only; BYO rows stay off until
        // the user fills in their endpoints. Gorse stays off because
        // it may be unhealthy locally.
        setSelected(
          new Set(
            d.engines
              .filter(e => e.name !== 'gorse')
              .map(e => e.name)
          )
        );
      })
      .catch((e: Error) => setError(e.message));

    fetch('/api/reco/tasks')
      .then(r => r.json())
      .then((d: { tasks: typeof seedTasks }) => setSeedTasks(d.tasks))
      .catch(() => undefined); // task list is purely informational — failure is silent
  }, []);

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const runEval = async () => {
    // Belt-and-suspenders: button is already disabled when this is
    // true, but re-check here so direct callers (keyboard, paste-and-go)
    // can't bypass the BYO contract.
    if (byoHasError) {
      setError(
        [byoAgentUrlError, byoAgentKeyError, byoEngineUrlError]
          .filter((s): s is string => !!s)
          .join('\n')
      );
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setLogLines([]);
    const now = Date.now();
    const runEstimateMs = upcomingEstimateMs;
    setStartTs(now);
    setElapsedMs(0);
    setEstimatedMs(runEstimateMs);
    const enginesForRun = [...selected];
    // Each BYO row's required fields are only attached when that row
    // is selected. Leftover values for an unselected row never reach
    // the server.
    const llmUrlSent = byoAgentSelected ? trimmedLlmUrl || null : null;
    const llmKeySent = byoAgentSelected ? trimmedLlmKey || null : null;
    const customUrlSent = byoEngineSelected ? trimmedCustomUrl || null : null;
    setLastRunConfig({
      agentLlmUrl: llmUrlSent,
      customEngineUrl: customUrlSent,
      engines: customUrlSent ? [...enginesForRun, 'custom'] : enginesForRun,
      estimatedMs: runEstimateMs,
      actualMs: 0,
    });
    try {
      const res = await fetch('/api/reco/eval/stream', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engineNames: enginesForRun,
          taskSetId: taskSet,
          k,
          // BYO fields — only sent when the user opted into BYO via
          // the dedicated checkbox AND supplied a valid value.
          ...(llmUrlSent ? { agentLlmUrl: llmUrlSent } : {}),
          ...(llmKeySent ? { agentLlmApiKey: llmKeySent } : {}),
          ...(customUrlSent ? { customEngineUrl: customUrlSent } : {}),
        }),
      });
      if (!res.body) throw new Error('eval stream: response has no body');
      const finishedReport = await consumeEvalStream(res.body, line =>
        setLogLines(prev => [...prev, line])
      );
      if (!finishedReport) throw new Error('eval stream ended without a report');
      setReport(finishedReport);
      const actualMs = Date.now() - now;
      setLastRunConfig(prev =>
        prev
          ? { ...prev, actualMs }
          : {
              agentLlmUrl: llmUrlSent,
              customEngineUrl: customUrlSent,
              engines: customUrlSent ? [...enginesForRun, 'custom'] : enginesForRun,
              estimatedMs: runEstimateMs,
              actualMs,
            }
      );
    } catch (e) {
      setError((e as Error).message);
      setLastRunConfig(null);
    } finally {
      setLoading(false);
      setStartTs(null);
    }
  };

  const reportAgentLlm = report ? agentLlmFromReport(report) : null;

  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : '—');

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Recommendation evaluation
        </h1>
        <p className="text-base text-gray-600 mt-2 max-w-3xl leading-relaxed">
          Score recommendation engines and LLM agents on the same task set,
          with the same metrics. Pick engines, pick a task set, hit{' '}
          <strong className="text-gray-900">Run</strong> — the table below
          shows how each one compares.
        </p>
        <p className="text-sm mt-3">
          <a
            href="/docs/overview"
            target="_blank"
            rel="noopener"
            className="font-medium text-red-600 hover:text-red-700 underline"
          >
            What is this? — one-page explainer (for clients &amp; 3rd-party teams) →
          </a>
        </p>
      </header>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
            <p className="text-gray-600 leading-relaxed">
              An offline scoreboard. Each engine receives the same{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                RecoContext
              </code>{' '}
              (user, location, surface) and returns a ranked list of restaurant
              or item IDs. We score that list against ground-truth expected IDs
              per task.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Metrics</h3>
            <ul className="space-y-1.5 text-gray-600">
              <li>
                <strong className="text-gray-900">Hit@K</strong> — share of
                tasks whose expected item is in the top K.
              </li>
              <li>
                <strong className="text-gray-900">NDCG@K</strong> — Hit@K
                weighted by rank position.
              </li>
              <li>
                <strong className="text-gray-900">MRR</strong> — mean reciprocal
                rank of the first hit.
              </li>
              <li>
                <strong className="text-gray-900">Recall@K</strong> — for
                multi-item ground truth, share recovered.
              </li>
              <li>
                <strong className="text-gray-900">Coverage</strong> — share of
                the catalog the engine ever recommends.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Engines &amp; runtime
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Library engines (
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">popularity</code>,{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">lightfm</code>,{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">implicit</code>,{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">gorse</code>
              ) finish in seconds. The{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">agent</code>{' '}
              row runs an LLM driving the real UI in headless Chromium —
              expect{' '}
              <strong className="text-gray-900">30–60 s per task</strong>.{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">random</code>{' '}
              is the sanity floor.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded border bg-white">
          <h2 className="font-semibold mb-2">Engines</h2>
          {engines.length === 0 ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {engines.map(e => (
                <li key={e.name} className="flex items-start gap-2">
                  <Checkbox
                    id={`eng-${e.name}`}
                    checked={selected.has(e.name)}
                    onCheckedChange={() => toggle(e.name)}
                  />
                  <label htmlFor={`eng-${e.name}`} className="text-sm cursor-pointer">
                    <span className="font-medium">{displayEngineName(e.name)}</span>{' '}
                    <Badge variant="secondary">{e.version}</Badge>
                    <p className="text-xs text-gray-500">{e.description}</p>
                    {e.name === 'byo-agent' && selected.has('byo-agent') && (byoAgentUrlError || byoAgentKeyError) && (
                      <p className="text-xs text-red-600 mt-0.5">
                        {byoAgentUrlError || byoAgentKeyError} — fill in the BYO panel below.
                      </p>
                    )}
                    {e.name === 'byo-engine' && selected.has('byo-engine') && byoEngineUrlError && (
                      <p className="text-xs text-red-600 mt-0.5">
                        {byoEngineUrlError} — fill in the BYO panel below.
                      </p>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 rounded border bg-white">
          <h2 className="font-semibold mb-2">Task set</h2>
          <Select value={taskSet} onValueChange={v => setTaskSet(v as 'seed' | 'history')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seed">seed (curated, ~10 tasks)</SelectItem>
              <SelectItem value="history">history (leave-one-out, ≤50 users)</SelectItem>
            </SelectContent>
          </Select>
          {taskSet === 'seed' && seedTasks.length > 0 && (
            <details className="mt-2 rounded border border-gray-200 bg-gray-50">
              <summary className="cursor-pointer px-2 py-1.5 text-xs font-medium text-gray-700">
                View {seedTasks.length} seed tasks
              </summary>
              <ol className="list-decimal pl-6 pr-2 py-2 space-y-1 text-xs text-gray-700">
                {seedTasks.map(t => (
                  <li key={t.taskId}>
                    <code className="rounded bg-white px-1 text-[10px]">{t.taskId}</code>{' '}
                    <span className="text-gray-600">{t.statement}</span>
                    {t.expectedNames.length > 0 && (
                      <span className="ml-1 text-gray-400">
                        → {t.expectedNames.join(', ')}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </details>
          )}
          <div className="mt-4">
            <label className="text-sm font-medium">k</label>
            <Select value={String(k)} onValueChange={v => setK(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 3, 5, 10, 20].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 rounded border bg-white flex flex-col justify-between">
          <div>
            <h2 className="font-semibold mb-2">Run</h2>
            <p className="text-sm text-gray-500">
              {selected.size} engine{selected.size === 1 ? '' : 's'} ×{' '}
              {TASK_COUNT[taskSet]} tasks
            </p>
            {selected.size > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Next run estimate:{' '}
                <span className="font-medium text-gray-600">
                  ~{formatDuration(upcomingEstimateMs)}
                </span>
                {(selected.has('agent') || selected.has('byo-agent')) && (
                  <span className="ml-1 text-amber-600">
                    (LLM agent is slow)
                  </span>
                )}
              </p>
            )}
            {lastRunConfig && !loading && lastRunConfig.actualMs > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Last run:{' '}
                <span className="font-medium text-gray-700">
                  {formatDuration(lastRunConfig.actualMs)}
                </span>
                <span className="text-gray-400">
                  {' '}
                  (estimated ~{formatDuration(lastRunConfig.estimatedMs)})
                </span>
              </p>
            )}
          </div>
          <Button
            disabled={loading || selected.size === 0 || byoHasError}
            onClick={runEval}
            className="mt-3"
          >
            {loading ? 'Running…' : `Run eval (~${formatDuration(upcomingEstimateMs)})`}
          </Button>
          {byoHasError && (
            <p className="mt-2 text-xs text-amber-700">
              Run is blocked — a selected BYO row is missing required inputs
              (see red errors in the BYO panel below).
            </p>
          )}
        </div>
      </section>

      <details
        className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        open={byoAgentSelected || byoEngineSelected || byoHasError}
      >
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          BYO inputs (URLs &amp; key for the BYO rows above)
          {(byoAgentSelected || byoEngineSelected) && (
            <span className="ml-2 text-xs font-normal text-gray-500">
              {[
                byoAgentSelected ? 'BYO agent selected' : null,
                byoEngineSelected ? 'BYO engine selected' : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </summary>
        <form
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
          autoComplete="off"
          onSubmit={e => e.preventDefault()}
        >
          <div className={byoAgentSelected ? '' : 'opacity-60'}>
            <p className="mb-2 text-xs text-gray-500">
              Inputs are required when{' '}
              <strong className="text-gray-700">BYO agent</strong> is selected
              in the engines list above.
            </p>
            <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <strong>Gateway must be OpenAI-compatible.</strong>
            </div>
            <label className="block font-medium text-gray-800 mb-1" htmlFor="reco-llm-gateway-endpoint">
              LLM gateway endpoint
            </label>
            <input
              id="reco-llm-gateway-endpoint"
              name="reco-llm-gateway-endpoint"
              type="search"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              placeholder="https://your-llm-gateway.example.com/v1"
              value={agentLlmUrl}
              onChange={e => setAgentLlmUrl(e.target.value)}
              disabled={!byoAgentSelected}
              aria-invalid={!!byoAgentUrlError}
              className={`w-full rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 ${
                byoAgentUrlError ? 'border-red-400' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:text-gray-400`}
            />
            {byoAgentUrlError && (
              <p className="mt-1 text-xs text-red-600">{byoAgentUrlError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">BYO agent</code>{' '}
              row drives the same headless-browser sidecar as{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">default agent</code>,
              but each tick's LLM call goes to this URL instead. Your key
              stays on your gateway.{' '}
              <a
                href="/docs/byo-llm"
                target="_blank"
                rel="noopener"
                className="text-red-600 hover:text-red-700 underline"
              >
                Gateway setup + example →
              </a>
            </p>
            <div className="mt-3">
              <label className="block font-medium text-gray-800 mb-1" htmlFor="reco-llm-gateway-token">
                Gateway bearer token
              </label>
              <div className="flex gap-2">
                <input
                  id="reco-llm-gateway-token"
                  name="reco-llm-gateway-token"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Bearer token for the gateway above"
                  value={agentLlmApiKey}
                  onChange={e => setAgentLlmApiKey(e.target.value)}
                  disabled={!byoAgentSelected}
                  aria-invalid={!!byoAgentKeyError}
                  className={`flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-400 ${
                    byoAgentKeyError ? 'border-red-400' : 'border-gray-300'
                  } ${showKey ? '' : '[-webkit-text-security:disc]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="rounded border border-gray-300 px-2 text-xs text-gray-600 hover:bg-gray-50"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              {byoAgentKeyError && (
                <p className="mt-1 text-xs text-red-600">{byoAgentKeyError}</p>
              )}
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={e => setRememberKey(e.target.checked)}
                />
                Remember this key in browser storage (local only; off by default)
              </label>
            </div>
          </div>
          <div className={byoEngineSelected ? '' : 'opacity-60'}>
            <p className="mb-2 text-xs text-gray-500">
              Inputs are required when{' '}
              <strong className="text-gray-700">BYO engine</strong> is selected
              in the engines list above.
            </p>
            <label className="block font-medium text-gray-800 mb-1" htmlFor="reco-custom-engine-endpoint">
              BYO engine endpoint
            </label>
            <input
              id="reco-custom-engine-endpoint"
              name="reco-custom-engine-endpoint"
              type="search"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              placeholder="https://your-engine.example.com/recommend"
              value={customEngineUrl}
              onChange={e => setCustomEngineUrl(e.target.value)}
              disabled={!byoEngineSelected}
              aria-invalid={!!byoEngineUrlError}
              className={`w-full rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 ${
                byoEngineUrlError ? 'border-red-400' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:text-gray-400`}
            />
            {byoEngineUrlError && (
              <p className="mt-1 text-xs text-red-600">{byoEngineUrlError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Any HTTP service that accepts <code className="rounded bg-gray-100 px-1 text-xs">POST</code>{' '}
              with a{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">RecoContext</code>{' '}
              JSON body and returns a{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">RecommendationResponse</code>.
              Same shape LightFM and Implicit use. Independent of the LLM
              URL — works with or without the agent ticked.
            </p>
            <details className="mt-2 rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <summary className="cursor-pointer font-medium text-gray-800">
                Wire shape (click to expand)
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-2 text-xs leading-snug text-gray-100">{`POST {your-url}
{
  "userId": "1",                // string, optional
  "lat": 40.7038, "lng": -73.95,
  "surface": "home_feed",
  "k": 5,
  "candidatePool": ["12","42"], // optional restrict
  "taskId": "..."               // optional
}

→ 200
{
  "items": [{ "id": "42", "score": 0.91, "kind": "restaurant" }],
  "engine": "your-name",
  "version": "1.0.0",
  "latencyMs": 137
}`}</pre>
              <p className="mt-2">
                <a
                  href="/docs/reco-http-contract"
                  target="_blank"
                  rel="noopener"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  Full wire contract →
                </a>
              </p>
            </details>
          </div>
        </form>
      </details>

      {loading && (
        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900">Running…</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedEngines.join(', ')} on {taskSet} ({TASK_COUNT[taskSet]}{' '}
                tasks, k={k})
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="font-mono text-gray-900">
                {formatDuration(elapsedMs)}{' '}
                <span className="text-gray-400">
                  / ~{formatDuration(estimatedMs)}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {Math.round(progressFraction * 100)}%
              </div>
            </div>
          </div>
          <div
            className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressFraction * 100)}
          >
            <div
              className="h-full bg-red-600 transition-all duration-200 ease-linear"
              style={{ width: `${progressFraction * 100}%` }}
            />
          </div>
          {elapsedMs > estimatedMs && (
            <p className="text-xs text-amber-600 mt-2">
              Taking longer than expected. The estimate is a heuristic — actual
              time depends on LLM latency and per-task complexity.
            </p>
          )}
          {logLines.length > 0 && (
            <details className="mt-4 rounded border border-gray-200 bg-gray-50">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-700">
                Live log ({logLines.length} {logLines.length === 1 ? 'event' : 'events'}) — click to expand
              </summary>
              <pre className="max-h-72 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                {logLines.join('\n')}
              </pre>
            </details>
          )}
        </section>
      )}
      {!loading && logLines.length > 0 && (
        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <details className="rounded border border-gray-200 bg-gray-50">
            <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-700">
              Last run log ({logLines.length} events)
            </summary>
            <pre className="max-h-72 overflow-auto px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap">
              {logLines.join('\n')}
            </pre>
          </details>
        </section>
      )}

      {report && (
        <>
          <section className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-gray-900">Last run config</span>
              {lastRunConfig && (
                <span className="text-gray-600">
                  {lastRunConfig.engines.join(', ')} · {report.taskSet} · k={report.k}
                </span>
              )}
            </div>
            {lastRunConfig?.agentLlmUrl && (
              <p className="mt-1 text-xs text-gray-600">
                BYO LLM gateway:{' '}
                <code className="rounded bg-white px-1">
                  {hostFromUrl(lastRunConfig.agentLlmUrl) ?? lastRunConfig.agentLlmUrl}
                </code>
              </p>
            )}
            {lastRunConfig?.customEngineUrl && (
              <p className="mt-1 text-xs text-gray-600">
                BYO engine:{' '}
                <code className="rounded bg-white px-1">
                  {hostFromUrl(lastRunConfig.customEngineUrl) ?? lastRunConfig.customEngineUrl}
                </code>
              </p>
            )}
            {reportAgentLlm && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary" className="bg-violet-100 text-violet-900 hover:bg-violet-100">
                  LLM used
                </Badge>
                <span>{formatAgentLlm(reportAgentLlm)}</span>
              </p>
            )}
            {(lastRunConfig?.engines.includes('agent') ||
              lastRunConfig?.engines.includes('byo-agent')) &&
              !reportAgentLlm && (
                <p className="mt-2 text-xs text-amber-700">
                  An agent row was selected but no LLM metadata came back —
                  check the sidecar is running and reachable.
                </p>
              )}
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              Aggregate <span className="text-sm font-normal text-gray-500">— run {report.runId}, k={report.k}, n={report.perTask.length}</span>
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engine</TableHead>
                  <TableHead>Hit@K</TableHead>
                  <TableHead>NDCG@K</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Recall@K</TableHead>
                  <TableHead>Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(report.aggregate).map(([name, agg]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        {displayEngineName(name)}
                        {(name === 'agent' || name === 'byo-agent') && reportAgentLlm && (
                          <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-900 hover:bg-violet-100 text-xs font-normal"
                          >
                            LLM
                          </Badge>
                        )}
                      </span>
                      {(name === 'agent' || name === 'byo-agent') && reportAgentLlm && (
                        <p className="text-xs font-normal text-gray-500 mt-0.5">
                          {formatAgentLlm(reportAgentLlm)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{fmt(agg.hitAtK)}</TableCell>
                    <TableCell>{fmt(agg.ndcgAtK)}</TableCell>
                    <TableCell>{fmt(agg.mrr)}</TableCell>
                    <TableCell>{fmt(agg.recallAtK)}</TableCell>
                    <TableCell>{fmt(agg.coverage)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Per-task drilldown</h2>
            <div className="space-y-3">
              {report.perTask.map(row => (
                <details key={row.taskId} className="p-3 rounded border bg-white">
                  <summary className="cursor-pointer text-sm">
                    <span className="font-medium">{row.taskId}</span>
                    <span className="text-gray-500"> — expected </span>
                    <code className="text-xs">
                      {row.expectedNames?.join(', ') || row.expectedItemIds.join(',')}
                    </code>
                    <span className="ml-2 text-xs text-gray-400">
                      {Object.entries(row.perEngine)
                        .map(([n, r]) => `${displayEngineName(n)}:${r.metrics?.anyHit ? '✓' : '✗'}`)
                        .join('  ')}
                    </span>
                  </summary>
                  <p className="text-xs text-gray-600 mt-2 mb-3">{row.statement}</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Engine</TableHead>
                        <TableHead>Predicted (top {report.k})</TableHead>
                        <TableHead>Hit@K</TableHead>
                        <TableHead>NDCG@K</TableHead>
                        <TableHead>Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(row.perEngine).map(([name, r]) => (
                        <TableRow key={name}>
                          <TableCell className="font-medium">
                            {displayEngineName(name)}
                            {(name === 'agent' || name === 'byo-agent') && r.debug?.llm && (
                              <p className="text-xs font-normal text-violet-700 mt-0.5">
                                LLM: {formatAgentLlm(r.debug.llm)}
                                {typeof r.debug.steps === 'number'
                                  ? ` · ${r.debug.steps} steps`
                                  : ''}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs">
                              {r.error ? `error: ${r.error}` : r.predicted.slice(0, report.k).join(', ') || '—'}
                            </code>
                          </TableCell>
                          <TableCell>{r.metrics ? fmt(r.metrics.hitAtK) : '—'}</TableCell>
                          <TableCell>{r.metrics ? fmt(r.metrics.ndcgAtK) : '—'}</TableCell>
                          <TableCell>{r.latencyMs.toFixed(0)} ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
