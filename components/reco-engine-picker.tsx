'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';

type Engine = { name: string; version: string; description: string };

/**
 * Phase 3 demo control: pick which reco engine re-ranks /home.
 *
 * Renders only when NEXT_PUBLIC_RECO_DEMO === '1'. Selection is
 * persisted via `useAppStore.activeRecoEngine`. "none" = production
 * behaviour (no re-rank, no extra network calls).
 */
export default function RecoEnginePicker() {
  const enabled = process.env.NEXT_PUBLIC_RECO_DEMO === '1';
  const active = useAppStore(s => s.activeRecoEngine);
  const setActive = useAppStore(s => s.setActiveRecoEngine);
  const [engines, setEngines] = useState<Engine[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch('/api/reco/engines')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { engines: Engine[] }) => {
        if (!cancelled) setEngines(d.engines ?? []);
      })
      .catch(() => {
        if (!cancelled) setEngines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2 mr-3">
      <label
        className="flex items-center gap-2 bg-[#f1f1f1] rounded-full px-3 h-8 text-xs text-gray-700"
        title="Phase 3 demo: re-rank /home with the selected engine"
      >
        <span className="hidden md:inline font-medium uppercase tracking-wide text-[10px] text-gray-500">
          Reco
        </span>
        <select
          value={active ?? ''}
          onChange={e => setActive(e.target.value || null)}
          className="bg-transparent outline-none cursor-pointer pr-1 text-sm"
          aria-label="Recommendation engine"
          data-testid="reco-engine-picker"
        >
          <option value="">none</option>
          {engines.map(e => (
            <option key={e.name} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      {active && (
        <span
          className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 h-6 text-[11px] font-medium text-emerald-700 border border-emerald-200"
          data-testid="reco-active-badge"
        >
          re-ranked by {active}
        </span>
      )}
    </div>
  );
}
