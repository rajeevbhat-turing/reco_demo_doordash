/**
 * LLM-agent track types — canonical for the Next.js side.
 *
 * The agent sidecar in `tools/reco-agent/` keeps a duplicated copy at
 * `tools/reco-agent/src/types.ts` (same pattern as
 * `tools/reco-engines/common/models.py` mirroring `lib/reco/types.ts`).
 * The wire contract — `POST /recommend` returning `RecommendationResponse`
 * from `lib/reco/types.ts` — is what enforces sync at runtime.
 *
 * Phase: 4. See `EXECUTION.md` §1 for the locked decisions these
 * shapes encode.
 */

import type { RecommendationResponse } from '@/lib/reco/types';

/** The action vocabulary the LLM may emit each tick. */
export type AgentAction =
  | { type: 'goto'; url: string }
  | { type: 'clickByTestId'; testId: string }
  | { type: 'clickBySelector'; selector: string }
  | { type: 'type'; selector: string; text: string }
  | { type: 'scroll'; deltaY: number }
  | { type: 'read'; selector: string }
  | { type: 'addToCart' }
  | { type: 'finish'; reason?: string };

/** Input handed to a single agent run. */
export interface AgentInput {
  taskId: string;
  startUrl: string;
  /** Provider-specific model string, e.g. `claude-opus-4-7` or `stub`. */
  model: string;
  /** Hard cap on the action loop. Reaching it forces a `finish`. */
  maxSteps: number;
}

/** Verifier-store event the UI emits during the run; consumed for scoring. */
export interface VerifierEvent {
  type: string;
  payload: Record<string, unknown>;
  /** Epoch ms when the UI emitted the event. */
  ts: number;
}

/** One tick of the action loop, persisted for replay. */
export interface AgentStepRecord {
  /** Zero-indexed step number. */
  step: number;
  action: AgentAction;
  /** What the LLM was told before deciding (truncated DOM digest). */
  observation: string;
  /** Set when dispatch failed and the LLM was given a retry. */
  error?: string;
  /** Wall-clock ms spent in this tick (LLM call + dispatch). */
  durationMs: number;
  /**
   * URL the page settled on after dispatch. Captured even when the
   * action didn't intend to navigate — the extractor uses URL trail
   * to derive which `restaurant_id` the agent visited via a card
   * click (cards don't carry data-testids).
   */
  urlAfter?: string;
}

/** Final result of a single agent run. */
export interface AgentOutput {
  runId: string;
  input: AgentInput;
  actions: AgentStepRecord[];
  verifierEvents: VerifierEvent[];
  /** Mapped from the trajectory by `lib/reco/agent/extract.ts` (Phase 4 §4). */
  recommendation: RecommendationResponse;
  /** Total wall-clock ms for the run. */
  durationMs: number;
  /** True when `maxSteps` was hit and the loop force-finished. */
  truncated: boolean;
}

/** Lightweight status payload for the demo replay page while a run is in flight. */
export interface AgentRunStatus {
  runId: string;
  state: 'pending' | 'running' | 'done' | 'error';
  /** Latest step number that has finished. */
  step: number;
  /** Populated when `state === 'error'`. */
  error?: string;
}
