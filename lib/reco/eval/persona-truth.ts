// @ts-expect-error — better-sqlite3 ships without types.
import type Database from 'better-sqlite3';
import type {
  ExpectedOverride,
  ExpectedSection,
  ExpectedTask,
  Persona,
  PriceTier,
} from '../types';

export const HOT_CUISINE_THRESHOLD = 2.0;
export const CANDIDATE_RADIUS_MILES = 25;
export const SECTION_SIZE = 4;
export const FAMILIAR_COUNT = 3;

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

function loadPersonaSignals(db: Database, userId: number) {
  const orderRows = db
    .prepare(`SELECT store_id, COUNT(*) AS n FROM orders WHERE user_id = ? GROUP BY store_id`)
    .all(userId) as Array<{ store_id: number; n: number }>;
  const reviewRows = db
    .prepare(`SELECT store_id, rating FROM user_reviews WHERE user_id = ?`)
    .all(userId) as Array<{ store_id: number; rating: number }>;

  const ordersByStore = new Map<number, number>();
  for (const r of orderRows) ordersByStore.set(r.store_id, r.n);

  const blocked = new Set<number>();
  for (const r of reviewRows) if (r.rating <= 2) blocked.add(r.store_id);

  const orderRestaurants = db
    .prepare(
      `SELECT DISTINCT r.id, r.cuisine
       FROM orders o JOIN restaurants r ON r.id = o.store_id
       WHERE o.user_id = ?`,
    )
    .all(userId) as OrderedRestRow[];

  return { ordersByStore, blocked, orderRestaurants };
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

export function buildExpected(persona: Persona, db: Database): ExpectedTask {
  const { ordersByStore, blocked, orderRestaurants } = loadPersonaSignals(db, persona.user_id);
  const avgRatings = loadAvgRatings(db);

  // Candidate pool — near, in the persona's price tier, not blocked.
  const candidates = loadCandidatePool(db, persona).filter((r) => !blocked.has(r.id));

  // family.kid_friendly_required deferred — the v1 heuristic
  // (`menu_item.name LIKE '%kid%'`) was too narrow (55 of 594 restaurants
  // qualified) and collapsed family-persona sections to zero. Will revisit
  // when the catalog has a real kid-friendly tag. See design.md.

  // Hot cuisines: affinity × historical order count.
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

  // Build one section per hot cuisine.
  const sections: ExpectedSection[] = [];
  for (const { cuisine } of hot) {
    // Familiar: persona's ordered restaurants in this cuisine, by order count desc.
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
    const familiar = familiarDedup.slice(0, FAMILIAR_COUNT);

    // Novel: candidate-pool restaurants of this cuisine the persona has never ordered.
    const novelPool = candidates
      .filter((r) => r.cuisine === cuisine && !ordersByStore.has(r.id))
      .map((r) => ({ id: r.id, rating: avgRatings.get(r.id) ?? 0, featured: r.featured ?? 0 }))
      .sort((a, b) => b.rating - a.rating || b.featured - a.featured);
    const novelCount = SECTION_SIZE - familiar.length;
    const novel = novelPool.slice(0, Math.max(1, Math.min(novelCount, novelPool.length)));

    // Filler: if `familiar` short and there are highest-rated candidates left.
    const usedIds = new Set<number>([
      ...familiar.map((f) => f.id),
      ...novel.map((n) => n.id),
    ]);
    const remaining = SECTION_SIZE - familiar.length - novel.length;
    const filler =
      remaining > 0
        ? candidates
            .filter((r) => r.cuisine === cuisine && !usedIds.has(r.id))
            .map((r) => ({ id: r.id, rating: avgRatings.get(r.id) ?? 0 }))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, remaining)
        : [];

    const ranked = [
      ...familiar.map((f) => f.id),
      ...filler.map((f) => f.id),
      ...novel.map((n) => n.id),
    ];

    // Need at least one familiar + one novel for the section to be useful.
    if (familiar.length === 0 || novel.length === 0) continue;
    if (ranked.length < 2) continue;

    const novelty_index = familiar.length + filler.length;

    sections.push({
      label: `More ${cuisine} for you`,
      cuisine,
      ranked_restaurant_ids: ranked,
      novelty_index,
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
): ExpectedTask {
  const base = buildExpected(persona, db);
  const override = overridesByPersonaId[persona.id];
  return override ? applyOverride(base, override) : base;
}
