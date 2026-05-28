import type { AgentAction } from '../types.js';
import type { DecideInput, LlmProvider } from './index.js';

/**
 * OpenAI Chat Completions provider. Phase 4 §3 (added 2026-05-21 to
 * unblock the user-side smoke test).
 *
 * Uses raw `fetch` against `/v1/chat/completions` so we don't pull in
 * another SDK. JSON-mode (`response_format: json_object`) forces the
 * model to return a parseable object — no prefill/extractor tricks
 * needed.
 *
 * Default model is `gpt-4o-mini` — the action vocabulary is small
 * enough that the cheaper tier suffices for a demo. Override via
 * `AgentInput.model` ("gpt-4o", "gpt-4o-mini", etc.).
 */
export interface OpenAiProviderOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  /** Override the endpoint for Azure / proxies. */
  endpoint?: string;
  /** Required: the templated system prompt from `prompts/agent.md`. */
  systemPrompt: string;
}

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface OpenAiResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export function makeOpenAiProvider(opts: OpenAiProviderOptions): LlmProvider {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'openai provider: OPENAI_API_KEY is not set; pass apiKey or set the env var'
    );
  }

  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? 256;
  const endpoint = normalizeEndpoint(opts.endpoint);

  return {
    name: 'openai',
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
        'Respond with a single JSON action object.',
      ].join('\n');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: opts.systemPrompt },
            { role: 'user', content: userText },
          ],
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`openai.decide: HTTP ${res.status} — ${detail.slice(0, 200)}`);
      }

      const body = (await res.json()) as OpenAiResponse;
      if (body.error?.message) {
        throw new Error(`openai.decide: ${body.error.message}`);
      }
      const content = body.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('openai.decide: empty response content');
      }

      const parsed = JSON.parse(content) as AgentAction;
      assertIsAgentAction(parsed);
      return parsed;
    },
  };
}

/**
 * Accept both forms the user might paste in the BYO field:
 *   https://api.openai.com/v1                  (base — OpenAI SDK style)
 *   https://api.openai.com/v1/chat/completions (full path)
 * If `/chat/completions` is already present we leave it alone; otherwise
 * we append it. Mirrors the OpenAI SDK's own behavior so the field is
 * forgiving.
 */
function normalizeEndpoint(input?: string): string {
  if (!input) return DEFAULT_ENDPOINT;
  const trimmed = input.replace(/\/+$/, '');
  if (/\/chat\/completions$/.test(trimmed)) return trimmed;
  return `${trimmed}/chat/completions`;
}

function assertIsAgentAction(a: unknown): asserts a is AgentAction {
  if (!a || typeof a !== 'object' || !('type' in a)) {
    throw new Error('openai.decide: response is not an action object');
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
      `openai.decide: unknown action type "${(a as { type: unknown }).type}"`
    );
  }
}
