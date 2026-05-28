# Dashdoor reco demo — what it is, how it works, why it's useful

A live consumer food-delivery app (the "gym") instrumented as an
**evaluation harness for recommendation engines and LLM agents**.
Same UI a person would use to order dinner — every action is graded
against ground-truth tasks and scored with standard ranking metrics.

This page is the one-screen explainer. For the click-through guide,
see the **`/demo`** landing. For the wire contract you implement to
plug in your own engine, see **`/docs/reco-http-contract`**. For the
LLM-gateway path, see **`/docs/byo-llm`**.

---

## What it is

A working DoorDash-style consumer app — `/home`, `/store/<id>`,
`/search`, cart, checkout — backed by real seed data (~600
restaurants, ~3,000 users, ~67,000 historical orders). Behind it sits
an **evaluation harness** that:

- runs each rec engine over a fixed task set (curated seed + order-
  history leave-one-out);
- scores each engine's ranked output against ground truth with
  **Hit@K, NDCG@K, MRR, Recall@K, Coverage**;
- exposes the same scoreboard for LLM agents that drive the real
  browser through the gym — so an agent's trajectory (first
  restaurant it clicked) gets a Hit@K **on the same scale** as a
  library model's ranked list.

The point: any recommender — a classical CF model, a transformer
re-ranker, an LLM agent, your in-house recommendation service — gets
scored on the same tasks with the same metrics.

---

## How it works

### Task → context → ranking → score

1. A **task** is a small JSON object: `{ statement, userLat/Lng,
   surface: "home_feed", expectedItemIds: ["202"] }`. The expected
   IDs are the ground truth (e.g. West Diner = restaurant 202).
2. The harness builds a **`RecoContext`** for the task (user id,
   location, surface, k) and hands it to each selected engine.
3. Each engine returns a `RecommendationResponse` — a ranked list of
   restaurant/item IDs. Library engines compute it offline; the
   LLM-agent engine drives the actual browser.
4. The harness compares the ranked list to the expected IDs and
   computes the metrics.

### Two tracks, one scoreboard

| Track | What runs | Wire |
|---|---|---|
| **Engine plug-in** | Library models (`popularity`, `gorse`, `lightfm`, `implicit`) or any HTTP service of yours | `POST /recommend` with a `RecoContext`, returns `RecommendationResponse`. Contract: `/docs/reco-http-contract`. |
| **LLM agent** | Headless Chromium + your LLM drives `/home`, clicks into restaurants, optionally adds to cart. First `/store/<id>` it visits = its top-1 recommendation. | Standard chat-completions to an OpenAI-compatible endpoint. Contract: `/docs/byo-llm`. |

Both produce a row in the same Hit@K table on `/reco-eval`. The agent
takes longer per task (~30–60 s in a browser vs. tens of ms for a
library); both are scored identically.

### Bring your own — without sharing keys

The deployed `/reco-eval` exposes a **Bring your own** panel:

- **Custom LLM URL**: point the gym's agent at an OpenAI-compatible
  gateway you host. Your provider key stays on your gateway; we just
  send chat messages. Keys never reach our backend.
- **Custom engine URL**: any HTTP service that speaks the wire
  contract. Adds a `custom` row to the scoreboard alongside our
  library engines. No clone, no install on your side beyond that one
  service.

---

## What value it provides

1. **Apples-to-apples comparison.** Your model, our library models,
   and an LLM agent all see the same task and same context. The same
   metric column is the only number anyone has to argue about.
2. **A real UI for agent evals.** Most rec benchmarks are offline
   click-prediction datasets. This one drives an actual consumer app
   — with modals, addresses, carts, checkout — so an LLM agent's
   weaknesses (selector handling, distractor banners, modal
   intercepts) surface in the score.
3. **Zero-integration plug-in.** Both tracks expose URL fields on the
   demo UI; no SDK to import, no schema to learn beyond two JSON
   shapes documented in this same repo.
4. **Self-serve, BYO keys.** Clients never share API keys; the only
   thing we host on our infra is the consumer app and the eval
   runner. Their model + key live on their side.

---

## How a third-party rec team uses this

The intended workflow for a recommendation team that already has a
production engine they want to validate or improve:

1. **Plug it in**: expose your existing engine behind a `POST
   /recommend` endpoint (or run a tiny shim if the shape differs).
   Paste the URL into the BYO panel on `/reco-eval`. It becomes a
   `custom` row on the next eval.
2. **Score against baselines**: pick a task set (the curated 10-task
   seed for needle-in-haystack, or the 50-task history split for
   personalization signal). See how your engine compares to
   `popularity` / `lightfm` / `implicit` / `gorse` on Hit@5.
3. **Compare against an LLM agent**: tick the `agent` row, point it
   at your team's LLM gateway via the same BYO panel. See whether a
   prompted general-purpose LLM driving the UI gets close to your
   trained model on the same tasks.
4. **Iterate**: change weights, features, prompts, fine-tunes. Re-run
   the same task set. The aggregate row + per-task drilldown shows
   exactly which tasks moved.
5. **Bring back the wins** to your production engine — the gym is
   only the test harness; nothing about it is locked to our infra.

For an LLM/agent team specifically: the gym is a non-toy environment
to validate that your model can actually drive a real e-commerce UI.
A model that scores 0.6 Hit@5 here is doing real selector reasoning,
real disambiguation, real modal handling — not parroting a JSON
schema.

---

## What's in the box

- **Consumer app**: `/home`, `/store/<id>`, `/search`, cart sidebar,
  full checkout flow. Real SQLite catalog (`data/db/dashdoor.db`).
- **Engine track**: pluggable adapter contract
  (`/docs/reco-http-contract`); 5 built-in engines (`random`,
  `popularity`, `gorse`, `lightfm`, `implicit`); persistent training
  for the ML sidecars.
- **Agent track**: Playwright-driven headless Chromium; per-task
  trajectory recorded; first-restaurant extraction; same Hit@K as
  library engines.
- **Demo UI**: `/demo` landing, `/reco-eval` scoreboard with engine
  selector + BYO panel, live re-rank picker on `/home`.
- **Metrics**: Hit@K, NDCG@K, MRR, Recall@K, Coverage. Per-task
  drilldown shows predicted vs. expected for every engine + the
  agent.
- **Privacy boundary**: client-supplied keys never persist. BYO LLM
  URL/key are request-scoped; we forward chat messages and discard
  the auth.

---

## Related

- `/demo` — landing with click-through cards
- `/reco-eval` — the scoreboard
- `/docs/byo-llm` — bring your own LLM gateway
- `/docs/reco-http-contract` — wire contract for the engine track
