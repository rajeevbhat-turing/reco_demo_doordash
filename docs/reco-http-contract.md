# Reco HTTP Contract

All `/recommend` engines — OpenSearch baseline and BYO engines — speak the same contract.
The canonical TypeScript types live in `lib/reco/types.ts` (`RecommendRequest`, `RecommendResponse`).

---

## POST /recommend

### Request

```json
{
  "personaId": "alice-tran",
  "topK": 20,
  "candidates": [
    {
      "id": 101,
      "features": {
        "cuisine_affinity_match": 0.9,
        "price_tier_match": true,
        "distance_miles": 1.2,
        "avg_rating": 4.3,
        "persona_order_count": 7,
        "promo_discount": 10,
        "dash_pass": true
      }
    }
  ],
  "llm": {
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "sk-...",
    "model": "gpt-4o-mini"
  }
}
```

| Field | Required | Description |
|---|---|---|
| `personaId` | Yes | ID of the persona from `data/reco-personas/personas.json` |
| `topK` | No | Maximum results to return (default: 20) |
| `candidates` | Recommended | The pre-built candidate set from `/api/reco/candidates`. When omitted, each engine retrieves its own pool (the OpenSearch baseline falls back to city-based retrieval). Providing this makes the A/B comparison apples-to-apples. |
| `llm` | No | LLM re-ranker only. Credentials for a BYO LLM (OpenAI-compatible format). Key is used for the duration of the request only — never logged or persisted. |

### `candidates[].features` — per-candidate feature vector

| Field | Type | Description |
|---|---|---|
| `cuisine_affinity_match` | `number` 0–1 | Persona's affinity score for this restaurant's cuisine (`preferences.cuisine_affinity[cuisine] ?? 0`) |
| `price_tier_match` | `boolean` | Restaurant's `price_range` falls within the persona's `price_tier` |
| `distance_miles` | `number` | Haversine distance from the persona's address |
| `avg_rating` | `number` | `AVG(rating)` over approved `user_reviews` (0 if none) |
| `persona_order_count` | `number` | Count of past orders this persona placed at this restaurant |
| `promo_discount` | `number` | Restaurant's `discount_percentage` (0 if none) |
| `dash_pass` | `boolean` | Restaurant is DashPass eligible |

The candidate pool is produced by `lib/reco/candidates.buildCandidates(persona, db)`, which applies `CANDIDATE_RADIUS_MILES` (default 25 mi) and `price_tier` filtering — the same pool `buildExpected` uses for the ground-truth rule. Exposed to clients via `GET /api/reco/candidates?personaId=<id>`.

---

### Response

```json
{
  "engine": "opensearch",
  "personaId": "alice-tran",
  "ranked_ids": [101, 205, 88],
  "scores": { "101": 9.4, "205": 7.1, "88": 6.3 },
  "trajectory": {
    "engine": "opensearch",
    "steps": [
      { "stage": "query", "restaurant_ids": [], "notes": "{...}" },
      { "stage": "candidate_gen", "restaurant_ids": [101, 205, ...], "notes": "..." },
      { "stage": "score", "restaurant_ids": [...], "scores": { "101": 9.4 }, "notes": "..." },
      { "stage": "final", "restaurant_ids": [101, 205, 88] }
    ],
    "raw_explain": [{ "id": 101, "score": 9.4, "explanation": { ... } }]
  },
  "source": "byo-gateway",
  "gatewayHost": "api.openai.com"
}
```

| Field | Description |
|---|---|
| `engine` | Engine identifier (`"opensearch"`, `"llm-ranker"`, `"custom"`) |
| `personaId` | Echo of the request's `personaId` |
| `ranked_ids` | Restaurant IDs in ranked order (best first), length ≤ `topK` |
| `scores` | Per-restaurant scores (optional; higher = better) |
| `trajectory` | Decision audit trail — see `docs/reco-trajectory-shape.md` |
| `source` | LLM ranker only: `"byo-gateway"` (BYO key used) or `"server-default"` (env key) |
| `gatewayHost` | LLM ranker BYO path only: hostname of the BYO LLM endpoint |

---

## GET /health

Returns `{ "status": "ok", "engine": "<name>" }`. Used by smoke tests and the demo startup script to wait for sidecar readiness.

---

## Engine registry

`config/reco-engines.json` lists all engines. The `baseline: true` engine (OpenSearch) is always selected on `/reco-eval` and its column is highlighted as the line to beat.

```json
[
  { "id": "opensearch", "label": "OpenSearch", "url": "http://localhost:4001", "baseline": true },
  { "id": "llm-ranker", "label": "LLM Ranker", "url": "http://localhost:4002" }
]
```

BYO engines are registered transiently for a single run via the `/reco-eval` BYO panel:
- **"Use my endpoint"** tab — any URL serving this contract
- **"Use my LLM"** tab — uses the llm-ranker sidecar with your credentials

---

## A/B evaluation flow

```
Browser
  ↓  GET /api/reco/candidates?personaId=alice-tran
  ←  { candidates: [...], expected: ExpectedTask }

Browser → POST http://localhost:4001/recommend  (OpenSearch, with candidates)
Browser → POST http://localhost:4002/recommend  (LLM Ranker, with candidates + llm?)
Browser → POST http://custom.example.com/recommend  (BYO endpoint, with candidates)
  ←  ranked_ids, scores, trajectory  (per engine)

Browser computes scoreTask(ranked_ids, expected) for each engine
  →  Comparison table on /reco-eval (precision@k, recall@k, NDCG@k, overlap, blocked_hits)
```
