# Task Generator Script

A Python script that generates task configurations for DashDoor by reading templates and substituting placeholders with data from the database.

## Quick Start

```bash
# Generate tasks from all templates
python scripts/generate_tasks.py

# Generate from a specific template
python scripts/generate_tasks.py --template-index 0

# Generate 50 tasks with reproducible output
python scripts/generate_tasks.py --max-total 50 --seed 42
```

## Command-Line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--template` | `config/templates.json` | Path to templates file |
| `--template-index` | all | Use specific template index only |
| `--db` | `data/db/dashdoor.db` | Path to database |
| `--output` | `config/generated_tasks.csv` | Output CSV file path |
| `--radius` | `10.0` | Search radius in miles |
| `--max-per-template` | `5` | Max tasks per template type |
| `--max-total` | unlimited | Total tasks limit |
| `--seed` | - | Random seed for reproducibility |
| `--pre-auth-pct` | `0.70` | Percentage of tasks using pre-authentication (0.0-1.0) |

## Pre-Authentication Mode

By default, 70% of generated tasks use **pre-authentication** via `simulator_config`, while 30% require **explicit login** in the task statement.

> **Note:** This split applies only to **generated tasks**. Predefined tasks from `predefined_tasks.json` keep their original configuration.

### Pre-Authenticated Tasks (70%)

- Login instruction is removed from `task_statement`
- `simulator_config.bootstrap_data.user` is set to the user's email

**Example output:**
```json
{
  "task_statement": "Order pizza from Mario's Pizzeria and add extra cheese.",
  "simulator_config": {
    "bootstrap_data": {
      "date": "2025-12-19T12:00:00-08:00",
      "timezone": "America/Los_Angeles",
      "user": "john@example.com"
    }
  }
}
```

### Explicit Login Tasks (30%)

- Login instruction remains in `task_statement`
- `simulator_config.bootstrap_data.user` is **not set**
- The agent must handle authentication as part of the task

**Example output:**
```json
{
  "task_statement": "Log in using email 'john@example.com' and password 'pass123'. Order pizza from Mario's Pizzeria and add extra cheese.",
  "simulator_config": {
    "bootstrap_data": {
      "date": "2025-12-19T12:00:00-08:00",
      "timezone": "America/Los_Angeles"
    }
  }
}
```

### Controlling the Split

```bash
# 80% pre-auth, 20% explicit login
python scripts/generate_tasks.py --pre-auth-pct 0.80

# All tasks require explicit login
python scripts/generate_tasks.py --pre-auth-pct 0.0

# All tasks use pre-authentication
python scripts/generate_tasks.py --pre-auth-pct 1.0
```

---

## Templates

The system supports 36 templates:

---

### 1. `item-addon-order`
**Category:** Order placement > Customizations  
**Capabilities:** Search and filtering, Instruction following

Orders a specific menu item with an add-on/modification from a restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ITEM_ADD_ON}}` | Optional add-on name |

---

### 2. `nearest-cheapest-choice`
**Category:** Menu Viewing > Restaurant discovery & filtering, Price & rating tradeoffs  
**Capabilities:** Search and filtering, Decision making, Instruction following

Orders from the nearest restaurant of a given cuisine, choosing the cheaper of two items (or higher-rated if same price).

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CUISINE}}` | Restaurant cuisine type (e.g., Italian, Mexican) |
| `{{RESTAURANT_ITEM_1}}` | First menu item option |
| `{{RESTAURANT_ITEM_2}}` | Second menu item option |
| `{{ADDRESS_TYPE}}` | Delivery address type (house, apartment, etc.) |

---

### 3. `new-cheapest-restaurant`
**Category:** Order History > Restaurant discovery & filtering, Reorder & past orders  
**Capabilities:** Order history analysis, Search and filtering, Decision making

