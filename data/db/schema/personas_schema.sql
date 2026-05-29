-- Persona preferences and family schema. Idempotent.
-- Applied to data/db/dashdoor.db; the seed lives in personas_seed.sql.
--
-- See docs/reco-persona-shape.md and docs/reco-family-shape.md for the
-- canonical JSON shape these tables mirror.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id                 INTEGER PRIMARY KEY,
  cuisine_affinity        TEXT NOT NULL,    -- JSON map<cuisine, weight 0..1>
  price_tier              TEXT NOT NULL CHECK (price_tier IN ('budget','mid','premium')),
  dietary                 TEXT NOT NULL,    -- JSON string[]
  spice_tolerance         TEXT NOT NULL CHECK (spice_tolerance IN ('mild','medium','hot')),
  novelty_appetite        REAL NOT NULL CHECK (novelty_appetite BETWEEN 0 AND 1),
  delivery_time_tolerance TEXT NOT NULL CHECK (delivery_time_tolerance IN ('quick','flexible')),
  promo_sensitivity       TEXT NOT NULL CHECK (promo_sensitivity IN ('low','mid','high')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_family (
  user_id               INTEGER PRIMARY KEY,
  adults                INTEGER NOT NULL CHECK (adults >= 1),
  kids                  INTEGER NOT NULL CHECK (kids >= 0),
  kid_ages              TEXT NOT NULL,      -- JSON int[]; length must equal `kids`
  shared_dietary        TEXT NOT NULL,      -- JSON string[]
  kid_friendly_required INTEGER NOT NULL CHECK (kid_friendly_required IN (0,1)),
  notes                 TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
