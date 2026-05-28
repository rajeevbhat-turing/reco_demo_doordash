/**
 * Trajectory → recommendation mapping. Duplicate of
 * `lib/reco/agent/extract.ts` for the sidecar. Same rules and
 * semantics; see canonical file for docs.
 */

import type { AgentStepRecord, VerifierEvent } from './types.js';
import type { RecoItem, RecommendationResponse, RecoSurface } from './wire.js';

export interface ExtractInput {
  actions: AgentStepRecord[];
  verifierEvents: VerifierEvent[];
  surface: RecoSurface;
  k: number;
  latencyMs: number;
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
    debug: { surface: input.surface, steps: input.actions.length },
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
    const id = match[1]!;
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
