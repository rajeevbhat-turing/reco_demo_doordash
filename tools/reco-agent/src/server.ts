import './load-env.js'; // populate process.env from ../../.env (no-op in prod)

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { z } from 'zod';
import type { RecoContext } from './wire.js';
import { runAgent } from './run.js';
import { extractRecommendation } from './extract.js';
import type { AgentInput } from './types.js';

/**
 * Hono server exposing the agent sidecar. Phase 4 §4.
 *
 *   GET  /health     liveness probe used by docker-compose
 *   POST /run        invoke an agent run directly (AgentInput → AgentOutput)
 *   POST /recommend  standard reco-engine wire contract — kicks off
 *                    an agent run keyed by `ctx.taskId`, then maps the
 *                    trajectory to a `RecommendationResponse`.
 */
const app = new Hono();

const AgentInputSchema = z.object({
  taskId: z.string(),
  startUrl: z.string().url(),
  model: z.string(),
  maxSteps: z.number().int().positive(),
});

const RecoContextSchema = z.object({
  surface: z.enum(['home_feed', 'home_promo', 'search', 'store_items']),
  lat: z.number(),
  lng: z.number(),
  k: z.number().int().positive(),
  userId: z.string().optional(),
  candidatePool: z.array(z.string()).optional(),
  recentOrderIds: z.array(z.string()).optional(),
  now: z.string().optional(),
  taskId: z.string().optional(),
  startUrl: z.string().url().optional(),
  // Phase 5 BYO: forwarded from the eval runner per request.
  agentLlmUrl: z.string().url().optional(),
  agentLlmApiKey: z.string().optional(),
});

app.get('/health', c => c.json({ ok: true, phase: '4', step: '§4' }));

app.post('/run', async c => {
  const body = await c.req.json();
  const parsed = AgentInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid AgentInput', issues: parsed.error.issues }, 400);
  }
  try {
    const out = await runAgent(parsed.data);
    return c.json(out);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

app.post('/recommend', async c => {
  const body = await c.req.json();
  const parsed = RecoContextSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid RecoContext', issues: parsed.error.issues }, 400);
  }
  const ctx = parsed.data as RecoContext;

  if (!ctx.taskId) {
    return c.json(
      { error: '/recommend requires ctx.taskId so the agent can look up the task statement' },
      400
    );
  }

  const input: AgentInput = {
    taskId: ctx.taskId,
    startUrl: ctx.startUrl ?? deriveStartUrl(ctx.surface),
    model: process.env.RECO_AGENT_MODEL ?? defaultModel(),
    maxSteps: Number(process.env.RECO_AGENT_MAX_STEPS ?? 25),
  };

  try {
    const out = await runAgent(input, {
      llmUrl: ctx.agentLlmUrl,
      llmApiKey: ctx.agentLlmApiKey,
    });
    const response = extractRecommendation({
      actions: out.actions,
      verifierEvents: out.verifierEvents,
      surface: ctx.surface,
      k: ctx.k,
      latencyMs: out.durationMs,
      version: '0.1-phase4',
    });
    return c.json({
      ...response,
      debug: {
        ...response.debug,
        llm: out.llm,
        truncated: out.truncated,
      },
    });
  } catch (err) {
    return c.json({ error: (err as Error).message, engine: 'agent', version: '0.1-phase4' }, 500);
  }
});

/**
 * Map a surface to the URL the agent should land on first. Override
 * with `ctx.startUrl` for store-page-only flows.
 *
 * `RECO_AGENT_TARGET_URL` is the base URL of the parent Dashdoor app
 * as seen *from inside the sidecar's network*. In docker-compose
 * that's typically `http://host.docker.internal:3000`; locally,
 * `http://localhost:3000`.
 */
/**
 * Pick a default model based on which provider key is available, so a
 * `/recommend` call works without forcing the caller to also set
 * `RECO_AGENT_MODEL`. Explicit `RECO_AGENT_MODEL` always wins.
 */
function defaultModel(): string {
  if (process.env.OPENAI_API_KEY) return 'gpt-4o-mini';
  return 'claude-sonnet-4-6';
}

function deriveStartUrl(surface: RecoContext['surface']): string {
  const base = process.env.RECO_AGENT_TARGET_URL ?? 'http://localhost:3000';
  switch (surface) {
    case 'home_feed':
    case 'home_promo':
      return `${base}/home`;
    case 'search':
      return `${base}/search`;
    case 'store_items':
      // No store id without more context — drop to /home and let the
      // agent navigate. v1 expects this to be uncommon; runners that
      // care should pass `ctx.startUrl` explicitly.
      return `${base}/home`;
  }
}

const port = Number(process.env.PORT ?? 8003);

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port });
  console.log(`[reco-agent] listening on :${port} (GET /health, POST /run, POST /recommend)`);
}

export { app };
