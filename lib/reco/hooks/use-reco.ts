'use client';

import { useQuery } from '@tanstack/react-query';
import type { RecoContext, RecommendationResponse } from '@/lib/reco/types';

interface UseRecoArgs {
  /** Engine name; `null` disables the hook entirely (no fetches). */
  engine: string | null;
  ctx: Omit<RecoContext, 'k'> & { k: number };
}

/**
 * Phase 3 helper. Fetches an engine ranking for the current page and
 * caches it via react-query. When `engine` is `null` the hook short-
 * circuits to a stable empty response — no network calls. That's how
 * the production flow stays bit-identical when the picker is "none".
 *
 * Cache key includes the engine name + candidatePool hash so switching
 * engines or refreshing the pool triggers a refetch.
 */
export function useReco({ engine, ctx }: UseRecoArgs) {
  const poolKey =
    ctx.candidatePool && ctx.candidatePool.length > 0
      ? `${ctx.candidatePool.length}:${ctx.candidatePool[0]}:${ctx.candidatePool[ctx.candidatePool.length - 1]}`
      : 'none';

  const enabled = !!engine;

  const q = useQuery<RecommendationResponse>({
    queryKey: ['reco-predict', engine, ctx.surface, ctx.k, ctx.lat, ctx.lng, poolKey],
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min — re-rank shouldn't thrash
    queryFn: async () => {
      const res = await fetch('/api/reco/predict', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ engine, ctx }),
      });
      if (!res.ok) {
        // The endpoint already 200s on engine failure; a non-2xx here
        // means a real client/server problem. Swallow into an empty
        // result so the caller's fallback path takes over.
        return {
          items: [],
          engine: engine ?? 'unknown',
          version: '',
          latencyMs: 0,
          debug: { error: `HTTP ${res.status}` },
        };
      }
      return (await res.json()) as RecommendationResponse;
    },
  });

  return {
    ids: q.data?.items.map(i => i.id) ?? null,
    scores: q.data?.items ?? null,
    isLoading: q.isLoading,
    error: q.error as Error | null,
    response: q.data ?? null,
  };
}
