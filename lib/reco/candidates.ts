// @ts-expect-error — better-sqlite3 ships without types
import type Database from 'better-sqlite3';
import type { Candidate, CandidateFeatures, Persona, PriceTier } from './types';
import { CANDIDATE_RADIUS_MILES } from './eval/persona-truth';

const PRICE_RANGES: Record<PriceTier, number[]> = {
  budget: [1],
  mid: [2],
  premium: [3, 4],
};

type RestRow = {
  id: number;
  cuisine: string;
  price_range: number;
  latitude: number | null;
  longitude: number | null;
  dash_pass: number;
  discount_percentage: number | null;
};

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function buildCandidates(persona: Persona, db: Database): Candidate[] {
  const orderRows = db
    .prepare(`SELECT store_id, COUNT(*) AS n FROM orders WHERE user_id = ? GROUP BY store_id`)
    .all(persona.user_id) as Array<{ store_id: number; n: number }>;
  const ordersByStore = new Map<number, number>(
    orderRows.map((r: { store_id: number; n: number }) => [r.store_id, r.n])
  );

  const ratingRows = db
    .prepare(
      `SELECT store_id, AVG(rating) AS avg_rating
       FROM user_reviews
       WHERE store_category = 'restaurant' AND approval_status = 'approved'
       GROUP BY store_id`
    )
    .all() as Array<{ store_id: number; avg_rating: number }>;
  const avgRatings = new Map<number, number>(
    ratingRows.map((r: { store_id: number; avg_rating: number }) => [r.store_id, r.avg_rating])
  );

  const priceRanges = PRICE_RANGES[persona.preferences.price_tier];
  const rows = db
    .prepare(
      `SELECT id, cuisine, price_range, latitude, longitude, dash_pass, discount_percentage
       FROM restaurants
       WHERE price_range IN (${priceRanges.join(',')})`
    )
    .all() as RestRow[];

  const candidates = rows
    .filter((r) => r.latitude != null && r.longitude != null)
    .filter(
      (r) =>
        haversineMiles(persona.address.lat, persona.address.lng, r.latitude!, r.longitude!) <=
        CANDIDATE_RADIUS_MILES
    )
    .map((r) => {
      const distance_miles = haversineMiles(
        persona.address.lat,
        persona.address.lng,
        r.latitude!,
        r.longitude!
      );
      const features: CandidateFeatures = {
        cuisine_affinity_match: persona.preferences.cuisine_affinity[r.cuisine] ?? 0,
        price_tier_match: priceRanges.includes(r.price_range),
        distance_miles,
        avg_rating: avgRatings.get(r.id) ?? 0,
        persona_order_count: ordersByStore.get(r.id) ?? 0,
        promo_discount: r.discount_percentage ?? 0,
        dash_pass: !!r.dash_pass,
      };
      return { id: r.id, features };
    });

  // Sort by relevance so the most useful candidates appear first when sliced.
  // Primary: cuisine affinity × 10 (preferred cuisines first).
  // Secondary: past orders (familiar restaurants bubble up).
  // Tertiary: avg rating.
  candidates.sort((a, b) => {
    const scoreA = a.features.cuisine_affinity_match * 10 +
                   a.features.persona_order_count * 2 +
                   a.features.avg_rating;
    const scoreB = b.features.cuisine_affinity_match * 10 +
                   b.features.persona_order_count * 2 +
                   b.features.avg_rating;
    return scoreB - scoreA;
  });

  return candidates;
}
