// @ts-expect-error — better-sqlite3 ships without types.
import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';

import type { ExpectedOverride, Persona } from '@/lib/reco/types';
import {
  applyOverride,
  buildExpected,
  buildExpectedWithOverrides,
  HOT_CUISINE_THRESHOLD,
} from '@/lib/reco/eval/persona-truth';

/**
 * Builds a tiny in-memory DB with the minimal schema buildExpected reads.
 */
function buildTestDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE restaurants (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      price_range INTEGER NOT NULL,
      latitude REAL,
      longitude REAL,
      dash_pass INTEGER DEFAULT 0,
      discount_percentage INTEGER,
      featured INTEGER DEFAULT 0
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL
    );
    CREATE TABLE user_reviews (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      store_category TEXT NOT NULL,
      rating REAL NOT NULL,
      approval_status TEXT NOT NULL DEFAULT 'approved'
    );
    CREATE TABLE menu_categories (
      id INTEGER PRIMARY KEY,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL
    );
    CREATE TABLE menu_items (
      id INTEGER PRIMARY KEY,
      restaurant_id INTEGER NOT NULL,
      name TEXT NOT NULL
    );
  `);
  return db;
}

/** Convenience: a persona living at (0, 0) — restaurants near (0, 0) are in range. */
function makePersona(overrides: Partial<Persona> = {}): Persona {
  return {
    id: 'test-persona',
    user_id: 9000,
    display_name: 'Test Persona',
    email: 'test@personas.demo',
    address: {
      label: 'Home',
      line1: '1 Test St',
      city: 'Testville',
      state: 'CA',
      zip: '00000',
      lat: 0,
      lng: 0,
      default: true,
    },
    story: 'fixture',
    preferences: {
      cuisine_affinity: { Thai: 0.9 },
      price_tier: 'mid',
      dietary: [],
      spice_tolerance: 'medium',
      novelty_appetite: 0.5,
      delivery_time_tolerance: 'quick',
      promo_sensitivity: 'mid',
    },
    family: null,
    ...overrides,
  };
}

function seedRestaurant(
  db: any,
  args: { id: number; name: string; cuisine: string; price?: number; lat?: number; lng?: number; featured?: number },
) {
  db.prepare(
    `INSERT INTO restaurants (id, name, cuisine, price_range, latitude, longitude, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    args.id,
    args.name,
    args.cuisine,
    args.price ?? 2,
    args.lat ?? 0,
    args.lng ?? 0,
    args.featured ?? 0,
  );
}

function addOrders(db: any, userId: number, storeId: number, n: number) {
  const stmt = db.prepare(`INSERT INTO orders (user_id, store_id) VALUES (?, ?)`);
  for (let i = 0; i < n; i++) stmt.run(userId, storeId);
}

function addReview(db: any, userId: number, storeId: number, rating: number) {
  db.prepare(
    `INSERT INTO user_reviews (user_id, store_id, store_category, rating, approval_status)
     VALUES (?, ?, 'restaurant', ?, 'approved')`,
  ).run(userId, storeId, rating);
}

