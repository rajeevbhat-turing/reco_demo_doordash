# Execution — Phase 8: Label quality

**Goal:** make the ground truth smarter so A/B scores reward what a good
recommender actually does. Three sub-phases, each independently shippable:

- **8a** — drop outlier/misattributed orders before deriving hot cuisines
- **8b** — replace the fixed 3-familiar+1-new split with a ratio driven
  by `novelty_appetite`
- **8c** — make explore slots pick *relevant* adjacent cuisines, scored
  at the set level

Almost everything lives in `lib/reco/eval/persona-truth.ts`. Each rule
is (a) a named exported constant, (b) surfaced in the trajectory as a
`filter` step so the demo can *show* the cleaning.

On exit: tick **Phase 8** in `plan.md`, clear this file's body.

---

## Persona reference (drives the demos)

| Bucket (`novelty_appetite`) | Personas | 8b split (explore/familiar) |
|---|---|---|
| Explorer (≥ `EXPLORE_HI` 0.66) | alice-tran (0.70), eli-nakamura (0.90) | 3 / 1 |
| Mid (0.33–0.66) | chloe-okafor (.50), fatima-rashid (.40), hana-park (.50), julia-volkov (.60) | 2 / 2 |
| Homebody (< `EXPLORE_LO` 0.33) | ben-kowalski (.20), diego-mendoza (.30), gabe-jensen (.30), idris-mensah (.20) | 1 / 3 |

> ⚠️ **8b flips alice-tran** from 3-familiar/1-new (today) to
> 1-familiar/3-explore. Expect her `flat_ranked_ids` and section win/loss
> to change. Use **ben-kowalski** (homebody) as the "stable familiar"
> contrast in the demo.

---

## 8a — Outlier / misattribution removal

Runs *before* hot-cuisine and familiar computation. Add an exported
`cleanOrderSignals(...)` helper (or inline) that returns the kept set
plus a list of `{order_id, reason}` exclusions for the trajectory.

- [ ] **8a.1 — Pull order detail in `loadPersonaSignals`**
      Extend the orders query to also select `subtotal` (cents) and
      `order_date` per order (today it only does `COUNT(*)` by store).
      Need per-order rows, not just store tallies, to compute the
      distribution. Keep the existing aggregates too.

- [ ] **8a.2 — Basket-size outlier flag**
      Constant `OUTLIER_BASKET_MAD_K = 3.0`. Compute `median` and `MAD`
      of the persona's order `subtotal`s. Flag any order with
      `subtotal > median + OUTLIER_BASKET_MAD_K × MAD` (guard MAD=0 →
      no exclusions). Excluded orders don't count toward `ordersByStore`
      or `ordersByCuisine`. Reason string:
      `"order #<id>: <ratio>× median basket — outlier"`.

- [ ] **8a.3 — Cuisine one-off filter**
      Constant `MIN_CUISINE_SUPPORT = 2`. A cuisine needs ≥ this many
      *distinct kept orders* to seed a **familiar** section. A single
      order from an otherwise-uneaten cuisine is excluded from familiar
      (may still seed an explore slot in 8c). Reason:
      `"<cuisine>: only <n> order — below support, not familiar"`.

- [ ] **8a.4 — Affinity vs. behavior mismatch (surface only, no drop)**
      High `order_count` + near-zero stated affinity → annotate
      `"possible misattribution"`. High affinity + low order_count →
      annotate `"stated-but-unproven (explore candidate)"`. v1 only
      writes these into the trajectory; no exclusion.

- [ ] **8a.5 — Emit the `filter` trajectory step**
      `buildExpected` already returns `ExpectedTask`; the *engines* emit
      trajectories. So the cleaning needs to surface where the demo
      reads it. Decision: add `filters?: {order_id?, cuisine?, reason}[]`
      to `ExpectedTask` (rule output), and have the OpenSearch sidecar +
      `/reco-eval` render an expected-side `filter` panel. (Engines'
      own trajectories are unchanged.) Document in design.md.

- [ ] **8a.6 — Unit tests** (`tests/unit/reco/persona-truth.test.ts`)
      - catering-sized order (≫ median) excluded from hot-cuisine tally
      - cuisine with 1 order → no familiar section emitted
      - normal orders untouched; MAD=0 path safe
      - filters list populated with correct reasons

