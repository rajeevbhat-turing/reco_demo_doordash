# Reco trajectory shape

Every engine that implements `POST /recommend` must include a `trajectory`
field in its response. The shape is defined in `lib/reco/types.ts`.

## Minimum contract (all engines)

```ts
type RecoTrajectory = {
  engine: string;          // engine identifier
  steps: TrajectoryStep[]; // at least candidate_gen + final
  raw_explain?: unknown;   // optional engine-specific payload
};

type TrajectoryStep = {
  stage: TrajectoryStage;          // see below
  restaurant_ids: number[];        // IDs at this stage
  scores?: Record<number, number>; // optional: id → score
  notes?: string;                  // optional: human-readable note
};

type TrajectoryStage =
  | 'query'         // search query / filter definition (ids may be empty)
  | 'candidate_gen' // initial retrieval set
  | 'filter'        // post-retrieval hard filters
  | 'score'         // scoring / ranking pass
  | 'rerank'        // optional secondary rerank
  | 'final';        // final ordered output
```

**Required steps:** `candidate_gen` and `final`. Everything else is optional.
The `/reco-eval` drilldown modal degrades gracefully when only the thin
two-step shape is present.

## OpenSearch full shape

In addition to `candidate_gen` and `final`, OpenSearch emits:

| Step | What it carries |
|---|---|
| `query` | `notes` = JSON-stringified `function_score` query, `restaurant_ids = []` |
| `score` | `scores` map (id → `_score`), `notes` describing the scoring formula |

`raw_explain` is set to:
```ts
Array<{ id: number; score: number; explanation: OSExplanation }>
```
where `OSExplanation` mirrors the OpenSearch `_explanation` node:
```ts
type OSExplanation = {
  value: number;
  description: string;
  details?: OSExplanation[];
};
```
This lets the drilldown modal render per-field score contributions for any
restaurant in the result set.
