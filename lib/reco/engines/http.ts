import {
  RecoEngineError,
  type RecommendationEngine,
  type RecoContext,
  type RecommendationResponse,
} from '@/lib/reco/types';

interface HttpEngineConfig {
  name: string;
  version: string;
  description: string;
  endpoint: string; // full URL of the POST /recommend handler
  apiKey?: string; // sent as Authorization: Bearer <key>
  timeoutMs?: number; // default 5000
}

/**
 * Generic adapter for any external HTTP recommendation engine that speaks
 * the wire contract in `lib/reco/README.md`. Used directly for LightFM /
 * Implicit sidecars; wrapped by `gorse.ts` for the Gorse-specific
 * endpoint shape.
 *
 * Failure policy: a downstream error (timeout, non-2xx, malformed body)
 * surfaces as a `RecoEngineError`. The eval runner catches per-task and
 * records the error in the report rather than aborting the whole run.
 */
export function makeHttpEngine(config: HttpEngineConfig): RecommendationEngine {
  const timeoutMs = config.timeoutMs ?? 5000;

  return {
    name: config.name,
    version: config.version,
    description: config.description,

    async recommend(ctx: RecoContext): Promise<RecommendationResponse> {
      const start = performance.now();
      const body = JSON.stringify(ctx);
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`;

      const attempt = async (): Promise<RecommendationResponse> => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body,
            signal: controller.signal,
          });
          if (!res.ok) {
            throw new RecoEngineError(
              config.name,
              `HTTP ${res.status} from ${config.endpoint}`
            );
          }
          const json = (await res.json()) as Partial<RecommendationResponse>;
          if (!json || !Array.isArray(json.items)) {
            throw new RecoEngineError(config.name, 'response missing items[]');
          }
          return {
            items: json.items,
            engine: json.engine ?? config.name,
            version: json.version ?? config.version,
            latencyMs: json.latencyMs ?? performance.now() - start,
            debug: json.debug,
          };
        } finally {
          clearTimeout(timer);
        }
      };

      try {
        return await attempt();
      } catch (err) {
        // Retry once on network/abort, not on RecoEngineError already constructed.
        if (err instanceof RecoEngineError) throw err;
        try {
          return await attempt();
        } catch (err2) {
          throw new RecoEngineError(config.name, 'request failed after retry', err2);
        }
      }
    },
  };
}