- [ ] **8a.7 — Outlier eval scenario (seed)**
      Add one large Thai catering order for alice-tran to
      `data/db/schema/personas_seed.sql` **and** the live `dashdoor.db`
      (a restaurant she hasn't otherwise ordered from). Assert the
      cleaned rule ignores it while a naive tally would have made that
      restaurant/cuisine hot. Regenerate `expected.json` (8d.1).

---

## 8b — Adaptive exploration ratio

Replace fixed `FAMILIAR_COUNT = 3` with a ratio from `novelty_appetite`.

- [ ] **8b.1 — `exploreCount(appetite)` exported fn**
      Constants `EXPLORE_HI = 0.66`, `EXPLORE_LO = 0.33`.
      `appetite ≥ HI → 3`, `LO ≤ appetite < HI → 2`, `< LO → 1`
      (out of `SECTION_SIZE = 4`). Keep `FAMILIAR_COUNT` exported but
      mark `@deprecated — superseded by exploreCount()`.

- [ ] **8b.2 — Type change: `novelty_index` → `novelty_indices: number[]`**
      Breaking rename on `ExpectedSection`. Touch every call site:
      - `lib/reco/types.ts:59` — field definition (+ keep optional
        `novelty_index` getter? No — clean rename, update all consumers)
      - `lib/reco/eval/persona-truth.ts:179,185` — set the array
      - `components/cuisine-section.tsx:26` — `indices.includes(idx)`
      - `app/reco-eval/reco-eval-client.tsx:499` — section win/loss ring
      - `scripts/dump-persona-truth.ts:42,45` — CLI dump
      - `tests/unit/reco/persona-truth.test.ts` — asserts (lines ~180,
        211, 221)
      - `data/reco-personas/expected.json` — regenerate (8d.1)
      - `data/reco-personas/overrides.json` — currently `{}`, but
        `ExpectedOverride` shape follows the type; note in design.md

- [ ] **8b.3 — Wire into `buildExpected`**
      `const explore = exploreCount(persona.preferences.novelty_appetite);`
      `const familiarN = SECTION_SIZE - explore;` Take `familiarN`
      familiar; fill the rest with explore picks (8c). Explore slots are
      the trailing `explore` positions →
      `novelty_indices = [familiarN, …, SECTION_SIZE-1]`.

- [ ] **8b.4 — UI tags all explore cards**
      `cuisine-section.tsx`: tag every card whose index is in
      `novelty_indices` with "Try something new" (not just one).

- [ ] **8b.5 — Unit tests**
      explorer (0.8)→3 explore indices; homebody (0.2)→1; mid (0.5)→2.
      Boundary: exactly 0.66→explorer, exactly 0.33→mid.

---

## 8c — Complementary / next-order novelty

Make explore slots *relevant* and score them as a set.

- [ ] **8c.1 — Cuisine-adjacency map**
      `data/reco-personas/cuisine-adjacency.json` — symmetric map,
      hand-curated v1 (keys must match `restaurants.cuisine` values):
      Thai↔Vietnamese↔Malaysian · Italian↔Mediterranean↔Greek ·
      Mexican↔Latin American · Japanese↔Korean↔Chinese ·
      Indian↔Mediterranean. New `lib/reco/adjacency.ts` exports
      `loadAdjacencies(path)` and `adjacentCuisines(cuisine, map)`.
      (Verify against actual distinct cuisines in the DB first.)

- [ ] **8c.2 — Explore-slot fill priority**
      For each section's explore slots, prefer in order:
      1. new restaurants in the persona's *loved* cuisine (never ordered)
      2. restaurants in an *adjacent* cuisine never tried
      Subject to the same block-list / price / family constraints as
      familiar slots. Replaces today's single "highest-rated novel" pick.

- [ ] **8c.3 — Set-level scoring (keep `metrics.ts` DB-free)**
      Explore slots have no single right answer. To avoid passing a
      restaurant→cuisine map into `scoreTask`, **precompute** the valid
      set into the rule output: add `explore_valid_ids: number[]` to
      `ExpectedSection` (all loved+adjacent in-pool candidates for that
      section). In `metrics.ts`: a ranked id landing in an explore slot
      scores as a hit if it ∈ that section's `explore_valid_ids`;
      familiar slots stay exact-ID. New `scoreTask` option
      `{ sectionAware: true }` or a sibling `scoreTaskBySection`.

- [ ] **8c.4 — Unit tests**
      adjacent-cuisine pick in explore slot → hit; irrelevant cuisine →
      miss; loved-cuisine new restaurant → hit; familiar slot still
      exact-ID.

---

## 8d — Regen + docs

- [ ] **8d.1 — Regenerate `expected.json`**
      Re-run `scripts/dump-persona-truth.ts` (or its write path) so the
      committed ground truth matches the new rule. Confirm
      `/api/reco/persona-home` and `/reco-eval` still render.

- [ ] **8d.2 — design.md** — already updated for the contract changes
      this phase introduces (constants, `novelty_indices`,
      `explore_valid_ids`, `filters`, adjacency file). Verify it matches
      the shipped code at exit.

- [ ] **8d.3 — Smoke** — `scripts/persona-demo-smoke.sh` still exits 0;
      add an assertion that alice-tran's trajectory/expected carries a
      non-empty `filters` list (the seeded catering outlier).

---

## Exit criteria

- [ ] **Outlier scenario passes** — alice-tran's expected output shows
      the seeded catering order in `filters` with a reason; the naive
      tally vs. cleaned rule produce different hot cuisines (unit test
      proves it).
- [ ] **Adaptive ratio visible** — `/home` as eli-nakamura (explorer)
      shows 3 "Try something new" cards per section; ben-kowalski
      (homebody) shows 1.
- [ ] **Adjacent explore** — alice-tran (Thai) explore slots are filled
      from Vietnamese/Malaysian or new Thai, never random cuisines.
- [ ] **Types clean** — `npx tsc --noEmit` passes.
- [ ] **Unit tests green** — `npm run test:unit` passes (incl. new
      8a/8b/8c tests).

> **On exit:** tick **Phase 8** in `plan.md`, clear this file's body.