describe('buildExpected', () => {
  it('blocks restaurants the persona rated ≤ 2★', () => {
    const db = buildTestDb();
    // 4 familiar Thai places, one of which is rated 1.5★ → must be blocked.
    seedRestaurant(db, { id: 1, name: 'Thai A', cuisine: 'Thai' });
    seedRestaurant(db, { id: 2, name: 'Thai B', cuisine: 'Thai' });
    seedRestaurant(db, { id: 3, name: 'Thai C', cuisine: 'Thai' });
    seedRestaurant(db, { id: 4, name: 'Thai D (bad)', cuisine: 'Thai' });
    seedRestaurant(db, { id: 5, name: 'Thai E (novel)', cuisine: 'Thai', featured: 1 });
    addOrders(db, 9000, 1, 5);
    addOrders(db, 9000, 2, 3);
    addOrders(db, 9000, 3, 2);
    addOrders(db, 9000, 4, 1);
    addReview(db, 9000, 4, 1.5); // negative → blocks 4

    const exp = buildExpected(makePersona(), db);

    expect(exp.blocked_restaurant_ids).toEqual([4]);
    expect(exp.flat_ranked_ids).not.toContain(4);
    expect(exp.sections[0].ranked_restaurant_ids).not.toContain(4);
  });

  it('omits cuisines below HOT_CUISINE_THRESHOLD', () => {
    const db = buildTestDb();
    seedRestaurant(db, { id: 1, name: 'Thai A', cuisine: 'Thai' });
    seedRestaurant(db, { id: 2, name: 'Italian A', cuisine: 'Italian' });
    seedRestaurant(db, { id: 3, name: 'Italian B (novel)', cuisine: 'Italian' });
    seedRestaurant(db, { id: 4, name: 'Thai B (novel)', cuisine: 'Thai' });
    // Thai: 0.9 × 5 = 4.5 (hot). Italian: 0.4 × 1 = 0.4 (cold).
    addOrders(db, 9000, 1, 5);
    addOrders(db, 9000, 2, 1);

    const exp = buildExpected(
      makePersona({
        preferences: {
          ...makePersona().preferences,
          cuisine_affinity: { Thai: 0.9, Italian: 0.4 },
        },
      }),
      db,
    );
    const cuisines = exp.sections.map((s) => s.cuisine);
    expect(cuisines).toContain('Thai');
    expect(cuisines).not.toContain('Italian');
  });

  it('section has 3 familiar + 1 new with novelty_index pointing at the new one', () => {
    const db = buildTestDb();
    seedRestaurant(db, { id: 1, name: 'Fam1', cuisine: 'Thai' });
    seedRestaurant(db, { id: 2, name: 'Fam2', cuisine: 'Thai' });
    seedRestaurant(db, { id: 3, name: 'Fam3', cuisine: 'Thai' });
    seedRestaurant(db, { id: 4, name: 'New1', cuisine: 'Thai', featured: 1 });
    addOrders(db, 9000, 1, 4);
    addOrders(db, 9000, 2, 3);
    addOrders(db, 9000, 3, 2);

    const exp = buildExpected(makePersona(), db);

    expect(exp.sections).toHaveLength(1);
    const sec = exp.sections[0];
    expect(sec.ranked_restaurant_ids).toEqual([1, 2, 3, 4]);
    expect(sec.novelty_index).toBe(3);
    // The novelty slot is a restaurant the persona never ordered from.
    expect([4]).toContain(sec.ranked_restaurant_ids[sec.novelty_index]);
  });

  it('respects the candidate radius (15 mi default)', () => {
    const db = buildTestDb();
    // ~1100 mi away — outside radius.
    seedRestaurant(db, { id: 1, name: 'Near Fam', cuisine: 'Thai', lat: 0, lng: 0 });
    seedRestaurant(db, { id: 2, name: 'Far New', cuisine: 'Thai', lat: 16, lng: 0 });
    addOrders(db, 9000, 1, 5);

    const exp = buildExpected(makePersona(), db);
    // No "new" candidate in range → section dropped (need both familiar + new).
    expect(exp.sections).toHaveLength(0);
  });

  it('threshold is exactly 2.0 — score = 2.0 is hot, score < 2.0 is not', () => {
    expect(HOT_CUISINE_THRESHOLD).toBe(2.0);
  });
});

describe('applyOverride', () => {
  const base = {
    personaId: 'p1',
    surface: 'home_feed' as const,
    sections: [
      {
        label: 'orig',
        cuisine: 'Thai',
        ranked_restaurant_ids: [1, 2, 3, 4],
        novelty_index: 3,
      },
    ],
    blocked_restaurant_ids: [9],
    flat_ranked_ids: [1, 2, 3, 4],
  };

  it('replaces sections wholesale when present', () => {
    const ov: ExpectedOverride = {
      sections: [
        { label: 'patched', cuisine: 'Thai', ranked_restaurant_ids: [99], novelty_index: 0 },
      ],
    };
    const out = applyOverride(base, ov);
    expect(out.sections).toEqual(ov.sections);
    expect(out.blocked_restaurant_ids).toEqual([9]);
    expect(out.flat_ranked_ids).toEqual([1, 2, 3, 4]);
  });

  it('replaces blocked_restaurant_ids when present, otherwise keeps base', () => {
    const out1 = applyOverride(base, { blocked_restaurant_ids: [42] });
    expect(out1.blocked_restaurant_ids).toEqual([42]);
    const out2 = applyOverride(base, {});
    expect(out2.blocked_restaurant_ids).toEqual([9]);
  });

  it('buildExpectedWithOverrides applies override when keyed by personaId', () => {
    const db = buildTestDb();
    seedRestaurant(db, { id: 1, name: 'Fam', cuisine: 'Thai' });
    seedRestaurant(db, { id: 2, name: 'New', cuisine: 'Thai' });
    addOrders(db, 9000, 1, 5);

    const persona = makePersona();
    const overrides: Record<string, ExpectedOverride> = {
      [persona.id]: { blocked_restaurant_ids: [777] },
    };
    const out = buildExpectedWithOverrides(persona, db, overrides);
    expect(out.blocked_restaurant_ids).toEqual([777]);
  });
});
