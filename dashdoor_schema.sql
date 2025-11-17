PRAGMA foreign_keys = ON;

-- ===========================================
-- RESTAURANTS, MENUS, AND CATEGORIES
-- ===========================================
CREATE TABLE restaurants (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  logo                  TEXT NOT NULL,
  banner                TEXT NOT NULL,
  details_banner        TEXT,
  is_free_delivery      INTEGER NOT NULL CHECK (is_free_delivery IN (0,1)),
  min_delivery_fee     	INTEGER NOT NULL CHECK (min_delivery_fee >= 0),
  price_range           INTEGER NOT NULL CHECK (price_range BETWEEN 1 AND 4),
  cuisine               TEXT NOT NULL,
  dash_pass             INTEGER NOT NULL CHECK (dash_pass IN (0,1)),
  opening_hour          INTEGER NOT NULL CHECK (opening_hour >= 0),
  closing_hour         	INTEGER NOT NULL CHECK (closing_hour >= 0),
  street              	TEXT NOT NULL,
  city                	TEXT NOT NULL,
  state               	TEXT NOT NULL,
  zip_code            	TEXT NOT NULL,
  latitude            	REAL CHECK (latitude  BETWEEN -90  AND 90),
  longitude           	REAL CHECK (longitude BETWEEN -180 AND 180),
  phone                 TEXT NOT NULL,
  discount_percentage   INTEGER CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
  discount_cap          INTEGER CHECK (discount_cap IS NULL OR discount_cap >= 0),
  featured              INTEGER CHECK (featured IN (0,1)),
  new_flag              INTEGER CHECK (new_flag IN (0,1)),
  section               TEXT
);

-- Defines available cuisine or restaurant-type categories (e.g., "coffee", "breakfast")
CREATE TABLE categories (
  name TEXT PRIMARY KEY
);

-- Many-to-many link between restaurants and their categories
CREATE TABLE restaurant_categories (
  restaurant_id  INTEGER NOT NULL,
  category_name  TEXT NOT NULL,
  PRIMARY KEY (restaurant_id, category_name),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_name) REFERENCES categories(name) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Menu categories for grouping menu items (e.g., "Featured", "Beverages")
CREATE TABLE menu_categories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id  INTEGER NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  display_order  INTEGER NOT NULL,
  is_active      INTEGER NOT NULL CHECK (is_active IN (0,1)),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Menu items available at each restaurant
CREATE TABLE menu_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id    INTEGER NOT NULL,
  category_id      INTEGER NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  price            INTEGER NOT NULL CHECK (price >= 0),
  image            TEXT,
  calories         INTEGER CHECK (calories IS NULL OR calories >= 0),
  rating           REAL CHECK (rating >= 0 AND rating <= 5),
  rating_count     INTEGER,
  popular          INTEGER CHECK (popular IN (0,1)),
  featured         INTEGER CHECK (featured IN (0,1)),
  display_order    INTEGER,
  is_available     INTEGER CHECK (is_available IN (0,1)),
  discount_percentage   INTEGER CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
  discount_cap          INTEGER CHECK (discount_cap IS NULL OR discount_cap >= 0),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id)   REFERENCES menu_categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- MODIFICATION CATALOG (per menu item)
