import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';
import type {
  RecommendationEngine,
  RecoContext,
  RecommendationResponse,
} from '@/lib/reco/types';

/**
 * Sanity-floor baseline. Returns `k` items sampled uniformly from the
 * candidate pool (or from "restaurants within 10 miles" if no pool was
 * given). Anything that scores below `random` is broken.
 *
 * Uses a deterministic-per-context seed so re-runs are reproducible.
 */
class RandomEngine implements RecommendationEngine {
  readonly name = 'random';
  readonly version = '1.0.0';
  readonly description = 'Uniform random over the candidate pool. Sanity floor.';

  async recommend(ctx: RecoContext): Promise<RecommendationResponse> {
    const start = performance.now();

    const pool = ctx.candidatePool ?? (await defaultRestaurantPool(ctx));
    const rng = mulberry32(seedFor(ctx));
    const shuffled = [...pool].sort(() => rng() - 0.5);
    const items = shuffled.slice(0, ctx.k).map((id, i) => ({
      id,
      score: 1 - i / Math.max(ctx.k, 1),
      kind: ctx.surface === 'store_items' ? ('item' as const) : ('restaurant' as const),
    }));

    return {
      items,
      engine: this.name,
      version: this.version,
      latencyMs: performance.now() - start,
      debug: { poolSize: pool.length },
    };
  }
}

async function defaultRestaurantPool(ctx: RecoContext): Promise<string[]> {
  const rows = await db.query<{ id: number; latitude: number; longitude: number }>(
    'SELECT id, latitude, longitude FROM restaurants WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
  );
  return rows
    .filter(r => calculateDistance(r.latitude, r.longitude, ctx.lat, ctx.lng) <= 10)
    .map(r => String(r.id));
}

function seedFor(ctx: RecoContext): number {
  const s = `${ctx.userId ?? 'guest'}|${ctx.lat.toFixed(4)}|${ctx.lng.toFixed(4)}|${ctx.surface}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomEngine: RecommendationEngine = new RandomEngine();
