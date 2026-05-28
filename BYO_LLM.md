# BYO LLM — bring your own model to the deployed demo

This doc is for clients (or anyone) who wants to evaluate **their own
LLM** on the deployed Dashdoor reco-eval gym **without sharing their
API key** with us and **without cloning this repo**.

The flow:

1. You run a tiny **OpenAI-compatible chat-completions gateway** on
   your side. Your real provider key lives only on that gateway.
2. You give us the gateway URL.
3. On the deployed `/reco-eval`, open the "Bring your own" panel and
   paste the URL. Tick the `agent` row. Run an eval.
4. The gym's agent sidecar makes its tick-by-tick LLM calls to **your
   URL** instead of `api.openai.com` / `api.anthropic.com`. Same Hit@K
   scoring as the library engines.

## What "OpenAI-compatible" means here

Your gateway needs to expose **one** endpoint:

```
POST {your-url}/chat/completions
```

with the standard OpenAI chat-completions request body:

```json
{
  "model": "gpt-4o-mini",
  "max_tokens": 256,
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system", "content": "<our agent prompt>" },
    { "role": "user",   "content": "<observation + task + history>" }
  ]
}
```

and the standard OpenAI response shape:

```json
{ "choices": [{ "message": { "content": "<JSON action>" } }] }
```

The agent expects a JSON action object back (per
`tools/reco-agent/prompts/agent.md`), so your model should respect the
`response_format: json_object` constraint.

If you have an internal Anthropic-style gateway instead (Messages
API), the same field works — the Claude provider in the sidecar
honors `baseURL`. Use a Claude model name (e.g.
`claude-sonnet-4-6`) and we'll route through the Claude path.

## Minimal FastAPI gateway example (~30 lines)

```python
# gateway.py — forwards /chat/completions to OpenAI with YOUR key
# Run on your infra; expose to the demo VM (34.134.213.241) only.
import os, httpx
from fastapi import FastAPI, Request

UPSTREAM = "https://api.openai.com/v1/chat/completions"
PROVIDER_KEY = os.environ["OPENAI_API_KEY"]   # YOUR real key — never shared

app = FastAPI()

@app.post("/chat/completions")
async def chat(req: Request):
    body = await req.json()
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            UPSTREAM,
            json=body,
            headers={
                "authorization": f"Bearer {PROVIDER_KEY}",
                "content-type": "application/json",
            },
        )
    return r.json()
```

Run:

```
pip install fastapi httpx uvicorn
OPENAI_API_KEY=sk-... uvicorn gateway:app --host 0.0.0.0 --port 8080
```

You can add IP allowlisting, rate limits, audit logging, model
restrictions, or any policy you want — the gym only cares that the
endpoint speaks the wire above.

## Plugging it in

On the deployed `/reco-eval`:

1. Expand the **Bring your own** panel.
2. Paste your gateway URL into **Custom LLM URL** — e.g.
   `https://my-llm-gateway.example.com/v1`.
   (The `/chat/completions` suffix is added by the agent; don't include it.)
3. Optionally paste a bearer token into **Custom LLM key** if your
   gateway requires auth from us. If you don't, leave it blank —
   our requests will arrive without an `Authorization` header.
4. Tick the `agent` row. Optionally tick library engines for
   side-by-side comparison.
5. Pick task set `seed` (10 tasks; takes ~7–10 min).
6. Click **Run**.

The `agent` row will show up in the Hit@K / NDCG / MRR table next to
your selected library engines.

## Privacy boundary

- **Your key never reaches our backend.** It lives only on your
  gateway. The Custom LLM key field is for *gateway* auth — not your
  provider key.
- The gym **forwards request bodies through** to your URL. That body
  contains our agent prompt + the per-tick page observation. Nothing
  about other clients.
- Trace files (`data/reco-agent-runs/`) on the gym record each tick's
  observation + action for debugging. If you don't want those
  persisted, ask us to disable trace writing for your session —
  documented as a deferred toggle in `future_ideas.md`.

## Just want to plug in a recommendation **service** (no LLM)?

Use the **Custom engine URL** field on the same panel. Implement any
HTTP service that takes a `RecoContext` JSON body and returns a
`RecommendationResponse` — same wire as LightFM / Implicit. Full
contract: `docs/reco-http-contract.md`. No model, no prompt, no
agent loop — just an engine.

## Limits worth knowing about

- The **prompt + action vocabulary are ours**. Your model has to
  emit JSON matching one of 8 action shapes (see
  `tools/reco-agent/prompts/agent.md`). It also has to follow our
  sign-in / restaurant-discovery instructions.
- The **browser still runs on our VM**. We dispatch the actions your
  model decides. If your model emits selectors the gym's DOM doesn't
  match, you'll see the failure reflected in your Hit@K.
- The gateway must be **reachable from the gym VM's egress**. If
  you're behind a VPN that requires us to dial in, that's a
  follow-up conversation.