Finds the best cheapest restaurant of given cuisines that the user has NOT ordered from before.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{DIETARY_PREFERENCE_1}}` | First cuisine preference |
| `{{DIETARY_PREFERENCE_2}}` | Second cuisine preference |

---

### 4. `replace-payment-card`
**Category:** Payment & Checkout > Payment method management  
**Capabilities:** Instruction following, Form filling, UI Elements: Text Fields

Deletes existing payment card and adds a new one with specific details. Requires users with a house address.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CARD_NUMBER}}` | 16-digit card number |
| `{{CARD_CVV}}` | 3-digit CVV |
| `{{EXPIRY_MONTH_NAME}}` | Expiry month name (e.g., "March") |
| `{{EXPIRY_YEAR}}` | Expiry year (e.g., "2027") |
| `{{EXPIRY_MM_YY}}` | Expiry in MM/YY format (e.g., "03/27") |

---

### 5. `rate-last-order`
**Category:** Ratings & Reviews > Review creation  
**Capabilities:** Instruction following, Text generation

Rates a previous order with a star rating and feedback. Uses actual user order history.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_NAME}}` | Name of restaurant from order history |
| `{{RATING_NUM}}` | Star rating (1-5) |
| `{{ITEM_NAME}}` | Item name from the order |
| `{{COMPLAINT_1}}` | First feedback keyword |
| `{{COMPLAINT_2}}` | Second feedback keyword |

**Note:** Feedback is contextually generated based on rating:
- 1-2 stars: negative terms (cold, late, wrong, missing)
- 3 stars: neutral terms (just okay, average)
- 4-5 stars: positive terms (delicious, perfect, fresh)

---

### 6. `clear-invalid-carts`
**Category:** Cart Management > Cart cleanup  
**Capabilities:** Search and filtering, Instruction following

Removes carts from restaurants that are no longer in the user's delivery area. Requires users who have carts from out-of-range restaurants.

**Variables:** Common variables only (USER_EMAIL, USER_PASSWORD)

---

### 7. `replace-cart-item`
**Category:** Cart Management > Cart editing & item swaps, Delivery scheduling  
**Capabilities:** Cart manipulation, Scheduling, Order Placement

Replaces an item in an existing cart and schedules delivery for a specific time. Uses actual user cart data.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_NAME}}` | Restaurant name from user's cart |
| `{{ITEM_TO_REPLACE}}` | Current item in cart to remove |
| `{{ITEM_TO_ADD}}` | New item to add to cart |
| `{{DELIVERY_TIME}}` | Scheduled delivery time (e.g., "6:30 PM") |

---

### 8. `reorder-with-addons`
**Category:** Order History > Reorder & past orders  
**Capabilities:** Order history, Cart manipulation, Promo code application

Reorders from a previous restaurant with a specific item, quantity, apartment delivery details, and promo code. Requires users with order history and an apartment address.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_NAME}}` | Restaurant name from order history |
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{RESTAURANT_ITEM_KEYWORDS}}` | Keywords for item search |
| `{{ITEM_QTY}}` | Item quantity (2-4) |
| `{{STREET}}` | Apartment street address |
| `{{APARTMENT_NUMBER}}` | Apartment unit number |
| `{{ENTRY_CODE}}` | Building entry code |
| `{{PROMO_CODE}}` | Promotional code to apply |

---

### 9. `express-nearest-order`
**Category:** Order Placement > Delivery options  
**Capabilities:** Search and filtering, Delivery option selection, Promo code application

Orders a specific item with express/priority delivery and applies a promo code.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{DELIVERY_OPTION}}` | Delivery option (express, priority) |
| `{{MEMBERSHIP_TYPE}}` | Membership type (DashPass) |
| `{{PROMO_CODE}}` | Promotional code to apply |

---

### 10. `cheapest-item-filter`
**Category:** Menu Viewing > Price filtering  
**Capabilities:** Search and filtering, Decision making

Finds the cheapest option for a specific item while excluding a particular restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name to search for |
| `{{EXCLUDED_RESTAURANT}}` | Restaurant to exclude from results |

---

### 11. `top-rated-category`
**Category:** Menu Viewing > Rating-based filtering  
**Capabilities:** Search and filtering, Category navigation

Finds top-rated items from a specific menu category at a restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{MENU_CATEGORY}}` | Menu category name |

