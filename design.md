# Design — Persona-driven recommendation eval

## Goal

Let a client **bring their own ranking model** and A/B it against
**persona-aware ground truth**, with **OpenSearch as the named
baseline**. The client's ranker scores the same candidate set the
baseline saw (Shopify-style: retrieve candidates → rank by features);
two BYO paths — a client-hosted `/recommend` endpoint, or their LLM
key/endpoint driving our ranking prompt. The same persona logic drives
the `/home` UI, and every engine emits a **trajectory** so we can see
*why* it ranked the way it did. (The open-source Python engines and the
agentic-browse path are out — see `plan.md` Phase 7.)

## 10 personas

Ten consumers seeded as real users in `data/db/dashdoor.db` (rows
3101–3110). Each persona has:

- A seven-dimension preference profile (below).
- 8–20 seeded orders consistent with their preferences.
- 5–15 seeded reviews — **at least 2 are ≤ 2★** so the "avoid
  negative reviews" rule has something to bite on.

**Five of the ten** also have a family block.

## Preferences — seven dimensions

| Dimension | Type | Example |
|---|---|---|
| `cuisine_affinity` | `map<cuisine, 0..1>` | `{ "Thai": 0.9, "Vietnamese": 0.6 }` |
| `price_tier` | `budget` \| `mid` \| `premium` | `mid` |
| `dietary` | `string[]` | `["no-pork", "halal"]` |
| `spice_tolerance` | `mild` \| `medium` \| `hot` | `hot` |
| `novelty_appetite` | `0..1` (homebody → explorer) | `0.7` |
| `delivery_time_tolerance` | `quick` \| `flexible` | `quick` |
| `promo_sensitivity` | `low` \| `mid` \| `high` | `mid` |

`spice_tolerance` is kept in the schema but ignored by the rule until
a corresponding `menu_items.spice_level` field exists. The other six
all map onto existing `restaurants` columns (`cuisine`, `price_range`,
`dash_pass`, `discount_percentage`, the computed delivery time, plus
the categories tables for dietary).

**Address is not a preference dimension.** The persona's
`address.lat`/`lng` drives candidate-pool retrieval at the engine
level, the same way `/home` already uses `defaultAddress` today — so
location filtering happens before the rule runs.

## Family block (5 of 10 personas)

| Field | Type |
|---|---|
| `adults` | int |
| `kids` | int |
| `kid_ages` | `int[]` |
| `shared_dietary` | `string[]` |
| `kid_friendly_required` | bool |

## Reviews (existing schema, reused)

`user_reviews` already exists in `dashdoor.db` (63k rows, `rating`
0–5). We seed 5–15 per persona; ≥ 2 of each persona's reviews carry
`rating ≤ 2`. The ground-truth rule treats those restaurants as
**blocked** — they cannot appear in any section.

## Ground truth — rule + hand overrides

A pure function turns (persona attributes + order history + review
history) into an expected ranked list. Hand overrides patch the rule
per persona, per surface.

**Rule (home_feed):**

1. Compute *hot cuisines*: `affinity × historical_order_count`. Keep
   cuisines above threshold (default `2.0`, tunable).
2. For each hot cuisine, build a **section of 4 restaurants**:
   - **3 familiar:** top by past orders for this persona, matching
     price tier + dietary, not rated ≤ 2★.
   - **1 new:** highest-rated cuisine match the persona has never
     ordered from, same constraints.
3. **Block list:** every restaurant the persona has rated ≤ 2★ — not
   allowed anywhere in the expected output.
4. **Family constraints** (if `family` is set): exclude restaurants
   that violate `shared_dietary`; if `kid_friendly_required`,
   restrict to ones with kid-friendly items.

The hand-override file (`data/reco-personas/overrides.json`) is the
same shape as the rule's output; the runner merges
`rule_output ⊕ override` with override winning on present fields.

### Rule constants and v1 heuristics

These are exported as named constants from
`lib/reco/eval/persona-truth.ts` so they're tunable in one place.
Each carries a documented default; push back here when the demo
needs different numbers.

| Constant | Default | Purpose |
|---|---|---|
| `HOT_CUISINE_THRESHOLD` | `2.0` | A cuisine becomes "hot" when `affinity × historical_order_count ≥ 2.0`. Below this, no section is emitted. |
| `CANDIDATE_RADIUS_MILES` | `15` | Haversine distance from the persona's `address.lat`/`lng` — restaurants outside this are not candidates. |
| `SECTION_SIZE` | `4` | Cards per cuisine section (3 familiar + 1 new). |
| `FAMILIAR_COUNT` | `3` | Familiar slots per section before the novelty slot. |

**Planned refinements (Phase 8 — see `plan.md`):** outlier/misattribution
removal (a 2× catering order or a one-off cuisine shouldn't become a
"hot cuisine"); an **adaptive explore/exploit ratio** driven by
`novelty_appetite` (explorer → 3-of-4 new, homebody → 1-of-4); and
**complementary novelty** — explore slots prefer adjacent cuisines
("ordered Thai → try Vietnamese") via a cuisine-adjacency map, scored at
the set level rather than exact-ID. The fixed `FAMILIAR_COUNT` below is
superseded by the ratio function once 8b lands.

