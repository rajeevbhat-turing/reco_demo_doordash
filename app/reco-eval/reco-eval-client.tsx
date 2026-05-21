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

function agentLlmFromReport(report: Report): AgentLlmDebug | null {
  for (const row of report.perTask) {
    const llm = row.perEngine.agent?.debug?.llm;
    if (llm?.provider) return llm;
  }
  return null;
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
  custom: 500, // BYO HTTP engine — unknown latency; assume 500 ms
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
  if (ms < 1000) return `${ms} ms`;
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
  const effectiveEngines = customEngineUrl.trim()
    ? [...selectedEngines, 'custom']
    : selectedEngines;
  const upcomingEstimateMs = estimateMs(effectiveEngines, taskSet);
  const progressFraction = loading && estimatedMs > 0
    ? Math.min(0.99, elapsedMs / estimatedMs)
    : 0;

  useEffect(() => {
    fetch('/api/reco/engines')
      .then(r => r.json())
      .then((d: { engines: Engine[] }) => {
        setEngines(d.engines);
        // Default to random + popularity (Gorse may be unhealthy locally).
        setSelected(new Set(d.engines.filter(e => e.name !== 'gorse').map(e => e.name)));
      })
      .catch((e: Error) => setError(e.message));
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
    setLoading(true);
    setError(null);
    setReport(null);
    const now = Date.now();
    const runEstimateMs = upcomingEstimateMs;
    setStartTs(now);
    setElapsedMs(0);
    setEstimatedMs(runEstimateMs);
    const enginesForRun = [...selected];
    const llmUrlSent = agentLlmUrl.trim() || null;
    const customUrlSent = customEngineUrl.trim() || null;
    setLastRunConfig({
      agentLlmUrl: llmUrlSent,
      customEngineUrl: customUrlSent,
      engines: customUrlSent ? [...enginesForRun, 'custom'] : enginesForRun,
      estimatedMs: runEstimateMs,
      actualMs: 0,
    });
    try {
      const res = await fetch('/api/reco/eval', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engineNames: enginesForRun,
          taskSetId: taskSet,
          k,
          // BYO fields — only sent when the user filled them.
          ...(llmUrlSent ? { agentLlmUrl: llmUrlSent } : {}),
          ...(agentLlmApiKey ? { agentLlmApiKey } : {}),
          ...(customUrlSent ? { customEngineUrl: customUrlSent } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'eval failed');
      const finishedReport = data.report as Report;
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
      </header>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What this is</h3>
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
                    <span className="font-medium">{e.name}</span>{' '}
                    <Badge variant="secondary">{e.version}</Badge>
                    <p className="text-xs text-gray-500">{e.description}</p>
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
                {selected.has('agent') && (
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
            disabled={loading || selected.size === 0}
            onClick={runEval}
            className="mt-3"
          >
            {loading ? 'Running…' : `Run eval (~${formatDuration(upcomingEstimateMs)})`}
          </Button>
        </div>
      </section>

      <details className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Bring your own (BYO LLM + BYO engine)
        </summary>
        <form
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
          autoComplete="off"
          onSubmit={e => e.preventDefault()}
        >
          <div>
            <label className="block font-medium text-gray-800 mb-1" htmlFor="reco-llm-gateway-endpoint">
              LLM gateway endpoint <span className="text-gray-400 font-normal">(agent only)</span>
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
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              OpenAI-compatible chat-completions endpoint. When the{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">agent</code>{' '}
              row runs, its tick-by-tick LLM calls hit this URL instead of
              Anthropic / OpenAI. Leave blank to use the server-side
              defaults configured in the agent sidecar. Your key stays on
              your gateway.{' '}
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
                Gateway bearer token <span className="text-gray-400 font-normal">(optional)</span>
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
                  placeholder="Bearer token for the gateway above, if needed"
                  value={agentLlmApiKey}
                  onChange={e => setAgentLlmApiKey(e.target.value)}
                  className={`flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 ${
                    showKey ? '' : '[-webkit-text-security:disc]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="rounded border border-gray-300 px-2 text-xs text-gray-600 hover:bg-gray-50"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
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
          <div>
            <label className="block font-medium text-gray-800 mb-1" htmlFor="reco-custom-engine-endpoint">
              Custom engine endpoint <span className="text-gray-400 font-normal">(adds a <code className="rounded bg-gray-100 px-1 text-xs">custom</code> row)</span>
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
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
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
            {lastRunConfig?.engines.includes('agent') && !reportAgentLlm && (
              <p className="mt-2 text-xs text-amber-700">
                Agent was selected but no LLM metadata came back — check the sidecar is
                running and reachable.
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
                        {name}
                        {name === 'agent' && reportAgentLlm && (
                          <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-900 hover:bg-violet-100 text-xs font-normal"
                          >
                            LLM
                          </Badge>
                        )}
                      </span>
                      {name === 'agent' && reportAgentLlm && (
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
                        .map(([n, r]) => `${n}:${r.metrics?.anyHit ? '✓' : '✗'}`)
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
                            {name}
                            {name === 'agent' && r.debug?.llm && (
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