---

### 12. `best-deal-order`
**Category:** Order Placement > Deals & promotions  
**Capabilities:** Search and filtering, Deal discovery

Finds and orders from the best deal available in a menu category.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{MENU_CATEGORY}}` | Menu category name |

---

### 13. `bulk-simple-order`
**Category:** Order Placement > Bulk orders  
**Capabilities:** Cart manipulation, Quantity management

Places a bulk order with multiple quantities of items including a main item and drinks.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{MAIN_ITEM}}` | Main item name |
| `{{MAIN_ITEM_NAME}}` | Alias for main item (for grader) |
| `{{MAIN_ITEM_QTY}}` | Quantity of main item (2-4) |
| `{{DRINK_CATEGORY}}` | Drink category name |
| `{{DRINK_QTY}}` | Quantity of drinks (1-3) |
| `{{CONTACT_NUMBER}}` | Contact phone number |

---

### 14. `update-delivery-instructions`
**Category:** Address & Delivery > Delivery instructions  
**Capabilities:** Instruction following, Form filling

Updates delivery instructions for an address with entry code and specific location.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{ENTRY_CODE}}` | Building entry code |
| `{{DELIVERY_LOCATION}}` | Delivery location (lobby, front door, etc.) |

---

### 15. `lowest-calorie-dessert`
**Category:** Menu Viewing > Diet & calorie filtering  
**Capabilities:** Search and filtering, Calorie-based decisions

Orders desserts based on calorie count with a sauce option selection.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_CATEGORY}}` | Restaurant category |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{TOTAL_SERVINGS}}` | Number of servings (2-4) |
| `{{MENU_CATEGORY}}` | Menu category name |
| `{{SAUCE_OPTION}}` | Selected sauce option |

---

### 16. `top-rated-history`
**Category:** Order History > History filtering  
**Capabilities:** Order history analysis, Filtering

Filters order history to find top-rated items matching a keyword filter.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{ITEM_FILTER}}` | Item filter keyword (chicken, pasta, etc.) |

---

### 17. `helpful-review-items`
**Category:** Ratings & Reviews > Review discovery  
**Capabilities:** Search and filtering, Review analysis

Finds helpful reviews and items from a specific restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |

---

### 18. `cheapest-rated-slices`
**Category:** Menu Viewing > Price & rating tradeoffs  
**Capabilities:** Search and filtering, Decision making

Finds cheapest items in a category that meet a minimum rating threshold.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CUISINE}}` | Restaurant cuisine type |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{MENU_CATEGORY}}` | Menu category name |
| `{{MIN_RATING}}` | Minimum rating (3, 3.5, 4, or 4.5) |

---

### 19. `cheapest-liked-combo`
**Category:** Menu Viewing > Combo ordering  
**Capabilities:** Search and filtering, Cart manipulation

Orders a combo with the cheapest liked item and an additional item.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{MENU_CATEGORY}}` | Menu category name |
| `{{ADDITIONAL_ITEM}}` | Additional item name |
| `{{ADDITIONAL_ITEM_KEYWORDS}}` | Keywords for additional item |

---

### 20. `cheapest-nearby-item`
**Category:** Menu Viewing > Nearby & price filtering  
**Capabilities:** Search and filtering, Location-based decisions

Finds the cheapest nearby item matching criteria.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{CUISINE}}` | Restaurant cuisine type |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{MENU_CATEGORY}}` | Menu category name |

---

### 21. `multi-express-orders`
**Category:** Order Placement > Multiple orders  
**Capabilities:** Cart manipulation, Express delivery

Places express orders from multiple restaurants.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_1}}` | First restaurant name |
| `{{RESTAURANT_1_ITEM_1}}` | First item from restaurant 1 |
| `{{RESTAURANT_1_ITEM_2}}` | Second item from restaurant 1 |
| `{{RESTAURANT_2_ITEM}}` | Item from second restaurant |
| `{{CUISINE}}` | Cuisine type for second restaurant |
| `{{DELIVERY_OPTION}}` | Delivery option (express, priority) |

