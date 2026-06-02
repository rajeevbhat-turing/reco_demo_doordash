'use client';

import { useEffect, useRef, useState } from 'react';
import { scoreTask } from '@/lib/reco/metrics';
import type { Persona, RecoTrajectory, ExpectedTask, Candidate } from '@/lib/reco/types';
import type { ScoreResult } from '@/lib/reco/metrics';
import { useRecoSelectionStore } from '@/store/reco-selection-store';

type Engine = {
  id: string;
  label: string;
  url: string;
  baseline?: boolean;
};

type EngineResult = {
  label: string;
  ranked_ids: number[];
  scores?: Record<number, number>;
  trajectory?: RecoTrajectory;
  metrics?: ScoreResult;
  error?: string;
  source?: string;
  model?: string;
  gatewayHost?: string;
};

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string | null;
};

type Props = {
  initialPersonas: Persona[];
  guideHtml?: string;
};

type OSExplainNode = {
  value: number;
  description: string;
  details?: OSExplainNode[];
};

type RawExplainEntry = {
  id: number;
  score: number;
  explanation: unknown;
};

const STAGE_COLORS: Record<string, string> = {
  query: 'bg-purple-100 text-purple-800',
  candidate_gen: 'bg-blue-100 text-blue-800',
  filter: 'bg-yellow-100 text-yellow-800',
  score: 'bg-orange-100 text-orange-800',
  rerank: 'bg-pink-100 text-pink-800',
  final: 'bg-green-100 text-green-800',
};

const METRIC_LABELS: Record<keyof ScoreResult, string> = {
  precision_at_k: 'Precision@k',
  recall_at_k: 'Recall@k',
  ndcg_at_k: 'NDCG@k',
  overlap: 'Overlap',
  blocked_hits: 'Blocked hits',
};

