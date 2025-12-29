# DashDoor Tasks Changelog

This changelog tracks changes made to `tasks/dashdoor.csv`.

## Table of Contents

1. [December 28, 2025](#december-28-2025)
2. [December 23, 2025](#december-23-2025)
3. [Initial Release](#initial-release)

---

## December 28, 2025

### Task Distribution Update

Updated task distribution for `simulator_config`:

| Type | Task Count | Description |
|------|------------|-------------|
| **A** | 200 | `bootstrap_data` with `date`, `timezone`, and `user` + login instruction removed (auto-login via simulator) |
| **B** | 6 | Login/Signup flow tasks - no `user` in bootstrap, login instruction retained in `task_statement` |

#### Type A: Auto-Login Tasks (200 tasks)

These tasks use `simulator_config` with user bootstrap for automatic authentication:

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
- Added `bootstrap_data.date`: 12:00 PM Los Angeles time in ISO 8601 format
- Added `bootstrap_data.timezone`: IANA timezone identifier for Los Angeles
- Added `bootstrap_data.user`: User email for automatic login via simulator
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

#### Type B: Login/Signup Flow Tasks (6 tasks)

These 6 tasks test the login and signup authentication flows and do NOT use auto-login:

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
- **No `user` field**: User must manually log in or sign up
- **Login instruction retained** in `task_statement`: The login/signup instruction remains in the task prompt

These tasks specifically test:
- User login flow
- User signup/registration flow
- Authentication UI interactions

---

### Verifier Operator Replacements

#### Replace `JSON_EQUALS` with `JSON_PART_OF` and `JSON_CONTAINS`

Updated grader config operators for more flexible assertion matching:

| Before | After | Use Case |
|--------|-------|----------|
| `JSON_EQUALS` | `JSON_PART_OF` | Actual value is a subset of expected |
| `JSON_EQUALS` | `JSON_CONTAINS` | Expected value is contained within actual |

**Reason:** `JSON_EQUALS` requires exact matches which can be too strict. The new operators allow:
- `JSON_PART_OF`: Validates that actual state properties exist within expected state (partial match)
- `JSON_CONTAINS`: Validates that expected values are present in actual state (containment check)

**Example:**

Before (strict equality):
```json
{
  "operator": "JSON_EQUALS",
  "path_to_actual": "$.items[0]",
  "paths_to_expected": ["$[0].items[0]"]
}
```

After (flexible matching):
```json
{
  "operator": "JSON_PART_OF",
  "path_to_actual": "$.items[0]",
  "paths_to_expected": ["$[0].items[0]"]
}
```

---

### Expected State Function Fixes

#### Fix `get_date_N_days_from_today` to Use Bootstrap Date

Updated `get_date_N_days_from_today` function to use the current date from `bootstrap_data` instead of system date.

| Before | After |
|--------|-------|
| Uses system date (`new Date()`) | Uses `bootstrap_data.date` from simulator config |

**Reason:** Tasks are executed with a simulated date defined in `bootstrap_data.date`. The expected state functions must use this same date for consistent date calculations.

**Example:**

Before:
```javascript
// Used system date
const today = new Date();
const targetDate = addDays(today, N);
```

After:
```javascript
// Uses bootstrap date from simulator config
const bootstrapDate = getBootstrapDate(); // e.g., "2025-12-19T12:00:00-08:00"
const targetDate = addDays(new Date(bootstrapDate), N);
```

This ensures date-dependent assertions (e.g., scheduled orders, delivery times) match the simulated time context.

---

## December 23, 2025

### CSV Structure Changes

#### Added `task_id` Column

Added a new `task_id` column as the first column in the CSV, extracted from the `full_task_json` field.

| Column Order | Before | After |
|--------------|--------|-------|
| 1 | `full_task_json` | `task_id` |
| 2 | `task_category_L1` | `full_task_json` |
| 3 | ... | `task_category_L1` |

---

### Duplicate Task Fix

#### Issue
The CSV contained duplicate task IDs and task statements.

#### Resolution
- Removed the duplicate task entry
- Re-assigned unique sequential IDs and task statements to ensure all tasks are unique

---

### `item-addon-order` Template - Modification Path Fixes

#### Path Changes for All `item-addon-order` Tasks

Updated grader config paths to correctly reference modification data:

| Path Type | Before | After |
|-----------|--------|-------|
| `path_to_actual` | `$.items[0].modifications[0].options[0].id` | `$.items[0].modifications[0].options[0].optionId` |
| `paths_to_expected` | `$[3].modifications[0].options[0].id` | `$[3].modification.options[0].id` |

**Reason:** The actual order data uses `optionId` (not `id`) for modification options, and the expected state from `get_modifications` returns a singular `modification` object (not `modifications` array).

#### Dynamic `modification_name` for Size vs Add-on Options

Updated the `modification_name` in `get_modifications` function calls to use the correct modification type from the database:

| Option Type | Before | After |
|-------------|--------|-------|
| Small, Medium, Large | `"modification_name": "add-ons"` | `"modification_name": "size"` |
| Berry Compote, etc. | `"modification_name": "add-ons"` | `"modification_name": "sauce choice"` |
| extra cheese, etc. | `"modification_name": "add-ons"` | `"modification_name": "add-ons"` (unchanged) |

**Affected Tasks:**

**Size modifications (5 tasks):**

| Task ID | Option | modification_name |
|---------|--------|-------------------|
| `item-addon-order-002` | Medium | `"size"` |
| `item-addon-order-003` | Small | `"size"` |
| `item-addon-order-005` | Large | `"size"` |
| `item-addon-order-006` | Large | `"size"` |
| `item-addon-order-007` | Large | `"size"` |

**Sauce choice modifications (1 task):**

| Task ID | Option | modification_name |
|---------|--------|-------------------|
| `item-addon-order-004` | Berry Compote | `"sauce choice"` |

**Add-on modifications (1 task):**

| Task ID | Option | modification_name |
|---------|--------|-------------------|
| `item-addon-order-001` | extra cheese | `"add-ons"` |

---

## Initial Release

### Verifier Index Fixes

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

#### Verifier Changes by Task

| # | Task Name | Verifier Change | Notes |
|---|-----------|:---------------:|-------|
| 1 | `item-addon-order` | ❌ No | Already compliant with JSONPath indexing |
| 2 | `nearest-cheapest-choice` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].id` → `$[2].items[0].id` |
| 3 | `new-cheapest-restaurant` | ❌ No | No changes required |
| 4 | `replace-payment-card` | ✅ Yes | `$.address.zipCode` → `$[0].address.zipCode` |
| 5 | `rate-last-order` | ❌ No | No indexing issues found |
| 6 | `clear-invalid-carts` | ✅ Yes | `$.carts[*].storeId` → `$[2].carts[*].storeId` |
| 7 | `replace-cart-item` | ✅ Yes | `$.date` → `$[2].date`, `$.slot` → `$[3].slot` |
| 8 | `reorder-with-addons` | ✅ Yes | `$.deal.id` → `$[0].deal.id`, `$.orders[0].items[*].name` → `$[2].orders[0].items[*].name`, `$.items[*].name` → `$[3].items[*].name` |
| 9 | `express-nearest-order` | ✅ Yes | `$.deal.id` → `$[1].deal.id`, `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[3].items[0].name` |
| 10 | `cheapest-item-filter` | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 11 | `top-rated-category` | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 12 | `best-deal-order` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].deals[0].id` → `$[1].restaurants[0].deals[0].id`, `$.categories[0].id` → `$[2].categories[0].id`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 13 | `bulk-simple-order` | ✅ Yes | Updated paths_to_expected to reference both item expected states (`$[2]`, `$[3]`) |
| 14 | `update-delivery-instructions` | ✅ Yes | `$.address.deliveryInstructions` → `$[0].address.deliveryInstructions` |
| 15 | `lowest-calorie-dessert` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[*].name` → `$[2].items[*].name` |
| 16 | `top-rated-history` | ✅ Yes | `$.items[*].name` → `$[2].items[*].name`, `$.items[0].restaurantId` → `$[2].items[0].restaurantId` |
| 17 | `helpful-review-items` | ✅ Yes | `$.reviews[0].likedItems[*].itemName` → `$[1].reviews[0].likedItems[*].itemName`, `$.reviews[0].storeId` → `$[1].reviews[0].storeId` |
| 18 | `cheapest-rated-slices` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 19 | `cheapest-liked-combo` | ✅ Yes | Operator changed: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`. Split paths into separate assertions: `$[1].items[0].name`, `$[2].items[0].name` |
| 20 | `cheapest-nearby-item` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 21 | `multi-express-orders` | ✅ Yes | orders[0]: `$.items[*].name` → `$[4].items[*].name`, `$.restaurants[0].id` → `$[3].restaurants[0].id`; orders[1]: `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 22 | `gift-coffee-order` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 23 | `list-affordable-cuisine` | ✅ Yes | `$.restaurants[*].name` → `$[0].restaurants[*].name` |
| 24 | `positive-order-review` | ✅ Yes | `$.orders[0].id` → `$[1].orders[0].id` |
| 25 | `nearest-coffee-cart` | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 26 | `search-express-order` | ✅ Yes | `$.items[0].name` → `$[2].items[0].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 27 | `list-cheapest-items` | ✅ Yes | `$.items[*].restaurantName` → `$[1].items[*].restaurantName` |
| 28 | `find-matching-restaurant` | ✅ Yes | `$.restaurants[0].name` → `$[1].restaurants[0].name` |
| 29 | `top-liked-entrees` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 30 | `hotel-cheapest-delivery` | ❌ No | No changes required |
| 31 | `low-calorie-order` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[*].name` → `$[2].items[*].name` |
| 32 | `item-with-sauce` | ❌ No | No changes required |
| 33 | `healthy-fixed-order` | ✅ Yes | Operator changed: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`. Split into 3 assertions: `$[2].items[0].name`, `$[3].items[0].name`, `$[4].items[0].name` |
| 34 | `scheduled-group-order` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.restaurants[0].id` → `$[1].restaurants[0].id`, `$.items[0].name` → `$[2].items[0].name`, `$.slot` → `$[3].slot` |
| 35 | `update-cart-quantity` | ❌ No | No changes required |
| 36 | `build-specific-cart` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[*].name` → `$[2].items[*].name`, `$.restaurants[0].id` → `$[1].restaurants[0].id` |
| 37 | `list-menu-options` | ❌ No | No changes required |
| 38 | `list-rated-restaurants` | ❌ No | No changes required |
| 39 | `scheduled-best-item` | ✅ Yes | `$.address.id` → `$[0].address.id`, `$.items[0].name` → `$[1].items[0].name`, `$.slot` → `$[2].slot` |
