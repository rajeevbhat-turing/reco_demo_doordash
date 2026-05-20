/**
 * Recommendation engine adapter contract.
 *
 * Every engine — in-repo (popularity, random) or external (Gorse via HTTP,
 * LightFM/Implicit sidecars in Phase 2) — implements `RecommendationEngine`
 * and is registered with `lib/reco/engines/index.ts`.
 *
 * The same JSON shape is the wire contract for HTTP engines: see
 * `docs/reco-http-contract.md` (created with the http adapter).
 */

/** Where in the Dashdoor UI a recommendation will be rendered or scored. */
export type RecoSurface =
  | 'home_feed' // /home main restaurant grid
  | 'home_promo' // /home promo banner carousel
  | 'search' // /search results re-ranking
  | 'store_items'; // /store/[id] popular-items / upsell carousel

/** What kind of entity an engine returns. */
export type RecoItemKind = 'restaurant' | 'item';

/** Single ranked recommendation. */
export interface RecoItem {
  /** Restaurant id (string form of `restaurants.id`) or menu item id. */
  id: string;
  /** Higher is better. Engines may use any scale; the eval runner only uses order. */
  score: number;
  /** What `id` refers to. Determines which catalog the id is looked up in. */
  kind: RecoItemKind;
  /** Optional engine-specific debugging metadata, surfaced in the demo UI. */
  meta?: Record<string, unknown>;
}

/** Input passed to every `recommend()` call. */
export interface RecoContext {
  /** Logged-in user id, when available. Guest evals omit this. */
  userId?: string;
  /** Delivery location used by location-aware engines. */
  lat: number;
  lng: number;
  /** Surface the recommendation will be rendered on / scored against. */
  surface: RecoSurface;
  /**
   * Restrict candidates to this set of ids. Lets the eval runner score
   * engines on the same pool (e.g. "the restaurants within 10 mi"). If
   * omitted, the engine may use its own candidate selection.
   */
  candidatePool?: string[];
  /** How many items to return. Engines may return fewer if they run out. */
  k: number;
  /** Override "now" for time-aware engines (e.g. lunch vs dinner). */
  now?: string; // ISO-8601
  /** Recent order ids for this user, newest first. Optional sequence signal. */
  recentOrderIds?: string[];
}

/** What every `recommend()` call returns, and what HTTP engines must respond with. */
export interface RecommendationResponse {
  items: RecoItem[];
  /** Engine `name` echoed back so a multi-engine eval can audit the wire. */
  engine: string;
  /** Engine version echoed back for reproducibility. */
  version: string;
  /** Wall-clock latency the engine spent producing the response. */
  latencyMs: number;
  /** Free-form per-engine debug info shown in the demo UI on drill-down. */
  debug?: Record<string, unknown>;
}

/** The interface implemented by every registered engine. */
export interface RecommendationEngine {
  /** Stable identifier used in the registry, in eval reports, and on the demo UI. */
  readonly name: string;
  /** Engine version. Bump when behavior changes so old reports stay interpretable. */
  readonly version: string;
  /** One-line description shown in the demo UI engine picker. */
  readonly description: string;
  recommend(ctx: RecoContext): Promise<RecommendationResponse>;
}

/** Thrown by adapters when a downstream engine fails in a way the runner should record. */
export class RecoEngineError extends Error {
  constructor(
    public readonly engine: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(`[${engine}] ${message}`);
    this.name = 'RecoEngineError';
  }
}
