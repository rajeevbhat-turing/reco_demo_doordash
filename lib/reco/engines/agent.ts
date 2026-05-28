import { makeHttpEngine } from './http';
import type { RecommendationEngine } from '@/lib/reco/types';

/**
 * Phase 4 LLM-agent track, exposed to the engine registry as a
 * pseudo-engine. The sidecar lives in `tools/reco-agent/` and serves
 * `POST /recommend` matching `docs/reco-http-contract.md`; under the
 * hood each call drives a real browser via Playwright + an LLM action
 * loop.
 *
 * Registration is conditional on `RECO_AGENT_URL` being set — the
 * agent is slow (LLM-bounded) and shouldn't appear in `/reco-eval`
 * unless the sidecar is actually reachable. The registry calls
 * `getAgentEngine()` and drops the entry when it returns `undefined`.
 *
 * Timeout knob: `RECO_AGENT_TIMEOUT_MS` (default 120_000 — one task can
 * legitimately take a minute or more in browser time).
 */
export function getAgentEngine(): RecommendationEngine | undefined {
  const url = process.env.RECO_AGENT_URL;
  if (!url) return undefined;

  const timeoutMs = Number(process.env.RECO_AGENT_TIMEOUT_MS ?? 120_000);

  return makeHttpEngine({
    name: 'agent',
    version: '0.1-scaffold',
    description:
      'LLM-driven browser agent (Playwright + OpenAI). Drives the real Dashdoor UI; trajectory mapped to a ranked list.',
    endpoint: url,
    timeoutMs,
  });
}
