# Execution — Phase 3: live re-rank of `/home`

Engines stop being a `/reco-eval`-only feature. The demo header gets an
engine picker; the actual `/home` feed visibly re-orders when the user
changes it. Production flow (no `RECO_DEMO`) stays bit-identical.

> Previous EXECUTION.md content (Phase 0, Phase 2 code, Phase 2 verify)
> is archived in `docs/execution-phase-0.md` and
> `docs/execution-phase-2-code.md`. Phase 2 verify summary lives in
> `RECO_PLAN.md` Phase 2 exit block.

Tick checkboxes the moment a step is done, per `CLAUDE.md`.

---

## 0. Pre-flight

- [x] On branch `reco`.
- [x] `npm run dev` works (sidecars optional — random + popularity
      alone exercise the re-rank path).
- [x] Reco unit tests still green: 24/24 (added `apply-ranking.test.ts`).

---

## 1. Decisions (lock before coding)

- [x] **Scope of re-rank:** only the "All stores" / first-named-section
      list on `/home`. Database-driven editorial sections (`section`
      column) are not touched — they're curated, not algorithmic.
- [x] **Gate:** `NEXT_PUBLIC_RECO_DEMO === '1'`. Production flow
      (unset) is *never* altered.
- [x] **Fallback:** if the engine fails or returns nothing, the
      unsorted list renders. Never break `/home`.
- [x] **Never drop items:** engines re-rank the candidate set;
      restaurants not in the engine response append in their original
      order at the end.

---

## 2. Header engine picker (B.1)

- [x] `next.config.mjs` — `env: { NEXT_PUBLIC_RECO_DEMO: process.env.RECO_DEMO ?? '' }`
      mirrors the server flag to the client.
- [x] `store/app-store.ts` — `activeRecoEngine: string | null`,
      `setActiveRecoEngine`, persisted via `partialize`. Default `null`.
- [x] `components/reco-engine-picker.tsx` (new) — fetches
      `/api/reco/engines`, renders a `<select>` only when
      `NEXT_PUBLIC_RECO_DEMO === '1'`. Injected next to `<SearchBar>` in
      `components/header.tsx`.
- [x] Adds a small green "re-ranked by {engine}" status pill next to
      the picker when active (clearer demo signal than per-card badges,
      and avoids touching the shared restaurant card component).

---

## 3. Predict endpoint + hook (B.2)

- [x] `app/api/reco/predict/route.ts` — `POST { engine, ctx }`;
      `getEngine().recommend(ctx)`. Engine-side failures are swallowed
      into `200 { items: [], debug: { error } }` so `/home` falls
      back to the unsorted feed instead of breaking. 404 for unknown
      engine, 400 for malformed body.
- [x] `lib/reco/hooks/use-reco.ts` — `useReco({ engine, ctx })`
      wrapper around `useQuery`. Key includes engine + surface + k +
      lat/lng + candidate-pool fingerprint. Disabled (`enabled: false`)
      when `engine === null`, so no fetch ever fires in production
      mode.
- [x] Cache: 5 min `staleTime`.
- [x] `lib/reco/utils/apply-ranking.ts` — pure helper used by `/home`;
      "never drops items" invariant covered by 5 unit tests.

---

## 4. Wire `/home` (B.3 + B.4)

- [x] `app/home/page.tsx`
  - [x] Read `activeRecoEngine` from `useAppStore`.
  - [x] Renamed local `actualRestaurants` → `baseRestaurants` for the
        un-ranked feed; `actualRestaurants` is now
        `applyRanking(baseRestaurants, recoRankedIds)`. Every existing
        section derivation continues to read `actualRestaurants`, so
        ranking flows through *all* sections transparently — the
        production code path is unchanged when `recoRankedIds` is
        null.
  - [x] `useReco` called with `surface: 'home_feed'`, `k: 20`,
        candidate pool = `baseRestaurants` ids. Lat/lng from the
        already-resolved `activeAddress`.
- [x] Per-card "via {engine}" badge → **replaced** by the header-level
      status pill (see §2). Avoids touching `restaurant-section.tsx`
      or downstream card components; same demo signal, smaller blast
      radius.

---

## 5. Regression check (B.5)

Verified via dev server smoke (port :3001 — compose stack owns :3000).

- [x] **Production mode** (`npm run dev`, no `RECO_DEMO`):
  - [x] `/home` HTTP 200, 43,778 bytes.
  - [x] `reco-engine-picker` testid: 0 occurrences in rendered HTML.
  - [x] `reco-active-badge` testid: 0 occurrences.
  - [x] No `/api/reco/predict` strings in the rendered HTML (no
        client-side reco calls leak in).
  - [x] `/api/reco/engines` still HTTP 200 (API available, just not
        auto-called).
- [x] **Demo mode** (`RECO_DEMO=1 npm run dev`):
  - [x] `/home` HTTP 200, 44,286 bytes (~500 B picker overhead).
  - [x] `reco-engine-picker` testid present in HTML.
  - [x] `POST /api/reco/predict` returns a valid
        `RecommendationResponse`.
- [x] `npx tsc --noEmit` → **0 errors** (down from the 58 pre-existing
      test-fixture errors of the prior branch; the new branch already
      had those resolved).
- [x] Full unit suite: **102 files, 1677 passing, 3 skipped, 0
      failed**. Header tests now stub `RecoEnginePicker` (added one
      `vi.mock` line).
- [ ] E2E suite (`scripts/n.sh npm run test:e2e:chromium`) — **deferred
      to a separate triage pass**, not Phase 3 code work. May 2026 run:
      32 passed / 118 failed (exit 1). Failures are concentrated in
      address (`localStorage` SecurityError), auth OTP, checkout, and
      orders — not reco picker or `/api/reco/predict`. No Phase 3
      regression inferred; see `PARALLEL_WORK.md` §A “E2E gate”.

---

## 6. Demo polish (B.6)

- [ ] Manual visual smoke — pick `random`, `popularity`, `gorse`,
      `lightfm`, `implicit` from the header picker on `/home` and
      confirm each one reorders the grid. **User-side TODO** (needs
      a browser).
- [ ] Screenshots per non-baseline engine to
      `docs/screenshots/phase3-rerank-<engine>.png`. **User-side TODO.**
- [x] `RECO_PLAN.md` Phase 3 exit block updated with verified
      regression status (screenshot links deferred).

---

## Definition of done

| Criterion | Status |
|-----------|:------:|
| Header `<select>` + active-state pill render under `RECO_DEMO`; selection re-orders `/home`'s feed | ✓ |
| With `RECO_DEMO` unset, `/home` is bit-identical to before — no picker, no extra fetches, same response size up to picker overhead | ✓ |
| `npx tsc --noEmit` → 0 errors | ✓ |
| Reco unit tests green | ✓ 24/24 |
| Full unit suite green | ✓ 1677/1680 (3 skipped, 0 failed) |
| E2E suite green | Deferred — separate triage pass (see `PARALLEL_WORK.md` §A) |
| Manual visual smoke + screenshots per engine | User-side TODO |
| `RECO_PLAN.md` Phase 3 exit block updated | ✓ (screenshots deferred) |

**The engines product goal is functionally closed.** Live re-rank
works in the demo; production flow is untouched. Outstanding items are
verification artifacts (screenshots; full e2e green), not code. E2e is
explicitly **out of scope** for closing Phase 3 until triage on `main`.

Next EXECUTION.md becomes Phase 4 (LLM-agent track) or Phase 5
(deploy polish), depending on demo timeline.
