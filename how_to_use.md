# How to use the reco demo

A usage guide for the deployed demo. Open the URL, pick a mode, click
through. Operator/deploy/troubleshooting lives in `deploy_plan.md`.

## Where it lives

| Thing | Value |
|---|---|
| Demo URL | http://34.134.213.241:3000 |
| Landing | http://34.134.213.241:3000/demo |
| Manual login email | `john.doe@example.com` |
| Manual login password | `password` |

The LLM-agent track signs itself in automatically — you only need the
login above if you want to click around the consumer app by hand.

## The landing — `/demo`

Three cards. Each routes to one of the demo modes below.

## Mode 1 — Engine evaluation

Open `/reco-eval`.

1. Tick the engines you want to compare (`random`, `popularity`,
   `gorse`, `lightfm`, `implicit`).
2. Pick a task set: **seed** (10 named-restaurant lookups) or
   **history** (order leave-one-out).
3. Hit **Run**.

The table shows Hit@K, NDCG@K, MRR, Recall@K, Coverage per engine.
Click a row for the per-task drilldown.

Talking points on the history split: **Implicit** beats **LightFM**
beats **popularity** by a clear margin on Hit@5.

## Mode 2 — LLM agent

Same page (`/reco-eval`) — the agent appears as the **`agent`** row in
the engine list.

1. Tick `agent` plus one or two library engines for comparison.
2. Pick task set **seed**.
3. Hit **Run**.

Each task takes about 30–60 seconds: the agent launches a headless
browser, lands on `/home` already logged in, scrolls the feed, picks a
restaurant, and finishes. The first restaurant it navigates into is
treated as its top-1 recommendation. Same Hit@K scoring as the library
engines.

If the demo machine has both Anthropic and OpenAI keys, the active
model is whatever the sidecar is configured for; the agent column is
always labelled `agent`.

## Mode 3 — Live re-rank

Open `/home`. In the header, find the **Reco** dropdown.

Switch between engines (`gorse`, `lightfm`, `implicit`). The
restaurant grid reorders. A small green pill shows **"re-ranked by
{engine}"** so the audience can tell what's driving the order.

## Walking a client through it (~15 min)

1. `/home` — show the consumer app first; point out the
   "Recommendation engine demo" link in the header.
2. `/demo` — read the three cards.
3. Mode 1 — run popularity + lightfm + implicit on the history task
   set; show the metric table.
4. Mode 2 — re-run with the `agent` row checked on one or two seed
   tasks; narrate the wait while the browser opens; show the agent
   row land next to the libraries.
5. Mode 3 — back on `/home`, toggle the Reco picker between two
   engines; watch the feed reorder.

## What to share with a client

Paste into a DM:

> **Reco demo:** http://34.134.213.241:3000/demo
>
> Manual login: `john.doe@example.com` / `password`. The LLM-
> agent mode doesn't need login.
>
> Three modes:
> - **Engine evaluation** — library models on the same task set.
> - **LLM agent** — the model drives the real UI; appears as `agent`
>   on the same scoreboard.
> - **Live re-rank** — toggle engines on `/home`, watch the feed
>   reorder.

## Related docs

- `deploy_plan.md` — deploy, DNS, TLS, restart, redeploy,
  troubleshooting
- `demo_setup.md` — product story, BYO-LLM contract, architecture
- `RECO_PLAN.md` — phased plan
- `future_ideas.md` — anything cut from v1
