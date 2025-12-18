### item-addon-order

**Review**
- Verified that all `paths_to_expected` use indexed JSONPaths (e.g. `$[n].field`).

**Result**
- No changes required.

**Impact**
- Template already compliant with Meta feedback regarding JSONPath indexing.

### Template: nearest-cheapest-choice

**Issue**
- `paths_to_expected` used non-indexed JSONPaths (`$.address.id`, `$.items[0].id`).

**Fix**
- Updated to indexed paths:
  - `$[0].address.id`
  - `$[2].items[0].id`

**Impact**
- Syntax-only JSONPath fix.
- No change to task logic or grading behavior.

$[1].restaurants[0].name

### replace-payment-card

- Fixed Meta feedback by adding explicit expected-state array index
- Updated paths_to_expected from `$.address.zipCode` to `$[0].address.zipCode`
- No task logic or grader behavior changed

### rate-last-order

- Reviewed verifier against Meta feedback
- No `paths_to_expected` indexing issues found
- No changes required

### clear-invalid-carts

- Fixed Meta feedback by adding explicit expected-state index
- Updated paths_to_expected from `$.carts[*].storeId` to `$[2].carts[*].storeId`
- No task logic or grader behavior changed

### replace-cart-item

- Fixed Meta feedback: added explicit expected-state indices
- Updated `$.date` → `$[2].date`
- Updated `$.slot` → `$[3].slot`
- No task logic or grader behavior changed

### reorder-with-addons

- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.deal.id` → `$[0].deal.id`
- Updated `$.orders[0].items[*].name` → `$[2].orders[0].items[*].name`
- Updated `$.items[*].name` → `$[3].items[*].name`
- No task logic or grader behavior changed

### express-nearest-order

- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.deal.id` → `$[1].deal.id`
- Updated `$.address.id` → `$[0].address.id`
- Updated `$.items[0].name` → `$[3].items[0].name`
- No task logic or grader behavior changed

### cheapest-item-filter
- Fixed paths_to_expected to use indexed expected state references ($[2])
- Updated $.items[0].name → $[2].items[0].name to reference the get_items expected state
- Updated $.items[0].restaurantId → $[2].items[0].restaurantId to ensure restaurant comparison
- No behavior or logic changes

### top-rated-category
- Fixed paths_to_expected to use indexed expected state references ($[2])
- Updated $.items[0].name → $[2].items[0].name to reference the highest-rated item returned by get_items
- Updated $.items[0].restaurantId → $[2].items[0].restaurantId to ensure the ordered item is matched against the indexed restaurant source
- No behavior or logic changes

### best-deal-order
- Fixed paths_to_expected to use indexed expected state references ($[0], $[1], $[2])
- Updated $.address.id → $[0].address.id to reference the user address returned by get_user_address
- Updated $.restaurants[0].deals[0].id → $[1].restaurants[0].deals[0].id to correctly bind the applied deal to the indexed restaurant result
- Updated $.categories[0].id → $[2].categories[0].id to reference the menu category returned by get_menu_categories
- Updated $.restaurants[0].id → $[1].restaurants[0].id to ensure the order is placed with the selected deal-eligible restaurant
- No behavior or logic changes

### bulk-simple-order
- Fixed indexing by updating paths_to_expected to reference both item expected states ($[2], $[3]) for ARRAY_STRING_EQUALS

### update-delivery-instructions
- Fixed paths_to_expected to use indexed expected state references ($[0])
- Updated $.address.deliveryInstructions → $[0].address.deliveryInstructions to reference the original address returned by get_user_address
- No behavior or logic changes

### lowest-calorie-dessert
- Fixed paths_to_expected to use indexed expected state references ($[0], $[1], $[2])
- Updated $.address.id → $[0].address.id to reference the delivery address returned by get_user_address
- Updated $.restaurants[0].id → $[1].restaurants[0].id to bind the order to the selected restaurant from get_restaurants
- Updated $.items[*].name → $[2].items[*].name to compare ordered items against the lowest-calorie items returned by get_items
- No behavior or logic changes

### top-rated-history
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.items[*].name` → `$[2].items[*].name`
- Updated `$.items[0].restaurantId` → `$[2].items[0].restaurantId`
- No task logic or grader behavior changed

### helpful-review-items
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.reviews[0].likedItems[*].itemName` → `$[1].reviews[0].likedItems[*].itemName`
- Updated `$.reviews[0].storeId` → `$[1].reviews[0].storeId`
- No task logic or grader behavior changed

### cheapest-rated-slices
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id`
- Updated `$.items[*].name` → `$[2].items[*].name`
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id`
- No task logic or grader behavior changed




