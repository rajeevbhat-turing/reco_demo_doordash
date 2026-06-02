// @ts-expect-error — better-sqlite3 ships without types.
import type Database from 'better-sqlite3';
import type {
  ExpectedOverride,
  ExpectedSection,
  ExpectedTask,
  FilterEntry,
  Persona,
  PriceTier,
} from '../types';
import type { AdjacencyMap } from '../adjacency';
import { adjacentCuisines } from '../adjacency';

// ── Tunable constants ─────────────────────────────────────────────────────────

export const HOT_CUISINE_THRESHOLD = 2.0;
export const CANDIDATE_RADIUS_MILES = 25;
export const SECTION_SIZE = 4;

/** @deprecated superseded by exploreCount() */
export const FAMILIAR_COUNT = 3;

// 8a — outlier cleaning
export const OUTLIER_BASKET_MAD_K = 6.0;
export const MIN_CUISINE_SUPPORT = 2;

// 8b — adaptive exploration ratio
export const EXPLORE_HI = 0.66;
export const EXPLORE_LO = 0.33;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the number of explore slots for a persona's novelty_appetite.
 * Explorer (≥ EXPLORE_HI): 3 explore / 1 familiar
 * Mid (EXPLORE_LO ≤ x < EXPLORE_HI): 2 / 2
 * Homebody (< EXPLORE_LO): 1 / 3
 */
