import type { ExpectedTask } from './types';

export type ScoreResult = {
  precision_at_k: number;
  recall_at_k: number;
  ndcg_at_k: number;
  overlap: number;
  blocked_hits: number;
};

function computeDcg(ranked: number[], relevant: Set<number>): number {
  let dcg = 0;
  for (let i = 0; i < ranked.length; i++) {
    if (relevant.has(ranked[i])) dcg += 1 / Math.log2(i + 2);
  }
  return dcg;
}

function computeIdcg(k: number, relevantCount: number): number {
  const n = Math.min(k, relevantCount);
  let idcg = 0;
  for (let i = 0; i < n; i++) idcg += 1 / Math.log2(i + 2);
  return idcg;
}

export function scoreTask(ranked_ids: number[], expected: ExpectedTask, k?: number): ScoreResult {
  const kk = k ?? ranked_ids.length;
  const relevant = new Set(expected.flat_ranked_ids);
  const blocked = new Set(expected.blocked_restaurant_ids);
  const topK = ranked_ids.slice(0, kk);

  const hits = topK.filter((id) => relevant.has(id)).length;
  const precision_at_k = kk > 0 ? hits / kk : 0;
  const recall_at_k = relevant.size > 0 ? hits / relevant.size : 0;

  const dcg = computeDcg(topK, relevant);
  const idcg = computeIdcg(kk, relevant.size);
  const ndcg_at_k = idcg > 0 ? dcg / idcg : 0;

  const union = relevant.size + kk - hits;
  const overlap = union > 0 ? hits / union : 0;

  const blocked_hits = topK.filter((id) => blocked.has(id)).length;

  return { precision_at_k, recall_at_k, ndcg_at_k, overlap, blocked_hits };
}

export function aggregate(results: ScoreResult[]): ScoreResult {
  if (results.length === 0) {
    return { precision_at_k: 0, recall_at_k: 0, ndcg_at_k: 0, overlap: 0, blocked_hits: 0 };
  }
  const n = results.length;
  return {
    precision_at_k: results.reduce((s, r) => s + r.precision_at_k, 0) / n,
    recall_at_k: results.reduce((s, r) => s + r.recall_at_k, 0) / n,
    ndcg_at_k: results.reduce((s, r) => s + r.ndcg_at_k, 0) / n,
    overlap: results.reduce((s, r) => s + r.overlap, 0) / n,
    blocked_hits: results.reduce((s, r) => s + r.blocked_hits, 0),
  };
}
