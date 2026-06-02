# Execution — Phase 11: Header eval switcher + persisted runs

**Goal:** collapse the two overlapping selection controls (the client-only
per-persona store + the in-feed `RecoSwitcher`) into **one**: a dropdown in
the **site header**, always visible, listing **all saved evals** from a
**server-persisted** store. Selecting one auto-refreshes `/home` (rendering
that run's persona sections, reordered by the run) and shows a slim banner
with the engine's **model + run date/time**. The selected eval drives which
persona's feed `/home` shows; with no selection, `/home` keeps prior behavior.

See `design.md` §"Header eval switcher + persisted runs (Phase 11)".

On exit: tick **Phase 11** in `plan.md`, clear this file's body.

---

## Steps

- [x] **11.1 — Persisted runs API (`app/api/reco/runs/route.ts` + `data/reco-traces/runs.json`)**
      Follow the `fs`/`path`/`process.cwd()` style of
      `app/api/reco/persona-home/route.ts`. `readRuns()/writeRuns()` helpers
      handle a missing dir/file (`mkdirSync(..., { recursive: true })`).
      - `GET` → all runs, newest-first by `capturedAt`.
      - `POST` → body minus `id`/`capturedAt`; compute
        `id = ${personaUserId}:${engineId}:${model ?? ''}`, set `capturedAt`,
        upsert (replace same-`id`), write file, return saved record.
      - `DELETE` → `?id=` removes one; no param clears all.
      Record shape: `id, personaId, personaUserId, personaName, engineId,
      label, model?, ranked_ids, scores?, capturedAt`.

- [x] **11.2 — Shrink selection store (`store/reco-selection-store.ts`)**
      Replace the per-persona `runs/history` API with
      `{ activeRunId: string | null; setActiveRun(id|null) }`, persisted
      (bump key to `reco-active-run`). Export the `RecoRun` type for reuse.
      Drop `applyRun`/`useRecoHistory`/`clearHistory`/`useRecoSelection`.

- [x] **11.3 — Header dropdown (`components/header.tsx`)**
      By the "Reco Eval" pill (~line 941): fetch `/api/reco/runs` on mount and
      on `pathname` change into local state. Add a compact `<select>` bound to
      `activeRunId`; options = "— Rule default —" + each run as
      `${personaName} · ${label}${model ? ' · '+model : ''} (${time})`.
      `onChange → setActiveRun(value || null)`. Always rendered.

- [x] **11.4 — Home applies active run (`app/home/page.tsx`)**
      Resolve active run: read `activeRunId` (gated by `storeMounted`), fetch
      `/api/reco/runs`, find by id. Persona source: if active run → fetch
      persona-home for `activeRun.personaUserId`; else keep current
      `currentUser` path. Reuse `effectiveSections` reorder via
      `activeRun.ranked_ids`. Replace the `RecoSwitcher` block (lines ~615–622)
      with a slim banner (engine · model · `toLocaleString()` + Clear →
      `setActiveRun(null)`). Remove `RecoSwitcher`/`useRecoHistory` imports.

- [x] **11.5 — `/reco-eval` writes to backend (`app/reco-eval/reco-eval-client.tsx`)**
      `handleRun`: after fan-out, `await POST /api/reco/runs` for each
      successful, non-error result (persona name/id from `selectedPersonaData`).
      `handleApply`: POST (or reuse saved id) then `setActiveRun(id)`; keep toast.
      Drop the `applyRun` import; use slimmed store's `setActiveRun`.

- [x] **11.6 — Delete `components/reco-switcher.tsx`** — superseded.

- [x] **11.7 — Docs** — `docs/PERSONA_DEMO.md` "Applying a winner": pick an
      eval from the header dropdown (global list), banner shows model + run time.

---

## Exit criteria

- [x] `/reco-eval` Run for a persona → `data/reco-traces/runs.json` created;
      `GET /api/reco/runs` returns the records.
- [x] Header dropdown (any page) lists saved runs; selecting one refreshes
      `/home`: persona sections reorder, banner shows engine · model · run time.
- [x] "— Rule default —" clears the active run; feed returns to rule order.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run test:unit` passes (pre-existing sign-in.test.tsx failures aside).

> **On exit:** tick **Phase 11** in `plan.md`, clear this file's body.
