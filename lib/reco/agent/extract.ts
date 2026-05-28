import type { RecoSurface, RecoItem, RecommendationResponse } from '@/lib/reco/types';
import type { AgentStepRecord, VerifierEvent } from '@/lib/reco/agent/types';

/**
 * Trajectory → recommendation mapping. Phase 4 §4.
 *
 * Pure, deterministic, no I/O — given an agent's actions and the
 * verifier-store snapshot, return what the agent effectively
 * recommended. Same `RecommendationResponse` shape the engine track
 * emits, so the eval runner can score the agent like any other engine.
 *
 * Per-surface rules (locked in `EXECUTION.md` §1):
 *   • home_feed   → first `k` distinct restaurant_ids the agent
 *                   navigated into (URL trail `/store/<id>`).
 *   • store_items → items in the verifier-store `lastOrderInfo.items`
 *                   (cart at order time), in order, deduped. Falls back
 *                   to an empty list if nothing was added.
 *   • home_promo / search — not in scope for Phase 4 v1; the runner
 *     skips agent rows on those surfaces, but we still return a
 *     well-formed response with an empty items[] so the wire stays
 *     happy.
 *
 * Always emits a `RecommendationResponse`; never throws. Padding is
 * intentionally not done — a short trajectory yields a short items[],
 * which the metrics scorer handles as a miss past index N.
 */

export interface ExtractInput {
  actions: AgentStepRecord[];
  verifierEvents: VerifierEvent[];
  surface: RecoSurface;
  k: number;
  /** Latency to report on the response (run wall-clock, set by caller). */
  latencyMs: number;
  /** Engine version string to echo back. */
  version: string;
}

export function extractRecommendation(input: ExtractInput): RecommendationResponse {
  const items =
    input.surface === 'home_feed'
      ? extractFromHomeFeed(input.actions, input.k)
      : input.surface === 'store_items'
        ? extractFromStoreItems(input.verifierEvents, input.k)
        : [];

  return {
    items,
    engine: 'agent',
    version: input.version,
    latencyMs: input.latencyMs,
    debug: {
      surface: input.surface,
      steps: input.actions.length,
    },
  };
}

const STORE_URL_RE = /\/store\/([^/?#]+)/;

function extractFromHomeFeed(actions: AgentStepRecord[], k: number): RecoItem[] {
  const seen = new Set<string>();
  const items: RecoItem[] = [];
  for (const step of actions) {
    if (!step.urlAfter) continue;
    const match = STORE_URL_RE.exec(step.urlAfter);
    if (!match) continue;
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({
      id,
      score: 1 - items.length / Math.max(k, 1),
      kind: 'restaurant',
      meta: { fromStep: step.step },
    });
    if (items.length >= k) break;
  }
  return items;
}

interface CartItemLike {
  id?: number | string;
  itemName?: string;
}

function extractFromStoreItems(events: VerifierEvent[], k: number): RecoItem[] {
  // Most-recent verifier-snapshot wins (the run loop emits one at end).
  const snapshot = events.findLast(e => e.type === 'verifier-snapshot')?.payload;
  const state = snapshot?.['state'] as Record<string, unknown> | undefined;
  const lastOrder = state?.['lastOrderInfo'] as Record<string, unknown> | undefined;
  const rawItems = (lastOrder?.['items'] ?? []) as CartItemLike[];

  const seen = new Set<string>();
  const items: RecoItem[] = [];
  for (const ci of rawItems) {
    if (ci.id == null) continue;
    const id = String(ci.id);
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({
      id,
      score: 1 - items.length / Math.max(k, 1),
      kind: 'item',
      meta: ci.itemName ? { itemName: ci.itemName } : undefined,
    });
    if (items.length >= k) break;
  }
  return items;
}
