import { describe, expect, it } from 'vitest';
import { aggregate, scoreTask } from '@/lib/reco/metrics';
import type { ExpectedTask } from '@/lib/reco/types';

function makeExpected(
  flat_ranked_ids: number[],
  blocked_restaurant_ids: number[] = []
): ExpectedTask {
  return {
    personaId: 'test',
    surface: 'home_feed',
    sections: [],
    flat_ranked_ids,
    blocked_restaurant_ids,
  };
}

describe('scoreTask', () => {
  it('exact ranking → perfect scores', () => {
    const expected = makeExpected([1, 2, 3, 4]);
    const result = scoreTask([1, 2, 3, 4], expected);
    expect(result.precision_at_k).toBeCloseTo(1);
    expect(result.recall_at_k).toBeCloseTo(1);
    expect(result.ndcg_at_k).toBeCloseTo(1);
    expect(result.overlap).toBeCloseTo(1);
    expect(result.blocked_hits).toBe(0);
  });

  it('irrelevant item in top position → NDCG < 1', () => {
    // 99 is not relevant — pushes relevant items to lower ranks, lowering DCG
    const expected = makeExpected([1, 2, 3, 4]);
    const result = scoreTask([99, 1, 2, 3], expected);
    expect(result.ndcg_at_k).toBeLessThan(1);
    expect(result.blocked_hits).toBe(0);
  });

  it('partial overlap → recall < 1', () => {
    const expected = makeExpected([1, 2, 3, 4, 5, 6, 7, 8]);
    const result = scoreTask([1, 2, 3, 4], expected);
    expect(result.precision_at_k).toBeCloseTo(1);
    expect(result.recall_at_k).toBeCloseTo(0.5);
    expect(result.blocked_hits).toBe(0);
  });

  it('no overlap → zeros', () => {
    const expected = makeExpected([1, 2, 3]);
    const result = scoreTask([7, 8, 9], expected);
    expect(result.precision_at_k).toBe(0);
    expect(result.recall_at_k).toBe(0);
    expect(result.ndcg_at_k).toBe(0);
    expect(result.overlap).toBe(0);
  });

  it('blocked hit → blocked_hits > 0', () => {
    const expected = makeExpected([1, 2, 3], [99]);
    const result = scoreTask([99, 1, 2, 3], expected);
    expect(result.blocked_hits).toBe(1);
  });

  it('multiple blocked hits counted correctly', () => {
    const expected = makeExpected([1, 2], [98, 99]);
    const result = scoreTask([98, 99, 1, 2], expected);
    expect(result.blocked_hits).toBe(2);
  });

  it('no relevant items → all zeros', () => {
    const expected = makeExpected([]);
    const result = scoreTask([1, 2, 3], expected);
    expect(result.precision_at_k).toBe(0);
    expect(result.recall_at_k).toBe(0);
    expect(result.ndcg_at_k).toBe(0);
    expect(result.blocked_hits).toBe(0);
  });

  it('empty ranked list → zeros', () => {
    const expected = makeExpected([1, 2, 3]);
    const result = scoreTask([], expected);
    expect(result.precision_at_k).toBe(0);
    expect(result.recall_at_k).toBe(0);
    expect(result.ndcg_at_k).toBe(0);
    expect(result.blocked_hits).toBe(0);
  });

  it('k parameter limits the window evaluated', () => {
    const expected = makeExpected([1, 2, 3, 4]);
    // Top-2 are irrelevant; relevant items at positions 3 and 4
    const result = scoreTask([9, 8, 1, 2], expected, 2);
    expect(result.precision_at_k).toBe(0);
    expect(result.recall_at_k).toBe(0);
  });

  it('k larger than ranked list: precision denominator is k, recall uses actual hits', () => {
    // 2 ranked, k=100: precision@100 = 2/100 = 0.02; recall = 2/2 = 1
    const expected = makeExpected([1, 2]);
    const result = scoreTask([1, 2], expected, 100);
    expect(result.precision_at_k).toBeCloseTo(0.02);
    expect(result.recall_at_k).toBeCloseTo(1);
  });
});

describe('aggregate', () => {
  it('empty array → zeros', () => {
    const result = aggregate([]);
    expect(result.precision_at_k).toBe(0);
    expect(result.blocked_hits).toBe(0);
  });

  it('single result → same values', () => {
    const r = { precision_at_k: 0.8, recall_at_k: 0.6, ndcg_at_k: 0.7, overlap: 0.5, blocked_hits: 1 };
    const result = aggregate([r]);
    expect(result.precision_at_k).toBeCloseTo(0.8);
    expect(result.blocked_hits).toBe(1);
  });

  it('averages rate metrics and sums blocked_hits', () => {
    const r1 = { precision_at_k: 1.0, recall_at_k: 1.0, ndcg_at_k: 1.0, overlap: 1.0, blocked_hits: 2 };
    const r2 = { precision_at_k: 0.0, recall_at_k: 0.0, ndcg_at_k: 0.0, overlap: 0.0, blocked_hits: 1 };
    const result = aggregate([r1, r2]);
    expect(result.precision_at_k).toBeCloseTo(0.5);
    expect(result.recall_at_k).toBeCloseTo(0.5);
    expect(result.ndcg_at_k).toBeCloseTo(0.5);
    expect(result.overlap).toBeCloseTo(0.5);
    expect(result.blocked_hits).toBe(3);
  });
});
