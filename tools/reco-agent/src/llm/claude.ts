import Anthropic from '@anthropic-ai/sdk';
import type { AgentAction } from '../types.js';
import type { DecideInput, LlmProvider } from './index.js';

/**
 * Anthropic Claude provider. Phase 4 §3.
 *
 * The system prompt (action vocabulary + agent persona) is held
 * constant across ticks so it can be served from the Anthropic prompt
 * cache (each call is hot after the first). Prompt-cache `cache_control`
 * hinting is a §4-or-later optimization — the installed SDK (0.30)
 * doesn't expose it cleanly. Output is constrained by a strict
 * system-prompt directive and parsed via `extractFirstJsonObject`,
 * which scans for the first balanced `{…}` — works whether the model
 * returns raw JSON or wraps it in a sentence. (We previously used
 * assistant-message prefill but the Claude 4.X family rejects that.)
 */
export interface ClaudeProviderOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  /** Required: the templated system prompt from `prompts/agent.md`. */
  systemPrompt: string;
  /**
   * Override the Anthropic API base URL — used for BYO gateways
   * (LiteLLM, Azure-style proxies, corporate egress endpoints) that
   * speak the Messages API. The client's real provider key stays on
   * their gateway; we just use `apiKey` to authenticate to the
   * gateway itself.
   */
  baseURL?: string;
}

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export function makeClaudeProvider(opts: ClaudeProviderOptions): LlmProvider {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'claude provider: ANTHROPIC_API_KEY is not set; pass apiKey or set the env var'
    );
  }

  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 256;
  const client = new Anthropic(opts.baseURL ? { apiKey, baseURL: opts.baseURL } : { apiKey });

  return {
    name: 'claude',
    model,
    async decide(input: DecideInput): Promise<AgentAction> {
      const historyLines = input.history
        .slice(-5)
        .map(h => `  step ${h.step}: ${JSON.stringify(h.action)}${h.error ? ` [error: ${h.error}]` : ''}`)
        .join('\n');

      const userText = [
        `Task: ${input.taskStatement}`,
        `Step ${input.step} of max ${input.step + input.remainingSteps}. ${input.remainingSteps} steps left.`,
        '',
        'Page elements (visible):',
        input.observation || '(empty)',
        '',
        historyLines ? `Recent actions:\n${historyLines}` : 'Recent actions: (none)',
        '',
        'Respond with one JSON action object.',
      ].join('\n');

      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: opts.systemPrompt,
        messages: [{ role: 'user', content: userText }],
      });

      const block = res.content[0];
      if (!block || block.type !== 'text') {
        throw new Error('claude.decide: no text content in response');
      }
      const raw = block.text.trim();
      const json = extractFirstJsonObject(raw);
      const parsed = JSON.parse(json) as AgentAction;
      assertIsAgentAction(parsed);
      return parsed;
    },
  };
}

function extractFirstJsonObject(s: string): string {
  let depth = 0;
  let inString = false;
  let escape = false;
  let start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) return s.slice(start, i + 1);
    }
  }
  throw new Error('claude.decide: no balanced JSON object in response');
}

function assertIsAgentAction(a: unknown): asserts a is AgentAction {
  if (!a || typeof a !== 'object' || !('type' in a)) {
    throw new Error('claude.decide: response is not an action object');
  }
  const valid = [
    'goto',
    'clickByTestId',
    'clickBySelector',
    'type',
    'scroll',
    'read',
    'addToCart',
    'finish',
  ];
  if (!valid.includes((a as { type: unknown }).type as string)) {
    throw new Error(
      `claude.decide: unknown action type "${(a as { type: unknown }).type}"`
    );
  }
}
