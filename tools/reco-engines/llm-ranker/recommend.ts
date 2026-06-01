import type { Persona, Candidate, RecoTrajectory, RecommendRequest, RecommendResponse } from '../../../lib/reco/types';

type LlmConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

function buildPrompt(persona: Persona, candidates: Candidate[]): string {
  const topCuisines = Object.entries(persona.preferences.cuisine_affinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([c, v]) => `${c}:${v.toFixed(2)}`)
    .join(', ');

  const candidateLines = candidates
    .map(
      (c) =>
        `ID:${c.id} affinity=${c.features.cuisine_affinity_match.toFixed(2)} ` +
        `rating=${c.features.avg_rating.toFixed(1)} ` +
        `dist=${c.features.distance_miles.toFixed(1)}mi ` +
        `orders=${c.features.persona_order_count} ` +
        `discount=${c.features.promo_discount}%`
    )
    .join('\n');

  const exampleIds = candidates
    .slice(0, 3)
    .map((c) => c.id)
    .join(', ');

  return `You are a restaurant recommendation engine. Rank these restaurants for a user.

User preferences:
- Cuisine affinities (name:weight 0-1): ${topCuisines}
- Price tier: ${persona.preferences.price_tier}
- Novelty appetite: ${persona.preferences.novelty_appetite.toFixed(2)} (0=prefers familiar, 1=loves new)
- Promo sensitivity: ${persona.preferences.promo_sensitivity}

Candidates (${candidates.length} restaurants):
${candidateLines}

Return ONLY a JSON array of restaurant IDs in ranked order (best first).
Example format: [${exampleIds}, ...]

Include all ${candidates.length} IDs exactly once. No other text.`;
}

function parseRankedIds(
  content: string,
  candidates: Candidate[]
): { ranked_ids: number[]; scores: Record<number, number> } {
  const candidateIdSet = new Set(candidates.map((c) => c.id));
  const match = content.match(/\[[\d,\s]+\]/);
  if (match) {
    try {
      const parsed: unknown[] = JSON.parse(match[0]);
      const validIds = parsed.filter(
        (x): x is number => typeof x === 'number' && candidateIdSet.has(x)
      );
      const deduped = [...new Set(validIds)];
      const missing = candidates.map((c) => c.id).filter((id) => !deduped.includes(id));
      const ranked_ids = [...deduped, ...missing];
      const scores: Record<number, number> = {};
      ranked_ids.forEach((id, i) => {
        scores[id] = 1 / (i + 1);
      });
      return { ranked_ids, scores };
    } catch {
      // fall through to fallback
    }
  }
  const ranked_ids = candidates.map((c) => c.id);
  const scores: Record<number, number> = {};
  ranked_ids.forEach((id, i) => {
    scores[id] = 1 / (i + 1);
  });
  return { ranked_ids, scores };
}

async function callLlm(
  prompt: string,
  llm?: LlmConfig
): Promise<{ content: string; source: 'byo-gateway' | 'server-default'; gatewayHost?: string }> {
  if (llm) {
    const url = `${llm.baseUrl.replace(/\/$/, '')}/chat/completions`;
    // Omit temperature — reasoning models (o1/o3/o4-*) reject temperature=0.
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${llm.apiKey}`,
      },
      body: JSON.stringify({
        model: llm.model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`BYO LLM ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    const gatewayHost = new URL(llm.baseUrl).hostname;
    return { content, source: 'byo-gateway', gatewayHost };
  }

  // Server-default: prefer OPENAI_API_KEY (gpt-4o-mini), fall back to ANTHROPIC_API_KEY.
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI API ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    return { content, source: 'server-default' };
  }

  if (anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic API ${res.status}: ${text}`);
    }
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    const content = data.content?.[0]?.text ?? '';
    return { content, source: 'server-default' };
  }

  throw new Error('No server-default LLM key available — set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env');
}

export async function recommend(
  persona: Persona,
  req: RecommendRequest
): Promise<RecommendResponse> {
  const candidates = req.candidates ?? [];
  const topK = req.topK ?? 20;
  // Give the LLM up to 3× topK candidates to rank, then slice the final result.
  const pool = candidates.slice(0, topK * 3);

  const prompt = buildPrompt(persona, pool);
  const { content, source, gatewayHost } = await callLlm(prompt, req.llm);

  const { ranked_ids: allRanked, scores } = parseRankedIds(content, pool);
  const ranked_ids = allRanked.slice(0, topK);

  const finalScores: Record<number, number> = {};
  ranked_ids.forEach((id) => {
    finalScores[id] = scores[id];
  });

  const trajectory: RecoTrajectory = {
    engine: 'llm-ranker',
    steps: [
      {
        stage: 'query',
        restaurant_ids: [],
        notes: prompt,
      },
      {
        stage: 'candidate_gen',
        restaurant_ids: pool.map((c) => c.id),
        notes: `${pool.length} candidates from A/B set (topK=${topK})`,
      },
      {
        stage: 'final',
        restaurant_ids: ranked_ids,
        scores: finalScores,
        notes: `source=${source}${gatewayHost ? ` gateway=${gatewayHost}` : ''}`,
      },
    ],
  };

  return {
    engine: 'llm-ranker',
    personaId: req.personaId,
    ranked_ids,
    scores: finalScores,
    trajectory,
    source,
    ...(gatewayHost ? { gatewayHost } : {}),
  };
}
