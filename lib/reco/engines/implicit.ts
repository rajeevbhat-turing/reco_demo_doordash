import { makeHttpEngine } from './http';

/**
 * Implicit (ALS/BPR) sidecar adapter. Source: `tools/reco-engines/implicit/`.
 * Wire contract: `docs/reco-http-contract.md`.
 *
 * The sidecar exposes a `store_items` surface that returns item-to-item
 * neighbors of the last ordered item, useful for the Phase 3 upsell
 * carousel.
 */
export const implicitEngine = makeHttpEngine({
  name: 'implicit',
  version: '0.7.2-als-f64',
  description:
    'Pure CF on implicit feedback (ALS by default, BPR optional). MIT-licensed `implicit` library.',
  endpoint: process.env.RECO_IMPLICIT_URL ?? 'http://implicit:8002/recommend',
  timeoutMs: 10_000,
});
