PRAGMA foreign_keys = ON;

-- ===========================================
-- DELIVERY PARTNER PORTAL DATABASE SCHEMA
-- ===========================================
-- Simplified schema for simulated delivery partner dashboard
-- Database file: delivery.db
-- Features: Sign-up/Login, Past Orders, Ratings, Earnings, Account
-- ===========================================

-- ===========================================
-- COUNTRIES (for phone number selection)
-- ===========================================

CREATE TABLE delivery_countries (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  code      TEXT NOT NULL,  -- e.g., "US"
  name      TEXT NOT NULL,  -- e.g., "United States"
  dial_code TEXT NOT NULL   -- e.g., "+1"
);

-- Insert common countries
INSERT INTO delivery_countries (code, name, dial_code) VALUES
  ('US', 'United States', '+1'),
  ('CA', 'Canada', '+1'),
  ('GB', 'United Kingdom', '+44'),
  ('AU', 'Australia', '+61'),
  ('DE', 'Germany', '+49'),
  ('FR', 'France', '+33'),
  ('ES', 'Spain', '+34'),
  ('IT', 'Italy', '+39'),
  ('MX', 'Mexico', '+52'),
  ('BR', 'Brazil', '+55');

-- ===========================================
-- DELIVERY PARTNERS (DRIVERS)
-- ===========================================

-- Main delivery partners table - users who sign up to deliver
CREATE TABLE delivery_partners (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  email                 TEXT NOT NULL UNIQUE,
  password              TEXT NOT NULL,
  name                  TEXT NOT NULL,
  phone_number          TEXT NOT NULL,
  country_id            INTEGER NOT NULL,
  avatar                TEXT,
  
  -- Stats (pre-calculated for display)
  lifetime_deliveries   INTEGER NOT NULL DEFAULT 0,
  average_rating        REAL NOT NULL DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
  acceptance_rate       REAL NOT NULL DEFAULT 0.0 CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100),
  completion_rate       REAL NOT NULL DEFAULT 0.0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  on_time_rate          REAL NOT NULL DEFAULT 0.0 CHECK (on_time_rate >= 0 AND on_time_rate <= 100),
  
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (country_id) REFERENCES delivery_countries(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_delivery_partners_email ON delivery_partners(email);

-- ===========================================
-- DELIVERY ORDERS (Past Deliveries)
-- ===========================================

-- Simplified past orders/deliveries for display
CREATE TABLE delivery_orders (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id            INTEGER NOT NULL,
  
  -- Store info
  store_name            TEXT NOT NULL,
  store_logo            TEXT,
  store_address         TEXT NOT NULL,
  
  -- Customer info (masked for privacy)
  customer_name         TEXT NOT NULL,
  customer_address      TEXT NOT NULL,
  
  -- Order details
  items_count           INTEGER NOT NULL CHECK (items_count > 0),
  distance_miles        REAL NOT NULL CHECK (distance_miles >= 0),
  
  -- Earnings for this delivery (in cents)
  base_pay              INTEGER NOT NULL DEFAULT 0,
  tip_amount            INTEGER NOT NULL DEFAULT 0,
  total_earnings        INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  status                TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')),
  
  -- Timestamps
  order_date            TEXT NOT NULL,
  completed_at          TEXT,
  
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_delivery_orders_partner ON delivery_orders(partner_id);
CREATE INDEX idx_delivery_orders_date ON delivery_orders(order_date);

-- ===========================================
-- DELIVERY RATINGS
-- ===========================================

-- Ratings received by delivery partners
CREATE TABLE delivery_ratings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id            INTEGER NOT NULL,
  order_id              INTEGER NOT NULL,
  
  rating                INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback              TEXT,
  customer_name         TEXT NOT NULL,
  
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (order_id) REFERENCES delivery_orders(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_delivery_ratings_partner ON delivery_ratings(partner_id);

-- ===========================================
-- DELIVERY EARNINGS (Weekly Summary)
-- ===========================================

-- Weekly earnings summary for display
CREATE TABLE delivery_earnings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id            INTEGER NOT NULL,
  
  week_start            TEXT NOT NULL,  -- e.g., "2024-01-01"
  week_end              TEXT NOT NULL,  -- e.g., "2024-01-07"
  
  -- Earnings breakdown (in cents)
  total_deliveries      INTEGER NOT NULL DEFAULT 0,
  base_pay              INTEGER NOT NULL DEFAULT 0,
  tips                  INTEGER NOT NULL DEFAULT 0,
  bonuses               INTEGER NOT NULL DEFAULT 0,
  total_earnings        INTEGER NOT NULL DEFAULT 0,
  
  -- Time worked
  hours_worked          REAL NOT NULL DEFAULT 0,
  
  UNIQUE (partner_id, week_start),
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_delivery_earnings_partner ON delivery_earnings(partner_id);
CREATE INDEX idx_delivery_earnings_week ON delivery_earnings(week_start);

-- ===========================================
-- DELIVERY PAYOUT METHODS (Account Management)
-- ===========================================

-- Payment methods for receiving payouts
CREATE TABLE delivery_payout_methods (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_id            INTEGER NOT NULL,
  
  method_type           TEXT NOT NULL CHECK (method_type IN ('bank_account', 'debit_card')),
  bank_name             TEXT,
  last_four             TEXT NOT NULL,
  is_default            INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_delivery_payout_methods_partner ON delivery_payout_methods(partner_id);