**Other rule choices (v1, called out so they're easy to revisit):**

- **Sections require both familiar and novel.** A cuisine that has
  no familiar match, or no in-pool novelty match, is dropped rather
  than emitted as a partial section. This keeps the demo's "3+1"
  story honest.
- **Insufficient familiar candidates** are topped up with the
  highest-rated cuisine matches from the candidate pool (computed
  from `user_reviews` aggregates; `featured` flag is the tiebreak
  when there are no reviews). The novelty slot is always positioned
  after any filler — `novelty_index = familiar.length + filler.length`.
- **`family.kid_friendly_required` is deferred in v1.** The original
  heuristic (any `menu_items.name LIKE '%kid%'` or category) matched
  only 55 of 594 restaurants — too narrow, collapsing family-persona
  sections to zero. The rule currently ignores `kid_friendly_required`.
  Re-enable once the catalog has a real `is_kid_friendly` tag.
- **Dietary filtering at restaurant level — not enforced in v1.**
  The schema has no restaurant-level dietary tag today, so the rule
  ignores `preferences.dietary` and `family.shared_dietary` as
  positive filters. The persona's own ≤ 2★ block list (which they
  built up by trying places that violated their diet) carries the
  most signal until a tag column lands. **TODO:** add restaurant
  dietary tags and re-enable.
- **Avg-rating source:** `AVG(rating)` over `user_reviews` where
  `store_category = 'restaurant'` AND `approval_status = 'approved'`,
  including the persona's own reviews. The persona's negative
  reviews then naturally pull a restaurant's score down without
  needing a separate hard-block path (the explicit block list is
  belt + suspenders).
- **DB client:** `better-sqlite3` (sync) for offline rule code; the
  Next.js app continues to use libsql. The two clients open the same
  `.db` file; no cross-traffic.

## OpenSearch as baseline

OpenSearch runs as a sidecar in the demo stack
(`config/docker-compose.demo.yaml`), speaking the same `POST
/recommend` contract as the BYO engines
(`docs/reco-http-contract.md`). It is **the named baseline**:

- Always selected on `/reco-eval` — can't be unchecked.
- Its column is highlighted in the metric table — the "line to beat".
- `/demo` copy: "your ranking model is scored against OpenSearch."

## Cuisine sections — UI

When a persona is signed in, `/home` renders one **labeled section
per hot cuisine** ("More Thai for you"). Each section is **4 cards**:
in v1, 3 familiar + 1 marked "Try something new". The active engine's
ranking fills the slots. (Phase 8 makes the familiar/explore split
adaptive to `novelty_appetite` and tags every explore card.)

Non-persona users see today's standard home feed, untouched.
Personalization keys off whether the signed-in user is a persona
(user_id 3101–3110) — there is no feature flag. Any non-persona user
gets a feed bit-identical to today's.

## Trajectories

Every engine emits a `RecoTrajectory` alongside its `/recommend`
response. The implemented shape (`lib/reco/types.ts`) is:

```ts
type RecoTrajectory = {
  engine: string;
  steps: TrajectoryStep[];   // query → candidate_gen → filter → score → rerank → final
  raw_explain?: unknown;     // OpenSearch _explain tree, rendered as score contributions
};

type TrajectoryStep = {
  stage: 'query' | 'candidate_gen' | 'filter' | 'score' | 'rerank' | 'final';
  restaurant_ids: number[];
  scores?: Record<number, number>;
  notes?: string;            // query DSL / prompt as JSON string, or a filter reason
};
```

OpenSearch fills this out fully via `_explain` (→ `raw_explain`). BYO
engines emit what they have — a thin `query` (prompt) + `candidate_gen`
+ `final`, plus their per-candidate `scores`. The `/reco-eval` drilldown
modal renders the steps; the score contributions panel reads
`raw_explain` for OpenSearch and `scores` for BYO engines.

## Data shapes — where things live

| What | Where |
|---|---|
| Personas (source of truth) | `data/reco-personas/personas.json` |
| Hand overrides | `data/reco-personas/overrides.json` |
| Preference + family schema | `data/db/schema/personas_schema.sql` |
| Persona DB seed | `data/db/schema/personas_seed.sql` |
| Persona shape doc | `docs/reco-persona-shape.md` |
| Family shape doc | `docs/reco-family-shape.md` |
| Trajectory shape doc | `docs/reco-trajectory-shape.md` |
| OpenSearch index doc | `docs/reco-opensearch-index-shape.md` |
| Ground-truth rule | `lib/reco/eval/persona-truth.ts` |
| Cuisine section component | `components/cuisine-section.tsx` |
| Persona home API | `app/api/reco/persona-home/route.ts` |
| OpenSearch engine | `tools/reco-engines/opensearch/` |
| Trajectory traces | `data/reco-traces/<runId>/<engine>/<task>.json` |

## Out of scope (for now)

- Surfaces beyond `home_feed` (search, store, promotions).
- Training models inside the gym.
- Multi-tenant or live-user telemetry.
- Persona evolution mid-session.
- Production-grade OpenSearch (no security plugin, single-node).
