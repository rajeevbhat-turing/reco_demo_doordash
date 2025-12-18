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

### cheapest-liked-combo
- Changed operator from `JSON_EQUALS` to `ARRAY_STRING_CONTAINS` to allow independent validation of each item
- Split single assertion with multiple paths into separate assertions to avoid failure when items differ
- Split `["$[1].items[0].name", "$[2].items[0].name"]` into two assertions:
  - `paths_to_expected: ["$[1].items[0].name"]` to reference the cheapest/most-liked item from get_items
  - `paths_to_expected: ["$[2].items[0].name"]` to reference the additional item from get_items

### cheapest-nearby-item
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[0].name` → `$[2].items[0].name` to reference the cheapest item returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the nearest restaurant returned by get_restaurants

### multi-express-orders
- Fixed Meta feedback by adding explicit expected-state indices
- For orders[0] (second order placed): Updated `$.items[*].name` → `$[4].items[*].name` and `$.restaurants[0].id` → `$[3].restaurants[0].id` to reference the cuisine-based restaurant
- For orders[1] (first order placed): Updated `$.items[*].name` → `$[2].items[*].name` and `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the named restaurant

### gift-coffee-order
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[0].name` → `$[2].items[0].name` to reference the coffee item returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the coffee shop returned by get_restaurants

### list-affordable-cuisine
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.restaurants[*].name` → `$[0].restaurants[*].name` to reference the affordable restaurants returned by get_restaurants

### positive-order-review
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.orders[0].id` → `$[1].orders[0].id` to reference the most recent order returned by get_orders

### nearest-coffee-cart
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.items[0].name` → `$[2].items[0].name` to reference the coffee item returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the nearest coffee shop returned by get_restaurants

### search-express-order
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.items[0].name` → `$[2].items[0].name` to reference the searched item returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the restaurant returned by get_restaurants

### list-cheapest-items
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.items[*].restaurantName` → `$[1].items[*].restaurantName` to reference the cheapest items returned by get_items

### find-matching-restaurant
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.restaurants[0].name` → `$[1].restaurants[0].name` to reference the matching restaurant returned by get_restaurants

### top-liked-entrees
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[*].name` → `$[2].items[*].name` to reference the top-liked entrees returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the restaurant returned by get_restaurants

### healthy-fixed-order
- Changed operator from `JSON_EQUALS` to `ARRAY_STRING_CONTAINS` to allow independent validation of each item
- Split single assertion with multiple paths into separate assertions to avoid failure when items differ
- Split `["$[2].items[0].name", "$[3].items[0].name", "$[4].items[0].name"]` into three assertions:
  - `paths_to_expected: ["$[2].items[0].name"]` to reference the first item from get_items
  - `paths_to_expected: ["$[3].items[0].name"]` to reference the second item from get_items
  - `paths_to_expected: ["$[4].items[0].name"]` to reference the third item from get_items

### build-specific-cart
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[*].name` → `$[2].items[*].name` to reference the items returned by get_items
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the restaurant returned by get_restaurants
- No task logic or grader behavior changed

### review-most-liked-items
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.reviews[*].likedItems[*].itemName` → `$[1].reviews[*].likedItems[*].itemName` to reference the liked items from reviews returned by get_reviews
- Updated `$.reviews[0].storeId` → `$[1].reviews[0].storeId` to reference the store ID from reviews returned by get_reviews
- No task logic or grader behavior changed

### scheduled-best-item
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[0].name` → `$[1].items[0].name` to reference the best-rated item returned by get_items
- Updated `$.slot` → `$[2].slot` to reference the scheduled time slot returned by get_time_slot
- No task logic or grader behavior changed

### scheduled-group-order
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the restaurant returned by get_restaurants
- Updated `$.items[0].name` → `$[2].items[0].name` to reference the item returned by get_items
- Updated `$.slot` → `$[3].slot` to reference the scheduled time slot returned by get_time_slot
- No task logic or grader behavior changed

### low-calorie-order
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.restaurants[0].id` → `$[1].restaurants[0].id` to reference the healthy restaurant returned by get_restaurants
- Updated `$.items[*].name` → `$[2].items[*].name` to reference the low-calorie items returned by get_items
- No task logic or grader behavior changed

### like-based-order
- Fixed Meta feedback by adding explicit expected-state indices
- Updated `$.address.id` → `$[0].address.id` to reference the delivery address returned by get_user_address
- Updated `$.items[*].name` → `$[1].items[*].name` to reference the liked items returned by get_items
- No task logic or grader behavior changed
