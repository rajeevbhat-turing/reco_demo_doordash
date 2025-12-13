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

## Templates

The system supports 9 templates:

### 1. `item-addon-order`
**Category:** Order placement > Customizations  
**Capabilities:** Search and filtering, Instruction following

Orders a specific menu item with an add-on/modification from a restaurant.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Order Chicken Wings from Pizza Palace, select the Extra Ranch add on.

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

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Order from the nearest Italian restaurant. Get either a Margherita Pizza or a Pepperoni Pizza, choosing the cheaper option, and if they cost the same, pick the one with the higher rating. Have it delivered to my house address.

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

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Help me find the best cheapest Mexican or Thai restaurant option that I have not ordered from in the past.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{DIETARY_PREFERENCE_1}}` | First cuisine preference |
| `{{DIETARY_PREFERENCE_2}}` | Second cuisine preference |

---

### 4. `hotel-cheapest-delivery`
**Category:** Address Entry & Validation > Address & delivery instructions, Price filtering  
**Capabilities:** Instruction following, Search and filtering, Order Placement

Adds a new hotel address and orders the cheapest item matching keywords with specific delivery instructions.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Add the hotel address 456 Oak Ave, San Francisco. Have the cheapest burger delivered nearby to my hotel. I want the delivery person to meet me at the hotel lobby.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{STREET}}` | Hotel street address |
| `{{CITY}}` | City name |
| `{{ITEM_KEYWORDS}}` | Keywords to search for menu items |

---

### 5. `replace-payment-card`
**Category:** Payment & Checkout > Payment method management  
**Capabilities:** Instruction following, Form filling, UI Elements: Text Fields

Deletes existing payment card and adds a new one with specific details.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Delete my current card details and add a new card 4532015112830366 with CVV 123 and expiry date March 2027. Use the zipcode of my current house address.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{CARD_NUMBER}}` | 16-digit card number |
| `{{CARD_CVV}}` | 3-digit CVV |
| `{{EXPIRY_MONTH_NAME}}` | Expiry month name (e.g., "March") |
| `{{EXPIRY_YEAR}}` | Expiry year (e.g., "2027") |
| `{{EXPIRY_MM_YY}}` | Expiry in MM/YY format (e.g., "03/27") |

---

### 6. `rate-last-order`
**Category:** Ratings & Reviews > Review creation  
**Capabilities:** Instruction following, Text generation

Rates a previous order with a star rating and feedback. Uses actual user order history.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Rate my last order from Burger Joint a 2 star because the Cheeseburger was cold and late.

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

### 7. `clear-invalid-carts`
**Category:** Cart Management > Cart cleanup  
**Capabilities:** Search and filtering, Instruction following

Removes carts from restaurants that are no longer in the user's delivery area. Requires users who have carts from out-of-range restaurants.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. I recently changed my address so remove all the carts from restaurants no longer in my area.

**Variables:** Common variables only (USER_EMAIL, USER_PASSWORD)

---

### 8. `replace-cart-item`
**Category:** Cart Management > Cart editing & item swaps, Delivery scheduling  
**Capabilities:** Cart manipulation, Scheduling, Order Placement

Replaces an item in an existing cart and schedules delivery for a specific time. Uses actual user cart data.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. I created a cart from Pizza Palace not too long ago, replace one of the Pepperoni Pizza with a Veggie Pizza and place an order for 6:30 PM tomorrow.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_NAME}}` | Restaurant name from user's cart |
| `{{ITEM_TO_REPLACE}}` | Current item in cart to remove |
| `{{ITEM_TO_ADD}}` | New item to add to cart |
| `{{DELIVERY_TIME}}` | Scheduled delivery time (e.g., "6:30 PM") |

---

### 9. `low-calorie-order`
**Category:** Menu Viewing > Diet & calorie filtering, Item customization, Coupon application  
**Capabilities:** Search and filtering, Decision making, Order Placement

Complex multi-item order: two lowest-calorie desserts, a chicken item with spice level, promo code application, and specific payment card.

**Example task:**
> Log in using email 'user@example.com' and password 'pass123'. Lets order desserts from Healthy Eats. But since I am on a diet make sure you pick the two different lowest calorie options. And also add Grilled Chicken for my nephew, keep the spice level Medium. Apply the SAVE20 coupon. Use the card ending with 4242 for payment.

**Variables:**
| Placeholder | Description |
|-------------|-------------|
| `{{RESTAURANT_NAME}}` | Restaurant name |
| `{{CHICKEN_ITEM_NAME}}` | Full chicken item name |
| `{{CHICKEN_ITEM_KEYWORDS}}` | Keywords for chicken item search |
| `{{SPICE_LEVEL}}` | Spice level (Mild, Medium, Hot, etc.) |
| `{{SPICE_LEVEL_NORMALIZED}}` | Lowercase spice level for grader |
| `{{PROMO_CODE}}` | Promotional code to apply |
| `{{CARD_LAST_FOUR}}` | Last 4 digits of payment card |

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

## User Pool Selection

Different templates require different user pools:

| Template | Required User Data |
|----------|-------------------|
| `rate-last-order` | Users with order history |
| `clear-invalid-carts` | Users with carts from out-of-range restaurants |
| `replace-cart-item` | Users with active carts |
| All others | Any user with valid addresses |

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
  "task_id": "001",
  "start_url": "https://dashdoor.rlgym.turing.com/home",
  "task_statement": "Log in using '{{USER_EMAIL}}'. Do something with {{MY_VARIABLE}}.",
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
elif template_id == "my-new-template":
    users = self.get_users_with_some_requirement()
```

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
```

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

## Files

- **`scripts/generate_tasks.py`** - Main generator script
- **`config/templates.json`** - Template definitions with placeholders
- **`config/generated_tasks.csv`** - Output file with generated tasks
