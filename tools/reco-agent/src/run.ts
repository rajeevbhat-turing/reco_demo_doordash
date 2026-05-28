import './load-env.js'; // populate process.env from ../../.env (no-op in prod)

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import { randomUUID } from 'node:crypto';

import type {
  AgentAction,
  AgentInput,
  AgentLlmMeta,
  AgentOutput,
  AgentStepRecord,
  VerifierEvent,
} from './types.js';
import { launch, type DriverHandle } from './driver.js';
import { observe } from './observe.js';
import { dispatch } from './actions.js';
import type { LlmProvider } from './llm/index.js';
import { makeOpenAiProvider } from './llm/openai.js';
import { makeStubProvider } from './llm/stub.js';
import { buildSystemPrompt } from './llm/prompt.js';
import { extractRecommendation } from './extract.js';

const MAX_ATTEMPTS = 3; // 1 try + 2 retries

/**
 * Single agent run entry point. Phase 4 §3.
 *
 * Drives a browser through `input.startUrl`, asks the configured LLM
 * provider for one action per tick, dispatches it, and records the
 * trajectory. Returns the full `AgentOutput` with a stub
 * `recommendation` field — Phase 4 §4 replaces the stub with the
 * trajectory-extracted ranking.
 */
export interface RunAgentOverrides {
  /** BYO-LLM gateway URL (OpenAI- or Anthropic-compatible). */
  llmUrl?: string;
  /** Bearer key for the gateway, if it requires one. */
  llmApiKey?: string;
}

export async function runAgent(
  input: AgentInput,
  overrides: RunAgentOverrides = {}
): Promise<AgentOutput> {
  const runId = randomUUID();
  const startedAt = Date.now();

  const task = await loadFullTask(input.taskId).catch(() => null);
  const taskStatement = task?.statement ?? (await loadTaskStatement(input.taskId));
  // Prefer the task's user (their default address matches the task's
  // lat/lng, so the home feed renders the expected restaurants). Fall
  // back to env, then to john.doe as the last resort.
  const userEmail =
    task?.userEmail ?? process.env.RECO_AGENT_USER ?? 'john.doe@example.com';
  const password = await resolvePassword(input.startUrl, userEmail);
  const systemPrompt = buildSystemPrompt({ userEmail, password });
  const provider = pickProvider(input.model, systemPrompt, overrides);
  const llm = buildLlmMeta(provider, overrides);

  let driver: DriverHandle | null = null;
  const actions: AgentStepRecord[] = [];
  let truncated = false;

  try {
    driver = await launch({
      startUrl: input.startUrl,
      headless: process.env.RECO_AGENT_HEADLESS !== '0',
      preAuthUserEmail: userEmail,
    });

    for (let step = 0; step < input.maxSteps; step++) {
      const tick = await runTick({
        provider,
        driver,
        step,
        remainingSteps: input.maxSteps - step,
        taskStatement,
        history: actions,
      });
      actions.push(tick);
      if (tick.action.type === 'finish') break;
    }

    const last = actions[actions.length - 1];
    if (!last || last.action.type !== 'finish') {
      truncated = true;
      actions.push({
        step: actions.length,
        action: { type: 'finish', reason: 'maxSteps reached' },
        observation: '(truncated)',
        durationMs: 0,
      });
    }
  } finally {
    if (driver) await driver.close().catch(() => undefined);
  }

  const verifierEvents = await collectVerifierEvents(driver);

  return {
    runId,
    input,
    actions,
    verifierEvents,
    // §4 replaces this with the extracted ranking. For §3 we emit an
    // empty-items response that still parses as RecommendationResponse.
    recommendation: {
      items: [],
      engine: 'agent',
      version: '0.1-scaffold',
      latencyMs: Date.now() - startedAt,
      debug: {
        steps: actions.length,
        truncated,
        note: 'recommendation extraction lands in Phase 4 §4',
      },
    },
    durationMs: Date.now() - startedAt,
    truncated,
    llm,
  };
}

