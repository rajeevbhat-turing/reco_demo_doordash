import type { AgentAction } from '../types.js';
import type { DecideInput, LlmProvider } from './index.js';

/**
 * Deterministic stub provider — used by §7 e2e tests and by anyone
 * exercising the wiring without API tokens.
 *
 * Policy: scroll, then click the first card, then finish. Lets tests
 * verify trajectory→recommendation mapping (Phase 4 §4) end-to-end
 * without an LLM in the loop.
 */
export function makeStubProvider(): LlmProvider {
  return {
    name: 'stub',
    model: 'stub-first-card',
    async decide(input: DecideInput): Promise<AgentAction> {
      if (input.step === 0) {
        return { type: 'scroll', deltaY: 400 };
      }
      if (input.step === 1) {
        return { type: 'clickByTestId', testId: 'restaurant-card-0' };
      }
      return { type: 'finish', reason: 'stub provider end-of-script' };
    },
  };
}
