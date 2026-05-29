# Execution — Phase 6: Smoke + demo polish

**Goal:** a clean, no-friction demo path — smoke script, walkthrough
doc, and `/reco-eval` accessible without login. Personas are ordinary
users: they log in through the **standard auth flow** (no special demo
mode, no flag, no OTP bypass), and `/home` personalizes automatically
whenever the logged-in user is a persona.

> **Design change (2026-05-29):** the `NEXT_PUBLIC_RECO_DEMO` flag was
> removed entirely. It was inlined at build time and never propagated
> reliably to the Next dev worker, which is what blocked step 3.2.
> Personalization, the `/reco-eval` link, and `/reco-eval` access are
> now unconditional; auth is unchanged from stock Dashdoor.

When this phase exits, clear this file's body and replace it with
Phase 7's detailed steps (or mark the project done). Then tick
Phase 6 in `plan.md`.

---

## 1. Smoke script

- [x] **1.1** Write `scripts/persona-demo-smoke.sh` that:
      - starts OpenSearch (docker compose), waits for `:9200`
      - seeds the index (`npx tsx scripts/seed-opensearch.ts`)
      - starts the sidecar, waits for `:4001/health`
      - hits `POST :4001/recommend` for alice-tran and asserts
        `ranked_ids` is non-empty and `trajectory.steps` includes
        `candidate_gen`, `score`, `final`
      - exits 0 on success, 1 on any failure

## 2. Walkthrough doc

- [x] **2.1** Write `docs/PERSONA_DEMO.md` covering:
      - prerequisites (docker, node, `.env`)
      - `./run.sh` to bring everything up
      - persona login IDs (all 10)
      - what to look for on `/home` (cuisine sections)
      - what to look for on `/reco-eval` (engine picker, Run, Details
        per row, score contributions)

## 3. `/reco-eval` without login (public, unconditional)

- [x] **3.1** Exempt `/reco-eval` from the client-side redirect guard
      in `app/main-layout.tsx` — unconditionally (`pathname !==
      '/reco-eval'`), no flag.
- [x] **3.2** Exempt `/reco-eval` from the **content gate** in
      `components/layout-wrapper.tsx` (`shouldShowContent`), which
      otherwise renders an empty `<main>` for anonymous users with no
      temp address. Verified: an anonymous (no-cookie) headless browser
      loads the full eval UI on `/reco-eval` — heading, engine picker,
      persona selector, Run button — with zero redirects. (Repro:
      `.scratch/verify-reco-eval-anon.ts`.)

## 4. ~~Skip OTP in demo mode~~ — dropped

> **Obsolete (2026-05-29):** per the design change above, personas use
> the **standard auth flow** unchanged. The OTP-bypass branch in
> `components/authentication/sign-in.tsx` was reverted. There is no
> demo-only login path.

## Exit criteria

- [ ] **Smoke script passes** — `bash scripts/persona-demo-smoke.sh`
      exits 0 on a clean machine with docker running.

      _How to verify (no login needed):_
      1. Ensure Docker Desktop is running.
      2. From repo root: `bash scripts/persona-demo-smoke.sh`
      3. Watch stdout — it should print progress lines for each stage
         (OpenSearch up, seed complete, sidecar up, recommend call).
      4. Final exit: `echo $?` → must print `0`.
      5. The recommend response for `alice-tran` must log `ranked_ids`
         with at least one entry and `trajectory.steps` containing
         `candidate_gen`, `score`, and `final`.

- [x] **`/reco-eval` anonymous** — visiting the page without a session
      loads the eval UI (no redirect). Unconditional; no flag.

      _How to verify (no login — use incognito):_
      1. Start the app: `npm run dev`
      2. Open a **private/incognito** browser window (no cookies).
      3. Navigate to `http://localhost:3000/reco-eval`.
      4. Pass: the eval page renders (engine picker, persona selector,
         Run button visible). Fail: you are redirected, or `<main>` is
         empty.
      5. Confirm by checking the address bar — it must still read
         `/reco-eval`.

- [x] ~~**OTP bypassed**~~ — dropped. Personas use the standard auth
      flow; there is no demo-only OTP bypass to verify.

- [x] **`PERSONA_DEMO.md` exists** — doc is present and describes the
      full demo path end-to-end.

      _How to verify (no login needed):_
      1. `ls docs/PERSONA_DEMO.md` — file must exist.
      2. Open the file and confirm it contains all of:
         - Prerequisites section (docker, node, `.env`)
         - `./run.sh` (or equivalent) startup instructions
         - All 10 persona login IDs (format `<first>.<last>@personas.demo` / `password`)
         - What to look for on `/home` (labeled cuisine sections,
           "Try something new" card)
         - What to look for on `/reco-eval` (engine picker, Run button,
           ranked table, Details drilldown, score contributions)

- [x] **Types clean** — `npx tsc --noEmit` passes.

      _How to verify (no login needed):_
      1. From repo root: `npx tsc --noEmit`
      2. Pass: command exits 0 with no output (or only warnings, no
         errors).
      3. Fail: any `error TS…` lines in the output.

- [x] **Unit tests green** — `npm run test:unit` still passes.

      _How to verify (no login needed):_
      1. From repo root: `npm run test:unit`
      2. Pass: all test suites show green; process exits 0.
      3. Fail: any test suite reports a failure or the process exits
         non-zero.

> **On exit:** when every box above is checked, tick **Phase 6** in
> `plan.md`, clear this file's body, and note the project complete (or
> replace with Phase 7 if scope has grown).
