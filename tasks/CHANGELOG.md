# DashDoor Tasks Changelog

This changelog tracks changes made to `tasks/dashdoor.csv`.

## Table of Contents

1. [January 16-20, 2026](#january-16-20-2026)
2. [December 28, 2025](#december-28-2025)
3. [December 23, 2025](#december-23-2025)
4. [Initial Release](#initial-release)

---

## January 16-20, 2026

This release addresses issues with ambiguous prompts, incorrect restaurant/item references, operator mismatches, and grader configuration fixes across multiple task templates.

### Summary of Changes

| Category | Description |
|----------|-------------|
| **Prompt Clarity** | Replaced ambiguous terms like "best" and "most liked" with explicit criteria ("highest rated", "cheapest") |
| **Restaurant/Item Fixes** | Updated restaurant names and items to match available data |
| **Address Fixes** | Corrected address types (apartment, house, office, other) to match user profiles |
| **Operator Updates** | Changed from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS`/`JSON_PART_OF` for flexible matching |
| **Grader Enhancements** | Added `get_modifications` function calls to verify required modifications |
| **Phone Number Format** | Removed dashes from phone numbers to match input field requirements |
| **Delivery Option Fixes** | Changed "priority delivery" to "express delivery" to match UI terminology |

---

### Individual Task Changes

#### `nearest-cheapest-choice-001`

**Changes:**
- Updated task statement to specify ordering from "the nearest Ethiopian restaurant that has both items on the menu"
- Added `get_restaurants` function to find nearest Ethiopian restaurant
- Added `restaurant_id` parameter to `get_items` function
- Updated `paths_to_expected` index from `$[1]` to `$[2]` for item verification

**Rationale:** The original prompt was ambiguous about which restaurant to order from. Updated to choose from an Ethiopian restaurant for accurate results and included instruction to choose from a restaurant that has both items on the menu to avoid ambiguity.

---

#### `nearest-cheapest-choice-003`

**Changes:**
- Changed restaurant cuisine from "Seafood" to "Pizza"
- Changed items from "Calamari or Ceviche" to "Cheese Pizza or Pepperoni Pizza"
- Updated grader filters and keywords accordingly

**Rationale:** Two restaurants (Lucky's Fish Market and The Crown Crab Shack) were equally close, causing non-deterministic results. Updated to order pizza items from the nearest Pizza restaurant to avoid confusion.

---

#### `nearest-cheapest-choice-004`

**Changes:**
- Changed restaurant cuisine from "Sandwiches" to "Italian"
- Added "that has both Sweet Potato Wedges and Mini Cheeseburger Sliders on the menu" to task statement
- Updated grader cuisine filter from "Sandwiches" to "Italian"

**Rationale:** The two closest sandwich restaurants did not have the specified items on their menus. Changed to Italian cuisine which has a restaurant with both items available.

---

#### `nearest-cheapest-choice-005`

**Changes:**
- Added "Order from the nearest Mexican restaurant that has both items on the menu" to task statement
- Changed delivery address from "office" to "house"
- Added `get_restaurants` function to find nearest Mexican restaurant
- Added `restaurant_id` parameter to `get_items` function
- Updated `paths_to_expected` index from `$[1]` to `$[2]`

**Rationale:** The user in this task doesn't have an office address. Changed to house address and specified Mexican restaurant to ensure both items are available.

---

#### `nearest-cheapest-choice-006`

**Changes:**
- Changed restaurant cuisine from "Salads" to "Mexican"
- Changed items from "Custom Salad or Bottled Water" to "Smoked Brisket Street Tacos or Bourbon Glazed Pork Tenderloin"
- Changed assertion path from `$.items[0].id` to `$.items[0].name`
- Updated all grader keywords and filters

**Rationale:** No one would realistically order "either a custom salad or a bottled water, depending on which is cheaper." Updated prompt to reflect real human ordering choices with comparable menu items.

---

#### `nearest-cheapest-choice-007`

**Changes:**
- Changed items from "Mini Cheeseburger or Cheeseburger" to "Truffle Smash Burger or Bacon Cheeseburger"
- Changed delivery address from "other" to "apartment"
- Updated grader keywords accordingly

**Rationale:** The user in this task doesn't have an "other" address type. Updated address to apartment and changed items to avoid ambiguity.

---

#### `new-cheapest-restaurant-001`

**Changes:**
- Changed task statement from "Help me find the best cheapest vegan or vegetarian restaurant option that I have not ordered from in the past" to "Help me find vegan or vegetarian restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."

**Rationale:** "Best cheapest" is ambiguous. Updated to explicit filtering instructions ("lowest price filter") and explicit selection criteria ("highest rated").

---

#### `new-cheapest-restaurant-002`

**Changes:**
- Changed task statement from "Help me find the best cheapest Steakhouse or Thai restaurant option..." to "Help me find Steakhouse or Thai restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."

**Rationale:** Same as above - replaced ambiguous "best cheapest" with explicit criteria.

---

#### `new-cheapest-restaurant-003`

**Changes:**
- Changed task statement from "Help me find the best cheapest Chinese or Breakfast & Brunch restaurant option..." to "Help me find Chinese or Japanese restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."
- Changed cuisine filter from "Breakfast & Brunch" to "Japanese" in grader config

**Rationale:** "Breakfast & Brunch" cuisine doesn't have filterable restaurants. Changed to Japanese cuisine which has available options.

---

#### `new-cheapest-restaurant-004`

**Changes:**
- Changed task statement from "Help me find the best cheapest Middle Eastern or American restaurant option..." to "Help me find Middle Eastern or American restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."

**Rationale:** Replaced ambiguous "best cheapest" with explicit filtering and selection criteria.

---

#### `new-cheapest-restaurant-005`

**Changes:**
- Changed task statement from "Help me find the best cheapest Breakfast & Brunch or Ethiopian restaurant option..." to "Help me find Mexican or Spanish restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."
- Changed cuisine filters from "Ethiopian, Breakfast & Brunch" to "Mexican, Spanish" in grader config

**Rationale:** "Breakfast & Brunch" and "Ethiopian" cuisines didn't have matching restaurants. Changed to Mexican and Spanish cuisines.

---

#### `new-cheapest-restaurant-006`

**Changes:**
- Changed task statement from "Help me find the best cheapest Korean or Middle Eastern restaurant option..." to "Help me find Korean or Middle Eastern restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."

**Rationale:** Replaced ambiguous "best cheapest" with explicit criteria.

---

#### `new-cheapest-restaurant-007`

**Changes:**
- Changed task statement from "Help me find the best cheapest Seafood or Chinese restaurant option..." to "Help me find Seafood or Chinese restaurants. Apply the lowest price filter possible and find the highest rated restaurant that I've not ordered from before."

**Rationale:** Replaced ambiguous "best cheapest" with explicit criteria.

---

#### `express-nearest-order-004`

**Changes:**
- Changed grader operator from `STRING_EQUALS` to `JSON_CONTAINS` and added `JSON_PART_OF` assertion
- Added second item path (`$[3].items[1].name`) to expected paths

**Rationale:** Updated grader config to accurately verify multiple items in the order.

---

#### `express-nearest-order-006`

**Changes:**
- Changed "priority delivery" to "express delivery" in task statement
- Changed delivery address from "hotel" to "apartment"
- Updated grader address type from "hotel" to "apartment"

**Rationale:** There is no "priority delivery" option in the UI - only "express" exists. Also, the user doesn't have a hotel address. Updated to use express delivery and apartment address to match UI and user profile.

---

#### `express-nearest-order-007`

**Changes:**
- Changed "priority delivery" to "express delivery" in task statement

**Rationale:** "Priority delivery" doesn't exist in the UI. Updated to use "express delivery" to match available options.

---

#### `cheapest-item-filter-001`

**Changes:**
- Changed excluded restaurant from "desserts table" to "burgers pantry"

**Rationale:** Two restaurants serve cauliflower tacos at the same cheapest price. Updated the excluded restaurant to make the result deterministic.

---

#### `cheapest-item-filter-004`

**Changes:**
- Changed item from "Seaweed Salad" to "green chile turkey burger"
- Changed excluded restaurant from "Saigon Vietnamese Cafe" to "Urban Habesha Kitchen"
- Updated grader keywords and restaurant name filter

**Rationale:** Multiple dishes existed at the cheapest price. Changed to a different item to ensure deterministic results.

---

#### `best-deal-order-002`

**Changes:**
- Complete task statement rewrite: "I need to place an order at my office address with Express delivery. Filter restaurants with deals and apply the lowest price filter possible and from the results pick the highest rated (for ties prefer one with more reviews). Order 2 Entrees, 2 Sides, and 2 Drinks. Apply the first deal listed in the Deals & Benefits section on the restaurant page while checking out."
- Added Express delivery verification assertion
- Added multiple category assertions for Entrees, Sides, and Drinks (using `JSON_CONTAINS`)
- Added `get_menu_categories` functions for Entrees, Sides, and Drinks

**Rationale:** "Cheapest restaurants" and "best one" were ambiguous with no clear indicators. Updated with explicit filters, tie-breaker logic, specific order quantities, and explicit deal application instructions.

---

#### `best-deal-order-004`

**Changes:**
- Changed task statement from "Look for cheapest restaurants with deals and pick the best one. Order enough Entrees..." to "Filter restaurants with deals and apply the lowest price filter possible and from the results pick the highest rated (for ties prefer one with more reviews). Order 2 Entrees, 2 Sides, and 2 Drinks. Apply the first deal listed in the Deals & Benefits section..."
- Added additional category assertions for Sides and Drinks
- Added `get_menu_categories` functions for Sides and Drinks

**Rationale:** Same as best-deal-order-002 - replaced ambiguous criteria with explicit filtering and ordering instructions.

---

#### `best-deal-order-005`

**Changes:**
- Complete task statement rewrite: "I need to place an order at my office address with Express delivery from Mike's Pastry. Order 4 Cappuccino and 1 Chocolate Dipped Cannoli. Apply the deal listed in the Deals & Benefits section on the restaurant page while checking out."
- Changed from dynamic restaurant selection to specific restaurant (Mike's Pastry)
- Added Express delivery verification
- Added specific item quantity assertions (Cappuccino == 4, Chocolate Dipped Cannoli == 1)
- Changed expected deal ID to hardcoded value "mikes-pastry-free-delivery-153"
- Removed dynamic `get_restaurants` and `get_menu_categories` functions

**Rationale:** The original dynamic approach was too ambiguous. Changed to order specific items from a specific restaurant to ensure deterministic and verifiable results.

---

#### `best-deal-order-006`

**Changes:**
- Changed task statement from "Look for cheapest restaurants with deals and pick the best one. Order enough Entrees to meet the spending limit..." to "Filter restaurants with deals and apply the lowest price filter possible and from the results pick the highest rated (for ties prefer one with more reviews). Order enough Entrees to meet the deal minimum. Apply the first deal listed..."
- Reordered assertions (storeId check before menuCategoryId)
- Changed operator from `STRING_EQUALS` to `JSON_CONTAINS` for category verification

**Rationale:** Replaced ambiguous "cheapest" and "best" criteria with explicit filtering and tie-breaker instructions.

---

#### `best-deal-order-007`

**Changes:**
- Changed from "Order enough Drinks" to "Order enough Sides to meet the deal minimum"
- Changed `get_menu_categories` keyword from "Drinks" to "Sides"
- Reordered assertions and changed operator to `JSON_CONTAINS`

**Rationale:** Updated to order from Sides category and added explicit filtering instructions.

---

#### `bulk-simple-order-001`

**Changes:**
- Changed restaurant from "cedar kitchen" to "Golden Smokehouse"
- Changed "order 2 of the cheapest available drinks" to "order 2 units of the cheapest available drink"
- Updated grader restaurant name filter

**Rationale:** The previous restaurant name didn't match. Updated to Golden Smokehouse and clarified "2 units of the same drink" vs "2 different drinks."

---

#### `bulk-simple-order-002`

**Changes:**
- Changed "order 3 of the cheapest available Shakes & Beverages" to "order 3 units of the cheapest available Shake & Beverage (other then water)"
- Changed phone number from "411-979-8317" to "4119798317" (removed dashes)

**Rationale:** Phone number field doesn't accept dashes. Updated to use digits only and clarified to order 3 units of the same item.

---

#### `bulk-simple-order-003`

**Changes:**
- Changed "order 1 of the cheapest available Beverages" to "order 1 unit of the cheapest available Beverage"
- Changed phone number from "938-554-6602" to "9385546602" (removed dashes)

**Rationale:** Phone number format doesn't allow dashes. Updated format and clarified item ordering.

---

#### `bulk-simple-order-004`

**Changes:**
- Changed "order 1 of the cheapest available Sides & Drinks" to "order 1 unit of the cheapest available Sides & Drinks"
- Changed phone number from "547-752-7254" to "5477527254" (removed dashes)

**Rationale:** Phone number field requires digits only. Updated format for consistency.

---

#### `bulk-simple-order-007`

**Changes:**
- Changed "order 2 of the cheapest available Appetizers" to "order 2 units of the cheapest available Appetizer"
- Changed phone number from "948-272-5378" to "9482725378" (removed dashes)

**Rationale:** Cheapest beverage was Lemonade but grader expected different items. Updated to clarify ordering 2 units of the same appetizer and fixed phone format.

---

#### `lowest-calorie-dessert-002`

**Changes:**
- Changed "Find the best Italian restaurant" to "Find the highest rated Italian restaurant near my hotel address"

**Rationale:** "Best" is subjective. Changed to explicit "highest rated" criterion.

---

#### `lowest-calorie-dessert-003`

**Changes:**
- Changed "Find the best Fast Food restaurant near my other" to "Find the highest rated Fast Food restaurant near my address labelled other"

**Rationale:** "Best" is subjective and "my other" was unclear. Changed to explicit "highest rated" and clarified address reference.

---

#### `lowest-calorie-dessert-005`

**Changes:**
- Changed "Find the best American restaurant" to "Find the highest rated American restaurant"
- Fixed grader path from `$.items[0].modifications[0].options[?(@.optionName == 'Chicken')]` to `$.items[*].modifications[0].options[?(@.optionName == 'Chicken')]`

**Rationale:** Changed "best" to explicit "highest rated." Fixed assertion path to check modifications on any item, not just the first.

---

#### `lowest-calorie-dessert-007`

**Changes:**
- Changed "Find the best Thai restaurant" to "Find the highest rated Thai restaurant"
- Fixed grader path from `$.items[0].modifications...` to `$.items[*].modifications...`

**Rationale:** Changed "best" to "highest rated" and fixed assertion to check all items for modifications.

---

#### `lowest-calorie-dessert-008`

**Changes:**
- Changed "Find the best American restaurant" to "Find the highest rated American restaurant"
- Fixed grader path from `$.items[0].modifications...` to `$.items[*].modifications...` for Ice Cream option

**Rationale:** Same changes as other lowest-calorie-dessert tasks for consistency.

---

#### `helpful-review-items-001`

**Changes:**
- Changed task statement from "Somebody recommended Mediterranean Kitchen to me, could you go through the reviews and find the review that people found the most helpful and add the liked items from it to my cart" to "Somebody recommended Mediterranean Kitchen to me. Could you check the reviews and find the most helpful one that includes liked items, then add those items to my cart? If any required modifications exist, choose the cheapest options."
- Changed user in simulator config from "lena.bennett71@example.com" to "yuna.nguyen18@mail.test"
- Added assertion to verify applied modification option ID
- Added `get_modifications` function to expected state functions

**Rationale:** Updated prompt to clarify selecting a review that has liked items and handling mandatory modifications. Changed user to ensure Mediterranean Kitchen exists nearby.

---

#### `helpful-review-items-002`

**Changes:**
- Changed task statement to match new format: "Somebody recommended Salads House to me. Could you check the reviews and find the most helpful one that includes liked items, then add those items to my cart? If any required modifications exist, choose the cheapest options."
- Added assertion for modification option ID verification
- Added `get_modifications` function call

**Rationale:** Most helpful review didn't list items. Updated to select reviews with liked items and verify mandatory add-ons.

---

#### `helpful-review-items-003`

**Changes:**
- Changed task statement to new format with modification instructions
- Added modification verification assertion
- Added `get_modifications` function call

**Rationale:** The restaurant was replaced with Maple Market because Portland Grill & Bar's most helpful review didn't have liked items. Added modification handling instructions.

---

#### `helpful-review-items-004`

**Changes:**
- Changed task statement from "...and add the liked items from it to my cart" to "...find the most helpful one that includes liked items, then add those items to my cart? If any required modifications exist, choose the cheapest options."
- Added modification verification assertion
- Added `get_modifications` function call

**Rationale:** Added instructions for selecting cheapest add-on when mandatory modifications exist.

---

#### `helpful-review-items-006`

**Changes:**
- Changed restaurant from "Fiona's Tavern" to "Willow's Table" throughout task and grader
- Changed task statement to new format with modification handling
- Added modification verification assertion
- Added `get_modifications` function call

**Rationale:** Fiona's Tavern didn't have reviews with liked items. Replaced with Willow's Table which has the required review data.

---

#### `helpful-review-items-007`

**Changes:**
- Changed task statement to new format (note: Gavin's with special apostrophe character)
- Added modification verification assertion
- Added `get_modifications` function call

**Rationale:** Updated to clarify selecting reviews with liked items and handling mandatory modifications.

---

#### `helpful-review-items-008`

**Changes:**
- Added "If there are required modifications, then apply the cheapest" to task statement
- Added modification verification assertion
- Added `get_modifications` function call

**Rationale:** Added modification handling for consistency with other helpful-review-items tasks.

---

#### `cheapest-rated-slices-002`

**Changes:**
- Changed "Order two of the cheapest Desserts available" to "Order two different dessert items with the lowest prices"

**Rationale:** "Two of the cheapest Desserts" was ambiguous (could mean 2 of the same item). Clarified to order two different items.

---

#### `cheapest-rated-slices-004`

**Changes:**
- Changed "Vegan restaurants near my new hotel" to "Italian restaurants near my hotel"
- Changed "two of the cheapest Beverages" to "two different classic pastas with the lowest prices"
- Changed cuisine filter from "Vegan" to "Italian"
- Changed menu category from "Beverages" to "classic pastas"

**Rationale:** Vegan restaurants didn't have the expected beverages. Changed to Italian restaurants with classic pastas.

---

#### `cheapest-rated-slices-005`

**Changes:**
- Changed "Order two of the cheapest Beverages available" to "Order two different pho with the lowest prices"
- Changed menu category filter from "Beverages" to "Pho"

**Rationale:** "Two of the cheapest Beverages" was not the same as "two cheapest beverages." Clarified intent and changed category to Pho.

---

#### `cheapest-liked-combo-001`

**Changes:**
- Changed "Order the cheapest and most liked one of the classic pizzas" to "Order the cheapest classic pizzas"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`
- Updated paths_to_expected to include both item references

**Rationale:** "Cheapest" and "most liked" are two different conditions that cannot be satisfied simultaneously. Removed "most liked" for clarity.

---

#### `cheapest-liked-combo-002`

**Changes:**
- Changed "Order the cheapest and most liked one of the Starters" to "Order the cheapest Starters"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Same as cheapest-liked-combo-001 - removed ambiguous "most liked" criterion.

---

#### `cheapest-liked-combo-003`

**Changes:**
- Changed "Order the cheapest and most liked one of the Sides" to "Order the cheapest Sides"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Removed conflicting "most liked" condition.

---

#### `cheapest-liked-combo-004`

**Changes:**
- Changed "Order the cheapest and most liked one of the Bakery & Drinks" to "Order the cheapest Bakery & Drinks in Lemon flavour"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Removed "most liked" and added "Lemon flavour" qualifier to ensure deterministic item selection.

---

#### `cheapest-liked-combo-005`

**Changes:**
- Changed "Order the cheapest and most liked one of the Starters" to "Order the cheapest Starters"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`
- Note: Minor syntax issue with extra comma in diff

**Rationale:** Removed conflicting "most liked" condition.

---

#### `cheapest-liked-combo-006`

**Changes:**
- Changed "Order the cheapest and most liked one of the Sides & Shares" to "Order the cheapest Sides & Shares"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Removed conflicting "most liked" condition.

---

#### `cheapest-liked-combo-007`

**Changes:**
- Changed "Order the cheapest and most liked one of the Sides & Shares" to "Order the cheapest Sides & Shares"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Removed conflicting "most liked" condition.

---

#### `cheapest-liked-combo-008`

**Changes:**
- Changed "Order the cheapest and most liked one of the Beverages" to "Order the cheapest of the Beverages"
- Changed operators from `ARRAY_STRING_CONTAINS` to `JSON_CONTAINS` and `JSON_PART_OF`

**Rationale:** Removed conflicting "most liked" condition.

---

#### `gift-coffee-order-001`

**Changes:**
- Changed "Find the best coffee place near that address" to "Find a coffee place near that address"

**Rationale:** Removed subjective "best" to avoid ambiguity. The task now simply requires finding any coffee place that has iced coffee.

---

#### `gift-coffee-order-002`

**Changes:**
- Changed "hotel address" to "other address"
- Changed "Find the best Chicken place near that address" to "Find a restaurant near that address"
- Updated grader address type from "hotel" to "other"

**Rationale:** Removed subjective "best" and updated address type since user profile has "other" not "hotel."

---

#### `gift-coffee-order-003`

**Changes:**
- Changed "Find the best Pizza place near that address that has Calamari Fritti" to "Order 2 Calamari Fritti from restaurant Famous Ristorante because they have the best taste ever"

**Rationale:** Made the task more specific by naming the exact restaurant to order from, removing the need for subjective "best" determination.

---

#### `gift-coffee-order-005`

**Changes:**
- Changed item from "Charred Broccoli Grain Bowl" to "original cheesecake"
- Changed "Find the best American place near that address that has Charred Broccoli Grain Bowl with Chili Oil" to "Find a restaurant near that address that has original cheesecake"
- Updated grader item_keyword and keywords
- Removed the Chili Oil modification requirement and `get_modifications` function

**Rationale:** Store ID was different from expected. Updated to order a simpler item (original cheesecake) without modifications.

---

#### `list-affordable-cuisine-001`

**Changes:**
- Changed "Tell me the top 3 most affordable restaurant names that are nearest to me" to "Apply the lowest price filters possible ($, $$, etc) and tell me 3 restaurant names that are nearest to me. A lower price rating is more important than the restaurant being closer."

**Rationale:** "Most affordable" was ambiguous with no clear indicator of how cheap a restaurant is. Updated to use explicit price filter instructions.

---

#### `list-affordable-cuisine-002`

**Changes:**
- Changed from "top 5 most affordable restaurant names" to "Apply the lowest price filters possible ($, $$, etc) and tell me 5 restaurant names that are nearest to me. A lower price rating is more important than the restaurant being closer."

**Rationale:** Same as list-affordable-cuisine-001 - replaced ambiguous criteria.

---

#### `list-affordable-cuisine-003`

**Changes:**
- Same pattern - replaced "most affordable" with explicit price filter instructions

**Rationale:** Same as above.

---

#### `list-affordable-cuisine-005`

**Changes:**
- Changed cuisine from "Burgers" to "Thai" in task statement and grader
- Replaced "most affordable" with explicit price filter instructions

**Rationale:** Updated cuisine type and clarified filtering criteria.

---

#### `list-affordable-cuisine-007`

**Changes:**
- Changed cuisine from "Burgers" to "Mexican" in task statement and grader
- Replaced "most affordable" with explicit price filter instructions

**Rationale:** Updated cuisine type and clarified filtering criteria.

---

#### `nearest-coffee-cart-007`

**Changes:**
- Changed task statement from "Look for the nearest coffee shop and add a Bagel with Cream Cheese to my cart" to "Look for the nearest coffee shop that has Buttermilk Pancakes and add Buttermilk Pancakes to my cart"
- Updated grader item_keyword and keywords from "Bagel with Cream Cheese" to "Buttermilk Pancakes"

**Rationale:** The nearest coffee shop didn't have Bagel with Cream Cheese. Changed to Buttermilk Pancakes and specified that the coffee shop must have the item.

---

#### `item-with-sauce-001`

**Changes:**
- Changed restaurant from "sushi pantry" to "Maple House" in task statement and grader

**Rationale:** Updated to a restaurant that actually has the specified item with the sauce option available.

---

#### `list-rated-restaurants-001`

**Changes:**
- Changed "Find and list authentic Vietnamese restaurants" to "Search for Vietnamese restaurants"
- Changed rating requirement from "4 or higher" to "4.5 or higher"
- Updated grader instruction to reference 4.5 rating threshold

**Rationale:** Removed subjective "authentic" term and updated rating threshold to ensure no restaurants satisfy all criteria (the expected answer is that none exist).

---

#### `find-matching-restaurant-005`

**Changes:**
- Added "Pick the closest one if there is more than one with the highest rating" to task statement
- Added distance sort (ascending) to grader's sort_type array

**Rationale:** Multiple restaurants had the same highest rating. Added distance as a tie-breaker criterion.

---

#### `healthy-fixed-order-004`

**Changes:**
- Complete task rewrite:
  - Changed from "Go to featured section and find restaurant Evergreen Market" to "Go to breakfast section and find restaurant Shake Shack"
  - Changed items from "2 Cold Brew Horchata, 2 Smoked Salmon Tartine, 1 DashPass Pasta Night" to "1 Double ShackBurger (make sure no customizations are applied) and a bottled water"
- Updated grader to expect 2 items instead of 3
- Updated all item name references and quantities
- Changed restaurant in grader from "Evergreen Market" to "Shake Shack"

**Rationale:** Evergreen Market didn't exist in the user's profile/section. Changed to Shake Shack in the breakfast section with available items.

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
