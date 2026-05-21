/**
 * Agent-side types — duplicates the canonical shapes in
 * `lib/reco/agent/types.ts` so the sidecar can be packaged without a
 * dependency on the Next.js source tree. If the canonical types change,
 * update this file too. The HTTP wire contract is the enforcement
 * boundary at runtime.
 */

export type AgentAction =
  | { type: 'goto'; url: string }
  | { type: 'clickByTestId'; testId: string }
  | { type: 'clickBySelector'; selector: string }
  | { type: 'type'; selector: string; text: string }
  | { type: 'scroll'; deltaY: number }
  | { type: 'read'; selector: string }
  | { type: 'addToCart' }
  | { type: 'finish'; reason?: string };

export interface AgentInput {
  taskId: string;
  startUrl: string;
  model: string;
  maxSteps: number;
}

export interface VerifierEvent {
  type: string;
  payload: Record<string, unknown>;
  ts: number;
}

export interface AgentStepRecord {
  step: number;
  action: AgentAction;
  observation: string;
  error?: string;
  durationMs: number;
  urlAfter?: string;
}

/** Which LLM endpoint drove this agent run (for eval UI / debug). */
export interface AgentLlmMeta {
  provider: string;
  model: string;
  source: 'byo-gateway' | 'server-default';
  gatewayHost?: string;
}

export interface AgentOutput {
  runId: string;
  input: AgentInput;
  actions: AgentStepRecord[];
  verifierEvents: VerifierEvent[];
  recommendation: unknown; // RecommendationResponse from wire.ts at call sites
  durationMs: number;
  truncated: boolean;
  /** Populated on every run so `/recommend` can surface LLM usage in `debug`. */
  llm: AgentLlmMeta;
}
