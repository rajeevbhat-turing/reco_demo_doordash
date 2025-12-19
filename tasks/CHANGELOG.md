# DashDoor Tasks Changelog

This changelog tracks changes made to `tasks/dashdoor.csv`.

## Changes
1. [Prompt Changes](#prompt-changes)
2. [Verifier Changes](#verifier-changes)

---

## Prompt Changes

Modifications to `simulator_config` (task setup, user persona, dates, etc.)

### Change Types

| Type | Task Count | Description |
|------|------------|-------------|
| **A** | 60 | `bootstrap_data` with `date` and `timezone` only |
| **B** | 140 | `bootstrap_data` with `date`, `timezone`, and `user` + login instruction removed from `task_statement` |

### Type A: Bootstrap Data Only (60 tasks)

These tasks received the base `simulator_config` update:

```json
"simulator_config": {
  "bootstrap_data": {
    "date": "2025-12-19T12:00:00-08:00",
    "timezone": "America/Los_Angeles"
  }
}
```

**Changes made:**
- Added `bootstrap_data.date`: 12:00 PM Los Angeles time in ISO 8601 format
- Added `bootstrap_data.timezone`: IANA timezone identifier for Los Angeles

### Type B: Bootstrap Data + User + Login Removed (140 tasks)

These 140 randomly selected tasks received additional modifications:

```json
"simulator_config": {
  "bootstrap_data": {
    "date": "2025-12-19T12:00:00-08:00",
    "timezone": "America/Los_Angeles",
    "user": "email@example.com"
  }
}
```

**Changes made:**
- **Removed login instruction** from `task_statement`: The prefix `"Log in using email '...' and password '...'."` was stripped

**Example task_statement change:**

Before:
```
Log in using email 'kai.hayes1@example.com' and password 'cb99JpX9M02b'. Order Bruschetta from Cafe by Frank's, select the Medium add on
```

After:
```
Order Bruschetta from Cafe by Frank's, select the Medium add on
```

### Task Lists

#### Type A Tasks (60 tasks) - Bootstrap Data Only

| # | Task ID |
|---|---------|
| 1 | `item-addon-order-001` |
| 3 | `item-addon-order-003` |
| 4 | `item-addon-order-004` |
| 6 | `item-addon-order-006` |
| 11 | `nearest-cheapest-choice-004` |
| 13 | `nearest-cheapest-choice-006` |
| 14 | `nearest-cheapest-choice-007` |
| 16 | `new-cheapest-restaurant-002` |
| 17 | `new-cheapest-restaurant-003` |
| 31 | `rate-last-order-003` |
| 33 | `rate-last-order-005` |
| 37 | `clear-invalid-carts-002` |
| 38 | `clear-invalid-carts-003` |
| 43 | `replace-cart-item-001` |
| 44 | `replace-cart-item-002` |
| 45 | `replace-cart-item-003` |
| 46 | `replace-cart-item-004` |
| 48 | `replace-cart-item-006` |
| 53 | `reorder-with-addons-005` |
| 61 | `cheapest-item-filter-004` |
| 62 | `cheapest-item-filter-005` |
| 65 | `top-rated-category-004` |
| 67 | `top-rated-category-006` |
| 70 | `best-deal-order-005` |
| 74 | `bulk-simple-order-002` |
| 77 | `update-delivery-instructions-001` |
| 81 | `lowest-calorie-dessert-002` |
| 96 | `cheapest-liked-combo-002` |
| 102 | `cheapest-nearby-item-005` |
| 104 | `multi-express-orders-003` |
| 106 | `gift-coffee-order-001` |
| 107 | `gift-coffee-order-002` |
| 111 | `list-affordable-cuisine-003` |
| 112 | `list-affordable-cuisine-005` |
| 114 | `positive-order-review-001` |
| 122 | `find-matching-restaurant-001` |
| 123 | `find-matching-restaurant-002` |
| 126 | `top-liked-entrees-003` |
| 127 | `hotel-cheapest-delivery-001` |
| 129 | `item-with-sauce-001` |
| 131 | `scheduled-group-order-001` |
| 137 | `express-nearest-order-001` |
| 145 | `update-delivery-instructions-004` |
| 146 | `update-delivery-instructions-006` |
| 154 | `nearest-coffee-cart-006` |
| 159 | `nearest-cheapest-choice-003` |
| 160 | `nearest-cheapest-choice-005` |
| 161 | `new-cheapest-restaurant-003` |
| 162 | `new-cheapest-restaurant-005` |
| 163 | `replace-payment-card-002` |
| 168 | `clear-invalid-carts-002` |
| 171 | `cheapest-item-filter-002` |
| 172 | `cheapest-item-filter-005` |
| 173 | `top-rated-category-003` |
| 187 | `find-matching-restaurant-004` |
| 188 | `scheduled-best-item-003` |
| 193 | `build-specific-cart-003` |
| 194 | `build-specific-cart-004` |
| 195 | `build-specific-cart-005` |
| 196 | `list-menu-options-003` |

#### Type B Tasks (140 tasks) - Bootstrap Data + User + Login Removed

| # | Task ID |
|---|---------|
| 2 | `item-addon-order-002` |
| 5 | `item-addon-order-005` |
| 7 | `item-addon-order-007` |
| 8 | `nearest-cheapest-choice-001` |
| 9 | `nearest-cheapest-choice-002` |
| 10 | `nearest-cheapest-choice-003` |
| 12 | `nearest-cheapest-choice-005` |
| 15 | `new-cheapest-restaurant-001` |
| 18 | `new-cheapest-restaurant-004` |
| 19 | `new-cheapest-restaurant-005` |
| 20 | `new-cheapest-restaurant-006` |
| 21 | `new-cheapest-restaurant-007` |
| 22 | `replace-payment-card-001` |
| 23 | `replace-payment-card-002` |
| 24 | `replace-payment-card-003` |
| 25 | `replace-payment-card-004` |
| 26 | `replace-payment-card-005` |
| 27 | `replace-payment-card-006` |
| 28 | `replace-payment-card-007` |
| 29 | `rate-last-order-001` |
| 30 | `rate-last-order-002` |
| 32 | `rate-last-order-004` |
| 34 | `rate-last-order-006` |
| 35 | `rate-last-order-007` |
| 36 | `clear-invalid-carts-001` |
| 39 | `clear-invalid-carts-004` |
| 40 | `clear-invalid-carts-005` |
| 41 | `clear-invalid-carts-006` |
| 42 | `clear-invalid-carts-007` |
| 47 | `replace-cart-item-005` |
| 49 | `replace-cart-item-007` |
| 50 | `reorder-with-addons-002` |
| 51 | `reorder-with-addons-003` |
| 52 | `reorder-with-addons-004` |
| 54 | `reorder-with-addons-007` |
| 55 | `express-nearest-order-002` |
| 56 | `express-nearest-order-004` |
| 57 | `express-nearest-order-005` |
| 58 | `express-nearest-order-006` |
| 59 | `express-nearest-order-007` |
| 60 | `cheapest-item-filter-002` |
| 63 | `cheapest-item-filter-007` |
| 64 | `top-rated-category-002` |
| 66 | `top-rated-category-005` |
| 68 | `top-rated-category-007` |
| 69 | `best-deal-order-002` |
| 71 | `best-deal-order-006` |
| 72 | `best-deal-order-007` |
| 73 | `bulk-simple-order-001` |
| 75 | `bulk-simple-order-005` |
| 76 | `bulk-simple-order-007` |
| 78 | `update-delivery-instructions-002` |
| 79 | `update-delivery-instructions-005` |
| 80 | `update-delivery-instructions-007` |
| 82 | `lowest-calorie-dessert-005` |
| 83 | `lowest-calorie-dessert-007` |
| 84 | `top-rated-history-002` |
| 85 | `top-rated-history-005` |
| 86 | `top-rated-history-007` |
| 87 | `helpful-review-items-001` |
| 88 | `helpful-review-items-002` |
| 89 | `helpful-review-items-003` |
| 90 | `helpful-review-items-005` |
| 91 | `helpful-review-items-007` |
| 92 | `cheapest-rated-slices-002` |
| 93 | `cheapest-rated-slices-005` |
| 94 | `cheapest-rated-slices-007` |
| 95 | `cheapest-liked-combo-001` |
| 97 | `cheapest-liked-combo-003` |
| 98 | `cheapest-liked-combo-005` |
| 99 | `cheapest-liked-combo-007` |
| 100 | `cheapest-nearby-item-001` |
| 101 | `cheapest-nearby-item-002` |
| 103 | `multi-express-orders-001` |
| 105 | `multi-express-orders-005` |
| 108 | `gift-coffee-order-003` |
| 109 | `list-affordable-cuisine-001` |
| 110 | `list-affordable-cuisine-002` |
| 113 | `list-affordable-cuisine-007` |
| 115 | `positive-order-review-003` |
| 116 | `nearest-coffee-cart-001` |
| 117 | `nearest-coffee-cart-007` |
| 118 | `search-express-order-001` |
| 119 | `list-cheapest-items-005` |
| 120 | `list-cheapest-items-006` |
| 121 | `list-cheapest-items-007` |
| 124 | `find-matching-restaurant-007` |
| 125 | `top-liked-entrees-001` |
| 128 | `low-calorie-order-001` |
| 130 | `healthy-fixed-order-001` |
| 132 | `update-cart-quantity-001` |
| 133 | `build-specific-cart-001` |
| 134 | `list-menu-options-001` |
| 135 | `list-rated-restaurants-001` |
| 136 | `reorder-with-addons-006` |
| 138 | `cheapest-item-filter-001` |
| 139 | `cheapest-item-filter-003` |
| 140 | `top-rated-category-001` |
| 141 | `top-rated-category-003` |
| 142 | `best-deal-order-004` |
| 143 | `bulk-simple-order-003` |
| 144 | `update-delivery-instructions-003` |
| 147 | `lowest-calorie-dessert-003` |
| 148 | `helpful-review-items-006` |
| 149 | `cheapest-liked-combo-004` |
| 150 | `cheapest-liked-combo-006` |
| 151 | `multi-express-orders-006` |
| 152 | `list-affordable-cuisine-004` |
| 153 | `positive-order-review-006` |
| 155 | `search-express-order-006` |
| 156 | `search-express-order-007` |
| 157 | `find-matching-restaurant-005` |
| 158 | `top-liked-entrees-004` |
| 164 | `replace-payment-card-004` |
| 165 | `rate-last-order-002` |
| 166 | `rate-last-order-004` |
| 167 | `rate-last-order-005` |
| 169 | `clear-invalid-carts-003` |
| 170 | `clear-invalid-carts-005` |
| 174 | `best-deal-order-002` |
| 175 | `bulk-simple-order-004` |
| 176 | `lowest-calorie-dessert-003` |
| 177 | `helpful-review-items-004` |
| 178 | `cheapest-rated-slices-004` |
| 179 | `cheapest-liked-combo-005` |
| 180 | `cheapest-nearby-item-004` |
| 181 | `gift-coffee-order-005` |
| 182 | `list-affordable-cuisine-004` |
| 183 | `nearest-coffee-cart-004` |
| 184 | `search-express-order-003` |
| 185 | `list-cheapest-items-002` |
| 186 | `list-cheapest-items-005` |
| 189 | `healthy-fixed-order-004` |
| 190 | `scheduled-group-order-002` |
| 191 | `scheduled-group-order-004` |
| 192 | `scheduled-group-order-005` |
| 197 | `list-menu-options-004` |
| 198 | `list-menu-options-005` |
| 199 | `replace-payment-card-002` |
| 200 | `healthy-fixed-order-001` |

---

## Verifier Changes

Modifications to `grader_config` (index fixes, operator changes, assertion updates)

| # | Task Name | Verifier Change | Notes |
|---|-----------|:---------------:|-------|
| 1 | `item-addon-order | ❌ No | Already compliant with JSONPath indexing |
| 2 | `nearest-cheapest-choice | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].id` → `$[2].items[0].id` |
| 3 | `new-cheapest-restaurant | ❌ No | No changes required |
| 4 | `replace-payment-card | ✅ Yes | `$.address.zipCode` → `$[0].address.zipCode` |
| 5 | `rate-last-order | ❌ No | No indexing issues found |
| 6 | `clear-invalid-carts | ✅ Yes | `$.carts[*].storeId` → `$[2].carts[*].storeId` |
| 7 | `replace-cart-item | ✅ Yes | `$.date` → `$[2].date`, `$.slot` → `$[3].slot` |
| 8 | `reorder-with-addons | ✅ Yes | `$.deal.id` → `$[0].deal.id`, `$.orders[0].items[*].name` → `$[2].orders[0].items[*].name`, `$.items[*].name` → `$[3].items[*].name` |
| 9 | `express-nearest-order | ✅ Yes | `$.deal.id` → `$[1].deal.id`, `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[3].items[0].name` |
| 10 | `cheapest-item-filter | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 11 | `top-rated-category | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 12 | `best-deal-order | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].deals[0].id` → `$[1].restaurants[0].deals[0].id`, `$.categories[0].id` → `$[2].categories[0].id`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 13 | `bulk-simple-order | ✅ Yes | Updated paths_to_expected to reference both item expected states (`$[2]`, `$[3]`) |
| 14 | `update-delivery-instructions | ✅ Yes | `$.address.deliveryInstructions` → `$[0].address.deliveryInstructions` |
| 15 | `lowest-calorie-dessert | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[*].name` → `$[2].items[*].name` |
| 16 | `top-rated-history | ✅ Yes | `$.items[*].name` → `$[2].items[*].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 17 | `helpful-review-items | ✅ Yes | `$.reviews[0].likedItems[*].itemName` → `$[1].reviews[0].likedItems[*].itemName`, `$.reviews[0].storeId` → `$[1].reviews[0].storeId` |
| 18 | `cheapest-rated-slices | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 19 | `cheapest-liked-combo | ✅ Yes | Operator changed: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`. Split paths into separate assertions: `$[1].items[0].name`, `$[2].items[0].name` |
| 20 | `cheapest-nearby-item | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 21 | `multi-express-orders | ✅ Yes | orders[0]: `$.items[*].name` → `$[4].items[*].name`, `$.restaurants[0].id` → `$[3].restaurants[0].id`; orders[1]: `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 22 | `gift-coffee-order | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 23 | `list-affordable-cuisine | ✅ Yes | `$.restaurants[*].name` → `$[0].restaurants[*].name` |
| 24 | `positive-order-review | ✅ Yes | `$.orders[0].id` → `$[1].orders[0].id` |
| 25 | `nearest-coffee-cart | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 26 | `search-express-order | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 27 | `list-cheapest-items | ✅ Yes | `$.items[*].restaurantName` → `$[1].items[*].restaurantName` |
| 28 | `find-matching-restaurant | ✅ Yes | `$.restaurants[0].name` → `$[1].restaurants[0].name` |
| 29 | `top-liked-entrees | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 30 | `hotel-cheapest-delivery | ❌ No | No changes required |
| 31 | `low-calorie-order | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[*].name` → `$[2].items[*].name` |
| 32 | `item-with-sauce | ❌ No | No changes required |
| 33 | `healthy-fixed-order | ✅ Yes | Operator changed: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`. Split into 3 assertions: `$[2].items[0].name`, `$[3].items[0].name`, `$[4].items[0].name` |
| 34 | `scheduled-group-order | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[0].name` → `$[2].items[0].name`, `$.slot` → `$[3].slot` |
| 35 | `update-cart-quantity | ❌ No | No changes required |
| 36 | `build-specific-cart | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 37 | `list-menu-options | ❌ No | No changes required |
| 38 | `list-rated-restaurants | ❌ No | No changes required |
| 39 | `scheduled-best-item | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[1].items[0].name`, `$.slot` → `$[2].slot` |

---

### Summary Statistics

| Metric | Count |
|--------|-------|
| Total Tasks | 39 |
| Verifier Changes | 31 |
| No Changes Required | 8 |

---

### Detailed Change Descriptions

#### Verifier Index Fix

All verifier changes address the feedback requiring explicit array indexing in `paths_to_expected` JSONPath expressions.

**Before (Non-compliant):**
```json
"paths_to_expected": ["$.address.id"]
```

**After (Compliant):**
```json
"paths_to_expected": ["$[0].address.id"]
```

The index `$[n]` references the nth expected state function result from `extract_states_config.expected_state_functions`.

#### Operator Changes

Two tasks required operator changes in addition to index fixes:

1. **cheapest-liked-combo**: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`
2. **healthy-fixed-order**: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`

These changes split single assertions with multiple paths into separate assertions for independent validation.

