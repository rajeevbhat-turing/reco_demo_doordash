import { describe, it, expect } from 'vitest';
import { applyRanking } from '@/lib/reco/utils/apply-ranking';

const r = (id: string) => ({ id });

describe('applyRanking', () => {
  it('returns the original list when rankedIds is empty', () => {
    expect(applyRanking([r('a'), r('b')], [])).toEqual([r('a'), r('b')]);
    expect(applyRanking([r('a'), r('b')], null)).toEqual([r('a'), r('b')]);
    expect(applyRanking([r('a'), r('b')], undefined)).toEqual([r('a'), r('b')]);
  });

  it('hoists ranked ids to the front in their given order', () => {
    expect(applyRanking([r('a'), r('b'), r('c')], ['c', 'a'])).toEqual([
      r('c'),
      r('a'),
      r('b'),
    ]);
  });

  it('ignores ranked ids that are not in the original list', () => {
    expect(applyRanking([r('a'), r('b')], ['z', 'b'])).toEqual([r('b'), r('a')]);
  });

  it('never drops an item', () => {
    const out = applyRanking([r('a'), r('b'), r('c'), r('d')], ['d']);
    expect(out.map(x => x.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('deduplicates ranked ids', () => {
    expect(applyRanking([r('a'), r('b')], ['a', 'a', 'b'])).toEqual([r('a'), r('b')]);
  });
});
