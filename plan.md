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

- [ ] `/reco-eval` page — engine picker, results table, opensearch pinned as baseline
- [ ] `components/cuisine-section.tsx` (3 familiar + 1 new)
- [ ] `/home` renders sections when logged in as a persona (`RECO_DEMO=1`)
- [ ] Non-persona users see untouched home feed

## Phase 5 — Trajectory visibility

- [ ] `RecoTrajectory` type added to `lib/reco/types.ts`
- [ ] OpenSearch emits full trajectory via `_explain`
- [ ] Other engines emit thin trajectories (candidate-gen + final)
- [ ] `/reco-eval` drilldown modal renders the steps

## Phase 6 — Smoke + demo polish

- [ ] `scripts/persona-demo-smoke.sh` end-to-end
- [ ] `docs/PERSONA_DEMO.md` walkthrough
- [ ] `/demo` landing page updated with the persona story
