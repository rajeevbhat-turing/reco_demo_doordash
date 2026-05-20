# `lib/reco/` — recommendation eval harness

This module turns the Dashdoor gym into an evaluation harness for
recommendation engines. The wire contract is small enough to fit on one
page. The same shape is reused everywhere: in-process engines implement
`RecommendationEngine` directly, external engines (Gorse, LightFM,
Implicit) speak the same JSON over HTTP via `engines/http.ts`.

See `RECO_PLAN.md` for phases and `EXECUTION.md` for the current
checklist.

## Layout

```
lib/reco/
├── types.ts            # the contract (read this first)
├── README.md           # this file
├── engines/
│   ├── index.ts        # registry
│   ├── random.ts       # baseline floor
│   ├── popularity.ts   # baseline ceiling
│   ├── http.ts         # generic adapter for external HTTP engines
│   └── gorse.ts        # Gorse-specific wrapper over http.ts
├── eval/
│   ├── task-loader.ts  # tasks/dashdoor.csv → RecoTask[]
│   ├── history-split.ts# leave-one-out over orders
│   ├── runner.ts       # engine × task → EvalReport
│   └── storage.ts      # data/reco-runs/<runId>.json
└── metrics.ts          # Hit@K, NDCG@K, MRR, Recall@K, Coverage
```

## Contract (TypeScript)

```ts
import type {
  RecommendationEngine,
  RecoContext,
  RecommendationResponse,
} from '@/lib/reco/types';

class MyEngine implements RecommendationEngine {
  readonly name = 'my-engine';
  readonly version = '1.0.0';
  readonly description = 'demo engine';

  async recommend(ctx: RecoContext): Promise<RecommendationResponse> {
    const start = performance.now();
    const items = [
      { id: '42', score: 0.9, kind: 'restaurant' as const },
    ];
    return {
      items,
      engine: this.name,
      version: this.version,
      latencyMs: performance.now() - start,
    };
  }
}
```

## HTTP wire contract

External engines (a Gorse instance, a FastAPI sidecar, etc.) expose
`POST /recommend` and accept/return the JSON shape below. `engines/http.ts`
is the only file that talks HTTP; everything else stays in TypeScript.

> Full reference: **[docs/reco-http-contract.md](../../docs/reco-http-contract.md)**.

**Request** — body is a `RecoContext`:

```json
{
  "userId": "usr_018f...",
  "lat": 37.7749,
  "lng": -122.4194,
  "surface": "home_feed",
  "candidatePool": ["12", "47", "98", "112"],
  "k": 5,
  "now": "2026-05-20T12:30:00-07:00",
  "recentOrderIds": ["ord_2099", "ord_2087"]
}
```

**Response** — a `RecommendationResponse`:

```json
{
  "items": [
    { "id": "47",  "score": 0.92, "kind": "restaurant" },
    { "id": "112", "score": 0.78, "kind": "restaurant" },
    { "id": "12",  "score": 0.65, "kind": "restaurant" }
  ],
  "engine": "gorse",
  "version": "0.5.0",
  "latencyMs": 41,
  "debug": { "served_by": "popular" }
}
```

**Errors** — the engine SHOULD respond `200` with `items: []` and an
explanatory `debug.error` rather than a non-2xx, so a single misbehaving
engine doesn't abort a multi-engine eval. `http.ts` will turn non-2xx
into a `RecoEngineError` recorded in the per-task report.

**Constraints**

- `k` is a request, not a guarantee. Engines may return fewer (e.g. when
  `candidatePool` is smaller than `k`).
- `score` is opaque to the eval runner — only the order of `items`
  matters. Use any scale you like as long as it's monotonic.
- `kind` MUST match the surface: `home_feed`/`home_promo`/`search` are
  `restaurant`; `store_items` is `item`.

## Adding a new engine

1. Implement `RecommendationEngine` in `lib/reco/engines/<name>.ts`
   (or stand up an HTTP service and use `engines/http.ts`).
2. Register it in `lib/reco/engines/index.ts`.
3. It shows up in `/api/reco/engines` and `/reco-eval` automatically.

## Why this contract is so small

The eval harness is the value, not the engines. Keeping the contract
minimal means real engines (Gorse, LightFM, Implicit, future LLM agent)
plug in with a few lines of glue. If something feels missing, push it
into `debug` first — promote it into the contract only after two engines
need it.
