PRAGMA foreign_keys = ON;

-- ===========================================
-- ADDRESSES
-- ===========================================
CREATE TABLE addresses (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id              TEXT NOT NULL,
  street                TEXT NOT NULL,
  city                  TEXT NOT NULL,
  state                 TEXT NOT NULL,
  zip_code              TEXT NOT NULL,
  latitude              REAL CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude             REAL CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  is_primary            INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0, 1)),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MERCHANT STORES
-- ===========================================
CREATE TABLE stores (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  business_type         TEXT NOT NULL,
  owner_id              TEXT NOT NULL,
  created_at            TEXT NOT NULL,
  -- Store hours
  opening_hour          TEXT,
  closing_hour          TEXT,
  FOREIGN KEY (owner_id) REFERENCES merchants(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MERCHANTS (Store Owners/Operators)
-- ===========================================
CREATE TABLE merchants (
  id                      TEXT PRIMARY KEY,
  email                   TEXT NOT NULL UNIQUE,
  password                TEXT NOT NULL,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  user_phone              TEXT NOT NULL,
  -- Primary store reference
  primary_store_id        TEXT,
  primary_business_type   TEXT,
  -- Onboarding status
  onboarding_completed    INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
  onboarding_step         INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_step BETWEEN 0 AND 5),
  -- Onboarding data stored as JSON
  onboarding_data         TEXT,
  -- Timestamps
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (primary_store_id) REFERENCES stores(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Junction table for merchant-store relationships (a merchant can manage multiple stores)
CREATE TABLE merchant_stores (
  merchant_id   TEXT NOT NULL,
  store_id      TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (merchant_id, store_id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MENU CATEGORIES
-- ===========================================
CREATE TABLE menu_categories (
  id              TEXT PRIMARY KEY,
  store_id        TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MENU ITEMS
-- ===========================================
CREATE TABLE menu_items (
  id              TEXT PRIMARY KEY,
  store_id        TEXT NOT NULL,
  category_id     TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  image           TEXT,
  pickup_price    INTEGER NOT NULL DEFAULT 0 CHECK (pickup_price >= 0),
  delivery_price  INTEGER NOT NULL DEFAULT 0 CHECK (delivery_price >= 0),
  status          TEXT NOT NULL DEFAULT 'In stock' CHECK (status IN (
    'In stock',
    'Out of stock - 4 hours',
    'Out of stock - Today',
    'Out of stock - 1 week',
    'Out of stock - Custom',
    'Out of stock - Indefinitely'
  )),
  calories        INTEGER CHECK (calories IS NULL OR calories >= 0),
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_available    INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0, 1)),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MODIFIERS (Modifier Groups)
-- ===========================================
CREATE TABLE modifiers (
  id                        TEXT PRIMARY KEY,
  store_id                  TEXT NOT NULL,
  name                      TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'In stock' CHECK (status IN (
    'In stock',
    'Out of stock - 4 hours',
    'Out of stock - Today',
    'Out of stock - 1 week',
    'Out of stock - Custom',
    'Out of stock - Indefinitely'
  )),
  timing                    TEXT,
  is_required               INTEGER NOT NULL DEFAULT 0 CHECK (is_required IN (0, 1)),
  allow_multiple_options    INTEGER NOT NULL DEFAULT 0 CHECK (allow_multiple_options IN (0, 1)),
  allow_multiple_same       INTEGER NOT NULL DEFAULT 0 CHECK (allow_multiple_same IN (0, 1)),
  allow_free_options        INTEGER NOT NULL DEFAULT 0 CHECK (allow_free_options IN (0, 1)),
  created_at                TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MODIFIER OPTIONS
-- ===========================================
CREATE TABLE modifier_options (
  id              TEXT PRIMARY KEY,
  modifier_id     TEXT NOT NULL,
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_default      INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Junction table for menu items and modifiers (which modifiers are used in which items)
CREATE TABLE menu_item_modifiers (
  menu_item_id    TEXT NOT NULL,
  modifier_id     TEXT NOT NULL,
  PRIMARY KEY (menu_item_id, modifier_id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (modifier_id) REFERENCES modifiers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- ORDERS
-- ===========================================
CREATE TABLE orders (
  id                  TEXT PRIMARY KEY,
  store_id            TEXT NOT NULL,
  -- Customer info
  customer_name       TEXT,
  customer_id         TEXT,
  customer_email      TEXT,
  -- Order status
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'preparing',
    'dasher_assigned',
    'dasher_waiting',
    'scheduled',
    'ready',
    'picked_up',
    'on_the_way',
    'dasher_nearby',
    'delivered',
    'cancelled',
    'returned',
    'abandoned'
  )),
  -- Date/time
  order_date          TEXT NOT NULL,
  scheduled_date      TEXT,
  -- Fulfillment
  fulfillment_type    TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
  channel             TEXT NOT NULL DEFAULT 'DashDoor',
  -- Delivery address (for delivery orders)
  delivery_street     TEXT,
  delivery_city       TEXT,
  delivery_state      TEXT,
  delivery_zip_code   TEXT,
  delivery_business   TEXT,
  delivery_latitude   REAL CHECK (delivery_latitude IS NULL OR (delivery_latitude BETWEEN -90 AND 90)),
  delivery_longitude  REAL CHECK (delivery_longitude IS NULL OR (delivery_longitude BETWEEN -180 AND 180)),
  -- Pricing (stored in cents)
  subtotal            INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  service_fee         INTEGER NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  delivery_fee        INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  tip_amount          INTEGER NOT NULL DEFAULT 0 CHECK (tip_amount >= 0),
  total               INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),
  -- Timestamps
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- ORDER ITEMS
-- ===========================================
CREATE TABLE order_items (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL,
  menu_item_id    TEXT,
  name            TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price           INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  image           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================================
-- REVIEWS
-- ===========================================
CREATE TABLE reviews (
  id                TEXT PRIMARY KEY,
  store_id          TEXT NOT NULL,
  customer_id       TEXT,
  customer_name     TEXT NOT NULL,
  rating            REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content           TEXT NOT NULL,
  timestamp         TEXT NOT NULL,
  order_id          TEXT,
  approval_status   TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Review liked items (menu items that the customer liked in the review)
CREATE TABLE review_liked_items (
  review_id         TEXT NOT NULL,
  menu_item_id      TEXT NOT NULL,
  PRIMARY KEY (review_id, menu_item_id),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Review photos
CREATE TABLE review_photos (
  id                TEXT PRIMARY KEY,
  review_id         TEXT NOT NULL,
  url               TEXT NOT NULL,
  sort_order        INTEGER DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_addresses_store_id ON addresses(store_id);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_business_type ON stores(business_type);
CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchant_stores_merchant_id ON merchant_stores(merchant_id);
CREATE INDEX idx_merchant_stores_store_id ON merchant_stores(store_id);
CREATE INDEX idx_menu_categories_store_id ON menu_categories(store_id);
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_status ON menu_items(status);
CREATE INDEX idx_modifiers_store_id ON modifiers(store_id);
CREATE INDEX idx_modifier_options_modifier_id ON modifier_options(modifier_id);
CREATE INDEX idx_menu_item_modifiers_menu_item_id ON menu_item_modifiers(menu_item_id);
CREATE INDEX idx_menu_item_modifiers_modifier_id ON menu_item_modifiers(modifier_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_approval_status ON reviews(approval_status);
CREATE INDEX idx_review_liked_items_review_id ON review_liked_items(review_id);
CREATE INDEX idx_review_liked_items_menu_item_id ON review_liked_items(menu_item_id);
CREATE INDEX idx_review_photos_review_id ON review_photos(review_id);
