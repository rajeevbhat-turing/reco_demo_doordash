# Family shape

A `Family` block models a household one persona orders for. Five of
the ten personas carry it; the other five have `family: null`.

**Lives at:** `Persona.family` in `data/reco-personas/personas.json`
(see `docs/reco-persona-shape.md`). Mirrored to the `user_family`
SQLite table by the seed script.

---

## `Family`

| Field | Type | Notes |
|---|---|---|
| `adults` | `integer` | `>= 1`. Adults the persona regularly orders for (themselves included). |
| `kids` | `integer` | `>= 0`. Number of children in the household. |
| `kid_ages` | `integer[]` | Length **must equal** `kids`. Each entry `0..17`. |
| `shared_dietary` | `string[]` | Constraints applied to the whole household. Same starter vocab as `Preferences.dietary` in `docs/reco-persona-shape.md`. |
| `kid_friendly_required` | `boolean` | If `true`, the ground-truth rule restricts each section to restaurants that have at least one kid-friendly item. |
| `notes` | `string` | Optional, human-only. Ignored by the rule. |

---

## Interaction with the rule

When `family` is present:

1. Restaurants that violate any `shared_dietary` constraint are
   dropped before sectioning (in addition to the persona's own
   `preferences.dietary`).
2. If `kid_friendly_required` is `true`, a restaurant only counts
   if at least one of its `menu_items` has the
   `kid-friendly` tag (or equivalent — exact detection rule
   confirmed in Phase 2 when the rule is implemented).

When `family` is `null`, neither check applies.

---

## Full example

```jsonc
{
  "id": "noah-patel",
  "user_id": 3106,
  "display_name": "Noah Patel",
  "email": "noah.patel@personas.demo",
  "address": {
    "label": "Home",
    "line1": "440 Castro St",
    "city": "Mountain View",
    "state": "CA",
    "zip": "94041",
    "lat": 37.3935,
    "lng": -122.0782,
    "default": true
  },
  "story": "Family of four, Friday is family-night, big multi-item orders.",
  "preferences": {
    "cuisine_affinity": { "Italian": 0.8, "American": 0.6, "Mexican": 0.5 },
    "price_tier": "mid",
    "dietary": [],
    "spice_tolerance": "medium",
    "novelty_appetite": 0.3,
    "delivery_time_tolerance": "flexible",
    "promo_sensitivity": "high"
  },
  "family": {
    "adults": 2,
    "kids": 2,
    "kid_ages": [4, 9],
    "shared_dietary": ["nut-free"],
    "kid_friendly_required": true,
    "notes": "Older kid won't touch seafood — taken as guidance, not a hard block."
  }
}
```
