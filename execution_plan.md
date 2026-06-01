# Execution — Phase 8: Label quality

**Goal:** make the ground truth smarter so A/B scores reflect what a
good recommender actually does. Three sub-phases build on each other:

- **8a** — remove outlier/misattributed orders before deriving hot cuisines
- **8b** — replace the fixed 3-familiar+1-new split with a ratio driven
  by `novelty_appetite`
- **8c** — make explore slots pick *relevant* adjacent cuisines rather
  than any novel restaurant

All changes live in `lib/reco/eval/persona-truth.ts` (and supporting
data files). Each addition is:
- Exposed as a named constant (one place to tune)
- Surfaced in the trajectory as a `filter` step so the demo can *show*
  the cleaning

On exit: tick **Phase 8** in `plan.md`, clear this file's body.

---

## 8a — Outlier / misattribution removal

Stop one-off or anomalous orders from polluting the preference signal.
Run *before* computing hot cuisines and familiar slots.

- [ ] **8a.1 — Basket-size outlier flag**
      For each persona, compute `median` and `MAD` of order totals
      (item count × price, or total spend). Flag orders where
      `total > median + OUTLIER_BASKET_MAD_K × MAD`
      (default `OUTLIER_BASKET_MAD_K = 3.0`).
      Excluded from `ordersByCuisine` and `ordersByStore` tallies.
      Emit a `filter` trajectory step listing excluded order IDs with
      reason `"basket outlier: Nx median"`.

- [ ] **8a.2 — Cuisine one-off filter**
      A cuisine needs ≥ `MIN_CUISINE_SUPPORT` distinct orders (default
      `2`) to count as established. A single order in a normally-uneaten
      cuisine is treated as noise for the familiar slot (may still seed
      an explore slot). Emit as `filter` step: `"one-off cuisine: only
      N order(s)"`.

- [ ] **8a.3 — Affinity vs. behavior mismatch flag (surface only)**
      High `order_count` + near-zero affinity → possible
      misattribution (flag in trajectory, don't exclude). High affinity
      + low order_count → stated-but-unproven (good explore candidate,
      not familiar slot). No hard exclusion in v1 — just a visible
      trajectory annotation.

- [ ] **8a.4 — Unit tests**
      In `tests/unit/reco/persona-truth.test.ts`:
      - catering-sized outlier is excluded from hot-cuisine tally
      - one-off cuisine doesn't produce a familiar section
      - normal orders unaffected

- [ ] **8a.5 — Outlier eval scenario**
      Seed a known catering order for alice-tran (large basket, Thai
      restaurant she hasn't otherwise ordered from). Assert: (a) cleaned
      rule ignores it, (b) naive rule would have counted it. Use as a
      demo case on `/reco-eval` trajectory drilldown.

---

## 8b — Adaptive exploration ratio

Replace the fixed `FAMILIAR_COUNT = 3` with a ratio driven by
`novelty_appetite`.

- [ ] **8b.1 — `exploreCount(appetite)` function**
      Export from `persona-truth.ts`:
      ```
      appetite >= EXPLORE_HI (default 0.66) → 3 explore / 1 familiar
      EXPLORE_LO <= appetite < EXPLORE_HI   → 2 explore / 2 familiar
      appetite <  EXPLORE_LO (default 0.33) → 1 explore / 3 familiar
      ```
      `FAMILIAR_COUNT` constant kept for backwards compat but
      superseded by the ratio function.

- [ ] **8b.2 — Wire into `buildExpected`**
      Replace `familiar.slice(0, FAMILIAR_COUNT)` with
      `familiar.slice(0, SECTION_SIZE - exploreCount(appetite))`.
      `novelty_index` generalises to a *set* of explore indices.

- [ ] **8b.3 — UI — `cuisine-section.tsx`**
      Tag *all* explore-slot cards "Try something new" (not just the
      last one). `novelty_index` becomes `novelty_indices: number[]`.

- [ ] **8b.4 — Unit tests**
      Explorer persona (appetite 0.8) → 3 explore slots.
      Homebody persona (appetite 0.2) → 1 explore slot.
      Mid persona (appetite 0.5) → 2 explore slots.

---

## 8c — Complementary / next-order novelty

Make explore slots *relevant* instead of random.

- [ ] **8c.1 — Cuisine-adjacency map**
      Create `data/reco-personas/cuisine-adjacency.json` (hand-curated
      v1). Suggested adjacencies:
      Thai ↔ Vietnamese ↔ Malaysian
      Italian ↔ Mediterranean ↔ Greek
      Mexican ↔ Tex-Mex ↔ Latin American
      Japanese ↔ Korean ↔ Chinese
      Indian ↔ Pakistani ↔ Middle Eastern

- [ ] **8c.2 — Explore-slot fill priority**
      Explore slots prefer, in order:
      1. New restaurants in the persona's *loved* cuisine (not yet
         ordered from)
      2. Restaurants in an *adjacent* cuisine not yet tried
      Subject to the same block list / price / family constraints.
      Export `loadAdjacencies(path)` from a new `lib/reco/adjacency.ts`.

- [ ] **8c.3 — Set-level scoring for explore slots**
      In `lib/reco/metrics.ts`: explore slots have no single right
      answer. Score them as a *category match* — did the engine put
      a valid loved-or-adjacent-cuisine candidate in that position?
      New function: `scoreExploreSlot(id, section, adjacency) → bool`.
      Update `scoreTask` to use set-level scoring for positions >=
      `novelty_indices[0]`.

- [ ] **8c.4 — Unit tests**
      Exact adjacent pick → explore slot scores as hit.
      Irrelevant cuisine → miss.
      Loved-cuisine restaurant → hit.

---

## Exit criteria

- [ ] **Outlier scenario passes** — trajectory modal for alice-tran
      shows the catering order excluded with reason; naive vs. cleaned
      rule produce different hot-cuisine scores.
- [ ] **Adaptive ratio visible** — explorer persona sections show 3
      "Try something new" tags; homebody shows 1.
- [ ] **Adjacent explore** — for a Thai-loving persona, explore slots
      come from Vietnamese/Malaysian (or Thai), not random cuisines.
- [ ] **Types clean** — `npx tsc --noEmit` passes.
- [ ] **Unit tests green** — `npm run test:unit` passes (incl. new
      8a/8b/8c tests).

> **On exit:** tick **Phase 8** in `plan.md`, clear this file's body.
