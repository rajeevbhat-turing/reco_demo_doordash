# DashDoor Database Schema Documentation

## Table of Contents
1. [Restaurants, Menus, and Categories](#restaurants-menus-and-categories)
2. [Modification Catalog](#modification-catalog)
3. [Countries and Users](#countries-and-users)
4. [Category Configurations](#category-configurations)
5. [Carts and Cart Items](#carts-and-cart-items)
6. [Orders and Order Items](#orders-and-order-items)
7. [User Reviews](#user-reviews)
8. [Deals](#deals)
9. [Promotionals](#promotionals)

---

# Restaurants, Menus, and Categories

## **restaurants**

### Overview
Stores information about all restaurants available on the platform, including their location, operating hours, pricing, delivery settings, and promotional features.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each restaurant |
| `name` | TEXT | NOT NULL | Restaurant's display name |
| `logo` | TEXT | NOT NULL | URL or path to the restaurant's logo image |
| `banner` | TEXT | NOT NULL | URL or path to the restaurant's banner image shown in listings |
| `details_banner` | TEXT | NULLABLE | Optional banner image shown on the restaurant's detail page |
| `is_free_delivery` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if restaurant offers free delivery (1 = yes, 0 = no) |
| `min_delivery_fee` | INTEGER | NOT NULL, >= 0 | Minimum delivery fee in cents for this restaurant |
| `price_range` | INTEGER | NOT NULL, BETWEEN 1-4 | Price range indicator (1 = $, 2 = $$, 3 = $$$, 4 = $$$$) |
| `cuisine` | TEXT | NOT NULL | Primary cuisine type (e.g., "Italian", "Mexican", "American") |
| `dash_pass` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if restaurant participates in DashPass program |
| `opening_hour` | INTEGER | NOT NULL, >= 0 | Opening hour in 24-hour format (e.g., 9 for 9 AM) |
| `closing_hour` | INTEGER | NOT NULL, >= 0 | Closing hour in 24-hour format (e.g., 22 for 10 PM) |
| `street` | TEXT | NOT NULL | Street address of the restaurant |
| `city` | TEXT | NOT NULL | City where restaurant is located |
| `state` | TEXT | NOT NULL | State where restaurant is located |
| `zip_code` | TEXT | NOT NULL | ZIP/postal code of restaurant location |
| `latitude` | REAL | BETWEEN -90 AND 90 | Geographic latitude coordinate for mapping and distance calculations |
| `longitude` | REAL | BETWEEN -180 AND 180 | Geographic longitude coordinate for mapping and distance calculations |
| `phone` | TEXT | NOT NULL | Restaurant's contact phone number |
| `discount_percentage` | INTEGER | NULLABLE, 0-100 | Percentage discount offered by restaurant (if applicable) |
| `discount_cap` | INTEGER | NULLABLE, >= 0 | Maximum discount amount in cents (caps the percentage discount) |
| `featured` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if restaurant is featured on homepage |
| `new_flag` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if restaurant is newly added to platform |
| `section` | TEXT | NULLABLE | Section category for organizing restaurants (e.g., "Trending", "Top Rated") |

### Relationships
- **One-to-Many** with `menu_categories` (one restaurant has many menu categories)
- **One-to-Many** with `menu_items` (one restaurant has many menu items)
- **Many-to-Many** with `categories` through `restaurant_categories` (a restaurant can belong to multiple cuisine categories)
- **One-to-Many** with `carts` (users can have carts for different restaurants)
- **One-to-Many** with `orders` (one restaurant can have many orders)
- **One-to-Many** with `user_reviews` (one restaurant can have many reviews)
- **One-to-Many** with `deals` (one restaurant can have multiple promotional deals)
- **One-to-Many** with `promotionals` (one restaurant can have multiple promotional banners)

### Notes
- All monetary values are stored in cents to avoid floating-point precision issues
- Boolean fields use SQLite's INTEGER type (0 = false, 1 = true)
- The `discount_percentage` and `discount_cap` work together to provide capped percentage discounts

---

## **categories**

### Overview
Defines available cuisine or restaurant-type categories (e.g., "coffee", "breakfast", "burgers") used for filtering and organizing restaurants.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `name` | TEXT | PRIMARY KEY | Unique category name (e.g., "Italian", "Chinese", "Fast Food") |

### Relationships
- **Many-to-Many** with `restaurants` through `restaurant_categories` (categories can be assigned to multiple restaurants)

### Notes
- Acts as a lookup table for valid category values
- Used for restaurant filtering and search functionality

---

## **restaurant_categories**

### Overview
Junction table establishing a many-to-many relationship between restaurants and their cuisine/type categories.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `restaurant_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `restaurants(id)` | The restaurant being categorized |
| `category_name` | TEXT | PRIMARY KEY (composite), NOT NULL, FK → `categories(name)` | The category assigned to the restaurant |

### Foreign Key Behaviors
- `restaurant_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `category_name` → `categories(name)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many category assignments belong to one restaurant)
- **Many-to-One** with `categories` (many restaurants can share one category)

### Notes
- Composite primary key prevents duplicate category assignments
- DELETE RESTRICT on `category_name` prevents deletion of categories still in use

---

## **menu_categories**

### Overview
Defines menu sections within a restaurant's menu (e.g., "Featured Items", "Beverages", "Appetizers") for organizing menu items.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each menu category |
| `restaurant_id` | INTEGER | NOT NULL, FK → `restaurants(id)` | The restaurant this menu category belongs to |
| `name` | TEXT | NOT NULL | Display name of the menu category (e.g., "Entrees", "Desserts") |
| `description` | TEXT | NULLABLE | Optional description of the menu category |
| `display_order` | INTEGER | NOT NULL | Sort order for displaying categories in the menu |
| `is_active` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if this category is currently active/visible |

### Foreign Key Behaviors
- `restaurant_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many menu categories belong to one restaurant)
- **One-to-Many** with `menu_items` (one menu category contains many menu items)

### Notes
- Different from `categories` table - this is for organizing items within a restaurant's menu
- Use `display_order` to control the presentation order in the UI

---

## **menu_items**

### Overview
Stores individual menu items available at each restaurant, including pricing, descriptions, images, ratings, and availability status.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each menu item |
| `restaurant_id` | INTEGER | NOT NULL, FK → `restaurants(id)` | The restaurant offering this menu item |
| `category_id` | INTEGER | NOT NULL, FK → `menu_categories(id)` | The menu category this item belongs to |
| `name` | TEXT | NOT NULL | Display name of the menu item |
| `description` | TEXT | NULLABLE | Detailed description of the menu item |
| `price` | INTEGER | NOT NULL, >= 0 | Base price of the item in cents |
| `image` | TEXT | NULLABLE | URL or path to the menu item's image |
| `calories` | INTEGER | NULLABLE, >= 0 | Calorie count for nutritional information |
| `rating` | REAL | BETWEEN 0 AND 5 | Average customer rating (0-5 stars) |
| `rating_count` | INTEGER | NULLABLE | Total number of ratings received |
| `popular` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if item is marked as popular |
| `featured` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if item is featured |
| `display_order` | INTEGER | NULLABLE | Sort order within its menu category |
| `is_available` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if item is currently available for ordering |
| `discount_percentage` | INTEGER | NULLABLE, 0-100 | Item-specific percentage discount (if applicable) |
| `discount_cap` | INTEGER | NULLABLE, >= 0 | Maximum discount amount in cents for this item |

### Foreign Key Behaviors
- `restaurant_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `category_id` → `menu_categories(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many menu items belong to one restaurant)
- **Many-to-One** with `menu_categories` (many items belong to one category)
- **One-to-Many** with `modifications` (one menu item can have many customization options)
- **One-to-Many** with `cart_items` (one menu item can appear in many carts)
- **One-to-Many** with `order_items` (one menu item can appear in many orders)
- **Many-to-Many** with `deals` through `deal_free_items` (items can be part of promotional deals)

### Notes
- Prices stored in cents for precision
- Item-level discounts override restaurant-level discounts
- `is_available` allows temporarily disabling items without deletion

---

# Modification Catalog

## **modifications**

### Overview
Defines customization groups for menu items (e.g., "Choose your size", "Add toppings", "Select protein") with selection rules and requirements.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each modification group |
| `menu_item_id` | INTEGER | NOT NULL, FK → `menu_items(id)` | The menu item this modification applies to |
| `description` | TEXT | NOT NULL | Display text for the modification group (e.g., "Choose your size") |
| `is_required` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if customer must select from this group |
| `select_up_to` | INTEGER | NOT NULL, >= 0 | Maximum number of options that can be selected from this group |
| `select_at_least` | INTEGER | NULLABLE, >= 0, <= select_up_to | Minimum number of options that must be selected (if specified) |
| `parent_option_id` | INTEGER | NULLABLE, FK → `modification_options(id)` | Optional parent option that triggers this nested modification |

### Foreign Key Behaviors
- `menu_item_id` → `menu_items(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `parent_option_id` → `modification_options(id)`: ON DELETE SET NULL, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `menu_items` (many modification groups belong to one menu item)
- **Many-to-One** with `modification_options` (for nested/conditional modifications)
- **One-to-Many** with `modification_options` (one modification group contains many options)
- **One-to-Many** with `cart_item_applied_modifications` (tracks selections in carts)
- **One-to-Many** with `order_item_applied_modifications` (tracks selections in orders)

### Notes
- `parent_option_id` enables conditional/nested modifications (e.g., sauce options only appear if "Add sauce" is selected)
- `select_up_to = 1` creates a radio button group (single choice)
- `select_up_to > 1` creates a checkbox group (multiple choice)
- When `is_required = 1`, ensure `select_at_least >= 1`

---

## **modification_options**

### Overview
Defines individual choices within a modification group (e.g., "Large", "Extra cheese", "Grilled chicken") with pricing and quantity limits.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each modification option |
| `modification_id` | INTEGER | NOT NULL, FK → `modifications(id)` | The modification group this option belongs to |
| `name` | TEXT | NOT NULL | Display name of the option (e.g., "Large", "Extra Cheese") |
| `description` | TEXT | NULLABLE | Optional additional details about the option |
| `price` | INTEGER | NOT NULL | Additional cost for this option in cents (can be 0) |
| `is_counter` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if this option allows quantity selection |
| `max_quantity` | INTEGER | NULLABLE | Maximum quantity allowed if `is_counter = 1` |
| `is_default` | INTEGER | NOT NULL, CHECK (0 or 1) | Boolean flag indicating if this option is pre-selected by default |
| `sort_order` | INTEGER | NOT NULL | Display order within the modification group |
| `image` | TEXT | NULLABLE | Optional image URL for visual option display |

### Foreign Key Behaviors
- `modification_id` → `modifications(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `modifications` (many options belong to one modification group)
- **One-to-Many** with `modifications` as parent (one option can trigger nested modifications via `parent_option_id`)
- **One-to-Many** with `cart_item_applied_options` (tracks option selections in carts)
- **One-to-Many** with `order_item_applied_options` (tracks option selections in orders)

### Notes
- `is_counter = 1` allows multiple quantities (e.g., "Add extra cheese: 1, 2, 3...")
- `is_counter = 0` treats option as binary selected/not selected
- `price = 0` for options with no additional charge (e.g., "No onions")
- Use `sort_order` to control display sequence in the UI

---

# Countries and Users

## **countries**

### Overview
Stores country information including country codes and international dialing codes for phone number formatting and validation.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each country |
| `code` | TEXT | NOT NULL | Two-letter ISO country code (e.g., "US", "PK", "GB") |
| `name` | TEXT | NOT NULL | Full country name (e.g., "United States", "Pakistan") |
| `dial_code` | TEXT | NOT NULL | International dialing code with + prefix (e.g., "+1", "+92") |

### Relationships
- **One-to-Many** with `users` (one country can have many users)

### Notes
- Used for phone number validation and formatting
- Essential for international user support
- Should be pre-populated with comprehensive country data

---

## **users**

### Overview
Stores user account information including authentication credentials, contact details, profile data, and account restrictions.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each user |
| `name` | TEXT | NOT NULL | User's full name or display name |
| `email` | TEXT | NOT NULL | User's email address (used for login and communication) |
| `phone_number` | TEXT | NOT NULL | User's phone number (without country code) |
| `password` | TEXT | NOT NULL | Hashed password for authentication |
| `country_id` | INTEGER | NOT NULL, FK → `countries(id)` | User's associated country for phone number formatting |
| `avatar` | TEXT | NULLABLE | URL or path to user's profile picture |
| `is_restricted` | INTEGER | CHECK (0 or 1) | Boolean flag indicating if user account has restrictions/bans |

### Foreign Key Behaviors
- `country_id` → `countries(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `countries` (many users belong to one country)
- **One-to-Many** with `payment_methods` (one user can have multiple payment methods)
- **One-to-Many** with `addresses` (one user can have multiple saved addresses)
- **One-to-Many** with `carts` (one user can have multiple carts)
- **One-to-Many** with `orders` (one user can have many orders)
- **One-to-Many** with `user_reviews` (one user can write many reviews)
- **Many-to-Many** with `user_reviews` through `review_helpful` (users can mark reviews as helpful)

### Notes
- Passwords should be hashed using secure algorithms (bcrypt, argon2)
- `is_restricted` can be used to implement bans or account restrictions
- DELETE RESTRICT on `country_id` prevents deletion of countries with active users

---

## **payment_methods**

### Overview
Stores saved payment methods (credit/debit cards) for users, enabling quick checkout and payment management.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each payment method |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` | The user who owns this payment method |
| `type` | TEXT | NOT NULL | Type of payment method (e.g., "Visa", "Mastercard", "Amex") |
| `card_number` | TEXT | NOT NULL | Encrypted full card number (should be encrypted in production) |
| `last_four` | TEXT | NOT NULL | Last four digits of card number for display purposes |
| `cvc` | TEXT | NOT NULL | Card security code (should be encrypted in production) |
| `expiry` | TEXT | NOT NULL | Card expiration date (format: MM/YY or MM/YYYY) |
| `zip_code` | TEXT | NOT NULL | Billing ZIP/postal code for card verification |
| `is_default` | INTEGER | NOT NULL, DEFAULT 0, CHECK (0 or 1) | Boolean flag indicating if this is the user's default payment method |

### Foreign Key Behaviors
- `user_id` → `users(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `users` (many payment methods belong to one user)
- **One-to-Many** with `orders` (one payment method can be used for multiple orders)

### Notes
- **SECURITY CRITICAL**: `card_number` and `cvc` should be encrypted at rest
- Only one payment method per user should have `is_default = 1`
- Consider PCI-DSS compliance requirements in production
- `last_four` is stored separately for safe display in UI

---

## **addresses**

### Overview
Stores saved delivery and billing addresses for users with detailed location information and delivery preferences.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each address |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` | The user who owns this address |
| `street` | TEXT | NOT NULL | Street address including house/building number |
| `city` | TEXT | NOT NULL | City name |
| `state` | TEXT | NOT NULL | State or province |
| `zip_code` | TEXT | NOT NULL | ZIP or postal code |
| `latitude` | REAL | BETWEEN -90 AND 90 | Geographic latitude for precise location mapping |
| `longitude` | REAL | BETWEEN -180 AND 180 | Geographic longitude for precise location mapping |
| `address_type` | TEXT | NOT NULL, CHECK (in 'house', 'apartment', 'hotel', 'office', 'other') | Category of address for appropriate delivery handling |
| `is_default` | INTEGER | NOT NULL, DEFAULT 0, CHECK (0 or 1) | Boolean flag indicating if this is the user's default delivery address |
| `gate_code` | TEXT | NULLABLE | Access code for gated communities |
| `apartment_suite` | TEXT | NULLABLE | Apartment, unit, or suite number (for 'apartment' type) |
| `entry_code` | TEXT | NULLABLE | Building entry code (for 'apartment' type) |
| `room_suite` | TEXT | NULLABLE | Room or suite number (for 'hotel' type) |
| `hotel_name` | TEXT | NULLABLE | Name of the hotel (for 'hotel' type) |
| `suite_floor` | TEXT | NULLABLE | Suite and floor information (for 'office' type) |
| `business_name` | TEXT | NULLABLE | Business name (for 'office' type) |
| `building_name` | TEXT | NULLABLE | Building name (for 'office' or other types) |
| `delivery_preference` | TEXT | CHECK (in 'door', 'location') | Whether to deliver to door or meet at specific location |
| `meet_location` | TEXT | NULLABLE | Specific meeting location if delivery_preference is 'location' |
| `delivery_instructions` | TEXT | NULLABLE | Additional instructions for delivery driver |
| `personal_label` | TEXT | NULLABLE | User's custom label for this address (e.g., "Home", "Mom's house") |

### Foreign Key Behaviors
- `user_id` → `users(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `users` (many addresses belong to one user)
- **One-to-Many** with `orders` (one address can be used for multiple orders)

### Notes
- Fields conditionally required based on `address_type` (e.g., `hotel_name` for hotels)
- Only one address per user should have `is_default = 1`
- Coordinates enable accurate delivery distance and time calculations
- Rich address details improve delivery success rates

---

# Category Configurations

## **category_configs**

### Overview
Defines fee structures and thresholds for different store categories (restaurant, grocery, retail, etc.) to calculate service and delivery fees.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each configuration |
| `store_category` | TEXT | NOT NULL, CHECK (in 'restaurant', 'grocery', 'retail', 'pets', 'convenience') | The store category this configuration applies to |
| `free_delivery_threshold` | INTEGER | NOT NULL, >= 0 | Minimum order subtotal in cents to qualify for free delivery |
| `default_delivery_fee` | INTEGER | NOT NULL, >= 0 | Standard delivery fee in cents when threshold not met |
| `service_fee_percentage` | REAL | NOT NULL, >= 0 | Service fee as a percentage of subtotal (e.g., 0.15 for 15%) |
| `min_service_fee` | INTEGER | NOT NULL, >= 0 | Minimum service fee in cents (ensures minimum fee even on small orders) |

### Relationships
- Referenced by `carts` and `orders` via `store_category` field for fee calculations

### Notes
- Used to calculate dynamic fees based on order value and store type
- Different categories may have different fee structures (e.g., grocery vs restaurant)
- Service fee is calculated as `MAX(subtotal * service_fee_percentage, min_service_fee)`
- Delivery fee is waived if `subtotal >= free_delivery_threshold`

---

# Carts and Cart Items

## **carts**

### Overview
Represents active shopping carts for users, linking them to a specific restaurant or store and defining the store category.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each cart |
| `user_id` | INTEGER | NULLABLE, FK → `users(id)` | The user who owns this cart (NULL for guest carts) |
| `store_id` | INTEGER | NULLABLE, FK → `restaurants(id)` | The restaurant/store this cart is for |
| `store_category` | TEXT | NOT NULL, CHECK (in 'restaurant', 'grocery', 'retail', 'pets', 'convenience') | Category of the store for fee calculation purposes |

### Foreign Key Behaviors
- `user_id` → `users(id)`: ON DELETE SET NULL, ON UPDATE CASCADE
- `store_id` → `restaurants(id)`: ON DELETE SET NULL, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `users` (many carts can belong to one user)
- **Many-to-One** with `restaurants` (many carts can reference one restaurant)
- **One-to-Many** with `cart_items` (one cart contains many cart items)

### Notes
- A cart is typically associated with a single restaurant/store
- `user_id` can be NULL to support guest checkout
- Cart persistence allows users to resume shopping across sessions
- Should implement cleanup logic for abandoned carts

---

## **cart_items**

### Overview
Represents individual menu items added to a cart, including quantity and customization selections.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each cart item |
| `cart_id` | INTEGER | NOT NULL, FK → `carts(id)` | The cart this item belongs to |
| `menu_item_id` | INTEGER | NOT NULL, FK → `menu_items(id)` | The menu item being ordered |
| `quantity` | INTEGER | NOT NULL, > 0 | Number of units of this item in the cart |
| `customizations` | TEXT | NULLABLE | JSON or text field for additional customization notes |

### Foreign Key Behaviors
- `cart_id` → `carts(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `menu_item_id` → `menu_items(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `carts` (many cart items belong to one cart)
- **Many-to-One** with `menu_items` (many cart items can reference one menu item)
- **One-to-Many** with `cart_item_applied_modifications` (one cart item can have many modification groups applied)

### Notes
- Each distinct configuration of the same menu item creates a separate cart item
- `customizations` field can store freeform text (e.g., "extra crispy", "no pickles")
- DELETE RESTRICT on `menu_item_id` prevents deletion of items still in carts

---

## **cart_item_applied_modifications**

### Overview
Records which modification groups were applied to a cart item (e.g., "Choose size", "Select toppings"). Acts as a container for the selected options.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each applied modification |
| `cart_item_id` | INTEGER | NOT NULL, FK → `cart_items(id)` | The cart item this modification applies to |
| `modification_id` | INTEGER | NOT NULL, FK → `modifications(id)` | The modification group that was applied |
| `modification_desc` | TEXT | NOT NULL | Description of the modification group (denormalized for historical record) |

### Foreign Key Behaviors
- `cart_item_id` → `cart_items(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `modification_id` → `modifications(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `cart_items` (many modifications belong to one cart item)
- **Many-to-One** with `modifications` (many applied modifications reference one modification definition)
- **One-to-Many** with `cart_item_applied_options` (one applied modification contains many selected options)

### Notes
- Stores modification description for display even if modification definition changes
- One row per modification group applied to the cart item
- The actual selected options are stored in `cart_item_applied_options`

---

## **cart_item_applied_options**

### Overview
Records the specific options selected within each applied modification group (e.g., "Large", "Extra cheese" x2) with pricing and quantities.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each applied option |
| `cart_item_applied_mod_id` | INTEGER | NOT NULL, FK → `cart_item_applied_modifications(id)` | The applied modification group this option belongs to |
| `option_id` | INTEGER | NOT NULL, FK → `modification_options(id)` | The specific option that was selected |
| `option_name` | TEXT | NOT NULL | Name of the option (denormalized for historical record) |
| `price` | INTEGER | NOT NULL | Price of this option in cents (denormalized for price stability) |
| `quantity` | INTEGER | NOT NULL, >= 1 | Quantity of this option selected (for counter-type options) |

### Foreign Key Behaviors
- `cart_item_applied_mod_id` → `cart_item_applied_modifications(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `option_id` → `modification_options(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `cart_item_applied_modifications` (many options belong to one applied modification)
- **Many-to-One** with `modification_options` (many applied options reference one option definition)

### Notes
- Price and name are denormalized to preserve cart state even if menu changes
- Quantity applies per-option, separate from cart_items.quantity
- Total cost for this option is `price * quantity * cart_items.quantity`

---

# Orders and Order Items

## **orders**

### Overview
Represents completed or in-progress customer orders with full order details, delivery information, pricing breakdown, and order status tracking.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each order |
| `user_id` | INTEGER | NULLABLE, FK → `users(id)` | The user who placed the order (NULL for guest orders) |
| `store_id` | INTEGER | NULLABLE, FK → `restaurants(id)` | The restaurant/store this order is from |
| `store_category` | TEXT | CHECK (in 'restaurant', 'grocery', 'retail', 'pets', 'convenience') | Category of the store for reference |
| `payment_method_id` | INTEGER | NULLABLE, FK → `payment_methods(id)` | Payment method used for this order |
| `address_id` | INTEGER | NULLABLE, FK → `addresses(id)` | Delivery address for this order |
| `delivery_type` | TEXT | NOT NULL | Type of delivery (e.g., "standard", "express", "pickup", "scheduled") |
| `delivery_time_str` | TEXT | NOT NULL | Human-readable delivery time estimate (e.g., "25-35 min", "ASAP") |
| `extra_fee` | INTEGER | NOT NULL, DEFAULT 0, >= 0 | Additional fees in cents (e.g., priority delivery fee) |
| `scheduled_date` | TEXT | NULLABLE | Scheduled delivery date (ISO 8601 format) if applicable |
| `scheduled_time_slot` | TEXT | NULLABLE | Scheduled time slot (e.g., "2:00 PM - 3:00 PM") if applicable |
| `phone_country_code` | TEXT | NOT NULL | Country code for contact phone (e.g., "+1") |
| `phone_number` | TEXT | NOT NULL | Contact phone number for this order |
| `tip_amount` | INTEGER | NOT NULL, DEFAULT 0, >= 0 | Tip amount in cents for delivery driver |
| `subtotal` | INTEGER | NOT NULL, >= 0 | Sum of all item prices before fees in cents |
| `service_fee` | INTEGER | NOT NULL, >= 0 | Service fee charged in cents |
| `delivery_fee` | INTEGER | NOT NULL, >= 0 | Delivery fee charged in cents |
| `total` | INTEGER | NOT NULL, >= 0 | Final total amount in cents (subtotal + service_fee + delivery_fee + extra_fee + tip_amount) |
| `order_date` | TEXT | NOT NULL | Timestamp when order was placed (ISO 8601 format) |
| `status` | TEXT | NOT NULL | Current order status (e.g., "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled") |

### Foreign Key Behaviors
- `user_id` → `users(id)`: ON DELETE SET NULL, ON UPDATE CASCADE
- `store_id` → `restaurants(id)`: ON DELETE SET NULL, ON UPDATE CASCADE
- `payment_method_id` → `payment_methods(id)`: ON DELETE SET NULL, ON UPDATE CASCADE
- `address_id` → `addresses(id)`: ON DELETE SET NULL, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `users` (many orders belong to one user)
- **Many-to-One** with `restaurants` (many orders are placed with one restaurant)
- **Many-to-One** with `payment_methods` (many orders use one payment method)
- **Many-to-One** with `addresses` (many orders deliver to one address)
- **One-to-Many** with `order_items` (one order contains many order items)
- **One-to-Many** with `user_reviews` (one order can have one review)

### Notes
- All fees and totals stored in cents for precision
- Foreign keys allow NULL to preserve order history even if related records are deleted
- `status` should follow a defined state machine for order workflow
- Phone number duplicated for order record permanence

---

## **order_items**

### Overview
Represents individual menu items within a completed order, recording what was ordered and in what quantity.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each order item |
| `order_id` | INTEGER | NOT NULL, FK → `orders(id)` | The order this item belongs to |
| `menu_item_id` | INTEGER | NOT NULL, FK → `menu_items(id)` | The menu item that was ordered |
| `quantity` | INTEGER | NOT NULL, > 0 | Number of units of this item ordered |

### Foreign Key Behaviors
- `order_id` → `orders(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `menu_item_id` → `menu_items(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `orders` (many order items belong to one order)
- **Many-to-One** with `menu_items` (many order items reference one menu item)
- **One-to-Many** with `order_item_applied_modifications` (one order item has many modification groups)
- **Many-to-Many** with `user_reviews` through `review_liked_items` (users can mark items as liked in reviews)

### Notes
- Similar structure to `cart_items` but represents finalized orders
- DELETE RESTRICT on `menu_item_id` prevents deletion of items that have been ordered
- Complete customization details stored in related modification tables

---

## **order_item_applied_modifications**

### Overview
Records which modification groups were applied to an order item (e.g., "Choose size", "Select toppings") in the completed order.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each applied modification |
| `order_item_id` | INTEGER | NOT NULL, FK → `order_items(id)` | The order item this modification applies to |
| `modification_id` | INTEGER | NOT NULL, FK → `modifications(id)` | The modification group that was applied |
| `modification_desc` | TEXT | NOT NULL | Description of the modification group (preserved for order history) |

### Foreign Key Behaviors
- `order_item_id` → `order_items(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `modification_id` → `modifications(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `order_items` (many modifications belong to one order item)
- **Many-to-One** with `modifications` (many applied modifications reference one modification definition)
- **One-to-Many** with `order_item_applied_options` (one applied modification contains many selected options)

### Notes
- Mirrors `cart_item_applied_modifications` structure for completed orders
- Preserves modification description for accurate order history
- Essential for order receipt and reorder functionality

---

## **order_item_applied_options**

### Overview
Records the specific options selected within each applied modification group in the completed order, with prices and quantities frozen at order time.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each applied option |
| `order_item_applied_mod_id` | INTEGER | NOT NULL, FK → `order_item_applied_modifications(id)` | The applied modification group this option belongs to |
| `option_id` | INTEGER | NOT NULL, FK → `modification_options(id)` | The specific option that was selected |
| `option_name` | TEXT | NOT NULL | Name of the option (preserved for order history) |
| `price` | INTEGER | NOT NULL | Price of this option in cents at time of order |
| `quantity` | INTEGER | NOT NULL, >= 1 | Quantity of this option selected |

### Foreign Key Behaviors
- `order_item_applied_mod_id` → `order_item_applied_modifications(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `option_id` → `modification_options(id)`: ON DELETE RESTRICT, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `order_item_applied_modifications` (many options belong to one applied modification)
- **Many-to-One** with `modification_options` (many applied options reference one option definition)

### Notes
- Mirrors `cart_item_applied_options` structure for completed orders
- Price and name denormalized to preserve exact order details
- Critical for accurate order receipts and reordering

---

# User Reviews

## **user_reviews**

### Overview
Stores customer reviews for restaurants/stores, including ratings, written feedback, timestamps, and approval status for moderation.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each review |
| `store_id` | INTEGER | NOT NULL, FK → `restaurants(id)` | The restaurant/store being reviewed |
| `store_category` | TEXT | NOT NULL, CHECK (in 'restaurant', 'grocery', 'retail', 'pets', 'convenience') | Category of the store being reviewed |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` | The user who wrote this review |
| `rating` | REAL | NOT NULL, BETWEEN 0 AND 5 | Star rating given (0-5, can include half stars) |
| `content` | TEXT | NOT NULL | Written review content/feedback |
| `timestamp` | TEXT | NOT NULL | When the review was submitted (ISO 8601 datetime) |
| `order_id` | INTEGER | NULLABLE, FK → `orders(id)` | The order this review is associated with (if applicable) |
| `approval_status` | TEXT | NOT NULL, CHECK (in 'approved', 'rejected', 'pending') | Moderation status of the review |

### Foreign Key Behaviors
- `store_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `user_id` → `users(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `order_id` → `orders(id)`: ON DELETE SET NULL, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many reviews belong to one restaurant)
- **Many-to-One** with `users` (many reviews written by one user)
- **Many-to-One** with `orders` (one order can have one associated review)
- **One-to-Many** with `review_photos` (one review can have multiple photos)
- **Many-to-Many** with `users` through `review_helpful` (users can mark reviews helpful)
- **Many-to-Many** with `order_items` through `review_liked_items` (reviews can highlight specific items)

### Notes
- Only `approved` reviews should be displayed publicly
- Linking to `order_id` ensures reviews are from actual customers
- `approval_status` enables content moderation workflow
- Rating contributes to restaurant's aggregate rating

---

## **review_photos**

### Overview
Stores photos uploaded by users as part of their reviews to showcase food, ambiance, or delivery quality.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each review photo |
| `review_id` | INTEGER | NOT NULL, FK → `user_reviews(id)` | The review this photo belongs to |
| `url` | TEXT | NOT NULL | URL or path to the uploaded photo |
| `sort_order` | INTEGER | NULLABLE | Display order for multiple photos in a review |

### Foreign Key Behaviors
- `review_id` → `user_reviews(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `user_reviews` (many photos belong to one review)

### Notes
- Supports multiple photos per review
- Use `sort_order` to control display sequence
- Photos deleted automatically when review is deleted

---

## **review_helpful**

### Overview
Junction table tracking which users found a review helpful, enabling "X people found this helpful" functionality.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `review_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `user_reviews(id)` | The review being marked as helpful |
| `user_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `users(id)` | The user who marked this review helpful |

### Foreign Key Behaviors
- `review_id` → `user_reviews(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `user_id` → `users(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `user_reviews` (many helpful marks for one review)
- **Many-to-One** with `users` (one user can mark many reviews helpful)

### Notes
- Composite primary key ensures each user can only mark a review helpful once
- Count of rows per `review_id` gives total helpful votes
- Used for sorting reviews by helpfulness

---

## **review_liked_items**

### Overview
Junction table linking reviews to specific order items the reviewer particularly liked, enabling "liked items" highlighting in reviews.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `review_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `user_reviews(id)` | The review containing the liked items |
| `order_item_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `order_items(id)` | The specific order item the reviewer liked |

### Foreign Key Behaviors
- `review_id` → `user_reviews(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `order_item_id` → `order_items(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `user_reviews` (one review can have many liked items)
- **Many-to-One** with `order_items` (one order item can be liked in multiple reviews)

### Notes
- Composite primary key prevents duplicate likes within a review
- Helps other customers identify popular menu items
- Only applies to items from the order associated with the review

---

# Deals

## **deals**

### Overview
Stores promotional deals and offers that can apply to specific restaurants or platform-wide, including discount rules, minimum purchase requirements, and free items.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier for each deal (likely human-readable like "spring2024") |
| `restaurant_id` | INTEGER | NULLABLE, FK → `restaurants(id)` | The restaurant this deal applies to (NULL for platform-wide deals) |
| `title` | TEXT | NOT NULL | Display title of the deal (e.g., "50% Off First Order") |
| `description` | TEXT | NOT NULL | Detailed description of the deal terms and conditions |
| `button_text` | TEXT | NULLABLE | Call-to-action button text (e.g., "Claim Offer", "Order Now") |
| `button_link` | TEXT | NULLABLE | URL or deep link when button is clicked |
| `minimum_purchase` | INTEGER | NULLABLE, >= 0 | Minimum order subtotal in cents required to use this deal |
| `discount_type` | TEXT | CHECK (in 'percentage', 'fixed') | Type of discount (percentage off or fixed amount off) |
| `discount_value` | INTEGER | NULLABLE, >= 0 | Discount amount (percentage as integer or cents for fixed) |
| `maximum_discount` | INTEGER | NULLABLE, >= 0 | Cap on discount amount in cents (for percentage discounts) |
| `promocode` | TEXT | NULLABLE | Promo code that must be entered to activate deal |

### Foreign Key Behaviors
- `restaurant_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many deals can belong to one restaurant)
- **Many-to-Many** with `menu_items` through `deal_free_items` (deals can include free items)

### Notes
- `restaurant_id = NULL` indicates platform-wide deals
- Text-based `id` allows human-readable identifiers for marketing
- Deals can offer discounts, free items, or both
- `maximum_discount` caps percentage-based discounts

---

## **deal_free_items**

### Overview
Junction table linking deals to specific menu items included as free items when the deal is applied.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `deal_id` | TEXT | PRIMARY KEY (composite), NOT NULL, FK → `deals(id)` | The deal offering free items |
| `item_id` | INTEGER | PRIMARY KEY (composite), NOT NULL, FK → `menu_items(id)` | The menu item included as free with this deal |
| `item_name` | TEXT | NOT NULL | Name of the free item (denormalized for display stability) |
| `sort_order` | INTEGER | NULLABLE | Display order when multiple free items are offered |

### Foreign Key Behaviors
- `deal_id` → `deals(id)`: ON DELETE CASCADE, ON UPDATE CASCADE
- `item_id` → `menu_items(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `deals` (many free items belong to one deal)
- **Many-to-One** with `menu_items` (one menu item can be free in multiple deals)

### Notes
- Composite primary key prevents duplicate free items in one deal
- `item_name` denormalized for consistent deal display
- Use `sort_order` to control display sequence of multiple free items

---

# Promotionals

## **promotionals**

### Overview
Stores promotional banners and marketing content for restaurants, featuring custom styling, gradients, and display ordering for carousel or grid layouts.

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each promotional |
| `restaurant_id` | INTEGER | NOT NULL, FK → `restaurants(id)` | The restaurant this promotional is for |
| `title` | TEXT | NOT NULL | Headline text for the promotional |
| `description` | TEXT | NOT NULL | Detailed promotional description or offer details |
| `button_text` | TEXT | NOT NULL | Call-to-action button text (e.g., "Order Now", "Learn More") |
| `button_color` | TEXT | NOT NULL | Color for the button (hex code or color name) |
| `gradient` | TEXT | NOT NULL | CSS gradient or background styling for the promotional banner |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp when promotional was created |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp when promotional was last modified |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1, CHECK (0 or 1) | Boolean flag indicating if promotional is currently active/visible |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order for displaying multiple promotionals |

### Foreign Key Behaviors
- `restaurant_id` → `restaurants(id)`: ON DELETE CASCADE, ON UPDATE CASCADE

### Relationships
- **Many-to-One** with `restaurants` (many promotionals belong to one restaurant)

### Indexes
- `idx_promotionals_active_order` on (`is_active`, `display_order`) - optimizes queries for active promotionals in display order
- `idx_promotionals_restaurant_id` on (`restaurant_id`) - optimizes lookups by restaurant

### Notes
- Only promotionals with `is_active = 1` should be displayed
- Use `display_order` to control placement in carousel/grid
- Rich styling options (`gradient`, `button_color`) enable branded promotional content
- Timestamps enable tracking of promotional lifecycle

---

## Summary

This database schema supports a comprehensive food delivery platform with:
- **Restaurant Management**: Full restaurant profiles, menus, and customization options
- **User Accounts**: Authentication, profiles, saved addresses, and payment methods
- **Shopping Experience**: Carts with complex item customizations and modifications
- **Order Processing**: Complete order tracking with delivery details and fee calculations
- **Reviews & Ratings**: Customer feedback with photos, helpful votes, and item likes
- **Marketing**: Promotional deals, discounts, and banner campaigns
- **Multi-Category Support**: Extensible to restaurants, grocery, retail, pets, and convenience stores