function buildLlmMeta(
  provider: LlmProvider,
  overrides: RunAgentOverrides
): AgentLlmMeta {
  const meta: AgentLlmMeta = {
    provider: provider.name,
    model: provider.model,
    source: overrides.llmUrl ? 'byo-gateway' : 'server-default',
  };
  if (overrides.llmUrl) {
    try {
      meta.gatewayHost = new URL(overrides.llmUrl).host;
    } catch {
      /* ignore malformed override — pickProvider already accepted it */
    }
  }
  return meta;
}

interface TickInput {
  provider: LlmProvider;
  driver: DriverHandle;
  step: number;
  remainingSteps: number;
  taskStatement: string;
  history: AgentStepRecord[];
}

async function runTick(t: TickInput): Promise<AgentStepRecord> {
  const tickStart = Date.now();
  const observation = await observe(t.driver.page);

  let lastAction: AgentAction | null = null;
  let lastError: string | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const action = await t.provider.decide({
        taskStatement: t.taskStatement,
        observation,
        history: t.history,
        step: t.step,
        remainingSteps: t.remainingSteps,
      });
      lastAction = action;
      await dispatch(t.driver.page, action);
      return {
        step: t.step,
        action,
        observation,
        durationMs: Date.now() - tickStart,
        urlAfter: safeUrl(t.driver.page),
      };
    } catch (err) {
      lastError = (err as Error).message;
    }
  }

  // All attempts failed — record the last attempt + error and force a finish.
  return {
    step: t.step,
    action: lastAction ?? { type: 'finish', reason: `forced after ${MAX_ATTEMPTS} failed attempts` },
    observation,
    error: lastError,
    durationMs: Date.now() - tickStart,
    urlAfter: safeUrl(t.driver.page),
  };
}

function safeUrl(page: { url: () => string }): string | undefined {
  try {
    return page.url();
  } catch {
    return undefined;
  }
}

/**
 * Snapshot the verifier-store after the run ends. For §3 we emit one
 * event with the final state; §4 will swap this for per-tick diffing
 * if the extractor needs intermediate signals (e.g. cart additions
 * before order placement).
 */
async function collectVerifierEvents(driver: DriverHandle | null): Promise<VerifierEvent[]> {
  if (!driver) return [];
  try {
    const state = await driver.verifierState();
    if (!state || Object.keys(state).length === 0) return [];
    return [{ type: 'verifier-snapshot', payload: state, ts: Date.now() }];
  } catch {
    return [];
  }
}

function pickProvider(
  model: string,
  systemPrompt: string,
  overrides: RunAgentOverrides = {}
): LlmProvider {
  if (model === 'stub' || model.startsWith('stub-')) {
    return makeStubProvider();
  }
  // Only the OpenAI (Chat Completions) wire is supported at runtime —
  // BYO gateways must speak OpenAI-compatible. A non-`gpt-*` model name
  // is coerced to the OpenAI default; we no longer route to the
  // Anthropic SDK from here. `makeClaudeProvider` is still importable
  // for the type system but never instantiated.
  const isOpenAi =
    model.startsWith('gpt-') || model.startsWith('o1-') || model.startsWith('o3-');
  const effectiveModel = isOpenAi ? model : 'gpt-4o-mini';
  return makeOpenAiProvider({
    model: effectiveModel,
    systemPrompt,
    ...(overrides.llmUrl ? { endpoint: overrides.llmUrl } : {}),
    ...(overrides.llmApiKey ? { apiKey: overrides.llmApiKey } : {}),
  });
}

/**
 * Resolve the gym password for `userEmail` so the agent can type it
 * into the sign-in modal's `Use password instead` form. Tries env first
 * (`RECO_AGENT_USER_PASSWORD`), then the gym's demo-only
 * `POST /api/reco/agent/credential` endpoint (which reads from
 * `users.password` — gym is a demo with plaintext passwords).
 *
 * Returns empty string on failure; the prompt templates blank and the
 * agent's trajectory will show a clear sign-in failure rather than
 * silently hanging.
 */