function StageLabel({ stage }: { stage: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${STAGE_COLORS[stage] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {stage}
    </span>
  );
}

function TrajectoryModal({
  trajectory,
  restaurantMap,
  restaurantId,
  onClose,
}: {
  trajectory: RecoTrajectory;
  restaurantMap: Map<number, RestaurantRow>;
  restaurantId: number;
  onClose: () => void;
}) {
  const [openSteps, setOpenSteps] = useState<Set<number>>(
    new Set(trajectory.steps.map((_, i) => i))
  );

  const toggleStep = (i: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const rawEntries = trajectory.raw_explain as RawExplainEntry[] | undefined;
  const entry = rawEntries?.find((e) => e.id === restaurantId) ?? rawEntries?.[0];
  const firstExplain = entry?.explanation as OSExplainNode | undefined;

  function findSumNode(node: OSExplainNode): OSExplainNode | undefined {
    if (node.description.includes('function score, score mode')) return node;
    for (const d of node.details ?? []) {
      const found = findSumNode(d);
      if (found) return found;
    }
  }

  function describeFn(node: OSExplainNode): string {
    const filterChild = node.details?.find((d) => d.description.startsWith('match filter:'));
    if (filterChild) {
      const weightNode = node.details
        ?.find((d) => d.description === 'product of:')
        ?.details?.find((d) => d.description === 'weight');
      const field = filterChild.description.replace('match filter: ', '');
      return weightNode ? `${field}  ×${weightNode.value}` : field;
    }
    if (node.description.startsWith('field value function:')) {
      const m = node.description.match(/doc\['(\w+)'\].*factor=([\d.]+)/);
      if (m) return `${m[1]} × ${m[2]}`;
      return node.description.replace('field value function: ', '');
    }
    return node.description;
  }

  const sumNode = firstExplain ? findSumNode(firstExplain) : undefined;
  const fnContributions = sumNode?.details ?? [];

  // For non-OpenSearch engines, show scores from the final step
  const finalStep = trajectory.steps.find((s) => s.stage === 'final');
  const byoScores = !rawEntries && finalStep?.scores;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold">Trajectory</h2>
            <p className="text-xs text-gray-500 mt-0.5">{trajectory.engine}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {trajectory.steps.map((step, i) => (
            <div key={i} className="px-6 py-4">
              <button
                className="w-full flex items-center gap-3 text-left"
                onClick={() => toggleStep(i)}
              >
                <StageLabel stage={step.stage} />
                <span className="text-sm text-gray-600">
                  {step.stage === 'query'
                    ? 'prompt / query'
                    : `${step.restaurant_ids.length} restaurants`}
                </span>
                {step.notes && step.stage !== 'query' && (
                  <span className="text-xs text-gray-400 truncate flex-1">{step.notes}</span>
                )}
                <span className="ml-auto text-gray-400 text-xs select-none">
                  {openSteps.has(i) ? '▲' : '▼'}
                </span>
              </button>

              {openSteps.has(i) && (
                <div className="mt-3 space-y-3">
                  {step.stage === 'query' && step.notes && (
                    <pre className="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-x-auto whitespace-pre-wrap max-h-64">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(step.notes), null, 2);
                        } catch {
                          return step.notes;
                        }
                      })()}
                    </pre>
                  )}
                  {step.notes && step.stage !== 'query' && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">
                      {step.notes}
                    </p>
                  )}
                  {step.scores && Object.keys(step.scores).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Scores (top 10)</p>
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-2 py-1 font-medium text-gray-600">
                              Restaurant
                            </th>
                            <th className="text-right px-2 py-1 font-medium text-gray-600">
                              Score
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(step.scores)
                            .slice(0, 10)
                            .map(([id, score]) => {
                              const row = restaurantMap.get(Number(id));
                              return (
                                <tr key={id} className="border-t border-gray-100">
                                  <td className="px-2 py-1">{row?.name ?? `#${id}`}</td>
                                  <td className="px-2 py-1 text-right font-mono">
                                    {score.toFixed(3)}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* OpenSearch _explain score contributions */}
        {entry && fnContributions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Score contributions —{' '}
              {restaurantMap.get(entry.id)?.name ?? `#${entry.id}`}
              {' '}(total: {entry.score.toFixed(3)})
            </p>
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1 font-medium text-gray-600">Contribution</th>
                  <th className="text-right px-2 py-1 font-medium text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody>
                {fnContributions.map((d, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-2 py-1 text-gray-700">{describeFn(d)}</td>
                    <td className="px-2 py-1 text-right font-mono">{d.value.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BYO engine — per-candidate scores from final step */}
        {byoScores && Object.keys(byoScores).length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Score attribution —{' '}
              {restaurantMap.get(restaurantId)?.name ?? `#${restaurantId}`}
              {' '}(rank-reciprocal score:{' '}
              {(byoScores[restaurantId] ?? 0).toFixed(3)})
            </p>
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1 font-medium text-gray-600">Restaurant</th>
                  <th className="text-right px-2 py-1 font-medium text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byoScores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([id, score]) => {
                    const row = restaurantMap.get(Number(id));
                    return (
                      <tr
                        key={id}
                        className={`border-t border-gray-100 ${Number(id) === restaurantId ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-2 py-1">{row?.name ?? `#${id}`}</td>
                        <td className="px-2 py-1 text-right font-mono">{score.toFixed(3)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── A/B Comparison Table ──────────────────────────────────────────────────────

function ComparisonTable({
  results,
  engines,
}: {
  results: Map<string, EngineResult>;
  engines: Engine[];
}) {
  const engineOrder = [
    ...engines.map((e) => e.id),
    ...[...results.keys()].filter((id) => !engines.find((e) => e.id === id)),
  ].filter((id) => results.has(id));

  const metricKeys: (keyof ScoreResult)[] = [
    'precision_at_k',
    'recall_at_k',
    'ndcg_at_k',
    'overlap',
    'blocked_hits',
  ];

  function bestEngineFor(metric: keyof ScoreResult): string | null {
    let best: string | null = null;
    let bestVal = -Infinity;
    const higherIsBetter = metric !== 'blocked_hits';
    for (const [engineId, result] of results.entries()) {
      if (!result.metrics) continue;
      const val = result.metrics[metric];
      if (higherIsBetter ? val > bestVal : val < bestVal || best === null) {
        bestVal = val;
        best = engineId;
      }
    }
    return best;
  }

  function fmtMetric(val: number, metric: keyof ScoreResult): string {
    if (metric === 'blocked_hits') return String(val);
    return (val * 100).toFixed(1) + '%';
  }

  const anyHaveMetrics = [...results.values()].some((r) => r.metrics);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600 w-36">Metric</th>
            {engineOrder.map((engineId) => {
              const engine = engines.find((e) => e.id === engineId);
              const result = results.get(engineId)!;
              return (
                <th
                  key={engineId}
                  className={`text-right px-4 py-2 font-medium ${
                    engine?.baseline
                      ? 'text-blue-700 bg-blue-50 border-l-2 border-l-blue-400'
                      : 'text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    {result.label ?? engine?.label ?? engineId}
                    {engine?.baseline && (
                      <span className="text-xs bg-blue-500 text-white rounded px-1.5 py-0.5 font-normal">
                        baseline
                      </span>
                    )}
                  </div>
                  {result.model && (
                    <div className="text-xs font-normal text-gray-500 mt-0.5 font-mono">
                      {result.model}
                    </div>
                  )}
                  {result.source && (
                    <div className="text-xs font-normal text-gray-400 mt-0.5">
                      {result.source}
                      {result.gatewayHost ? ` · ${result.gatewayHost}` : ''}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-xs font-normal text-red-500 mt-0.5 max-w-48 whitespace-normal">
                      {result.error.includes('fetch')
                        ? 'sidecar not running'
                        : result.error}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {anyHaveMetrics &&
            metricKeys.map((metric) => {
              const best = bestEngineFor(metric);
              return (
                <tr key={metric} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 text-gray-500 font-medium">{METRIC_LABELS[metric]}</td>
                  {engineOrder.map((engineId) => {
                    const result = results.get(engineId)!;
                    const engine = engines.find((e) => e.id === engineId);
                    const val = result.metrics?.[metric];
                    const isBest = engineId === best;
                    return (
                      <td
                        key={engineId}
                        className={`px-4 py-2 text-right font-mono ${
                          engine?.baseline ? 'bg-blue-50 border-l-2 border-l-blue-400' : ''
                        } ${isBest ? 'font-bold' : ''}`}
                      >
                        {val != null ? (
                          <span
                            className={
                              isBest
                                ? metric === 'blocked_hits'
                                  ? 'text-green-700'
                                  : 'text-green-700'
                                : ''
                            }
                          >
                            {fmtMetric(val, metric)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

// ── Per-section win/loss ──────────────────────────────────────────────────────

function SectionWinLoss({
  expected,
  results,
  engines,
  restaurantMap,
}: {
  expected: ExpectedTask;
  results: Map<string, EngineResult>;
  engines: Engine[];
  restaurantMap: Map<number, RestaurantRow>;
}) {
  const engineOrder = [
    ...engines.map((e) => e.id),
    ...[...results.keys()].filter((id) => !engines.find((e) => e.id === id)),
  ].filter((id) => results.has(id));

  if (expected.sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {expected.sections.map((section) => {
        const topK = new Map<string, Set<number>>();
        for (const engineId of engineOrder) {
          const r = results.get(engineId);
          topK.set(engineId, new Set(r?.ranked_ids ?? []));
        }
        return (
          <div key={section.cuisine} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
              <span className="text-sm font-medium">{section.label}</span>
              <span className="text-xs text-gray-400">
                {section.ranked_restaurant_ids.length} expected restaurants
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {engineOrder.map((engineId) => {
                const engine = engines.find((e) => e.id === engineId);
                const result = results.get(engineId)!;
                const ranked = topK.get(engineId) ?? new Set();
                const hits = section.ranked_restaurant_ids.filter((id) => ranked.has(id));
                const total = section.ranked_restaurant_ids.length;
                const pct = total > 0 ? (hits.length / total) * 100 : 0;
                return (
                  <div
                    key={engineId}
                    className={`px-4 py-2 flex items-center gap-3 text-sm ${
                      engine?.baseline ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="w-36 text-gray-600 font-medium truncate">
                      {result.label ?? engine?.label ?? engineId}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap flex-1">
                      {section.ranked_restaurant_ids.map((id, idx) => {
                        const hit = ranked.has(id);
                        const isNovelty = section.novelty_indices.includes(idx);
                        return (
                          <span
                            key={id}
                            title={`${restaurantMap.get(id)?.name ?? `#${id}`}${isNovelty ? ' (novelty)' : ''}`}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${
                              hit
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            } ${isNovelty ? 'ring-2 ring-amber-400' : ''}`}
                          >
                            {hit ? '✓' : '✗'}
                          </span>
                        );
                      })}
                    </div>
                    <span className="ml-auto text-xs text-gray-500 font-mono whitespace-nowrap">
                      {hits.length}/{total} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400">
        Ring = novelty slot. Green ✓ = engine included that restaurant in its top-k results.
      </p>
    </div>
  );
}

// ── Guide panel with Mermaid rendering ───────────────────────────────────────

function GuideBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#eff6ff',
          primaryBorderColor: '#93c5fd',
          primaryTextColor: '#1e3a5f',
          lineColor: '#60a5fa',
          secondaryColor: '#f0fdf4',
          tertiaryColor: '#fefce8',
          edgeLabelBackground: '#ffffff',
          background: '#ffffff',
        },
        fontSize: 15,
        flowchart: { nodeSpacing: 40, rankSpacing: 60, padding: 20, useMaxWidth: true },
      });
      if (ref.current) {
        const nodes = ref.current.querySelectorAll<HTMLElement>('.language-mermaid');
        // Wrap each diagram in a scrollable div before rendering
        nodes.forEach((node) => {
          const wrapper = document.createElement('div');
          wrapper.style.overflowX = 'auto';
          wrapper.style.padding = '8px 0';
          node.parentNode?.insertBefore(wrapper, node);
          wrapper.appendChild(node);
        });
        m.default.run({ nodes });
      }
    });
  }, [html]);
  return (
    <div
      ref={ref}
      className="px-6 py-5 prose prose-base prose-blue max-w-none border-t border-blue-200 bg-white"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RecoEvalClient({ initialPersonas, guideHtml }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [restaurantMap, setRestaurantMap] = useState<Map<number, RestaurantRow>>(new Map());

  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());
  const [selectedPersona, setSelectedPersona] = useState<string>(
    initialPersonas[0]?.id ?? ''
  );
  const [results, setResults] = useState<Map<string, EngineResult>>(new Map());
  const [expectedTask, setExpectedTask] = useState<ExpectedTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    engineId: string;
    restaurantId: number;
  } | null>(null);
  const setActiveRun = useRecoSelectionStore((s) => s.setActiveRun);

  const selectedPersonaData = initialPersonas.find((p) => p.id === selectedPersona);

  // BYO panel state
  const [byoEnabled, setByoEnabled] = useState(false);
  const [byoTab, setByoTab] = useState<'endpoint' | 'llm'>('endpoint');
  const [byoUrl, setByoUrl] = useState('');
  const [byoLlmBaseUrl, setByoLlmBaseUrl] = useState('https://api.openai.com/v1');
  const [byoLlmKey, setByoLlmKey] = useState('');
  const [byoLlmModel, setByoLlmModel] = useState('gpt-4o-mini');

  useEffect(() => {
    fetch('/api/reco/engines')
      .then((r) => r.json())
      .then((data: Engine[]) => {
        setEngines(data);
        setSelectedEngines(new Set(data.map((e) => e.id)));
      });

    fetch('/api/reco/restaurants')
      .then((r) => r.json())
      .then((rows: RestaurantRow[]) => {
        setRestaurantMap(new Map(rows.map((r) => [r.id, r])));
      });
  }, []);

  const toggleEngine = (id: string, baseline: boolean) => {
    if (baseline) return;
    setSelectedEngines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRun = async () => {
    if (!selectedPersona) return;
    setLoading(true);
    setRunError(null);
    setResults(new Map());
    setExpectedTask(null);
    setModalState(null);

    try {
      // 1. Build candidates + expected task from the Next.js API
      const candRes = await fetch(`/api/reco/candidates?personaId=${selectedPersona}`);
      if (!candRes.ok) {
        const body = await candRes.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to build candidates: HTTP ${candRes.status}`);
      }
      const { candidates, expected } = (await candRes.json()) as {
        candidates: Candidate[];
        expected: ExpectedTask;
      };
      setExpectedTask(expected);

      // 2. Determine which engines to run
      type EngineRun = {
        id: string;
        label: string;
        url: string;
        baseline?: boolean;
        llm?: { baseUrl: string; apiKey: string; model: string };
      };
      const engineRuns: EngineRun[] = engines
        .filter((e) => selectedEngines.has(e.id))
        .map((e) => ({
          id: e.id,
          label: e.label,
          url: e.url,
          baseline: e.baseline,
          // If llm-ranker is selected and BYO LLM tab is active, inject credentials
          llm:
            byoEnabled && byoTab === 'llm' && e.id === 'llm-ranker' && byoLlmBaseUrl
              ? { baseUrl: byoLlmBaseUrl, apiKey: byoLlmKey, model: byoLlmModel }
              : undefined,
        }));

      if (byoEnabled && byoTab === 'endpoint' && byoUrl) {
        engineRuns.push({
          id: 'custom',
          label: `BYO (${byoUrl.replace(/^https?:\/\//, '')})`,
          url: byoUrl,
        });
      }

      // 3. Fan out concurrently
      const runs = engineRuns.map(async (eng): Promise<[string, EngineResult]> => {
        const body = {
          personaId: selectedPersona,
          topK: 20,
          candidates,
          ...(eng.llm ? { llm: eng.llm } : {}),
        };
        try {
          const res = await fetch(`${eng.url}/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            return [
              eng.id,
              {
                label: eng.label,
                ranked_ids: [],
                error: errBody.error ?? `HTTP ${res.status}`,
              },
            ];
          }
          const data = await res.json();
          const metrics = scoreTask(data.ranked_ids ?? [], expected);
          return [
            eng.id,
            {
              label: eng.label,
              ranked_ids: data.ranked_ids ?? [],
              scores: data.scores,
              trajectory: data.trajectory,
              metrics,
              source: data.source,
              model: data.model,
              gatewayHost: data.gatewayHost,
            },
          ];
        } catch (err) {
          return [
            eng.id,
            {
              label: eng.label,
              ranked_ids: [],
              error: err instanceof Error ? err.message : String(err),
            },
          ];
        }
      });

      const allResults = await Promise.all(runs);
      setResults(new Map(allResults));

      // Persist every successful result to the backend so the header
      // dropdown picks them up globally. Apply in reverse so the baseline
      // (first in the list) ends up as the active run by default.
      if (selectedPersonaData) {
        for (const [engineId, result] of [...allResults].reverse()) {
          if (result.ranked_ids.length > 0 && !result.error) {
            await fetch('/api/reco/runs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personaId: selectedPersonaData.id,
                personaUserId: selectedPersonaData.user_id,
                personaName: selectedPersonaData.display_name,
                engineId,
                label: result.label,
                model: result.model,
                ranked_ids: result.ranked_ids,
                scores: result.scores,
              }),
            });
          }
        }
        // Activate the first (highest-priority) successful run
        const firstSuccess = allResults.find(([, r]) => r.ranked_ids.length > 0 && !r.error);
        if (firstSuccess) {
          const [engineId, result] = firstSuccess;
          setActiveRun(`${selectedPersonaData.user_id}:${engineId}:${result.model ?? ''}`);
        }
      }
    } catch (err) {
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const modalResult =
    modalState != null ? results.get(modalState.engineId) : undefined;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pt-24">
      {guideHtml && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50">
          <button
            onClick={() => setGuideOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <span>📋 Getting Started — Demo Guide</span>
            <span className="text-blue-500 text-xs">{guideOpen ? '▲ collapse' : '▼ expand'}</span>
          </button>
          {guideOpen && <GuideBody html={guideHtml} />}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">Reco Eval</h1>

      {/* Engine picker */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Engines</h2>
        <div className="flex flex-wrap gap-3">
          {engines.map((engine) => (
            <label
              key={engine.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium select-none transition-colors ${
                selectedEngines.has(engine.id)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              } ${engine.baseline ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => toggleEngine(engine.id, !!engine.baseline)}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedEngines.has(engine.id)}
                readOnly
              />
              {engine.label}
              {engine.baseline && (
                <span className="ml-1 text-xs bg-blue-500 text-white rounded px-1.5 py-0.5">
                  baseline
                </span>
              )}
            </label>
          ))}
        </div>
      </section>

      {/* Persona picker */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Persona</h2>
        <select
          value={selectedPersona}
          onChange={(e) => setSelectedPersona(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {initialPersonas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name} — {p.id}
            </option>
          ))}
        </select>
      </section>

      {/* BYO Panel */}
      <section className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold uppercase text-gray-500">BYO Ranker</h2>
          <button
            onClick={() => setByoEnabled((v) => !v)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              byoEnabled ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                byoEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {byoEnabled && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setByoTab('endpoint')}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  byoTab === 'endpoint'
                    ? 'border-b-2 border-gray-900 text-gray-900 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Use my endpoint
              </button>
              <button
                onClick={() => setByoTab('llm')}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  byoTab === 'llm'
                    ? 'border-b-2 border-gray-900 text-gray-900 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Use my LLM
              </button>
            </div>

            {byoTab === 'endpoint' && (
              <div className="px-5 py-4 space-y-3">
                <p className="text-xs text-gray-500">
                  Your server must implement{' '}
                  <code className="bg-gray-100 px-1 rounded">POST /recommend</code> speaking the
                  same contract as the built-in engines. It will receive the same candidate set.
                </p>
                <input
                  type="url"
                  placeholder="http://my-ranker.example.com"
                  value={byoUrl}
                  onChange={(e) => setByoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            )}

            {byoTab === 'llm' && (
              <div className="px-5 py-4 space-y-3">
                <p className="text-xs text-gray-500">
                  We send the ranking prompt to your LLM. Requires the LLM Ranker sidecar on{' '}
                  <code className="bg-gray-100 px-1 rounded">:4002</code>. Your API key is sent
                  only to the sidecar —{' '}
                  <strong>never logged or stored server-side.</strong>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Base URL (OpenAI-compatible)
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="https://api.openai.com/v1"
                      value={byoLlmBaseUrl}
                      onChange={(e) => setByoLlmBaseUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      API Key
                    </label>
                    <input
                      type="text"
                      autoComplete="new-password"
                      placeholder="sk-…"
                      value={byoLlmKey}
                      onChange={(e) => setByoLlmKey(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                    <select
                      value={byoLlmModel}
                      onChange={(e) => setByoLlmModel(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini — fast &amp; cheap</option>
                      <option value="gpt-4o">gpt-4o — flagship</option>
                      <option value="gpt-4.1">gpt-4.1 — latest</option>
                      <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={loading || selectedEngines.size === 0 || !selectedPersona}
        className="bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Running…' : 'Run'}
      </button>

      {/* Top-level error */}
      {runError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {runError}
        </div>
      )}

      {/* A/B Comparison Table */}
      {results.size > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            A/B Comparison{' '}
            <span className="text-gray-400 font-normal normal-case">
              — {selectedPersona}
            </span>
          </h2>
          <ComparisonTable results={results} engines={engines} />
        </section>
      )}

      {/* Per-section win/loss */}
      {results.size > 0 && expectedTask && expectedTask.sections.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            Section win/loss
          </h2>
          <SectionWinLoss
            expected={expectedTask}
            results={results}
            engines={engines}
            restaurantMap={restaurantMap}
          />
        </section>
      )}

      {/* Per-engine ranked result tables */}
      {results.size > 0 && (
        <section className="mt-8 space-y-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">Ranked results</h2>
          {[...results.entries()].map(([engineId, result]) => {
            const engine = engines.find((e) => e.id === engineId);
            return (
              <div key={engineId}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {result.label ?? engine?.label ?? engineId}
                    {engine?.baseline && (
                      <span className="ml-2 text-xs bg-blue-500 text-white rounded px-1.5 py-0.5">
                        baseline
                      </span>
                    )}
                    {result.error && (
                      <span className="ml-2 text-xs text-red-600">{result.error}</span>
                    )}
                  </h3>
                </div>
                {result.ranked_ids.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600 w-12">
                            Rank
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600 w-20">
                            ID
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Cuisine</th>
                          {result.trajectory && <th className="px-4 py-2 w-20" />}
                        </tr>
                      </thead>
                      <tbody>
                        {result.ranked_ids.map((id, idx) => {
                          const row = restaurantMap.get(id);
                          const isBlocked = expectedTask?.blocked_restaurant_ids.includes(id);
                          return (
                            <tr
                              key={id}
                              className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                                isBlocked ? 'bg-red-50' : ''
                              }`}
                            >
                              <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                              <td className="px-4 py-2 text-gray-500">{id}</td>
                              <td className="px-4 py-2 font-medium">
                                {row?.name ?? '—'}
                                {isBlocked && (
                                  <span className="ml-2 text-xs text-red-600 font-normal">
                                    blocked
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-500">{row?.cuisine ?? '—'}</td>
                              {result.trajectory && (
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() =>
                                      setModalState({ engineId, restaurantId: id })
                                    }
                                    className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2"
                                  >
                                    details
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Trajectory modal */}
      {modalState != null && modalResult?.trajectory && (
        <TrajectoryModal
          trajectory={modalResult.trajectory}
          restaurantMap={restaurantMap}
          restaurantId={modalState.restaurantId}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