---

### 22. `gift-coffee-order`
**Category:** Order Placement > Gift orders  
**Capabilities:** Search and filtering, Gift ordering

Places a gift order from a coffee/cafe type restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{CUISINE}}` | Cuisine type (coffee, cafe) |
| `{{ITEM_QUANTITY}}` | Item quantity (1-3) |

---

### 23. `list-affordable-cuisine`
**Category:** Menu Viewing > Cuisine discovery  
**Capabilities:** Search and filtering, List generation

Lists affordable options for a specific cuisine type.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CUISINE}}` | Restaurant cuisine type |
| `{{RESULT_COUNT}}` | Number of results to show (3-5) |

---

### 24. `positive-order-review`
**Category:** Ratings & Reviews > Review creation  
**Capabilities:** Instruction following, Text generation

Leaves a positive review for a past order with generated review text.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name from order history |
| `{{RATING}}` | Star rating (4 or 5) |
| `{{REVIEW_TEXT}}` | Generated positive review text |
| `{{REVIEW_KEYWORDS}}` | Positive keywords (delicious, amazing, etc.) |

---

### 25. `nearest-coffee-cart`
**Category:** Order Placement > Quick orders  
**Capabilities:** Search and filtering, Location-based ordering

Orders from the nearest coffee shop/cafe/bakery.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_TYPE}}` | Type of restaurant (coffee shop, cafe, etc.) |
| `{{RESTAURANT_ITEM}}` | Menu item name |

---

### 26. `search-express-order`
**Category:** Order Placement > Express orders  
**Capabilities:** Search and filtering, Express delivery

Searches for an item and places an express order.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{DELIVERY_OPTION}}` | Delivery option (express, priority) |

---

### 27. `list-cheapest-items`
**Category:** Menu Viewing > Price listing  
**Capabilities:** Search and filtering, List generation

Lists the cheapest options for a specific item.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{RESULT_COUNT}}` | Number of results to show (3-5) |

---

### 28. `find-matching-restaurant`
**Category:** Menu Viewing > Restaurant discovery  
**Capabilities:** Search and filtering, Multi-item matching

Finds a restaurant that has both of two specific items.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM_1}}` | First menu item |
| `{{RESTAURANT_ITEM_2}}` | Second menu item |

---

### 29. `top-liked-entrees`
**Category:** Menu Viewing > Rating-based ordering  
**Capabilities:** Search and filtering, Category navigation

Orders top-liked items from a specific menu category.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{MENU_CATEGORY}}` | Menu category name |
| `{{ITEM_COUNT}}` | Number of items (2-5) |
| `{{ADDRESS_TYPE}}` | Delivery address type |

---

### 30. `scheduled-best-item`
**Category:** Order Placement > Scheduled orders  
**Capabilities:** Scheduling, Order placement

Schedules an order for a specific time with time offset calculation.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ADDRESS_TYPE}}` | Delivery address type |
| `{{BASE_TIME}}` | Base time reference |
| `{{TIME_OFFSET}}` | Time offset from base time |
| `{{SCHEDULED_TIME}}` | Final scheduled delivery time |

---

### 31. `healthy-fixed-order`
**Category:** Order Placement > Multi-item orders  
**Capabilities:** Cart manipulation, Quantity management

Orders multiple specific items with quantities from a restaurant section.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{SECTION}}` | Restaurant section (Featured, Nearby, etc.) |
| `{{RESTAURANT}}` | Restaurant name |
| `{{ITEM_1}}` | First item name |
| `{{ITEM_1_NAME}}` | First item name (alias for grader) |
| `{{ITEM_1_QTY}}` | First item quantity |
| `{{ITEM_2}}` | Second item name |
| `{{ITEM_2_NAME}}` | Second item name (alias for grader) |
| `{{ITEM_2_QTY}}` | Second item quantity |
| `{{ITEM_3}}` | Third item name |
| `{{ITEM_3_NAME}}` | Third item name (alias for grader) |
| `{{ITEM_3_QTY}}` | Third item quantity |

---

### 32. `scheduled-group-order`
**Category:** Order Placement > Group orders  
**Capabilities:** Scheduling, Bulk ordering

Schedules a group order with multiple quantities for a specific time.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ITEM_QUANTITY}}` | Item quantity (2-6) |
| `{{SCHEDULED_TIME}}` | Scheduled delivery time |

