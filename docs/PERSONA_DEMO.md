# Persona Demo Walkthrough

End-to-end guide for running and exploring the persona-driven recommendation eval lab.

---

## Prerequisites

- **Docker Desktop** running (OpenSearch runs as a container)
- **Node ≥ 18** with `npm`
- `.env` file present — copy from `.env.example` if missing:
  ```bash
  cp .env.example .env
  ```
- Dependencies installed:
  ```bash
  npm install
  ```
- **Optional — LLM Ranker A/B:** set `ANTHROPIC_API_KEY` in `.env` (or export it) to enable the server-default LLM path. For BYO LLM, you supply your own key at run time in the `/reco-eval` UI.

---

## Bring everything up

Run the single startup script from the repo root:

```bash
./run.sh
```

This does, in order:

1. Kills any stale process on `:4001`
2. Starts OpenSearch via Docker (`config/docker-compose.demo.yaml`)
3. Waits for OpenSearch to be ready on `:9200`
4. Seeds the restaurant index (`scripts/seed-opensearch.ts`) — idempotent
5. Starts the OpenSearch reco sidecar on `:4001` in the background
6. Starts the Next.js dev server on `:3000`

To also start the LLM ranker sidecar (needed for Path B A/B):

```bash
npm run reco:llm-ranker &   # starts :4002 in background
```

---

## Persona login IDs

All persona accounts use the password `password`.

| Persona | Email |
|---|---|
| Alice Tran | `alice.tran@example.com` |
| Ben Kowalski | `ben.kowalski@example.com` |
| Chloe Okafor | `chloe.okafor@example.com` |
| Diego Mendoza | `diego.mendoza@example.com` |
| Eli Nakamura | `eli.nakamura@example.com` |
| Fatima Rashid | `fatima.rashid@example.com` |
| Gabe Jensen | `gabe.jensen@example.com` |
| Hana Park | `hana.park@example.com` |
| Idris Mensah | `idris.mensah@example.com` |
| Julia Volkov | `julia.volkov@example.com` |

Personas log in through the **standard Dashdoor auth flow** (email → Continue → OTP). The OTP code is returned in the `generate-otp` response body, as it is for every gym user — there is no separate demo login.

Non-persona control user: `john.doe@example.com` / `password`

---

## What to look for on `/home`

After signing in as any persona user:

- **Labeled cuisine sections** appear above the normal restaurant feed, e.g. "More Thai for you", "Explore Italian".
- There are **3 familiar** cuisine sections (cuisines the persona orders frequently) and **1 new** section (a cuisine they haven't tried much).
- Within each section, one card is tagged **"Try something new"** to surface variety.
- Non-persona users (`john.doe@example.com`) see the **standard untouched feed** — no cuisine sections. Personalization keys purely off whether the signed-in user is a persona (user_id 3101–3110).

---

## What to look for on `/reco-eval`

`/reco-eval` is accessible **without login** — open it in a fresh incognito window if you want to verify.

### Engine picker

OpenSearch shows a `baseline` badge and cannot be unchecked. The **LLM Ranker** engine appears as an optional toggle (requires the `:4002` sidecar to be running).

### Persona selector

Dropdown of all 10 personas. Defaults to Alice Tran.

### BYO Ranker panel

A toggle below the persona picker opens the BYO panel with two tabs:

**"Use my endpoint"** — paste the base URL of any server that speaks the `/recommend` contract (see `docs/reco-http-contract.md`). Your server receives the same candidate set and returns ranked IDs + scores + trajectory. No registration required — it runs for this evaluation only.

**"Use my LLM"** — paste:
- **Base URL** (OpenAI-compatible, e.g. `https://api.openai.com/v1`)
- **API Key** — used for this request only; cleared from state immediately after Run; never logged or persisted
- **Model** (e.g. `gpt-4o-mini`)

The request routes through the LLM Ranker sidecar (`:4002`), which builds a ranking prompt from the persona profile and candidate features, calls your LLM, and returns ranked IDs.

### Run and A/B table

Click **Run** to:

1. Fetch the canonical candidate set from `/api/reco/candidates?personaId=<id>` (radius-filtered, feature-annotated)
2. Fan out to all selected engines + any BYO engine **concurrently**, passing the same candidate set
3. Render an **A/B comparison table** — rows are metrics (Precision@k, Recall@k, NDCG@k, Overlap, Blocked hits), columns are engines. The OpenSearch baseline column is highlighted in blue; best-performing cell in each row is **bold green**.

### Section win/loss

Below the comparison table, each expected persona section (e.g. "More Thai for you") shows a grid of ✓/✗ cells — one per expected restaurant. Green ✓ = the engine included that restaurant in its results. The ringed cell is the novelty slot. This tells you at a glance which sections each engine "won".

### Details drilldown

Each row in the per-engine ranked table has a `details` link that opens the **Trajectory modal**:

- **OpenSearch** — full `_explain` tree → score contributions panel at the bottom (cuisine match, rating boost, etc.)
- **LLM Ranker / BYO endpoint** — prompt shown in `query` step; per-candidate scores shown in the `final` step and in the score attribution panel

---

## Applying a winner to the home feed

After evaluating engines on `/reco-eval`, you can push a winning ranking directly into `/home` feed via the **global eval dropdown in the site header**:

1. **Run** the eval for a persona — e.g. Alice Tran with OpenSearch + LLM Ranker.
2. In the **Ranked results** section, each engine has an **Apply to home feed** button. Click it for the engine you want.
3. A toast confirms: *"Applied gpt-4o-mini to Alice Tran's home feed."* The run is written to `data/reco-traces/runs.json` on the server.
4. The **header dropdown** (next to the Reco Eval pill, always visible) now lists the saved run as `Alice Tran · LLM Ranker · gpt-4o-mini (HH:MM)`.
5. Select it from any page — `/home` renders Alice's persona sections reordered by that engine's `ranked_ids`, and a slim banner confirms: *"Showing Alice Tran's feed ranked by LLM Ranker · gpt-4o-mini — run …"*
6. To compare: run again with a different model or engine, then use the header dropdown to flip between runs — the feed reorders instantly.
7. To return to rule-derived order: select **— Rule default —** in the dropdown, or click **Clear** in the banner.

**Global + durable:** runs are stored server-side in `data/reco-traces/runs.json`, not per-browser. The same dropdown is visible to all sessions; picking a run from any machine shows the same persona feed.

**A/B demo:** run with `gpt-4o-mini`, then `gpt-4o`, then `OpenSearch` — the header dropdown accumulates all three. Flip between them without re-running to show how each model changes the ordering.

No API keys or credentials are ever written — only the engine's captured `ranked_ids` and scores.

---

## Smoke test

To verify the full stack end-to-end without the browser:

```bash
bash scripts/persona-demo-smoke.sh
```

The script:
1. Starts OpenSearch, seeds the index
2. Starts the OpenSearch sidecar on `:4001`
3. Verifies the backwards-compat recommend call (no candidates)
4. Builds the candidate set for alice-tran and calls OpenSearch with it (A/B path)
5. If `ANTHROPIC_API_KEY` is set: starts the LLM ranker sidecar on `:4002` and verifies a ranked response with `source=server-default`

Exits 0 on success.

---

## The client pitch

> "Your ranking model is scored against OpenSearch. Send us your `/recommend` endpoint — or paste your LLM API key — and we run both on the same candidate pool, score them against the same ground truth, and show you exactly where yours wins and where it doesn't."

This is `design.md` §OpenSearch as baseline in action.
