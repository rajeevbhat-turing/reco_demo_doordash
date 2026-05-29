# Execution — Phase 4: Persona-aware UI sections

**Goal:** build the `/reco-eval` page (engine picker + results table,
opensearch pinned as baseline) and add persona-aware cuisine sections to
`/home` when `RECO_DEMO=1` and a persona is signed in. Non-persona users
see the untouched home feed.

When this phase exits, clear this file's body and replace it with
Phase 5's detailed steps. Then tick Phase 4 in `plan.md`.

---

## 1. `/reco-eval` page

- [ ] **1.1** Create `app/reco-eval/page.tsx` — server component shell,
      imports the client component.
- [ ] **1.2** Create `app/reco-eval/reco-eval-client.tsx` — client
      component with:
      - Engine picker: reads `config/reco-engines.json`; opensearch
        pre-selected and marked "baseline" (can't be unchecked).
      - Persona picker: dropdown of the 10 personas from
        `data/reco-personas/personas.json`.
      - "Run" button: calls `POST /recommend` on the selected engine URL
        with the selected persona, displays `ranked_ids` in a table with
        restaurant names resolved from the API.
- [ ] **1.3** Add a nav link to `/reco-eval` in the header (visible only
      when `RECO_DEMO=1`).
- [ ] **1.4** Create `app/api/reco/engines/route.ts` — `GET` returns
      `config/reco-engines.json` as JSON so the client doesn't need to
      import a server-side file directly.

## 2. Cuisine sections on `/home`

- [ ] **2.1** Create `components/cuisine-section.tsx` — renders one
      labeled section ("More Thai for you") with 4 restaurant cards:
      3 familiar + 1 marked "Try something new" at `novelty_index`.
      Props: `{ section: ExpectedSection; restaurants: Restaurant[] }`.
- [ ] **2.2** Add `app/api/reco/persona-home/route.ts` — `GET
      /api/reco/persona-home?userId=<id>` returns the `ExpectedTask` for
      the signed-in persona (runs `buildExpectedWithOverrides` server-
      side). Returns `{ sections, blocked_restaurant_ids }`.
- [ ] **2.3** In `app/home/page.tsx`, when `RECO_DEMO=1` and the
      signed-in user is a persona (user_id 3101–3110):
      - Fetch `/api/reco/persona-home`.
      - Render one `<CuisineSection>` per section above the existing feed.
      - Non-persona users and `RECO_DEMO` unset: no change to the page.

## 3. Env gate

- [ ] **3.1** Add `RECO_DEMO=` to `.env.example` (default empty/off).
      Document in `HOW_TO_TEST.md` that setting `RECO_DEMO=1` enables
      persona sections on `/home` and the `/reco-eval` nav link.

## Exit criteria

- [ ] `http://localhost:3000/reco-eval` loads, shows opensearch pre-selected,
      returns results for alice-tran.
- [ ] Signed in as `alice.tran@personas.demo` with `RECO_DEMO=1`,
      `/home` shows "More Thai for you" section above the regular feed.
- [ ] Signed in as a non-persona user, `/home` is unchanged.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run test:unit` still passes.

### How to run the exit checks

Bring the stack up first, then walk the criteria above:

```bash
# OpenSearch sidecar (the engine /reco-eval calls) + seed
docker compose -f config/docker-compose.demo.yaml up -d opensearch
npx tsx scripts/seed-opensearch.ts        # idempotent

# Engine server on :4001
(cd tools/reco-engines/opensearch && npm install && npm start) &

# App with the demo flag on
RECO_DEMO=1 npm run dev                    # /reco-eval + persona sections
npm run dev                                # second run, flag unset: home unchanged

npx tsc --noEmit
npm run test:unit
```

> **On exit:** when every box above is checked, tick **Phase 4** in
> `plan.md` (line 35) in the same commit, then clear this file's body
> and replace it with Phase 5's detailed steps.