async function resolvePassword(startUrl: string, userEmail: string): Promise<string> {
  if (process.env.RECO_AGENT_USER_PASSWORD) {
    return process.env.RECO_AGENT_USER_PASSWORD;
  }
  try {
    const origin = new URL(startUrl).origin;
    const res = await fetch(`${origin}/api/reco/agent/credential`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });
    if (!res.ok) {
      console.error(
        `[reco-agent] password lookup failed: HTTP ${res.status} for ${userEmail} (RECO_DEMO must be set on parent app)`
      );
      return '';
    }
    const body = (await res.json()) as { password?: string };
    return body.password ?? '';
  } catch (err) {
    console.error(`[reco-agent] password lookup error: ${(err as Error).message}`);
    return '';
  }
}

async function loadTaskStatement(taskId: string): Promise<string> {
  const tasksPath =
    process.env.RECO_TASKS_PATH ??
    path.resolve(
      url.fileURLToPath(new URL('.', import.meta.url)),
      '../../../data/reco-tasks/seed.json'
    );
  const raw = await fs.readFile(tasksPath, 'utf-8');
  const tasks = JSON.parse(raw) as Array<{ taskId: string; statement: string }>;
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) {
    throw new Error(`runAgent: taskId "${taskId}" not found in ${tasksPath}`);
  }
  return task.statement;
}

// CLI entry: tsx src/run.ts '{"taskId":"...","startUrl":"...","model":"stub","maxSteps":5}'
if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2];
  if (!raw) {
    console.error('usage: tsx src/run.ts <AgentInput JSON>');
    process.exit(2);
  }
  const input = JSON.parse(raw) as AgentInput;
  runAgent(input)
    .then(async out => {
      console.log(JSON.stringify(out, null, 2));
      // Score the trajectory against the seed task's expected ids and
      // print a compact summary at the bottom — saves grepping the JSON
      // to know whether the agent "got it right".
      const task = await loadFullTask(input.taskId).catch(() => null);
      const rec = extractRecommendation({
        actions: out.actions,
        verifierEvents: out.verifierEvents,
        surface: task?.surface ?? 'home_feed',
        k: 5,
        latencyMs: out.durationMs,
        version: '0.1-phase4',
      });
      const predicted = rec.items.map(i => i.id);
      const expected = task?.expectedItemIds ?? [];
      const hit1 = predicted[0] && expected.includes(predicted[0]) ? 1 : 0;
      const hit5 = predicted.slice(0, 5).some(id => expected.includes(id)) ? 1 : 0;
      console.log('\n--- agent score ---');
      console.log(`predicted: ${JSON.stringify(predicted)}`);
      console.log(`expected:  ${JSON.stringify(expected)}`);
      console.log(`Hit@1 = ${hit1}    Hit@5 = ${hit5}`);
    })
    .catch(err => {
      console.error(`[reco-agent] runAgent failed: ${(err as Error).message}`);
      process.exit(1);
    });
}

interface SeedTask {
  taskId: string;
  statement: string;
  expectedItemIds: string[];
  surface: 'home_feed' | 'home_promo' | 'search' | 'store_items';
  /** Field is `user` in seed.json — we surface it as `userEmail`. */
  userEmail?: string;
  userLat?: number;
  userLng?: number;
}

async function loadFullTask(taskId: string): Promise<SeedTask> {
  const tasksPath =
    process.env.RECO_TASKS_PATH ??
    path.resolve(
      url.fileURLToPath(new URL('.', import.meta.url)),
      '../../../data/reco-tasks/seed.json'
    );
  const tasks = JSON.parse(await fs.readFile(tasksPath, 'utf-8')) as Array<{
    taskId: string;
    statement: string;
    expectedItemIds: string[];
    surface: 'home_feed' | 'home_promo' | 'search' | 'store_items';
    user?: string;
    userLat?: number;
    userLng?: number;
  }>;
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`taskId not found: ${taskId}`);
  return {
    taskId: task.taskId,
    statement: task.statement,
    expectedItemIds: task.expectedItemIds,
    surface: task.surface,
    userEmail: task.user,
    userLat: task.userLat,
    userLng: task.userLng,
  };
}
