# Execution — Phase 10: Reco run history + home-feed switcher

**Goal:** extend Phase 9. Instead of a single active selection per persona,
the store keeps a **run history** (latest per engine-model combo). `/home`
gains a **dropdown switcher** so the persona can flip between any past run
(or rule default) without returning to `/reco-eval`. The applied banner text
+ timestamp stays visible alongside the dropdown.

See `design.md` §"Reco run history + home-feed switcher" for the full spec.

On exit: tick **Phase 10** in `plan.md`, clear this file's body.

---

## Steps

- [ ] **10.1 — Store migration (`store/reco-selection-store.ts`)**
      Replace `selections: Record<string, RecoSelection>` with
      `runs: Record<string, { history: RecoRunEntry[]; activeRunKey: string | null }>`.
      `RecoRunEntry` = `RecoSelection` + `runKey: string`.
      Actions:
      - `applyRun(personaKey, entry)` — compute `runKey = engineId + ':' + (model ?? '')`,
        upsert into `history` (replace same-runKey, else append), set `activeRunKey = runKey`,
        stamp `capturedAt`.
      - `setActiveRun(personaKey, runKey | null)` — switch active without adding.
      - `clearHistory(personaKey)` — drop the persona's entry entirely.
      Keep `useRecoSelection(personaKey)` returning the active `RecoRunEntry | undefined`
      (derived from `activeRunKey`). Add `useRecoHistory(personaKey)` → sorted
      (newest-first) `RecoRunEntry[]`.
      Bump persist `name` or `version` so the old `reco-selections` shape doesn't
      crash the new reducer (add a `migrate`/`version` or new key).

- [ ] **10.2 — "Apply to home feed" wiring (`app/reco-eval/reco-eval-client.tsx`)**
      Swap `applyEngine` for `applyRun`. Pass the full entry (engineId, label,
      model, ranked_ids, scores); the store computes `runKey` + `capturedAt`.
      Toast copy unchanged.

- [ ] **10.3 — `RecoSwitcher` component (`components/reco-switcher.tsx`)**
      Props: `{ personaKey, history, activeRun, onSelect(runKey|null), onReset() }`.
      Renders a `<select>` with a leading "— Rule default —" option then each
      history entry newest-first (label · model + `(date)`), pre-selecting the
      active run. To the right: inline text mirroring the Phase 9 banner
      (`Personalized by <label> · <model> — your pick from Reco Eval (<date>)`),
      and a **Reset to default** link. Selecting an option calls `onSelect`;
      Rule default → `onSelect(null)`.

- [ ] **10.4 — Wire switcher into `/home` (`app/home/page.tsx`)**
      Replace the inline Phase 9 banner with `<RecoSwitcher>` when
      `useRecoHistory(personaKey)` is non-empty. Feed it `activeRun`
      (`useRecoSelection`), `onSelect → setActiveRun`, `onReset → setActiveRun(null)`.
      `effectiveSections` is unchanged — it already reads `useRecoSelection`.

- [ ] **10.5 — Docs**
      Update `docs/PERSONA_DEMO.md` "Applying a winner" section: switching runs
      from the `/home` dropdown without re-running, latest-per-model dedup.

---

## Exit criteria

- [ ] Apply 2+ engine/model runs for one persona → `/home` dropdown lists each (latest per combo) + Rule default.
- [ ] Selecting a run reorders the feed instantly (no network call); banner text + timestamp update.
- [ ] Re-applying the same engine+model replaces its prior history entry (no duplicate).
- [ ] Reset / Rule default returns to `buildExpected` order.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run test:unit` passes.

> **On exit:** tick **Phase 10** in `plan.md`, clear this file's body.
