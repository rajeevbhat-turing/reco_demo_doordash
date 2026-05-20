import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before the engine imports it.
vi.mock('@/lib/db', () => ({
  db: {
    query: vi.fn(),
    queryOne: vi.fn(),
  },
}));

import { db } from '@/lib/db';
import { popularityEngine } from '@/lib/reco/engines/popularity';

const mockQuery = db.query as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockQuery.mockReset();
});

describe('popularityEngine', () => {
  it('ranks restaurants by rating × log(1+ratingCount), with featured as a tiebreaker', async () => {
    mockQuery.mockResolvedValueOnce([
      // identical popularity strength, only featured differs
      { id: 1, latitude: 0, longitude: 0, featured: 0, new_flag: 0, avg_rating: 4, total_rating_count: 10 },
      { id: 2, latitude: 0, longitude: 0, featured: 1, new_flag: 0, avg_rating: 4, total_rating_count: 10 },
    ]);
    const res = await popularityEngine.recommend({
      lat: 0,
      lng: 0,
      surface: 'home_feed',
      k: 2,
    });
    expect(res.items[0].id).toBe('2'); // featured wins the tie
    expect(res.items[0].score).toBeGreaterThan(res.items[1].score);
  });

  it('high-popularity beats featured-but-low-popularity', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 1, latitude: 0, longitude: 0, featured: 0, new_flag: 0, avg_rating: 5, total_rating_count: 1000 },
      { id: 2, latitude: 0, longitude: 0, featured: 1, new_flag: 0, avg_rating: 3, total_rating_count: 5 },
    ]);
    const res = await popularityEngine.recommend({
      lat: 0,
      lng: 0,
      surface: 'home_feed',
      k: 2,
    });
    // 1: 5 × log(1001) ≈ 34.5;  2: 2 + 3×log(6) ≈ 7.4 — rating wins
    expect(res.items[0].id).toBe('1');
  });

  it('honors the candidate pool', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 1, latitude: 0, longitude: 0, featured: 1, new_flag: 0, avg_rating: 5, total_rating_count: 100 },
      { id: 2, latitude: 0, longitude: 0, featured: 0, new_flag: 0, avg_rating: 4, total_rating_count: 50 },
    ]);
    const res = await popularityEngine.recommend({
      lat: 0,
      lng: 0,
      surface: 'home_feed',
      k: 5,
      candidatePool: ['2'],
    });
    expect(res.items.map(i => i.id)).toEqual(['2']);
  });

  it('filters by distance (10mi radius)', async () => {
    mockQuery.mockResolvedValueOnce([
      // near
      { id: 1, latitude: 37.7749, longitude: -122.4194, featured: 1, new_flag: 0, avg_rating: 5, total_rating_count: 10 },
      // far (Boston when query is SF)
      { id: 2, latitude: 42.3601, longitude: -71.0589, featured: 1, new_flag: 0, avg_rating: 5, total_rating_count: 10 },
    ]);
    const res = await popularityEngine.recommend({
      lat: 37.7749,
      lng: -122.4194,
      surface: 'home_feed',
      k: 5,
    });
    expect(res.items.map(i => i.id)).toEqual(['1']);
  });

  it('returns kind=item on the store_items surface', async () => {
    mockQuery.mockResolvedValueOnce([
      { id: 10, restaurant_id: 1, latitude: 0, longitude: 0, featured: 0, popular: 1, rating: 4.5, rating_count: 50 },
    ]);
    const res = await popularityEngine.recommend({
      lat: 0,
      lng: 0,
      surface: 'store_items',
      k: 5,
    });
    expect(res.items[0].kind).toBe('item');
    expect(res.items[0].meta).toEqual({ restaurantId: '1' });
  });
});
