# Persona shape

Personas are the canonical, version-controlled definition of the ten
consumers our recommendation eval runs against. The DB rows in
`dashdoor.db` (`users`, `user_preferences`, `user_family`) are a
projection of this file — re-generated from it by the seed script.

**Source of truth:** `data/reco-personas/personas.json` — a JSON array
of `Persona` objects.

---

## Top-level

```jsonc
[
  Persona,
  Persona,
  ...        // exactly 10 entries; 5 with family blocks, 5 with family: null
]
```

## `Persona`

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable kebab slug, lower-case, ASCII only. Used in URLs and filenames. Unique across the array. |
| `user_id` | `integer` | Row id in `users` table. Phase 1 uses `3101..3110` (avoids the e2e fixture at `3001`). |
| `display_name` | `string` | Shown in the UI; mirrors `users.name`. |
| `email` | `string` | Mirrors `users.email`. Used for the demo login. |
| `address` | `Address` | The persona's default delivery address — see `data/db/schema/dashdoor_schema.sql` `addresses` table for column shape. |
| `story` | `string` | One-line context for humans reading the file ("Bay Area solo, orders Thai 3×/week"). The runner ignores it. |
| `preferences` | `Preferences` | The five-dimension block — see below. |
| `family` | `Family \| null` | Family block if this persona orders for a household; otherwise `null`. See `docs/reco-family-shape.md`. |

## `Preferences` — seven dimensions

| Field | Type | Notes |
|---|---|---|
| `cuisine_affinity` | `map<string, number>` | Keys are cuisine names matching `restaurants.cuisine` (e.g. `"Thai"`, `"Italian"`). Values in `0..1` (1 = "love it"). Unknown keys are ignored by the rule. Empty map is legal but uninteresting. |
| `price_tier` | `"budget" \| "mid" \| "premium"` | Roughly maps to `restaurants.price_range` ranges 1, 2, 3–4. |
| `dietary` | `string[]` | Constraints to honor. Starter vocab below. Unknown values are ignored. |
| `spice_tolerance` | `"mild" \| "medium" \| "hot"` | Reserved for later — no `restaurants` column today, so the rule ignores it until one is added. |
| `novelty_appetite` | `number` | `0..1`. 0 = homebody (sticks to favorites); 1 = explorer (wants new places). The default rule uses a fixed "3 familiar + 1 new" mix; this dimension is a hook for future variations. |
| `delivery_time_tolerance` | `"quick" \| "flexible"` | `quick` = penalize restaurants whose computed delivery time exceeds ~25 min; `flexible` = ignore the signal. The rule consumes the same `deliveryTime` value the UI renders on each card. |
| `promo_sensitivity` | `"low" \| "mid" \| "high"` | `high` = boost restaurants with `dash_pass = 1` or `discount_percentage > 0`; `mid` = mild boost; `low` = ignore. |

Address is **not** a preference dimension — the persona's
`address.lat`/`lng` drives candidate-pool retrieval at the engine
level (same path the existing `/home` feed uses), so location-
sensitive filtering happens before the rule sees any candidates.

### `dietary` starter vocabulary

The rule only recognizes these values (anything else is ignored):

```
"vegetarian", "vegan", "halal", "kosher",
"gluten-free", "dairy-free", "nut-free",
"no-pork", "no-beef", "pescatarian"
```

---

## Full example

```json
[
  {
    "id": "alice-tran",
    "user_id": 3101,
    "display_name": "Alice Tran",
    "email": "alice.tran@personas.demo",
    "address": {
      "label": "Home",
      "line1": "1525 Mission St",
      "city": "San Francisco",
      "state": "CA",
      "zip": "94103",
      "lat": 37.7741,
      "lng": -122.4185,
      "default": true
    },
    "story": "Bay Area solo, orders Thai 3x/week, picky about pad see ew.",
    "preferences": {
      "cuisine_affinity": { "Thai": 0.9, "Vietnamese": 0.6, "Japanese": 0.4 },
      "price_tier": "mid",
      "dietary": ["no-pork"],
      "spice_tolerance": "hot",
      "novelty_appetite": 0.7,
      "delivery_time_tolerance": "quick",
      "promo_sensitivity": "mid"
    },
    "family": null
  }
]
```

A family persona example lives in `docs/reco-family-shape.md`.

---

## Mapping to SQLite

The seed script writes one row each into:

| Table | Source field(s) |
|---|---|
| `users` | `user_id`, `display_name` (→ `name`), `email`, plus defaults (password `"password"`, `country_id` 2, etc.) |
| `addresses` | `address` |
| `user_preferences` | `preferences` (JSON-encoded for `cuisine_affinity` and `dietary`) |
| `user_family` | `family` (only when non-null; JSON-encoded for `kid_ages` and `shared_dietary`) |

Each persona also gets seeded orders and `user_reviews` rows — see
`execution_plan.md` §4.5 and §4.6 for counts and constraints.
