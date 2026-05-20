# Execution — Finish the engines

Current in-flight scope: close out the engine track end-to-end so we
can move on to the LLM-agent goal cleanly. Two halves:

| Half | Phase | What it gets you |
|------|-------|------------------|
| A — Verify Phase 2 sidecars | RECO_PLAN.md Phase 2 §§2.5–exit | LightFM + Implicit actually train, serve, and beat random side-by-side with Gorse on `/reco-eval`. |
| B — Phase 3 live re-rank | RECO_PLAN.md Phase 3 | The real `/home` feed visibly re-orders when the user picks an engine. Demo "wow" moment. |

> Previously-completed checklists are archived at
> `docs/execution-phase-0.md` (Phase 0 build) and
> `docs/execution-phase-2-code.md` (Phase 2 code work).

Tick checkboxes the moment a step is done, per the rules in `CLAUDE.md`.

---

## A. Verify Phase 2 sidecars

Code (`tools/reco-engines/{lightfm,implicit}/`, adapters in
`lib/reco/engines/{lightfm,implicit}.ts`, compose file) is all done.
This half is the bring-up + smoke.

### A.0 Pre-flight

- [ ] Docker Desktop / OrbStack / Colima running. `docker info` ok.
- [ ] On branch `reco`.
- [ ] Ports 3000, 8001, 8002, 8087, 8088 free.
      ```sh
      lsof -iTCP -sTCP:LISTEN -nP | grep -E ':3000|:800[12]|:808[78]' || echo "ports free"
      ```
- [ ] Reco unit tests green:
      `scripts/n.sh npm run test:unit -- tests/unit/reco/` → 19/19.

### A.1 Build + boot the 5-engine stack

- [ ] `docker compose -f config/docker-compose.reco.yaml up --build`
      in its own terminal. First build is slow (LightFM compiles
      against numpy 1.x); subsequent boots take ~30–60 s for LightFM
      training to finish.
- [ ] In a second terminal, watch for each service to be healthy:
      ```sh
      for svc in 3000:dashdoor 8001:lightfm 8002:implicit 8088:gorse; do
        port=${svc%%:*}; name=${svc##*:}
        if [ "$name" = "gorse" ]; then path="api/health/live"; else path="health"; fi
        echo -n "$name ($port): "
        curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:$port/$path"
      done
      ```
      Expect `200` from each. `lightfm`/`implicit` may return `503`
      until training finishes — retry after 60 s.

### A.2 Seed Gorse (skip if already seeded from `gorse_work.md`)

- [ ] `RECO_GORSE_URL=http://localhost:8088 scripts/n.sh npx tsx scripts/seed-gorse.ts`
- [ ] Confirm row counts in the Gorse dashboard at
      http://localhost:8087.

### A.3 Five-engine eval

- [ ] Hit the API with all 5 engines on the history split:
      ```sh
      curl -s -X POST http://localhost:3000/api/reco/eval \
        -H 'content-type: application/json' \
        -d '{"engineNames":["random","popularity","gorse","lightfm","implicit"],
             "taskSetId":"history","k":5,"historyLimit":50}' \
        | python3 -c "
      import sys,json
      d=json.load(sys.stdin)
      print('runId',d['runId'],'n=',len(d['report']['perTask']))
      for n,a in d['report']['aggregate'].items():
          print(f'  {n:10}  hit@5={a[\"hitAtK\"]:.3f}  ndcg@5={a[\"ndcgAtK\"]:.3f}  mrr={a[\"mrr\"]:.3f}')
      "
      ```
- [ ] Bar: each engine returns metrics; no `error: …` in per-task
      rows on the happy path; at least one of {lightfm, implicit}
      beats `popularity` on Hit@5. If popularity wins everywhere,
      that's *useful* signal — but probably means the catalog is too
      small for personalization to shine; expand seed tasks (see
      `PARALLEL_WORK.md` Track 5).
- [ ] Save the report to `docs/samples/reco-report-5engines.json`:
      ```sh
      LAST=$(ls -t data/reco-runs/ | head -1)
      cp data/reco-runs/$LAST docs/samples/reco-report-5engines.json
      ```

### A.4 Visual check in the demo UI

- [ ] Open `http://localhost:3000/reco-eval`.
- [ ] All 5 engines appear; tick them all, run on history.
- [ ] Aggregate table renders 5 rows cleanly. Per-task drilldowns
      expand without overflow.
- [ ] Screenshot to `docs/screenshots/phase2-reco-eval.png`.

