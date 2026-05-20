/**
 * Recommendation metrics. All functions take a `predicted` list (ranked,
 * higher = better) and an `expected` set, and return a number in [0, 1]
 * — except MRR which is in (0, 1] (1/rank) and 0 if no hit.
 *
 * Binary relevance only for now: an item is either expected or not. We
 * keep the API surface small until a real engine needs graded relevance.
 */

export interface PerTaskMetrics {
  hitAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  mrr: number;
  /** How many of the top-k predictions were in the expected set. */
  hitsCount: number;
  /** Was the first expected id present anywhere in the predicted list? */
  anyHit: boolean;
}

export interface AggregateMetrics {
  hitAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  mrr: number;
  /** Catalog coverage: |union of predicted ids| / |catalogSize|. */
  coverage: number;
  /** Number of tasks aggregated. */
  n: number;
}

export function hitAtK(predicted: string[], expected: ReadonlySet<string>, k: number): number {
  if (k <= 0 || expected.size === 0) return 0;
  return predicted.slice(0, k).some(id => expected.has(id)) ? 1 : 0;
}

export function recallAtK(
  predicted: string[],
  expected: ReadonlySet<string>,
  k: number
): number {
  if (expected.size === 0) return 0;
  const top = predicted.slice(0, k);
  let hits = 0;
  for (const id of top) if (expected.has(id)) hits++;
  return hits / expected.size;
}

export function ndcgAtK(
  predicted: string[],
  expected: ReadonlySet<string>,
  k: number
): number {
  if (k <= 0 || expected.size === 0) return 0;
  let dcg = 0;
  for (let i = 0; i < Math.min(k, predicted.length); i++) {
    if (expected.has(predicted[i])) {
      // rel=1 for relevant items, 0 otherwise. log2(i+2) because rank is 1-indexed.
      dcg += 1 / Math.log2(i + 2);
    }
  }
  // Ideal DCG: as many relevant items as we can fit in k, ranked first.
  const idealHits = Math.min(expected.size, k);
  let idcg = 0;
  for (let i = 0; i < idealHits; i++) idcg += 1 / Math.log2(i + 2);
  return idcg === 0 ? 0 : dcg / idcg;
}

export function mrr(predicted: string[], expected: ReadonlySet<string>): number {
  for (let i = 0; i < predicted.length; i++) {
    if (expected.has(predicted[i])) return 1 / (i + 1);
  }
  return 0;
}

export function scoreTask(
  predicted: string[],
  expectedIds: string[],
  k: number
): PerTaskMetrics {
  const expected = new Set(expectedIds);
  const topK = predicted.slice(0, k);
  let hitsCount = 0;
  for (const id of topK) if (expected.has(id)) hitsCount++;
  return {
    hitAtK: hitAtK(predicted, expected, k),
    recallAtK: recallAtK(predicted, expected, k),
    ndcgAtK: ndcgAtK(predicted, expected, k),
    mrr: mrr(predicted, expected),
    hitsCount,
    anyHit: predicted.some(id => expected.has(id)),
  };
}

export function aggregate(
  perTask: PerTaskMetrics[],
  allPredictedIds: Iterable<string>,
  catalogSize: number
): AggregateMetrics {
  const n = perTask.length;
  if (n === 0) {
    return { hitAtK: 0, recallAtK: 0, ndcgAtK: 0, mrr: 0, coverage: 0, n: 0 };
  }
  const sum = perTask.reduce(
    (acc, m) => ({
      hitAtK: acc.hitAtK + m.hitAtK,
      recallAtK: acc.recallAtK + m.recallAtK,
      ndcgAtK: acc.ndcgAtK + m.ndcgAtK,
      mrr: acc.mrr + m.mrr,
    }),
    { hitAtK: 0, recallAtK: 0, ndcgAtK: 0, mrr: 0 }
  );
  const unique = new Set<string>();
  for (const id of allPredictedIds) unique.add(id);
  return {
    hitAtK: sum.hitAtK / n,
    recallAtK: sum.recallAtK / n,
    ndcgAtK: sum.ndcgAtK / n,
    mrr: sum.mrr / n,
    coverage: catalogSize > 0 ? unique.size / catalogSize : 0,
    n,
  };
}
