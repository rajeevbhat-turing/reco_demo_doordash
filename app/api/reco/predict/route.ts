import { NextRequest, NextResponse } from 'next/server';
import { getEngine } from '@/lib/reco/engines';
import { RecoEngineError, type RecoContext } from '@/lib/reco/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

interface PredictBody {
  engine?: string;
  ctx?: RecoContext;
}

/**
 * POST /api/reco/predict
 * Body: { engine: string, ctx: RecoContext }
 *
 * Thin wrapper over `getEngine(name).recommend(ctx)`. Used by the
 * `/home` re-rank flow in Phase 3. Returns the engine's
 * `RecommendationResponse` directly.
 */
export async function POST(request: NextRequest) {
  let body: PredictBody;
  try {
    body = (await request.json()) as PredictBody;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const { engine, ctx } = body;
  if (!engine || !ctx) {
    return NextResponse.json({ error: 'engine and ctx are required' }, { status: 400 });
  }

  const eng = getEngine(engine);
  if (!eng) {
    return NextResponse.json({ error: `engine '${engine}' not registered` }, { status: 404 });
  }

  try {
    const res = await eng.recommend(ctx);
    return NextResponse.json(res);
  } catch (err) {
    const message =
      err instanceof RecoEngineError ? err.message : (err as Error).message;
    // Never 500 for downstream engine failures — the home page falls
    // back to the unsorted list when items is empty.
    return NextResponse.json(
      {
        items: [],
        engine: eng.name,
        version: eng.version,
        latencyMs: 0,
        debug: { error: message },
      },
      { status: 200 }
    );
  }
}
