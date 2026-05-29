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
  cd tools/reco-engines/opensearch && npm install && cd -
  ```

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

---

## Persona login IDs

All persona accounts use the password `password`.

| Persona | Email |
|---|---|
| Alice Tran | `alice.tran@personas.demo` |
| Ben Kowalski | `ben.kowalski@personas.demo` |
| Chloe Okafor | `chloe.okafor@personas.demo` |
| Diego Mendoza | `diego.mendoza@personas.demo` |
| Eli Nakamura | `eli.nakamura@personas.demo` |
| Fatima Rashid | `fatima.rashid@personas.demo` |
| Gabe Jensen | `gabe.jensen@personas.demo` |
| Hana Park | `hana.park@personas.demo` |
| Idris Mensah | `idris.mensah@personas.demo` |
| Julia Volkov | `julia.volkov@personas.demo` |

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

1. **Engine picker** — OpenSearch is shown with a `baseline` badge and cannot be unchecked. Additional engines (if registered in `config/reco-engines.json`) appear as toggleable pills.

2. **Persona selector** — dropdown of all 10 personas. Defaults to Alice Tran.

3. **Run** — fires `POST :4001/recommend` for the selected persona and engine, then renders a ranked table of restaurants (rank, ID, name, cuisine).

4. **Details drilldown** — each row has a `details` link that opens the **Trajectory modal**, showing the steps the engine took:
   - `candidate_gen` — how many restaurants were retrieved from the index
   - `score` — the per-restaurant scores at ranking time (top 10 shown)
   - `final` — the final ordered list
   - `query` — the full OpenSearch query JSON (collapsible)

5. **Score contributions** — at the bottom of the trajectory modal, a table shows how each function (cuisine match, rating boost, etc.) contributed to the top restaurant's score, derived from OpenSearch `_explain`.

---

## Smoke test

To verify the stack end-to-end without the browser:

```bash
bash scripts/persona-demo-smoke.sh
```

Exits 0 if OpenSearch, seeding, sidecar, and the alice-tran recommend call all pass.
