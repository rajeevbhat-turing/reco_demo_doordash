'use client';

import { useEffect, useState } from 'react';
import type { Persona } from '@/lib/reco/types';

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
};

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string | null;
};

type Props = {
  initialPersonas: Persona[];
};

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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
