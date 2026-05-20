import { describe, it, expect } from 'vitest';
import {
  hitAtK,
  recallAtK,
  ndcgAtK,
  mrr,
  scoreTask,
  aggregate,
} from '@/lib/reco/metrics';

const expectedSet = (...ids: string[]) => new Set(ids);

describe('reco/metrics', () => {
  describe('hitAtK', () => {
    it('returns 1 when any expected id is in the top k', () => {
      expect(hitAtK(['a', 'b', 'c'], expectedSet('c'), 3)).toBe(1);
    });
    it('returns 0 when no expected id is in the top k', () => {
      expect(hitAtK(['a', 'b', 'c'], expectedSet('z'), 3)).toBe(0);
    });
    it('respects k as a cap', () => {
      expect(hitAtK(['a', 'b', 'c'], expectedSet('c'), 2)).toBe(0);
    });
    it('returns 0 on empty expected', () => {
      expect(hitAtK(['a'], expectedSet(), 3)).toBe(0);
    });
  });

  describe('recallAtK', () => {
    it('counts hits over expected size', () => {
      expect(recallAtK(['a', 'b', 'c'], expectedSet('a', 'c'), 3)).toBeCloseTo(1.0);
    });
    it('partial recall', () => {
      expect(recallAtK(['a', 'x', 'y'], expectedSet('a', 'b'), 3)).toBeCloseTo(0.5);
    });
  });

  describe('ndcgAtK', () => {
    it('is 1 when the expected item is ranked first', () => {
      expect(ndcgAtK(['a', 'b'], expectedSet('a'), 2)).toBeCloseTo(1);
    });
    it('penalizes lower ranks (1/log2(rank+1))', () => {
      // expected at rank 2: dcg = 1/log2(3), idcg = 1/log2(2) = 1
      const v = ndcgAtK(['x', 'a'], expectedSet('a'), 2);
      expect(v).toBeCloseTo(1 / Math.log2(3));
    });
    it('returns 0 on miss', () => {
      expect(ndcgAtK(['x', 'y'], expectedSet('a'), 2)).toBe(0);
    });
  });

  describe('mrr', () => {
    it('1/rank of first hit', () => {
      expect(mrr(['x', 'a', 'b'], expectedSet('a'))).toBeCloseTo(0.5);
    });
    it('0 if no hit', () => {
      expect(mrr(['x', 'y'], expectedSet('a'))).toBe(0);
    });
  });

  describe('scoreTask', () => {
    it('packages the metrics together', () => {
      const m = scoreTask(['a', 'b', 'c'], ['a'], 3);
      expect(m.hitAtK).toBe(1);
      expect(m.recallAtK).toBe(1);
      expect(m.ndcgAtK).toBeCloseTo(1);
      expect(m.mrr).toBeCloseTo(1);
      expect(m.hitsCount).toBe(1);
      expect(m.anyHit).toBe(true);
    });
  });

  describe('aggregate', () => {
    it('averages per-task metrics and computes coverage', () => {
      const t1 = scoreTask(['a', 'b'], ['a'], 2);
      const t2 = scoreTask(['c', 'd'], ['z'], 2);
      const agg = aggregate([t1, t2], ['a', 'b', 'c', 'd'], 10);
      expect(agg.n).toBe(2);
      expect(agg.hitAtK).toBeCloseTo(0.5);
      expect(agg.coverage).toBeCloseTo(0.4);
    });
    it('handles empty input', () => {
      const agg = aggregate([], [], 10);
      expect(agg.n).toBe(0);
      expect(agg.hitAtK).toBe(0);
    });
  });
});
