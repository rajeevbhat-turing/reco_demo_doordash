# Reco HTTP wire contract

Single shape both the Next.js eval harness and every HTTP-shaped engine
(LightFM, Implicit, future Recombee stub, etc.) speak. Gorse predates
this contract and has its own endpoint shape; the Gorse adapter
(`lib/reco/engines/gorse.ts`) translates internally.

The TypeScript source of truth is `lib/reco/types.ts`. This doc is the
mirror image for non-TS clients.

---

## Endpoint

```
POST {engine}/recommend
Content-Type: application/json
Authorization: Bearer <api-key>   (optional, only if engine requires it)
```

## Request body — `RecoContext`

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

| Field            | Type                   | Required | Notes                                                                                                                       |
|------------------|------------------------|:--------:|-----------------------------------------------------------------------------------------------------------------------------|
| `userId`         | string                 | no       | Logged-in user id. Omitted for guest evals; treat as cold-start.                                                            |
| `lat` / `lng`    | number                 | yes      | Delivery-address lat/lng. Location-aware engines may filter by this; non-location engines ignore it.                        |
| `surface`        | enum (see below)       | yes      | Determines whether the engine returns restaurants or items.                                                                 |
| `candidatePool`  | string[]               | no       | If set, engine MUST restrict output to ids in this set. If unset, engine uses its own candidate selection.                  |
| `k`              | integer ≥ 1            | yes      | How many items to return. A *request*, not a guarantee — return fewer if the pool runs out.                                 |
| `now`            | ISO-8601 string        | no       | Override "now" for time-aware engines (lunch vs dinner, day-of-week trends). Use server clock if absent.                    |
| `recentOrderIds` | string[]               | no       | The user's recent order ids, newest first. Optional sequence signal for sequence-aware engines.                             |

### Surfaces

| Surface       | Engine returns | Where Dashdoor would render it     |
|---------------|----------------|-------------------------------------|
| `home_feed`   | restaurants    | `/home` main restaurant grid        |
| `home_promo`  | restaurants    | `/home` promo banner carousel       |
| `search`      | restaurants    | `/search` results re-ranking        |
| `store_items` | items          | `/store/[id]` popular-items section |

`kind` in the response must match: `restaurant` for the first three,
`item` for `store_items`.

## Response body — `RecommendationResponse`

```json
{
  "items": [
    { "id": "47",  "score": 0.92, "kind": "restaurant", "meta": { "reason": "user-nn" } },
    { "id": "112", "score": 0.78, "kind": "restaurant" },
    { "id": "12",  "score": 0.65, "kind": "restaurant" }
  ],
  "engine": "lightfm",
  "version": "1.17-warp",
  "latencyMs": 41,
  "debug": { "fallback": false, "candidates_considered": 318 }
}
```

| Field         | Type                          | Required | Notes                                                                                                                          |
|---------------|-------------------------------|:--------:|--------------------------------------------------------------------------------------------------------------------------------|
| `items`       | RecoItem[]                    | yes      | Ranked, best first. May be `[]` (no results found) — see error policy.                                                         |
| `engine`      | string                        | yes      | Engine `name` echoed back. Lets a multi-engine eval audit which engine produced which row, even when proxied.                  |
| `version`     | string                        | yes      | Engine version. Bump when the model changes so old reports stay interpretable.                                                 |
| `latencyMs`   | number                        | yes      | Wall-clock latency the engine spent producing this response. Used for the latency column in the demo UI.                       |
| `debug`       | object                        | no       | Free-form per-engine debug info. Shown in the per-task drilldown on `/reco-eval`. Keep keys snake_case for cross-language ease. |

### `RecoItem`

| Field   | Type                     | Required | Notes                                                                  |
|---------|--------------------------|:--------:|------------------------------------------------------------------------|
| `id`    | string                   | yes      | Stable id for the entity. Restaurant id (string of `restaurants.id`) or menu item id (`menu_items.id`). |
| `score` | number                   | yes      | Higher = better. Eval runner only uses *order*; any monotonic scale works. |
| `kind`  | `"restaurant"`/`"item"`  | yes      | Must match the request's `surface`.                                    |
| `meta`  | object                   | no       | Optional per-item debug — e.g. `{ "reason": "user-nn" }`, surfaced on the drilldown. |

