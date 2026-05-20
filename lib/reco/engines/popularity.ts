import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';
import type {
  RecommendationEngine,
  RecoContext,
  RecoItem,
  RecommendationResponse,
} from '@/lib/reco/types';

/**
 * Popularity baseline. Strong, simple, and unfair to beat.
 *
 * `restaurant` surfaces rank by `featured`, then `new_flag`, then average
 * approved-review rating × log(1 + review_count) — a smoothed popularity
 * score. `store_items` reuses the formula already in
 * `app/api/restaurants/popular-items/route.ts` so the engine matches what
 * the live UI shows in the popular-items carousel.
 *
 * Distance filtering keeps the comparison fair: only restaurants within
 * 10 miles of the request are considered, just like the production feed.
 */
class PopularityEngine implements RecommendationEngine {
  readonly name = 'popularity';
  readonly version = '1.0.0';
  readonly description =
    'Featured + rating × log(1+count). Same formula as the production feed.';

  async recommend(ctx: RecoContext): Promise<RecommendationResponse> {
    const start = performance.now();

    const items =
      ctx.surface === 'store_items'
        ? await this.popularItems(ctx)
        : await this.popularRestaurants(ctx);

    return {
      items,
      engine: this.name,
      version: this.version,
      latencyMs: performance.now() - start,
    };
  }

  private async popularRestaurants(ctx: RecoContext): Promise<RecoItem[]> {
    const rows = await db.query<{
      id: number;
      latitude: number;
      longitude: number;
      featured: number | null;
      new_flag: number | null;
      avg_rating: number | null;
      total_rating_count: number | null;
    }>(
      `SELECT
         r.id,
         r.latitude,
         r.longitude,
         r.featured,
         r.new_flag,
         (SELECT AVG(ur.rating) FROM user_reviews ur
            WHERE ur.store_id = r.id AND ur.approval_status = 'approved') AS avg_rating,
         (SELECT COUNT(*)     FROM user_reviews ur
            WHERE ur.store_id = r.id AND ur.approval_status = 'approved') AS total_rating_count
       FROM restaurants r
       WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL`
    );

    const poolFilter = ctx.candidatePool ? new Set(ctx.candidatePool) : null;

    return rows
      .filter(r => {
        if (poolFilter && !poolFilter.has(String(r.id))) return false;
        return calculateDistance(r.latitude, r.longitude, ctx.lat, ctx.lng) <= 10;
      })
      .map(r => ({
        id: String(r.id),
        kind: 'restaurant' as const,
        score: popularityScore(r),
        // featuredOrder is a tiebreaker hint surfaced for debugging only.
        meta: { featured: !!r.featured, new: !!r.new_flag },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, ctx.k);
  }

  private async popularItems(ctx: RecoContext): Promise<RecoItem[]> {
    const rows = await db.query<{
      id: number;
      restaurant_id: number;
      latitude: number;
      longitude: number;
      featured: number | null;
      popular: number | null;
      rating: number | null;
      rating_count: number | null;
    }>(
      `SELECT mi.id, mi.restaurant_id, mi.featured, mi.popular, mi.rating, mi.rating_count,
              r.latitude, r.longitude
         FROM menu_items mi
         JOIN restaurants r ON mi.restaurant_id = r.id
        WHERE mi.is_available = 1
          AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL`
    );

    const poolFilter = ctx.candidatePool ? new Set(ctx.candidatePool) : null;

    return rows
      .filter(r => {
        if (poolFilter && !poolFilter.has(String(r.id))) return false;
        return calculateDistance(r.latitude, r.longitude, ctx.lat, ctx.lng) <= 10;
      })
      .map(r => ({
        id: String(r.id),
        kind: 'item' as const,
        score:
          (r.featured ? 2 : 0) +
          (r.popular ? 1 : 0) +
          (r.rating ?? 0) * Math.log(1 + (r.rating_count ?? 0)),
        meta: { restaurantId: String(r.restaurant_id) },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, ctx.k);
  }
}

function popularityScore(r: {
  featured: number | null;
  new_flag: number | null;
  avg_rating: number | null;
  total_rating_count: number | null;
}): number {
  return (
    (r.featured ? 2 : 0) +
    (r.new_flag ? 0.25 : 0) +
    (r.avg_rating ?? 0) * Math.log(1 + (r.total_rating_count ?? 0))
  );
}

export const popularityEngine: RecommendationEngine = new PopularityEngine();