---

### 33. `update-cart-quantity`
**Category:** Cart Management > Quantity updates  
**Capabilities:** Cart manipulation, Quantity management

Updates the quantity of items in an existing cart. Requires users with active carts.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name from user's cart |
| `{{TARGET_QUANTITY}}` | Target quantity to set (2-5) |

---

### 34. `build-specific-cart`
**Category:** Cart Management > Cart building  
**Capabilities:** Cart manipulation, Multi-item ordering

Builds a cart with three specific items and quantities.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{ITEM_1}}` | First item name |
| `{{ITEM_1_QTY}}` | First item quantity |
| `{{ITEM_2}}` | Second item name |
| `{{ITEM_2_QTY}}` | Second item quantity |
| `{{ITEM_3}}` | Third item name |
| `{{ITEM_3_QTY}}` | Third item quantity |

---

### 35. `list-menu-options`
**Category:** Menu Viewing > Menu exploration  
**Capabilities:** Search and filtering, Category navigation

Lists menu options from a specific category at a restaurant.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT}}` | Restaurant name |
| `{{ITEM_CATEGORY}}` | Menu category to list |

---

### 36. `list-rated-restaurants`
**Category:** Menu Viewing > Restaurant discovery  
**Capabilities:** Search and filtering, Rating & distance filtering

Lists restaurants by cuisine with minimum rating and maximum distance filters.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CUISINE}}` | Restaurant cuisine type |
| `{{RESTAURANT_ITEM}}` | Menu item to look for |
| `{{MIN_RATING}}` | Minimum rating (3, 3.5, 4, or 4.5) |
| `{{MAX_DISTANCE}}` | Maximum distance in miles (5, 10, or 15) |

---

## Common Variables

All templates automatically include these common variables:

| Placeholder | Description |
|-------------|-------------|
| `{{USER_EMAIL}}` | User's email address |
| `{{USER_PASSWORD}}` | User's password |

---

## Data Sources

All sample data is dynamically fetched from the database:

| Data Type | Database Source |
|-----------|-----------------|
| Cuisines | `restaurants.cuisine` (DISTINCT) |
| Address Types | `addresses.address_type` (DISTINCT) |
| Spice Levels | `modification_options.name` where modification contains 'spice' |
| Delivery Times | `orders.scheduled_time_slot` (DISTINCT) |
| Complaints | Keywords extracted from low-rated `user_reviews.content` |
| Street Names | Parsed from `addresses.street` |
| Cities | `addresses.city` (DISTINCT) |
| Restaurant Sections | `restaurants.section` (DISTINCT) |
| Restaurant Categories | `categories.name` (DISTINCT) |
| Menu Categories | `menu_categories.name` per restaurant |
| Deals/Promo Codes | `deals.promocode` table |

---

## User Pool Selection

Different templates require different user pools:

| Template | Required User Data |
|----------|-------------------|
| `rate-last-order` | Users with order history |
| `reorder-with-addons` | Users with order history |
| `top-rated-history` | Users with order history |
| `helpful-review-items` | Users with order history |
| `positive-order-review` | Users with order history |
| `replace-cart-item` | Users with active carts |
| `clear-invalid-carts` | Users with carts from out-of-range restaurants |
| `update-cart-quantity` | Users with active carts |
| All others | Any user with valid addresses |

---

## Predefined Tasks

The generator supports predefined tasks from `config/predefined_tasks.json`. These tasks:
- Are always assigned the `-001` suffix (e.g., `item-addon-order-001`)
- Are added first before generated tasks for each template
- Take priority over dynamically generated tasks
- **Keep their original `simulator_config`** - they are NOT subject to the 70/30 pre-auth split
- If a predefined task has `simulator_config.bootstrap_data.user`, the login prefix is automatically removed from its `task_statement`

---

## Adding New Templates

1. Add your template to `config/templates.json`:

```json
{
  "template_settings": {
    "template_id": "my-new-template",
    "task_category_L1": ["My Category"],
    "task_category_L2": ["Sub Category"],
    "capability": ["Required Capability"]
  },
  "start_url": "https://dashdoor.rlgym.turing.com/home",
  "task_statement": "Do something with {{MY_VARIABLE}}.",
  "task_type": "GUI Comprehension, Action Execution",
  "simulator_config": {
    "bootstrap_data": {
      "date": "2025-12-19T12:00:00-08:00",
      "timezone": "America/Los_Angeles"
    }
  },
  "grader_config": { ... }
}
```

2. Add a handler in `generate_variables_for_template()` in `generate_tasks.py`:

```python
elif template_id == "my-new-template":
    # Fetch data from DB and build variables
    variables.update({
        "MY_VARIABLE": some_value,
    })
    return variables