## Error policy

Engines SHOULD respond `200 OK` with `items: []` and an explanatory
`debug.error` rather than a non-2xx status. The eval runner treats
empty results as "engine had nothing to say for this task" and keeps
going; non-2xx becomes a `RecoEngineError` that's recorded against the
(task, engine) cell but does not abort the run.

Examples:

| Situation                          | Recommended response                                                                                  |
|------------------------------------|-------------------------------------------------------------------------------------------------------|
| Unknown `userId`                   | `200`, popularity-based fallback in `items`, `debug.fallback = true`                                  |
| Empty `candidatePool` after filter | `200`, `items: []`, `debug.error = "no candidates matched filters"`                                   |
| Model not yet trained              | `503` (cold service start — runner's retry-once kicks in) **or** `200` with popularity fallback       |
| Invalid request shape              | `400` with `{"error": "..."}` — caller bug, retry won't help                                          |

## Constraints

- **`k` is a request, not a guarantee.** Engines may return fewer
  (e.g. when `candidatePool` is smaller than `k`).
- **`score` is opaque to the eval runner.** Only `items` order matters.
- **`kind` must match the surface.** A `store_items` request that gets
  back `restaurant` ids will produce a typed-but-meaningless score.
- **No streaming.** The eval runner expects a single JSON response.
- **Default timeout is 5 s** (configurable in `http.ts`). p95 budget
  for the ~500-restaurant catalog is < 1 s.

## Version handshake

Every response must echo `engine` and `version`. The eval report
stores these and the demo UI displays them in the engine list, so a
report from a prior model version can be re-read months later and
still identified.

If an engine ships v2 and `engine: name` is unchanged, bump `version`
(e.g. `1.17-warp` → `1.17-warp-r2`). If the model swap is large enough
to warrant a different name in the registry (e.g. `lightfm-warp` vs
`lightfm-bpr`), register two adapters.

## Health endpoint

Sidecars SHOULD expose `GET /health` returning `200 {"ok": true}` once
they're ready to serve `/recommend`. Compose `depends_on` uses this to
gate startup ordering. Engines that need long warmup (LightFM training,
Implicit ALS) should return `503` until the first model is loaded.

## BYO engine via `/reco-eval` (Phase 5)

Clients can plug in their own engine **without** us editing the
registry: paste its URL into the **Bring your own → Custom engine URL**
field on `/reco-eval`. The eval runner wraps it with the same
`makeHttpEngine` adapter library engines use (`lib/reco/engines/http.ts`)
and runs it for that request only as a row labelled `custom`. Same
wire contract as the rest of this doc — your service just needs to
accept `RecoContext` and return `RecommendationResponse`. The URL is
not persisted server-side.

Additional optional fields on `RecoContext` are forwarded but
*agent-only* — library and BYO engines should drop them:

| Field | Purpose |
|---|---|
| `taskId` | Lookup key for the agent sidecar to fetch the task statement. |
| `startUrl` | Browser entry URL for the agent's Playwright session. |
| `agentLlmUrl` | OpenAI-compatible gateway URL the agent's LLM ticks against. |
| `agentLlmApiKey` | Bearer for the gateway above, if it requires one. |

See `BYO_LLM.md` for the LLM-side counterpart (point our agent at
your gateway).

## See also

- `lib/reco/types.ts` — TypeScript definitions.
- `lib/reco/README.md` — engine-author onboarding.
- `lib/reco/engines/http.ts` — the generic adapter; what every HTTP
  engine talks to from the Next.js side.
- `lib/reco/engines/gorse.ts` — example of a non-contract engine
  whose adapter does the shape translation locally.
- `BYO_LLM.md` — Phase 5 BYO LLM gateway pattern + plug-in flow.
