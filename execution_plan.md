# Execution — Phase 9: Apply a reco to the home feed

**Goal:** close the loop between `/reco-eval` and `/home`. After evaluating
engines, the user picks a winner and the `/home` feed for that persona
reorders its cuisine-section slots using the applied engine's `ranked_ids`.
Engine credentials are never persisted — only the captured ranked output.

On exit: tick **Phase 9** in `plan.md`, clear this file's body.

---

## Steps

- [ ] **9.1 — `store/reco-selection-store.ts`**
      Zustand store with `localStorage` persistence. Shape per personaId:
      `{ engineId, label, model?, ranked_ids, scores?, capturedAt }`.
      Export `useRecoSelection(personaId)` and `applyEngine(personaId, payload)`.

- [ ] **9.2 — "Apply to home feed" button on `/reco-eval`**
      Each engine column in the results table gets a button.
      Clicking calls `applyEngine(selectedPersonaId, { engineId, label, model, ranked_ids, scores })`.
      Show a confirmation toast: "Applied <label> to <persona>'s home feed."

- [ ] **9.3 — Home feed slot fill from applied engine**
      In `app/home/page.tsx` (or the persona-sections component), after loading
      the `buildExpected` sections, check `useRecoSelection(persona.user_id)`.
      If a selection exists, reorder each section's `ranked_restaurant_ids` by
      the engine's `ranked_ids` (IDs present in both, preserve section grouping;
      IDs not in the engine list go to the back). Fall back to rule order when
      no selection exists.

- [ ] **9.4 — Banner + reset**
      When an engine is applied, `/home` shows a top banner:
      `"Personalized by <label> · <model> — your pick from Reco Eval (<date>)"`
      with a **Reset to default** link that clears the store entry for that persona.

- [ ] **9.5 — Multiple-models demo**
      Verify that A/B of `gpt-4o-mini` vs `gpt-4o` vs OpenSearch can each be
      applied in turn and the `/home` feed visibly changes. Document in
      `docs/PERSONA_DEMO.md` (add a "Applying a winner" section).

---

## Exit criteria

- [ ] Apply a BYO engine result → `/home` reorders sections by the engine's ranking.
- [ ] Reset clears the banner and reverts to rule order.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run test:unit` passes.

> **On exit:** tick **Phase 9** in `plan.md`, clear this file's body.
