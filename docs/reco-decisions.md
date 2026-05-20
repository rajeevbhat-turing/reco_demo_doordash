# Recommendation eval — decisions (Phase 1)

Written *after* Phase 0 landed so the decisions reflect what's actually
in the code, not what we guessed before building.

## Surfaces in scope

| Surface          | In Phase 0? | Notes                                                                 |
|------------------|:----------:|-----------------------------------------------------------------------|
| `home_feed`      | ✓          | Restaurant grid on `/home`. Default surface in `RecoContext`.         |
| `store_items`    | ✓ (engine)  | Popularity engine handles items via `kind='item'`; no UI surface yet. |
| `home_promo`     | ✗          | Wait for Phase 2; promo banner ranking is small enough to skip.       |
| `search`         | ✗          | Wait for Phase 2.                                                     |

## Ground-truth sources

| Source                      | Used | Notes                                                       |
|-----------------------------|:----:|-------------------------------------------------------------|
| Curated seed (10 tasks)     | ✓    | `data/reco-tasks/seed.json` — single-named-restaurant.      |
| Order-history leave-one-out | ✓    | `lib/reco/eval/history-split.ts`. Uses the **order's** address, not the user's current default — synthetic users have cross-city defaults that produced false negatives in the first version. |
| Hand-curated personas       | ✗    | Not needed for Phase 0 demos.                               |

## Metrics

Implemented in `lib/reco/metrics.ts`:

- **Hit@K** — binary, 1 if any expected id appears in the top K.
- **Recall@K** — fraction of expected ids found in top K.
- **NDCG@K** — log discount, binary relevance.
- **MRR** — 1 / rank of first hit.
- **Coverage** — `|union of predicted ids| / catalogSize`. Catalog = `COUNT(*) FROM restaurants`.
- *Aggregate* is mean across tasks. Stderr deferred — not load-bearing yet.

## LLM-agent driver (for Phase 4)

Playwright + CDP, reusing the repo's `@playwright/test`. Decision will be
re-confirmed when Phase 4 starts; no code shipped for it yet.

## Engines

Phase 0 ships three:

| Engine       | Role                  | Where                                          |
|--------------|-----------------------|-----------------------------------------------|
| `random`     | Sanity floor          | `lib/reco/engines/random.ts`                  |
| `popularity` | Strong baseline       | `lib/reco/engines/popularity.ts`              |
| `gorse`      | First real engine     | `lib/reco/engines/gorse.ts` + compose sidecar |

Phase 2 adds **LightFM** and **Implicit** as FastAPI sidecars
(`tools/reco-engines/{lightfm,implicit}/`), each speaking the
`/recommend` HTTP wire contract documented in `lib/reco/README.md`.

## Calibration: what Phase 0 numbers look like and why

From the demo runs:

| Task set | random Hit@5 | popularity Hit@5 | reading |
|----------|:------------:|:----------------:|---------|
| seed (n=10)    | 0.100 | 0.000 | Seed expects a *specific* named restaurant; popularity returns globally popular ids — usually a miss. The harness correctly surfaces this. |
| history (n=18) | 0.000 | 0.056 | Popularity ≥ random, as expected. Both are low — synthetic catalog is large (≈ 500 restaurants) and popularity isn't personalized. Phase 2 engines should beat this. |

What we **don't** want to do: rebalance the seed until popularity wins.
The seed is intentionally a "needle in a haystack" set; it's there to
prove the harness can detect failure, not to flatter baselines.

## Out-of-scope confirmations

- **No A/B testing.** The eval is offline against fixed ground truth.
- **No multi-tenant auth on the demo.** `RECO_DEMO=1` is a single gate.
- **No re-ranking of the production `/home` feed in Phase 0.** That's
  Phase 3.
