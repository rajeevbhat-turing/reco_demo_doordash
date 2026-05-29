# Plan — Persona-driven recommendation eval

Six phases. Each row below maps to a phase. Detailed steps for the
**active** phase live in `execution_plan.md`; when a phase ends,
`execution_plan.md` is cleared and replaced with the next phase's
steps. See `design.md` for what we're building.

When a task finishes, tick the box in both files in the same commit.

---

## Phase 1 — Persona seed + data shapes documented

- [x] 10 personas in `data/reco-personas/personas.json` (5 with family)
- [x] `data/db/schema/personas_schema.sql` + `personas_seed.sql`
- [x] Seeded orders + reviews (≥ 2 negative per persona)
- [x] `/home` loads cleanly when logged in as any persona
- [x] `docs/reco-persona-shape.md` + `docs/reco-family-shape.md`

## Phase 2 — Rule-derived ground truth

- [x] `lib/reco/types.ts` — `ExpectedTask` / `ExpectedSection` types
- [x] `lib/reco/eval/persona-truth.ts` — pure `buildExpected(persona)` rule
- [x] `data/reco-personas/overrides.json` — hand-override file + merge logic
- [x] `scripts/dump-persona-truth.ts` — CLI to print the rule's output per persona
- [x] Unit tests for the rule (hot-cuisines, sectioning, block list, family constraints, override merge)

## Phase 3 — OpenSearch baseline engine

- [x] OpenSearch sidecar in `config/docker-compose.demo.yaml`
- [x] `tools/reco-engines/opensearch/` implements `POST /recommend`
- [x] `scripts/seed-opensearch.ts` loads from SQLite (idempotent)
- [x] Engine registered in `config/reco-engines.json` (`baseline: true`)

## Phase 4 — Persona-aware UI sections

- [x] `/reco-eval` page — engine picker, results table, opensearch pinned as baseline
- [x] `components/cuisine-section.tsx` (3 familiar + 1 new)
- [x] `/home` renders sections when logged in as a persona (`RECO_DEMO=1`)
- [x] Non-persona users see untouched home feed

### How to test Phase 4

Login IDs (seeded users 3101–3110, password is literally `password`):
- **Persona:** `alice.tran@personas.demo` / `password` (Thai-heavy, no
  family). Any of the 10 `<first>.<last>@personas.demo` users works.
- **Non-persona control:** `john.doe@example.com` / `password`.

Steps:

1. Seed + start OpenSearch (baseline engine), then the app with the flag:
   ```bash
   sqlite3 data/db/dashdoor.db < data/db/schema/personas_seed.sql   # if not already seeded
   docker compose -f config/docker-compose.demo.yaml up -d opensearch
   npx tsx scripts/seed-opensearch.ts
   (cd tools/reco-engines/opensearch && npm start) &              # serves :4001
   NEXT_PUBLIC_RECO_DEMO=1 npm run dev                            # serves :3000
   ```
2. **`/reco-eval`:** open `http://localhost:3000/reco-eval`. OpenSearch
   shows a "baseline" badge and cannot be unchecked. Pick a persona
   (default alice-tran), click **Run** → ranked table of restaurant
   names + cuisine appears.
3. **Persona sections:** sign in at `/login` as
   `alice.tran@personas.demo` / `password`, open `/home`. Labeled
   cuisine sections ("More Thai for you", etc.) render above the normal
   feed; one card per section is tagged "Try something new".
4. **Non-persona control:** sign in as `john.doe@example.com` /
   `password`, open `/home` → no cuisine sections, standard feed only.
5. **Flag off:** restart with plain `npm run dev` (no
   `NEXT_PUBLIC_RECO_DEMO`) → no "Reco Eval" header link and no cuisine
   sections for anyone.

> ⚠️ Phase 4 code is implemented and working but **not yet committed**
> (`app/reco-eval/`, `app/api/reco/`, `components/cuisine-section.tsx`
> are untracked; `app/home/page.tsx` + `components/header.tsx` modified).
> Commit before moving Phase 5 forward.

## Phase 5 — Trajectory visibility

- [ ] `RecoTrajectory` type added to `lib/reco/types.ts`
- [ ] OpenSearch emits full trajectory via `_explain`
- [ ] Other engines emit thin trajectories (candidate-gen + final)
- [ ] `/reco-eval` drilldown modal renders the steps

## Phase 6 — Smoke + demo polish

- [ ] `scripts/persona-demo-smoke.sh` end-to-end
- [ ] `docs/PERSONA_DEMO.md` walkthrough
- [ ] `/demo` landing page updated with the persona story
