/**
 * Wire contract types — duplicates `lib/reco/types.ts`. Mirrors the
 * pattern in `tools/reco-engines/common/models.py`. Authoritative
 * description: `docs/reco-http-contract.md`.
 */

export type RecoSurface = 'home_feed' | 'home_promo' | 'search' | 'store_items';
export type RecoItemKind = 'restaurant' | 'item';

export interface RecoItem {
  id: string;
  score: number;
  kind: RecoItemKind;
  meta?: Record<string, unknown>;
}

export interface RecoContext {
  userId?: string;
  lat: number;
  lng: number;
  surface: RecoSurface;
  candidatePool?: string[];
  k: number;
  now?: string;
  recentOrderIds?: string[];
  /** Agent track: task lookup + target URL. Ignored by non-agent engines. */
  taskId?: string;
  startUrl?: string;
  /** BYO-LLM gateway URL + key. Phase 5. */
  agentLlmUrl?: string;
  agentLlmApiKey?: string;
}

export interface RecommendationResponse {
  items: RecoItem[];
  engine: string;
  version: string;
  latencyMs: number;
  debug?: Record<string, unknown>;
}
