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
    }
  >;
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

export default function RecoEvalPage() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [taskSet, setTaskSet] = useState<'seed' | 'history'>('seed');
  const [k, setK] = useState<number>(5);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const res = await fetch('/api/reco/eval', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          engineNames: [...selected],
          taskSetId: taskSet,
          k,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'eval failed');
      setReport(data.report as Report);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(3) : '—');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Recommendation eval</h1>
        <p className="text-sm text-gray-600 mt-2">
          Phase 0 demo. Pick engines + a task set, hit Run, see metrics.
          See <code>RECO_PLAN.md</code> and <code>EXECUTION.md</code>.
        </p>
      </header>

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
              {selected.size} engine{selected.size === 1 ? '' : 's'} selected.
            </p>
          </div>
          <Button
            disabled={loading || selected.size === 0}
            onClick={runEval}
            className="mt-3"
          >
            {loading ? 'Running…' : 'Run eval'}
          </Button>
        </div>
      </section>

      {report && (
        <>
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
                    <TableCell className="font-medium">{name}</TableCell>
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
                          <TableCell className="font-medium">{name}</TableCell>
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
