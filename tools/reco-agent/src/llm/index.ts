import type { AgentAction, AgentStepRecord } from '../types.js';

/**
 * LLM provider interface. Phase 4 §3.
 *
 * Each provider (`claude.ts`, `openai.ts`, `stub.ts`) implements this
 * shape. `decide()` is called once per loop tick with the task
 * statement, current DOM digest, and recent action history; it must
 * return the next action.
 */
export interface LlmProvider {
  /** Provider id, e.g. `claude`. */
  readonly name: string;
  /** Specific model string, e.g. `claude-opus-4-7`. */
  readonly model: string;
  decide(input: DecideInput): Promise<AgentAction>;
}

export interface DecideInput {
  taskStatement: string;
  observation: string;
  /** Most-recent-first slice of step history, capped by the loop. */
  history: AgentStepRecord[];
  /** Step number the agent is about to take (0-indexed). */
  step: number;
  /** How many more steps remain in the budget. */
  remainingSteps: number;
}

/**
 * Canonical system prompt is in `tools/reco-agent/prompts/agent.md` and
 * loaded via `./prompt.ts#buildSystemPrompt`. `run.ts` resolves the
 * per-run user + OTP, builds the prompt once, and passes it to the
 * provider factory.
 */
