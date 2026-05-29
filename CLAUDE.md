# CLAUDE.md

Orientation file for Claude sessions in this repo. Be concise.
Update when something here goes stale.

## What this repo is

**Dashdoor** — a Next.js 15 / TypeScript clone of DoorDash used as an
**RL/UI gym**. Three sub-apps share one codebase: consumer (`/home`,
`/store`, `/search`, …), delivery (`/delivery`), merchant
(`/merchant`). Data lives in three local SQLite files under
`data/db/` and is baked into the production Docker image.

## What we are working on

Turning the gym into a **persona-driven recommendation evaluation
lab**: ten consumer personas with preferences and order/review
history, a rule-derived ground truth, **OpenSearch as the named
baseline**, persona-aware UI sections on `/home`, and **trajectory
visibility** so we can see why each engine ranked the way it did.

- **What we're building:** `design.md`
- **Phased plan (checkboxes):** `plan.md`
- **Current phase, step-by-step:** `execution_plan.md`
- Read all three before starting work.

## Shell workflow

For any multi-step shell work, write a script to `.scratch/` at the
repo root and run it, instead of running multiple inline Bash
commands.

- One script = one permission prompt instead of many.
- Name scripts descriptively (e.g. `.scratch/seed_personas_dry_run.sh`).
- Skip for one-liners and for commands already on the allowlist.
- `.scratch/` is gitignored — create it if missing.

### Checkbox discipline (required)

`plan.md` and `execution_plan.md` are the single source of truth for
progress.

- Before starting a step, find its checkbox in `execution_plan.md`
  (or `plan.md` for phase-level items).
- The moment a step is fully done — code written, tests green, change
  visible — flip its `[ ]` to `[x]` in the same commit that delivers
  it. Don't batch checkboxes at the end of the session.
- If partially done, leave `[ ]` and add a one-line note
  (`> note: …`) describing what's left.
- When a step is wrong/obsolete, edit or strike it (`~~text~~`)
  rather than silently checking.
- When a whole phase exits, **clear `execution_plan.md`'s body** and
  replace it with the next phase's detailed steps, then tick the
  phase in `plan.md`.
- New work discovered mid-phase gets appended as new unchecked
  boxes in `execution_plan.md` — don't let scope live only in
  commits or chat.

## Where things live

| What | Where |
|---|---|
| Consumer pages | `app/home/page.tsx`, `app/search/page.tsx`, `app/store/[id]/page.tsx` |
| Restaurant feed API | `app/api/restaurants/route.ts` |
| Popular items API | `app/api/restaurants/popular-items/route.ts` |
| Orders API (signals) | `app/api/orders/route.ts` |
| Verifier / oracle | `lib/verifier/`, `app/api/expected-state/*`, `store/verifier-store.ts` |
| Zustand stores | `store/*.ts` |
| API client wrappers | `lib/api/*` |
| DB clients | `lib/db.ts`, `lib/delivery-db.ts`, `lib/merchant-db.ts` |
| Schema | `dashdoor_schema.sql`, `DATABASE_SCHEMA_DOCUMENTATION.md` |
| Existing architecture docs | `ARCHITECTURE_DIAGRAM.md`, `ACTUAL_STATE_STRUCTURE.md`, `EXPECTED_STATE_FUNCTIONS.md` |
| Docker (prod) | `Dockerfile.prod` |

New code for the reco lab lives under (will exist after Phase 1+):
- `data/reco-personas/` — persona JSON + hand overrides
- `lib/reco/` — ground-truth rule, types
- `tools/reco-engines/opensearch/` — OpenSearch sidecar
- `components/cuisine-section.tsx` — persona-aware section UI
- `data/reco-traces/` — trajectory captures

## Commands

```
npm install
cp .env.example .env
npm run dev                 # local dev on :3000
npm run test:unit
npm run test:e2e:chromium

docker build -f ./Dockerfile.prod -t dashdoor . --load
docker run -p 3000:3000 dashdoor
```

Env knobs that matter:
- `LIBSQL_URL`, `DELIVERY_LIBSQL_URL`, `MERCHANT_LIBSQL_URL` — DB paths
- `PREFIX_URL` — image CDN prefix

## Working agreements

- Prefer editing existing files over creating new ones outside the
  reco module roots listed above.
- Don't break existing Dashdoor flows or e2e specs — the gym is also
  used as-is by other consumers.
- When changing the plan, edit `design.md` / `plan.md` /
  `execution_plan.md`. Don't scatter status into new markdown files.
- The seed DBs are committed; don't migrate schema casually —
  propose it first.
