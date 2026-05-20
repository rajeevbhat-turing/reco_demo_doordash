import {
  RecoEngineError,
  type RecommendationEngine,
  type RecoContext,
  type RecommendationResponse,
} from '@/lib/reco/types';

/**
 * Gorse adapter. Speaks Gorse's own endpoint shape rather than the
 * generic `/recommend` HTTP contract — Gorse predates that contract.
 *
 * Per https://gorse.io/docs/master/master/rest-api.html :
 *   GET  {server}/api/recommend/{user-id}?n={k}          — personalized
 *   GET  {server}/api/popular?n={k}                      — fallback
 *   GET  {server}/api/health/live                        — version probe
 *
 * Env:
 *   RECO_GORSE_URL      — base URL of the Gorse *server* (default :8088)
 *   RECO_GORSE_API_KEY  — optional X-API-Key header value
 */

interface GorseEngineConfig {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export function makeGorseEngine(config: GorseEngineConfig = {}): RecommendationEngine {
  const baseUrl =
    config.baseUrl ?? process.env.RECO_GORSE_URL ?? 'http://gorse:8088';
  const apiKey = config.apiKey ?? process.env.RECO_GORSE_API_KEY;
  const timeoutMs = config.timeoutMs ?? 5000;

  return {
    name: 'gorse',
    version: '0.5.x', // overridden per-request from /api/health/live when available
    description:
      'Gorse self-hosted recommender in CF-only mode: BPR matrix factorization + cosine item/user neighbors + popular fallback. No LLM calls. Apache-2.',

    async recommend(ctx: RecoContext): Promise<RecommendationResponse> {
      const start = performance.now();
      const path = ctx.userId
        ? `/api/recommend/${encodeURIComponent(ctx.userId)}?n=${ctx.k}`
        : `/api/popular?n=${ctx.k}`;
      const url = `${baseUrl.replace(/\/$/, '')}${path}`;

      const headers: Record<string, string> = { accept: 'application/json' };
      if (apiKey) headers['X-API-Key'] = apiKey;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { headers, signal: controller.signal });
        if (!res.ok) {
          throw new RecoEngineError('gorse', `HTTP ${res.status} from ${url}`);
        }
        const ids = (await res.json()) as Array<string | { Id: string; Score?: number }>;
        if (!Array.isArray(ids)) {
          throw new RecoEngineError('gorse', 'unexpected response shape');
        }

        // Two response shapes seen in the wild: a bare string[] (popular)
        // and [{Id, Score}] (recommend). Normalize.
        const kind = ctx.surface === 'store_items' ? ('item' as const) : ('restaurant' as const);
        const allItems = ids.map((entry, i) => {
          const id = typeof entry === 'string' ? entry : entry.Id;
          const score = typeof entry === 'string' ? 1 - i / Math.max(ctx.k, 1) : (entry.Score ?? 1 - i / Math.max(ctx.k, 1));
          return { id, score, kind };
        });

        // Gorse doesn't accept a candidate-pool filter, so post-filter here
        // when the eval is restricting candidates.
        const pool = ctx.candidatePool ? new Set(ctx.candidatePool) : null;
        const items = pool ? allItems.filter(it => pool.has(it.id)) : allItems;

        return {
          items: items.slice(0, ctx.k),
          engine: 'gorse',
          version: '0.5.x',
          latencyMs: performance.now() - start,
          debug: { endpoint: path, returned: ids.length, filtered: items.length },
        };
      } catch (err) {
        if (err instanceof RecoEngineError) throw err;
        throw new RecoEngineError('gorse', 'request failed', err);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export const gorseEngine: RecommendationEngine = makeGorseEngine();