### A.5 Wrap-up

- [ ] Tick Phase 2 exit boxes in `RECO_PLAN.md` Phase 2 (the §2.5
      "five engines compared in /reco-eval" line).
- [ ] If LightFM or Implicit beat popularity, note the numbers in
      RECO_PLAN.md Phase 2 exit block.
- [ ] Stop the stack:
      `docker compose -f config/docker-compose.reco.yaml down`.

---

## B. Phase 3 — live re-rank of `/home`

Engines stop being "demo-page only." The user picks an engine in the
header; the actual restaurant grid on `/home` re-orders to match.

### B.0 Decide what re-rank means here

- [ ] Decision: re-rank only the **"All stores"** fallback row and
      the **first** named section (e.g. "Trending now"). Keep
      database-driven sections (`section` column) untouched — they're
      editorial, not algorithmic.
- [ ] Decision: re-rank applies only when `RECO_DEMO=1`. Production
      flow is never altered.

### B.1 Engine picker in the header

- [ ] `store/app-store.ts` — add `activeRecoEngine: string | null`
      with `setActiveRecoEngine(name)` action. Persisted to
      localStorage so it survives reloads.
- [ ] `components/header.tsx` — when `process.env.NEXT_PUBLIC_RECO_DEMO
      === '1'`, render a small `<select>` listing engines fetched
      from `/api/reco/engines`. Default to `"none"` (production
      behavior).
- [ ] `next.config.mjs` — expose `NEXT_PUBLIC_RECO_DEMO` mirrored from
      `RECO_DEMO` (server env can't be read from the client).

### B.2 Reco fetch hook

- [ ] `lib/reco/hooks/use-reco.ts` (new) —
      `useReco({ surface, candidatePool, k })` calls a new
      `POST /api/reco/predict` endpoint, returns ranked ids. Uses
      `@tanstack/react-query` (already in deps) for caching.
- [ ] `app/api/reco/predict/route.ts` (new) — minimal wrapper around
      `getEngine(name).recommend(ctx)`. Body: `{ engine, ctx }`.
      Returns the engine's `RecommendationResponse` directly.

### B.3 Wire `/home`

- [ ] `app/home/page.tsx`
  - [ ] When `activeRecoEngine` is set, call `useReco({surface:
        'home_feed', candidatePool: actualRestaurants.map(r=>r.id),
        k: 8})`.
  - [ ] Re-order `allStores` (or the chosen section) so the engine's
        ranked ids come first, in order.
  - [ ] Restaurants not returned by the engine append in their
        original order at the end — never *drop* items.
- [ ] Skeleton/loading: while the reco call is in flight, show the
      unsorted list (don't blank the page).
- [ ] Error: on engine failure, log to console and silently fall back
      to the unsorted list. Never break `/home`.

### B.4 Per-card badge

- [ ] When `activeRecoEngine` is set, restaurant cards show a tiny
      `<Badge variant="secondary">via {engine}</Badge>` in the corner.
      Hover tooltip shows the engine's score for that card from
      `RecommendationResponse.items[i].meta` if present.

### B.5 Regression check

- [ ] With `RECO_DEMO` unset, `/home` looks bit-identical to before:
      no badge, no select, no extra network calls.
- [ ] Existing Playwright tests still pass:
      `scripts/n.sh npm run test:e2e:chromium -- tests/e2e/tests/development`.
- [ ] Type-check unchanged at 58 (the pre-existing baseline).

### B.6 Demo polish

- [ ] Screenshot `/home` re-ranked by each non-baseline engine
      (gorse / lightfm / implicit) to
      `docs/screenshots/phase3-rerank-<engine>.png`.
- [ ] Update `RECO_PLAN.md` Phase 3 exit block with the screenshots.

---

## Definition of done

All true at once:

1. `docker compose -f config/docker-compose.reco.yaml up --build`
   brings up all 4 sidecars cleanly; `/reco-eval` shows 5-engine
   metrics. (A.1–A.4)
2. `docs/samples/reco-report-5engines.json` committed.
3. `/home` visibly re-orders when the header engine picker changes.
   The unset engine ("none") reproduces production behaviour
   bit-identically. (B.3, B.5)
4. `scripts/n.sh npm run test:unit -- tests/unit/reco/` still
   green; e2e suite green.
5. RECO_PLAN.md Phase 2 + Phase 3 exit blocks updated with real
   numbers/screenshots.

Once this is done, **the engines goal is closed** and the next
EXECUTION.md becomes Phase 4 (LLM-agent track).
