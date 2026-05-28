# CLAUDE.md

Orientation file for Claude sessions in this repo. Be concise. Update when
something here goes stale.

## What this repo is

**Dashdoor** — a Next.js 15 / TypeScript clone of DoorDash used as an
**RL/UI gym**. Three sub-apps share one codebase: consumer (`/home`,
`/store`, `/search`, …), delivery (`/delivery`), merchant (`/merchant`).
Data lives in three local SQLite files under `data/db/` and is baked into
the production Docker image.

## What we are working on

Turning the gym into a **recommendation-engine evaluation harness** with two
tracks:

1. **Engine plug-in track** — pluggable adapters that take a `RecoContext`
   and return a ranked list; scored offline against ground truth.
2. **LLM-agent track** — an LLM drives the real Dashdoor UI and the agent's
   choices are scored with the same metrics.

Deployable to a VM for demos (compose stack + TLS; see deploy plan).

- **Plan (phased, checkboxes):** `RECO_PLAN.md`
- **Current phase, step-by-step:** `EXECUTION.md`
- **Big-picture flowcharts:** `docs/overview-flowchart.md`
- **Client demo / BYO LLM setup (ideas):** `demo_setup.md`
- **GCP deploy + TLS (`reco-demo.turing.com`, VM `10.128.0.51`):** `deploy_plan.md`
- Always read both before starting work.

### Checkbox discipline (required)

`RECO_PLAN.md` and `EXECUTION.md` are the single source of truth for
progress. Keep them current:

- [ ] Before starting a step, find its checkbox in `EXECUTION.md` (or
      `RECO_PLAN.md` for phase-level items).
- [ ] The moment a step is fully done — code written, tests green, change
      visible — flip its `[ ]` to `[x]` in the same commit/PR that
      delivers it. Don't batch checkboxes at the end of the session.
- [ ] If a step is partially done, leave it `[ ]` and add a one-line note
      under it (`> note: …`) describing what's left. Never check a box
      you wouldn't defend in review.
- [ ] When a step turns out to be wrong/obsolete, edit the text (or
      strike it: `~~text~~`) rather than silently checking it.
- [ ] When a whole phase is done, tick its exit-criterion bullet in
      `RECO_PLAN.md`, then replace `EXECUTION.md`'s body with the next
      phase's detailed steps (per the wrap-up step in `EXECUTION.md`).
- [ ] Discoveries that add new work get appended as new unchecked
      checkboxes in the appropriate section — don't let scope live only
      in commit messages or chat.

## Where things live (only what matters for the reco work)

| What | Where |
|---|---|
| Consumer pages | `app/home/page.tsx`, `app/search/page.tsx`, `app/store/[id]/page.tsx` |
| Restaurant feed API | `app/api/restaurants/route.ts` |
| Popular items API | `app/api/restaurants/popular-items/route.ts` |
| Promo banners API | `app/api/promotionals/route.ts` |
| Orders API (signals) | `app/api/orders/route.ts` |
| Oracle / expected-state APIs | `app/api/expected-state/*` |
| Oracle functions (in-app) | `lib/verifier/expected-state-functions/*` |
| Task definitions + graders | `tasks/dashdoor.csv` (parsed by `app/api/v1/get_expected_state/route.ts`) |
| Verifier state (events the UI emits for grading) | `store/verifier-store.ts` |
| Zustand stores | `store/*.ts` |
| API client wrappers | `lib/api/*` |
| DB clients | `lib/db.ts`, `lib/delivery-db.ts`, `lib/merchant-db.ts` |
| Schema | `dashdoor_schema.sql`, `DATABASE_SCHEMA_DOCUMENTATION.md` |
| Existing architecture/state docs | `ARCHITECTURE_DIAGRAM.md`, `ACTUAL_STATE_STRUCTURE.md`, `EXPECTED_STATE_FUNCTIONS.md` |
| Docker (prod) | `Dockerfile.prod` |

New reco code should live under `lib/reco/`, `app/api/reco/`, and
`app/reco-eval/` (see `EXECUTION.md`).

## Commands

```
npm install
cp .env.example .env
npm run dev                 # local dev on :3000
npm run test:unit
npm run test:e2e:chromium

docker build -f ./Dockerfile.prod -t dashdoor . --load
docker run -p 3000:3000 -e RECO_DEMO=1 dashdoor

# Full reco demo stack (VM or local):
#   ENV_FILE=deploy/env.demo.example ./scripts/demo-up.sh
#   ./scripts/deploy-seed-gorse.sh
# GCP + TLS: deploy_plan.md — https://reco-demo.turing.com
```

Env knobs that matter:
- `LIBSQL_URL`, `DELIVERY_LIBSQL_URL`, `MERCHANT_LIBSQL_URL` — DB paths
- `PREFIX_URL` — image CDN prefix
- `RECO_DEMO=1` — exposes the recommendation eval demo at `/reco-eval`
  (added in Phase 1)
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — Phase 4 agent track. The
  sidecar auto-loads `.env` (`tools/reco-agent/src/load-env.ts`), so no
  shell sourcing is needed.

## Phase 4 agent — invoking the sidecar

The sidecar lives in `tools/reco-agent/` with its own `package.json` and
`node_modules`. Two ways to run it:

```
# directly, no env juggling — load-env.ts pulls keys from ../../.env
cd tools/reco-agent
./node_modules/.bin/tsx src/run.ts '<AgentInput JSON>'      # one-shot CLI
./node_modules/.bin/tsx src/server.ts                        # HTTP server :8003
./node_modules/.bin/tsc --noEmit                             # sidecar typecheck
./node_modules/.bin/vitest run                               # sidecar tests
```

These patterns are pre-allowed in `.claude/settings.local.json`, so
future sessions won't need permission prompts. Use them instead of
`set -a; source .env; set +a; …` prefixes.

Useful sidecar env knobs:
- `RECO_AGENT_HEADLESS=0` — show the browser window (default: headless)
- `RECO_AGENT_MAX_STEPS` — override the default step cap
- `RECO_AGENT_TARGET_URL` — base URL of the parent app from inside the
  sidecar (default `http://localhost:3000`; use
  `http://host.docker.internal:3000` from a container)
- `RECO_AGENT_MODEL` — override the default model (auto-detects Claude
  vs OpenAI based on which API key is present)

## Working agreements

- Prefer editing existing files over creating new ones outside the reco
  module roots above.
- Don't break existing Dashdoor flows or e2e specs while adding the reco
  harness — the gym is also used as-is by other consumers.
- When changing the plan, edit `RECO_PLAN.md` and `EXECUTION.md`; don't
  scatter status into new markdown files.
- The seed DBs are committed; don't migrate schema casually — propose it
  first.
