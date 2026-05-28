# Overview — what this project does

Dashdoor is a DoorDash-style **RL/UI gym**. This repo extends it into a
**recommendation-engine evaluation harness**: plug in engines (or an LLM that
drives the UI), run the same tasks against the same ground truth, and compare
metrics. With `RECO_DEMO=1`, you can also **re-sort the live `/home` feed**
from a header picker.

---

## System overview

```mermaid
flowchart TB
  subgraph Product["What you're building"]
    G1["Goal 1: Engine plug-in track"]
    G2["Goal 2: LLM-agent track"]
    G3["Goal 3: Demo-ready Docker deploy"]
  end

  subgraph App["Dashdoor app (Next.js)"]
    UI["Consumer UI: /, /home, /store, checkout, auth"]
    DB[("SQLite via libSQL<br/>dashdoor.db + merchant + delivery")]
    UI --> DB
  end

  subgraph RecoHarness["Reco harness (lib/reco)"]
    Contract["RecommendationEngine contract<br/>recommend(ctx) → ranked IDs"]
    Registry["Engine registry<br/>random, popularity, gorse, lightfm, implicit, http, agent"]
    Tasks["Task set + ground truth<br/>data/reco-tasks/seed.json"]
    Metrics["Metrics: Hit@K, NDCG, MRR, coverage"]
    Runner["Eval runner → EvalReport<br/>saved to data/reco-runs/"]
    Contract --> Registry
    Tasks --> Runner
    Registry --> Runner
    Runner --> Metrics
  end

  Product --> App
  Product --> RecoHarness
  App --> RecoHarness
```

---

## Two ways recommendations get scored

```mermaid
flowchart LR
  subgraph TrackA["API engines (Phases 0–3)"]
    T["Task + user context"]
    E["Engine adapter"]
    R["Ranked restaurant/item IDs"]
    M["Compare to expected set"]
    S["Metrics + report"]
    T --> E --> R --> M --> S
  end

  subgraph TrackB["LLM agent (Phase 4)"]
    T2["Same task + start_url"]
    PW["Playwright drives real UI<br/>click, type, scroll, cart…"]
    Map["Map trajectory → RecommendationResponse"]
    M2["Same metrics + runner"]
    T2 --> PW --> Map --> M2
  end

  GT[("Ground truth<br/>tasks or order history")]
  GT --> TrackA
  GT --> TrackB
```

---

## Where it shows up in the app

```mermaid
flowchart TB
  DemoGate{"RECO_DEMO=1 ?"}

  subgraph Offline["Offline eval UI"]
    RE["/reco-eval"]
    RE --> POST["POST /api/reco/eval"]
    POST --> Runner2["Run engines × tasks"]
    Runner2 --> Table["Aggregate metrics table"]
  end

  subgraph Live["Live re-rank (Phase 3)"]
    Home["/home feed"]
    Picker["Header engine picker"]
    Predict["POST /api/reco/predict"]
    Rank["applyRanking() re-orders cards<br/>never drops restaurants"]
    Picker --> Predict --> Rank --> Home
  end

  subgraph Prod["Normal gym (RECO_DEMO off)"]
    HomePlain["/home — original order<br/>no picker, no predict calls"]
  end

  DemoGate -->|yes| Offline
  DemoGate -->|yes| Live
  DemoGate -->|no| Prod
```

---

## Phased delivery

```mermaid
flowchart TD
  P0["Phase 0 ✓<br/>Contract, baselines, Gorse,<br/>/reco-eval, metrics"]
  P1["Phase 1 ✓<br/>Decisions doc"]
  P2["Phase 2 ✓<br/>LightFM + Implicit sidecars<br/>5-engine eval"]
  P3["Phase 3 ✓<br/>Live re-rank on /home"]
  P4["Phase 4 ● active<br/>LLM agent + Playwright"]
  P5["Phase 5<br/>Deploy polish"]

  P0 --> P1 --> P2 --> P3 --> P4 --> P5
```

Phase checklists: `RECO_PLAN.md` (all phases), `EXECUTION.md` (current phase
only). Archived step lists live under `docs/execution-phase-*.md`.

---

## Docker / reco stack (optional local run)

```mermaid
flowchart TB
  subgraph Compose["docker compose reco stack"]
    DD["dashdoor Next app :3000"]
    G["Gorse :8088"]
    L["LightFM :8001"]
    I["Implicit :8002"]
  end

  DD --> G
  DD --> L
  DD --> I
  DD --> DBS[("Mounted .db files")]

  Seed["scripts/seed-gorse.ts<br/>orders → Gorse feedback"]
  Seed --> G
```

---

## Related docs

| Doc | Use for |
|-----|---------|
| `RECO_PLAN.md` | Phased goals, exit criteria, checkboxes |
| `EXECUTION.md` | Step-by-step work for the **current** phase |
| `HOW_TO_TEST.md` | Running evals and smoke tests |
| `docs/reco-http-contract.md` | External engine HTTP API |
| `gorse_work.md` | Gorse-specific verification and tuning |