export function exploreCount(appetite: number): number {
  if (appetite >= EXPLORE_HI) return 3;
  if (appetite >= EXPLORE_LO) return 2;
  return 1;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mad(arr: number[], med: number): number {
  return median(arr.map((v) => Math.abs(v - med)));
}

// ── Types ─────────────────────────────────────────────────────────────────────

const PRICE_RANGES: Record<PriceTier, number[]> = {
  budget: [1],
  mid: [2],
  premium: [3, 4],
};

type RestRow = {
  id: number;
  name: string;
  cuisine: string;
  price_range: number;
  latitude: number | null;
  longitude: number | null;
  dash_pass: number;
  discount_percentage: number | null;
  featured: number | null;
};

type OrderedRestRow = { id: number; cuisine: string };
type PerOrderRow = { id: number; store_id: number; subtotal: number };

// ── DB helpers ────────────────────────────────────────────────────────────────

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

function loadPersonaSignals(
  db: Database,
  userId: number,
  cuisineAffinity: Record<string, number>,
): {
  ordersByStore: Map<number, number>;
  blocked: Set<number>;
  orderRestaurants: OrderedRestRow[];
  filters: FilterEntry[];
} {
  // Per-order rows (subtotal needed for outlier detection)
  const perOrderRows = db
    .prepare(
      `SELECT id, store_id, subtotal
       FROM orders
       WHERE user_id = ? AND store_category = 'restaurant'`,
    )
    .all(userId) as PerOrderRow[];

  // Cuisine for each ordered-from store
  const storeIds = [...new Set(perOrderRows.map((r) => r.store_id))];
  const storeCuisineMap = new Map<number, string>();
  if (storeIds.length > 0) {
    const placeholders = storeIds.map(() => '?').join(',');
    (
      db
        .prepare(`SELECT id, cuisine FROM restaurants WHERE id IN (${placeholders})`)
        .all(...storeIds) as Array<{ id: number; cuisine: string }>
    ).forEach((r) => storeCuisineMap.set(r.id, r.cuisine));
  }

  // Reviews → blocked stores (rating ≤ 2)
  const blocked = new Set<number>();
  (
    db
      .prepare(`SELECT store_id, rating FROM user_reviews WHERE user_id = ?`)
      .all(userId) as Array<{ store_id: number; rating: number }>
  ).forEach((r) => {
    if (r.rating <= 2) blocked.add(r.store_id);
  });

  // 8a.2 — Basket-size outlier filter
  const filters: FilterEntry[] = [];
  const subtotals = perOrderRows.map((r) => r.subtotal);
  const med = median(subtotals);
  const m = mad(subtotals, med);
  const outlierThreshold = m === 0 ? Infinity : med + OUTLIER_BASKET_MAD_K * m;

  const keptOrders: PerOrderRow[] = [];
  for (const o of perOrderRows) {
    if (o.subtotal > outlierThreshold) {
      const ratio = med > 0 ? (o.subtotal / med).toFixed(1) : '?';
      filters.push({
        order_id: o.id,
        reason: `order #${o.id}: ${ratio}× median basket — outlier`,
      });
    } else {
      keptOrders.push(o);
    }
  }

  // Count kept orders per store
  const ordersByStore = new Map<number, number>();
  for (const o of keptOrders) {
    ordersByStore.set(o.store_id, (ordersByStore.get(o.store_id) ?? 0) + 1);
  }

  // Count kept orders per cuisine
  const keptByCuisine = new Map<string, number>();
  for (const [storeId, n] of ordersByStore) {
    const cuisine = storeCuisineMap.get(storeId);
    if (cuisine) keptByCuisine.set(cuisine, (keptByCuisine.get(cuisine) ?? 0) + n);
  }

  // 8a.3 — Cuisine one-off filter (from familiar, may still seed explore)
  const excludedCuisines = new Set<string>();
  for (const [cuisine, n] of keptByCuisine) {
    if (n < MIN_CUISINE_SUPPORT) {
      filters.push({
        cuisine,
        reason: `${cuisine}: only ${n} order — below support, not familiar`,
      });
      excludedCuisines.add(cuisine);
    }
  }

  // Remove excluded-cuisine stores from ordersByStore (familiar won't use them)
  for (const storeId of [...ordersByStore.keys()]) {
    const cuisine = storeCuisineMap.get(storeId);
    if (cuisine && excludedCuisines.has(cuisine)) ordersByStore.delete(storeId);
  }

  // orderRestaurants: distinct stores with kept orders in supported cuisines
  const orderRestaurants: OrderedRestRow[] = [];
  for (const [storeId] of ordersByStore) {
    const cuisine = storeCuisineMap.get(storeId);
    if (cuisine) orderRestaurants.push({ id: storeId, cuisine });
  }

  // 8a.4 — Affinity vs behavior mismatch (annotation only, no exclusion)
  for (const [cuisine, affinity] of Object.entries(cuisineAffinity)) {
    const n = keptByCuisine.get(cuisine) ?? 0;
    if (n > 3 && affinity < 0.1) {
      filters.push({
        cuisine,
        reason: `${cuisine}: ${n} orders but affinity ${affinity.toFixed(2)} — possible misattribution`,
      });
    } else if (affinity > 0.7 && n === 0) {
      filters.push({
        cuisine,
        reason: `${cuisine}: affinity ${affinity.toFixed(2)} but no orders — stated-but-unproven (explore candidate)`,
      });
    }
  }

  return { ordersByStore, blocked, orderRestaurants, filters };
}

function loadCandidatePool(db: Database, persona: Persona): RestRow[] {
  const priceRanges = PRICE_RANGES[persona.preferences.price_tier];
  const rows = db
    .prepare(
      `SELECT id, name, cuisine, price_range, latitude, longitude,
              dash_pass, discount_percentage, featured
       FROM restaurants
       WHERE price_range IN (${priceRanges.join(',')})`,
    )
    .all() as RestRow[];
  return rows.filter((r) => {
    if (r.latitude == null || r.longitude == null) return false;
    const d = haversineMiles(persona.address.lat, persona.address.lng, r.latitude, r.longitude);
    return d <= CANDIDATE_RADIUS_MILES;
  });
}

function loadAvgRatings(db: Database): Map<number, number> {
  const rows = db
    .prepare(
      `SELECT store_id, AVG(rating) AS avg_rating
       FROM user_reviews
       WHERE store_category = 'restaurant' AND approval_status = 'approved'
       GROUP BY store_id`,
    )
    .all() as Array<{ store_id: number; avg_rating: number }>;
  const m = new Map<number, number>();
  for (const r of rows) m.set(r.store_id, r.avg_rating);
  return m;
}

// ── Core rule ─────────────────────────────────────────────────────────────────

export function buildExpected(
  persona: Persona,
  db: Database,
  adjacencyMap: AdjacencyMap = {},
): ExpectedTask {
  const { ordersByStore, blocked, orderRestaurants, filters } = loadPersonaSignals(
    db,
    persona.user_id,
    persona.preferences.cuisine_affinity,
  );
  const avgRatings = loadAvgRatings(db);

  // Candidate pool — near, in the persona's price tier, not blocked.
  const candidates = loadCandidatePool(db, persona).filter((r) => !blocked.has(r.id));

  // family.kid_friendly_required deferred — the v1 heuristic
  // (`menu_item.name LIKE '%kid%'`) was too narrow (55 of 594 restaurants
  // qualified) and collapsed family-persona sections to zero. Will revisit
  // when the catalog has a real kid-friendly tag. See design.md.

  // Hot cuisines: affinity × historical kept-order count.
  const ordersByCuisine = new Map<string, number>();
  for (const r of orderRestaurants) {
    const n = ordersByStore.get(r.id) ?? 0;
    ordersByCuisine.set(r.cuisine, (ordersByCuisine.get(r.cuisine) ?? 0) + n);
  }
  const hot: Array<{ cuisine: string; score: number }> = [];
  for (const [cuisine, affinity] of Object.entries(persona.preferences.cuisine_affinity)) {
    const n = ordersByCuisine.get(cuisine) ?? 0;
    const score = affinity * n;
    if (score >= HOT_CUISINE_THRESHOLD) hot.push({ cuisine, score });
  }
  hot.sort((a, b) => b.score - a.score);

  // 8b — Adaptive exploration ratio
  const explore = exploreCount(persona.preferences.novelty_appetite);
  const familiarN = SECTION_SIZE - explore;

  // Build one section per hot cuisine.
  const sections: ExpectedSection[] = [];
  for (const { cuisine } of hot) {
    // Familiar: persona's ordered (kept) restaurants in this cuisine, by order count desc.
    const familiarRaw = orderRestaurants
      .filter((r) => r.cuisine === cuisine && !blocked.has(r.id))
      .map((r) => ({ id: r.id, orders: ordersByStore.get(r.id) ?? 0 }))
      .sort((a, b) => b.orders - a.orders);
    const familiarDedup: Array<{ id: number; orders: number }> = [];
    const seen = new Set<number>();
    for (const f of familiarRaw) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      familiarDedup.push(f);
    }
    const familiar = familiarDedup.slice(0, familiarN);

    // 8c — Explore-slot fill: (1) new same-cuisine, (2) adjacent-cuisine never tried.
    const orderedStoreIds = new Set(ordersByStore.keys());
    const adjacent = adjacentCuisines(cuisine, adjacencyMap);

    const sameNew = candidates
      .filter((r) => r.cuisine === cuisine && !orderedStoreIds.has(r.id))
      .map((r) => ({ id: r.id, rating: avgRatings.get(r.id) ?? 0, featured: r.featured ?? 0 }))
      .sort((a, b) => b.rating - a.rating || b.featured - a.featured);

    const adjNew = candidates
      .filter((r) => adjacent.includes(r.cuisine) && !orderedStoreIds.has(r.id))
      .map((r) => ({ id: r.id, rating: avgRatings.get(r.id) ?? 0, featured: r.featured ?? 0 }))
      .sort((a, b) => b.rating - a.rating || b.featured - a.featured);

    const explorePool = [...sameNew, ...adjNew];
    const exploreValid = explorePool.map((r) => r.id);

    const exploreNeeded = SECTION_SIZE - familiar.length;
    const exploreSlots = explorePool.slice(0, Math.max(1, Math.min(exploreNeeded, explorePool.length)));

    const ranked = [...familiar.map((f) => f.id), ...exploreSlots.map((e) => e.id)];

    // Need at least one familiar + one explore for the section to be useful.
    if (familiar.length === 0 || exploreSlots.length === 0) continue;
    if (ranked.length < 2) continue;

    const novelty_indices = Array.from(
      { length: exploreSlots.length },
      (_, i) => familiar.length + i,
    );

    sections.push({
      label: `More ${cuisine} for you`,
      cuisine,
      ranked_restaurant_ids: ranked,
      novelty_indices,
      explore_valid_ids: exploreValid,
    });
  }

  const flat: number[] = [];
  for (const s of sections) flat.push(...s.ranked_restaurant_ids);

  return {
    personaId: persona.id,
    surface: 'home_feed',
    sections,
    blocked_restaurant_ids: [...blocked].sort((a, b) => a - b),
    flat_ranked_ids: flat,
    filters: filters.length > 0 ? filters : undefined,
  };
}

export function applyOverride(expected: ExpectedTask, override: ExpectedOverride): ExpectedTask {
  return {
    ...expected,
    ...(override.sections !== undefined ? { sections: override.sections } : {}),
    ...(override.blocked_restaurant_ids !== undefined
      ? { blocked_restaurant_ids: override.blocked_restaurant_ids }
      : {}),
    ...(override.flat_ranked_ids !== undefined
      ? { flat_ranked_ids: override.flat_ranked_ids }
      : {}),
  };
}

export function buildExpectedWithOverrides(
  persona: Persona,
  db: Database,
  overridesByPersonaId: Record<string, ExpectedOverride>,
  adjacencyMap: AdjacencyMap = {},
): ExpectedTask {
  const base = buildExpected(persona, db, adjacencyMap);
  const override = overridesByPersonaId[persona.id];
  return override ? applyOverride(base, override) : base;
}
