'use client';

import { useEffect, useState } from 'react';
import type { Persona, RecoTrajectory } from '@/lib/reco/types';

type Engine = {
  id: string;
  label: string;
  url: string;
  baseline?: boolean;
};

type RecoResult = {
  engine: string;
  personaId: string;
  ranked_ids: number[];
  trajectory?: RecoTrajectory;
};

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string | null;
};

type Props = {
  initialPersonas: Persona[];
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

function StageLabel({ stage }: { stage: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${STAGE_COLORS[stage] ?? 'bg-gray-100 text-gray-700'}`}>
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
    setOpenSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const rawEntries = trajectory.raw_explain as RawExplainEntry[] | undefined;
  const entry = rawEntries?.find(e => e.id === restaurantId) ?? rawEntries?.[0];
  const firstEntry = entry;
  const firstExplain = firstEntry?.explanation as OSExplainNode | undefined;

  // Navigate the _explain tree to find the "function score, score mode [sum]" node,
  // which holds the actual per-function contributions as direct children.
  function findSumNode(node: OSExplainNode): OSExplainNode | undefined {
    if (node.description.includes('function score, score mode')) return node;
    for (const d of (node.details ?? [])) {
      const found = findSumNode(d);
      if (found) return found;
    }
  }

  // Produce a readable label for each function contribution child.
  function describeFn(node: OSExplainNode): string {
    const filterChild = node.details?.find(d => d.description.startsWith('match filter:'));
    if (filterChild) {
      const weightNode = node.details
        ?.find(d => d.description === 'product of:')
        ?.details?.find(d => d.description === 'weight');
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Steps */}
        <div className="divide-y divide-gray-100">
          {trajectory.steps.map((step, i) => (
            <div key={i} className="px-6 py-4">
              <button
                className="w-full flex items-center gap-3 text-left"
                onClick={() => toggleStep(i)}
              >
                <StageLabel stage={step.stage} />
                <span className="text-sm text-gray-600">
                  {step.stage === 'query' ? 'query definition' : `${step.restaurant_ids.length} restaurants`}
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
                  {/* Query JSON */}
                  {step.stage === 'query' && step.notes && (
                    <pre className="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-x-auto whitespace-pre-wrap max-h-48">
                      {(() => { try { return JSON.stringify(JSON.parse(step.notes), null, 2); } catch { return step.notes; } })()}
                    </pre>
                  )}

                  {/* Notes (non-query) */}
                  {step.notes && step.stage !== 'query' && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">{step.notes}</p>
                  )}

                  {/* Scores table */}
                  {step.scores && Object.keys(step.scores).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Scores (top 10)</p>
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-2 py-1 font-medium text-gray-600">Restaurant</th>
                            <th className="text-right px-2 py-1 font-medium text-gray-600">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(step.scores).slice(0, 10).map(([id, score]) => {
                            const row = restaurantMap.get(Number(id));
                            return (
                              <tr key={id} className="border-t border-gray-100">
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
              )}
            </div>
          ))}
        </div>

        {/* OpenSearch _explain breakdown for selected restaurant */}
        {firstEntry && fnContributions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Score contributions — {restaurantMap.get(firstEntry.id)?.name ?? `#${firstEntry.id}`}
              {' '}(total: {firstEntry.score.toFixed(3)})
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
      </div>
    </div>
  );
}

export default function RecoEvalClient({ initialPersonas }: Props) {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [restaurantMap, setRestaurantMap] = useState<Map<number, RestaurantRow>>(new Map());

  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());
  const [selectedPersona, setSelectedPersona] = useState<string>(
    initialPersonas[0]?.id ?? ''
  );
  const [result, setResult] = useState<RecoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/reco/engines')
      .then(r => r.json())
      .then((data: Engine[]) => {
        setEngines(data);
        setSelectedEngines(new Set(data.map(e => e.id)));
      });

    fetch('/api/reco/restaurants')
      .then(r => r.json())
      .then((rows: RestaurantRow[]) => {
        setRestaurantMap(new Map(rows.map(r => [r.id, r])));
      });
  }, []);

  const toggleEngine = (id: string, baseline: boolean) => {
    if (baseline) return;
    setSelectedEngines(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRun = async () => {
    if (!selectedPersona || selectedEngines.size === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedRowId(null);

    const engine = engines.find(e => selectedEngines.has(e.id));
    if (!engine) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${engine.url}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: selectedPersona, topK: 20 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data: RecoResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold mb-6">Reco Eval</h1>

      {/* Engine picker */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Engines</h2>
        <div className="flex flex-wrap gap-3">
          {engines.map(engine => (
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
          onChange={e => setSelectedPersona(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {initialPersonas.map(p => (
            <option key={p.id} value={p.id}>
              {p.display_name} — {p.id}
            </option>
          ))}
        </select>
      </section>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={loading || selectedEngines.size === 0 || !selectedPersona}
        className="bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Running…' : 'Run'}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            Results — {result.engine} / {result.personaId}
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-12">Rank</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600 w-20">ID</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Cuisine</th>
                  {result.trajectory && (
                    <th className="px-4 py-2 w-20" />
                  )}
                </tr>
              </thead>
              <tbody>
                {result.ranked_ids.map((id, idx) => {
                  const row = restaurantMap.get(id);
                  return (
                    <tr key={id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-2 text-gray-500">{id}</td>
                      <td className="px-4 py-2 font-medium">{row?.name ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{row?.cuisine ?? '—'}</td>
                      {result.trajectory && (
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => setSelectedRowId(id)}
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
        </section>
      )}

      {/* Trajectory modal — per-row */}
      {selectedRowId !== null && result?.trajectory && (
        <TrajectoryModal
          trajectory={result.trajectory}
          restaurantMap={restaurantMap}
          restaurantId={selectedRowId}
          onClose={() => setSelectedRowId(null)}
        />
      )}
    </div>
  );
}