-- ===========================================
CREATE TABLE modifications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id     INTEGER NOT NULL,
  description      TEXT NOT NULL,
  is_required      INTEGER NOT NULL CHECK (is_required IN (0,1)),
  select_up_to     INTEGER NOT NULL CHECK (select_up_to >= 0),
  select_at_least  INTEGER CHECK (select_at_least IS NULL OR (select_at_least >= 0 AND select_at_least <= select_up_to)),
  parent_option_id INTEGER,
  FOREIGN KEY (menu_item_id)     REFERENCES menu_items(id)        ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (parent_option_id) REFERENCES modification_options(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE modification_options (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  modification_id INTEGER NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price           INTEGER NOT NULL,
  is_counter      INTEGER NOT NULL CHECK (is_counter IN (0,1)),
  max_quantity    INTEGER,
  is_default      INTEGER NOT NULL CHECK (is_default IN (0,1)),
  sort_order      INTEGER NOT NULL,
  image           TEXT,
  FOREIGN KEY (modification_id) REFERENCES modifications(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- COUNTRIES AND USERS
-- ===========================================
CREATE TABLE countries (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  code      TEXT NOT NULL,  -- e.g., "PK"
  name      TEXT NOT NULL,  -- e.g., "Pakistan"
  dial_code TEXT NOT NULL   -- e.g., "+92"
);

-- User accounts and their associated country
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone_number  TEXT NOT NULL,
  password      TEXT NOT NULL,
  country_id    INTEGER NOT NULL,
  avatar        TEXT,
  is_restricted INTEGER CHECK (is_restricted IN (0,1)),
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Payment methods stored for users (cards, etc.)
CREATE TABLE payment_methods (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  type        TEXT NOT NULL,
  card_number TEXT NOT NULL,
  last_four   TEXT NOT NULL,
  cvc         TEXT NOT NULL,
  expiry      TEXT NOT NULL,
  zip_code    TEXT NOT NULL,
  is_default  INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Saved delivery or billing addresses for users
CREATE TABLE addresses (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             INTEGER NOT NULL,
  street              TEXT NOT NULL,
  city                TEXT NOT NULL,
  state               TEXT NOT NULL,
  zip_code            TEXT NOT NULL,
  latitude            REAL CHECK (latitude  BETWEEN -90  AND 90),
  longitude           REAL CHECK (longitude BETWEEN -180 AND 180),
  address_type        TEXT NOT NULL CHECK (address_type IN ('house','apartment','hotel','office','other')),
  is_default          INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0,1)),
  gate_code           TEXT,
  apartment_suite     TEXT,
  entry_code          TEXT,
  room_suite          TEXT,
  hotel_name          TEXT,
  suite_floor         TEXT,
  business_name       TEXT,
  building_name       TEXT,
  delivery_preference TEXT CHECK (delivery_preference IN ('door','location')),
  meet_location       TEXT,
  delivery_instructions TEXT,
  personal_label      TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- CATEGORY CONFIGURATIONS (SERVICE FEES)
-- ===========================================
CREATE TABLE category_configs (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  store_category           TEXT NOT NULL CHECK (store_category IN ('restaurant','grocery','retail','pets','convenience')),
  free_delivery_threshold  INTEGER NOT NULL CHECK (free_delivery_threshold >= 0),
  default_delivery_fee     INTEGER NOT NULL CHECK (default_delivery_fee >= 0),
  service_fee_percentage   REAL    NOT NULL CHECK (service_fee_percentage >= 0),
  min_service_fee          INTEGER NOT NULL CHECK (min_service_fee >= 0)
);

-- ===========================================
-- CARTS AND CART ITEMS
-- ===========================================
CREATE TABLE carts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id           INTEGER,
  store_id          INTEGER,
  store_category    TEXT NOT NULL CHECK (store_category IN ('restaurant','grocery','retail','pets','convenience')),
  FOREIGN KEY (user_id)  REFERENCES users(id)       ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (store_id) REFERENCES restaurants(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE cart_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_id          INTEGER NOT NULL,
  menu_item_id     INTEGER NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  customizations   TEXT,
  FOREIGN KEY (cart_id)      REFERENCES carts(id)       ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)  ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Applied modifications for a cart line (per-line; not multiplied by cart_items.quantity)
CREATE TABLE cart_item_applied_modifications (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_item_id       INTEGER NOT NULL,
  modification_id    INTEGER NOT NULL,
  modification_desc  TEXT NOT NULL,
  FOREIGN KEY (cart_item_id)    REFERENCES cart_items(id)    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (modification_id) REFERENCES modifications(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE cart_item_applied_options (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,
  cart_item_applied_mod_id      INTEGER NOT NULL,
  option_id                     INTEGER NOT NULL,
  option_name                   TEXT NOT NULL,
  price                         INTEGER NOT NULL,
  quantity                      INTEGER NOT NULL CHECK (quantity >= 1),
  FOREIGN KEY (cart_item_applied_mod_id) REFERENCES cart_item_applied_modifications(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (option_id)                  REFERENCES modification_options(id)          ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ===========================================
-- ORDERS AND ORDER ITEMS
-- ===========================================
CREATE TABLE orders (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER,
  store_id           INTEGER,
  store_category     TEXT CHECK (store_category IN ('restaurant','grocery','retail','pets','convenience')),
  payment_method_id  INTEGER,
  address_id         INTEGER,
  delivery_type      TEXT NOT NULL,
  delivery_time_str  TEXT NOT NULL,
  extra_fee          INTEGER NOT NULL DEFAULT 0 CHECK (extra_fee >= 0),
  scheduled_date     TEXT,
  scheduled_time_slot TEXT,
  phone_country_code TEXT NOT NULL,
  phone_number       TEXT NOT NULL,
  tip_amount         INTEGER NOT NULL DEFAULT 0 CHECK (tip_amount >= 0),
  subtotal           INTEGER NOT NULL CHECK (subtotal >= 0),
  service_fee        INTEGER NOT NULL CHECK (service_fee >= 0),
  delivery_fee       INTEGER NOT NULL CHECK (delivery_fee >= 0),
  total              INTEGER NOT NULL CHECK (total >= 0),
  order_date         TEXT NOT NULL,
  status             TEXT NOT NULL,
  FOREIGN KEY (user_id)           REFERENCES users(id)           ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (store_id)          REFERENCES restaurants(id)     ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (address_id)        REFERENCES addresses(id)       ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  FOREIGN KEY (order_id)     REFERENCES orders(id)      ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)  ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Applied modifications for an order line (per-line; not multiplied by order_items.quantity)
CREATE TABLE order_item_applied_modifications (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_id      INTEGER NOT NULL,
  modification_id    INTEGER NOT NULL,
  modification_desc  TEXT NOT NULL,
  FOREIGN KEY (order_item_id)  REFERENCES order_items(id)   ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (modification_id) REFERENCES modifications(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE order_item_applied_options (
  id                             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_item_applied_mod_id      INTEGER NOT NULL,
  option_id                      INTEGER NOT NULL,
  option_name                    TEXT NOT NULL,
  price                          INTEGER NOT NULL,
  quantity                       INTEGER NOT NULL CHECK (quantity >= 1),
  FOREIGN KEY (order_item_applied_mod_id) REFERENCES order_item_applied_modifications(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (option_id)                  REFERENCES modification_options(id)            ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ===========================================
-- USER REVIEWS
-- ===========================================
CREATE TABLE user_reviews (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id         INTEGER NOT NULL,  -- references the reviewed store (e.g., restaurant)
  store_category   TEXT NOT NULL CHECK (store_category IN ('restaurant','grocery','retail','pets','convenience')),
  user_id          INTEGER NOT NULL,  -- author of the review
  rating           REAL NOT NULL CHECK (rating >= 0 AND rating <= 5),
  content          TEXT NOT NULL,
  timestamp        TEXT NOT NULL,     -- ISO 8601 datetime string
  order_id         INTEGER,
  approval_status  TEXT NOT NULL CHECK (approval_status IN ('approved','rejected','pending')),
  FOREIGN KEY (store_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)       ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id)      ON DELETE SET NULL ON UPDATE CASCADE
);

-- Photos associated with a review
CREATE TABLE review_photos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id  INTEGER NOT NULL,
  url        TEXT NOT NULL,
  sort_order INTEGER,
  FOREIGN KEY (review_id) REFERENCES user_reviews(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Users who rated a review as helpful
CREATE TABLE review_helpful (
  review_id  INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  PRIMARY KEY (review_id, user_id),
  FOREIGN KEY (review_id) REFERENCES user_reviews(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Junction table for liked order items within a review
CREATE TABLE review_liked_items (
  review_id     INTEGER NOT NULL,
  order_item_id INTEGER NOT NULL,
  PRIMARY KEY (review_id, order_item_id),
  FOREIGN KEY (review_id)     REFERENCES user_reviews(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)  ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================================
-- DEALS
-- ===========================================
CREATE TABLE deals (
  id                TEXT PRIMARY KEY,
  restaurant_id     INTEGER,  -- NULL for all restaurants, otherwise foreign key to restaurants(id)
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  button_text       TEXT,
  button_link       TEXT,
  minimum_purchase  INTEGER CHECK (minimum_purchase IS NULL OR minimum_purchase >= 0),
  discount_type     TEXT CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed')),
  discount_value    INTEGER CHECK (discount_value IS NULL OR discount_value >= 0),
  maximum_discount  INTEGER CHECK (maximum_discount IS NULL OR maximum_discount >= 0),
  promocode         TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Free items associated with a deal
CREATE TABLE deal_free_items (
  deal_id    TEXT NOT NULL,
  item_id    INTEGER NOT NULL,
  item_name  TEXT NOT NULL,
  sort_order INTEGER,
  PRIMARY KEY (deal_id, item_id),
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- ===========================================
-- PROMOTIONALS
-- ===========================================
CREATE TABLE IF NOT EXISTS promotionals (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    button_text TEXT NOT NULL,
    button_color TEXT NOT NULL,
    gradient TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    display_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for active promotionals ordered by display_order
CREATE INDEX IF NOT EXISTS idx_promotionals_active_order 
ON promotionals(is_active, display_order);

-- Create index for restaurant_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_promotionals_restaurant_id 
ON promotionals(restaurant_id);

