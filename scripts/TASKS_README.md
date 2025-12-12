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
| `--output` | `config/generated_tasks.json` | Output file path |
| `--radius` | `10.0` | Search radius in miles |
| `--max-per-template` | `5` | Max tasks per template type |
| `--max-total` | unlimited | Total tasks limit |
| `--format` | `json` | Output format (`json` or `jsonl`) |
| `--no-shuffle` | - | Disable randomization |
| `--seed` | - | Random seed for reproducibility |

## Template Types

The system supports 9 template types:

| Index | Type | Description |
|-------|------|-------------|
| 0 | `order_with_addon` | Order item with modification |
| 1 | `order_from_cuisine` | Order from nearest restaurant of a cuisine |
| 2 | `find_restaurant` | Find best restaurant by dietary preference |
| 3 | `hotel_delivery` | Add hotel address and order delivery |
| 4 | `update_payment` | Delete and add new payment card |
| 5 | `rate_order` | Rate a past order with complaints |
| 6 | `remove_carts` | Remove carts from out-of-area restaurants |
| 7 | `modify_cart_order` | Modify cart and schedule delivery |
| 8 | `complex_order` | Multi-item order with promo code |

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

## Template Variables

### Common Variables (all templates)

| Placeholder | Description |
|-------------|-------------|
| `{{USER_EMAIL}}` | User's email address |
| `{{USER_PASSWORD}}` | User's password |

### Template-Specific Variables

| Template | Variables |
|----------|-----------|
| `order_with_addon` | RESTAURANT, RESTAURANT_ITEM, ITEM_ADD_ON, MODIFICATION_NAME |
| `order_from_cuisine` | CUISINE, RESTAURANT_ITEM_1, RESTAURANT_ITEM_2, ADDRESS_TYPE |
| `find_restaurant` | CUISINE_1, CUISINE_2 |
| `hotel_delivery` | STREET, CITY, ITEM_KEYWORDS |
| `update_payment` | CARD_NUMBER, CARD_CVV, EXPIRY_MONTH_NAME, EXPIRY_YEAR, EXPIRY_MM_YY |
| `rate_order` | RESTAURANT, RATING, ITEM_NAME, COMPLAINT_1, COMPLAINT_2 |
| `remove_carts` | (no additional variables) |
| `modify_cart_order` | RESTAURANT, ITEM_TO_REPLACE, ITEM_TO_ADD, DELIVERY_TIME |
| `complex_order` | RESTAURANT, ITEM_NAME, ITEM_KEYWORDS, SPICE_LEVEL, PROMO_CODE, CARD_LAST_FOUR |

## Adding New Templates

1. Add your template to `config/templates.json`:

```json
{
  "template_type": "my_new_template",
  "task_id": "001",
  "start_url": "https://dashdoor.rlgym.turing.com/home",
  "task_statement": "Log in using '{{USER_EMAIL}}'. Do something with {{MY_VARIABLE}}.",
  "grader_config": { ... }
}
```

2. Add a handler in `generate_variables_for_template()` in `generate_tasks.py`:

```python
elif template_type == "my_new_template":
    # Fetch data from DB and build variables
    variables.update({
        "MY_VARIABLE": some_value,
    })
    return variables
```

## Examples

```bash
# Generate 10 order_with_addon tasks
python scripts/generate_tasks.py --template-index 0 --max-per-template 10

# Generate 5 tasks from each template type
python scripts/generate_tasks.py --max-per-template 5

# Generate 100 total tasks with seed for reproducibility
python scripts/generate_tasks.py --max-total 100 --seed 42

# Output in JSONL format
python scripts/generate_tasks.py --format jsonl --output tasks.jsonl
```

## Files

- **`scripts/generate_tasks.py`** - Main generator script
- **`config/templates.json`** - Template definitions with placeholders
- **`config/generated_tasks.json`** - Output file with generated tasks
