import type { Persona, RecoTrajectory } from '../../../lib/reco/types';
import { INDEX_NAME } from './index-schema';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL ?? 'http://localhost:9200';
const DEFAULT_TOP_K = 20;

export type RecommendRequest = {
  personaId: string;
  topK?: number;
};

export type RecommendResponse = {
  engine: 'opensearch';
  personaId: string;
  ranked_ids: number[];
  trajectory: RecoTrajectory;
};

type OSHit = {
  _id: string;
  _score: number;
  _source: { id: number };
  _explanation?: unknown;
};

type OSSearchResponse = {
  hits: { hits: OSHit[] };
};

async function osRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${OPENSEARCH_URL}${path}`, {
    method: body !== undefined ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenSearch ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function recommend(
  persona: Persona,
  req: RecommendRequest
): Promise<RecommendResponse> {
  const topK = req.topK ?? DEFAULT_TOP_K;
  const { cuisine_affinity } = persona.preferences;
  const city = persona.address.city;

  // Build per-cuisine weight functions (affinity × 10 so scores are human-readable)
  const cuisineFunctions = Object.entries(cuisine_affinity).map(([cuisine, affinity]) => ({
    filter: { term: { cuisine } },
    weight: affinity * 10,
  }));

  const query = {
    size: topK,
    explain: true,
    query: {
      function_score: {
        query: { term: { city } },
        functions: [
          ...cuisineFunctions,
          {
            field_value_factor: {
              field: 'avg_rating',
              factor: 0.5,
              modifier: 'none',
              missing: 4.0,
            },
          },
        ],
        score_mode: 'sum',
        boost_mode: 'replace',
      },
    },
  };

  const result = await osRequest<OSSearchResponse>(`/${INDEX_NAME}/_search`, query);
  const hits = result.hits.hits;

  const ranked_ids = hits.map((h) => h._source.id);
  const scores: Record<number, number> = {};
  for (const h of hits) scores[h._source.id] = h._score;

  const trajectory: RecoTrajectory = {
    engine: 'opensearch',
    steps: [
      {
        stage: 'query',
        restaurant_ids: [],
        notes: JSON.stringify(query.query),
      },
      {
        stage: 'candidate_gen',
        restaurant_ids: ranked_ids,
        notes: `city=${city}, topK=${topK}`,
      },
      {
        stage: 'score',
        restaurant_ids: ranked_ids,
        scores,
        notes: `function_score: cuisine affinity×10 + avg_rating×0.5`,
      },
      {
        stage: 'final',
        restaurant_ids: ranked_ids,
      },
    ],
    raw_explain: hits.map((h) => ({ id: h._source.id, score: h._score, explanation: h._explanation })),
  };

  return { engine: 'opensearch', personaId: req.personaId, ranked_ids, trajectory };
}