```

3. If your template needs a specific user pool, update `get_users_for_template()`:

```python
# In the order_templates or cart_templates sets:
order_templates = {
    "rate-last-order", "reorder-with-addons", "top-rated-history",
    "helpful-review-items", "positive-order-review", "my-new-template"  # Add here if needed
}
```

---

## Examples

```bash
# Generate 10 item-addon-order tasks
python scripts/generate_tasks.py --template-index 0 --max-per-template 10

# Generate 5 tasks from each template type
python scripts/generate_tasks.py --max-per-template 5

# Generate 100 total tasks with seed for reproducibility
python scripts/generate_tasks.py --max-total 100 --seed 42

# Use custom database and output path
python scripts/generate_tasks.py --db data/db/custom.db --output output/tasks.csv

# Generate tasks with 80% pre-authentication
python scripts/generate_tasks.py --pre-auth-pct 0.80

# Generate all tasks requiring explicit login (no pre-auth)
python scripts/generate_tasks.py --pre-auth-pct 0.0
```

---

## Simulator Configuration

All tasks include a `simulator_config` object that configures the simulation environment:

```json
"simulator_config": {
  "bootstrap_data": {
    "date": "2025-12-19T12:00:00-08:00",
    "timezone": "America/Los_Angeles"
  }
}
```

### Bootstrap Data Fields

| Field | Description |
|-------|-------------|
| `date` | Simulated date/time in ISO 8601 format (12:00 PM Los Angeles time) |
| `timezone` | IANA timezone identifier (America/Los_Angeles) |
| `user` | (Optional) User email for pre-authenticated sessions |

### Configuration Types

| Type | Fields | Description |
|------|--------|-------------|
| **Type A** | `date`, `timezone` | Standard bootstrap - user must log in |
| **Type B** | `date`, `timezone`, `user` | Pre-authenticated session - login instruction removed from task statement |

**Note:** Type B tasks have the login instruction removed from `task_statement` since the user is pre-authenticated via `bootstrap_data.user`.

---

## Output Format

The script outputs a CSV file with the following columns:

| Column | Description |
|--------|-------------|
| `full_task_json` | Complete task configuration as JSON |
| `task_category_L1` | High-level task category |
| `task_category_L2` | Sub-category |
| `task_capability` | Required capabilities |
| `task` | Task statement text |
| `policy_model` | (empty - for evaluation) |
| `sumpass@10` | (empty - for evaluation) |
| `difficulty` | (empty - for evaluation) |
| `grader_summary` | (empty - for evaluation) |

---

## Files

- **`scripts/generate_tasks.py`** - Main generator script
- **`config/templates.json`** - Template definitions with placeholders
- **`config/predefined_tasks.json`** - Predefined task configurations
- **`config/generated_tasks.csv`** - Output file with generated tasks
