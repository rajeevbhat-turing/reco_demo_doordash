# Release Notes

## December 30, 2025

### 🥗 Dietary Preferences Expanded

#### New Restaurant Category Mappings
Expanded dietary filter coverage by adding more restaurant category mappings, significantly improving the number of restaurants matching each dietary preference:

| # | Filter | Restaurants | Status |
|---|--------|-------------|--------|
| 1 | Vegetarian | 84 | ✅ |
| 2 | Dairy-free | 80 | ✅ |
| 3 | Low-carb | 69 | ✅ |
| 4 | Nut-free | 64 | ✅ NEW |
| 5 | Vegan | 27 | ✅ |

**Key Update:** Added Nut-free as a new dietary filter option with 64 matching restaurants.

---

## December 28, 2025

### 🎯 Task System Updates

#### Task Distribution Restructured
Updated task distribution for `simulator_config`:

| Type | Task Count | Description |
|------|------------|-------------|
| **Auto-Login (Type A)** | 200 | `bootstrap_data` with `date`, `timezone`, and `user` — login instruction removed from task statement |
| **Login/Signup Flow (Type B)** | 6 | `bootstrap_data` with `date` and `timezone` only — login instruction retained for testing auth flows |

**Type A Tasks (200):** Use auto-login via `bootstrap_data.user` for streamlined testing
```json
"simulator_config": {
  "bootstrap_data": {
    "date": "2025-12-19T12:00:00-08:00",
    "timezone": "America/Los_Angeles",
    "user": "email@example.com"
  }
}
```

**Type B Tasks (6):** Test login/signup authentication flows without auto-login
```json
"simulator_config": {
  "bootstrap_data": {
    "date": "2025-12-19T12:00:00-08:00",
    "timezone": "America/Los_Angeles"
  }
}
```

#### Verifier Operator Replacements
Replaced `JSON_EQUALS` operator with more flexible alternatives:

| Before | After | Use Case |
|--------|-------|----------|
| `JSON_EQUALS` | `JSON_PART_OF` | Actual value is a subset of expected |
| `JSON_EQUALS` | `JSON_CONTAINS` | Expected value is contained within actual |

**Reason:** `JSON_EQUALS` requires exact matches which can be too strict. The new operators allow:
- `JSON_PART_OF`: Validates that actual state properties exist within expected state (partial match)
- `JSON_CONTAINS`: Validates that expected values are present in actual state (containment check)

#### Expected State Function Fix
Fixed `get_date_N_days_from_today` to use current date from `bootstrap_data` instead of system date:

| Before | After |
|--------|-------|
| Uses system date (`new Date()`) | Uses `bootstrap_data.date` from simulator config |

This ensures date-dependent assertions (e.g., scheduled orders, delivery times) match the simulated time context.

---

## December 23, 2025

### 🎨 UI Improvements

#### Food Descriptions Added to Menu Item Cards
Added menu item descriptions from the database to all relevant sections of the store page:
- Description is displayed above the item rating (Liked ratio) for better visual hierarchy
- Descriptions are limited to 2 lines with `line-clamp-2` to maintain consistent card heights
- Excluded from the Featured Items carousel to keep that section compact

**Files Modified:**
| File | Changes |
|------|---------|
| `app/store/[id]/page.tsx` | Added `item.description` rendering in Most Ordered section, Regular Menu Categories, and Search Results |
| `components/menu-item-dialog.tsx` | Added description display below item name in the menu item detail dialog |

#### Enhanced "Add to Cart" Button Visibility
Applied a stronger custom box-shadow to all "Add to cart" plus buttons for better visibility against any background color:
- **Before:** `shadow-md` (subtle, blends with white backgrounds)
- **After:** `shadow-[0_4px_14px_rgba(0,0,0,0.4)]` (distinctive, visible on any background)

**Files Modified:**
| File | Changes |
|------|---------|
| `app/store/[id]/page.tsx` | Updated shadow on plus buttons in Most Ordered gallery, Regular Menu Categories, and Search Results |
| `components/cart-sidebar.tsx` | Updated shadow on plus buttons for cart item thumbnails |
| `components/modals/deal-modal.tsx` | Updated shadow on plus buttons in the free items selection modal |

#### Pricing & Fees Modal Implementation
Made the "pricing & fees" text in the store page header clickable, opening a comprehensive ServiceFeesInfo modal with dynamic fee information:

**Modal Content Includes:**
- **Delivery Fee** — Dynamic based on restaurant's `isFreeDelivery` and `minDeliveryFee` settings
- **Service Fee** — Shows actual percentage (15%) and minimum ($4.99) from fee calculator, notes 10% increase for distances > 5 miles
- **Other Dashdoor Fees** — Express delivery fees ($2.99), regulatory fees
- **Menu Pricing** — Merchant pricing disclaimer

**Fee Structure (from `lib/utils/fee-calculator.ts`):**
- Service Fee: 15% of subtotal (minimum $4.99)
- Distance > 5 miles: +10% service fee
- Express Delivery: +$2.99 surcharge
- Distance-based delivery surcharges:
  - 0-2 miles: No surcharge
  - 2-5 miles: $0.50/mile
  - 5-10 miles: $0.75/mile
  - 10+ miles: $1.00/mile

**Files Modified:**
| File | Changes |
|------|---------|
| `app/store/[id]/page.tsx` | Added click handler to "pricing & fees" text, added state management for modal, passed restaurant data |
| `components/service-fees-info.tsx` | Updated to accept restaurant and category props, dynamically displays fee information from fee-calculator.ts |

#### Special Instructions Feature
Implemented a complete special instructions feature with a dedicated modal:

**Data Structure:**
```typescript
export interface SpecialInstructions {
  text: string;
  ifUnavailable: 'merchant_recommendation' | 'refund' | 'contact' | 'cancel';
}

export interface CartItem {
  // ... other fields
  specialInstructions?: SpecialInstructions;
}
```

**If Unavailable Options:**
- Go with merchant recommendation — Let the restaurant substitute
- Get a refund for the item — Refund if unavailable
- Contact me — Dasher contacts customer
- Cancel the entire order — Cancel if item unavailable

**UI/UX Details:**
- Modal uses React Portal to render outside parent DOM hierarchy
- Prevents event bubbling to avoid closing parent modals
- Menu item dialog becomes invisible while special instructions modal is open
- Instructions displayed with quotes in cart and order views

**Files Modified:**
| File | Changes |
|------|---------|
| `store/cart-store.ts` | Added `SpecialInstructions` interface with `text` and `ifUnavailable` fields to `CartItem` |
| `components/modals/special-instructions-modal.tsx` | New file — Modal component for entering special instructions |
| `components/menu-item-dialog.tsx` | Added "Preferences" section with button to open special instructions modal |
| `components/cart-sidebar.tsx` | Displays special instructions text for cart items |
| `app/checkout/page.tsx` | Displays special instructions in order summary, includes in order data |
| `app/orders/[orderId]/page.tsx` | Displays special instructions in order details |

---

### 🎯 Task System Updates

#### Duplicate Task IDs Fixed
Identified tasks with duplicate IDs in the task dataset. Each task now has a unique identifier assigned, ensuring proper task tracking and evaluation. The duplicate entries were detected and reassigned sequential IDs to maintain data integrity.

#### Duplicate Task Statements Fixed
Replaced duplicate tasks with unique ones. The task dataset now contains distinct task entries, eliminating redundancy and ensuring each task represents a unique test scenario.

#### Modification Path Mismatch Fixed
Corrected the JSON path references in the grader configuration for item-addon-order tasks:
- **path_to_actual:** Changed from `$.items[0].modifications[0].options[0].id` to `$.items[0].modifications[0].options[0].optionId` to correctly reference the option identifier in the cart items structure
- **paths_to_expected:** Changed from `$[3].modifications[0].options[0].id` to `$[3].modification.options[0].id` to align with the actual response structure returned by the expected state functions

#### Dynamic Modification Name
The `modification_name` parameter in the grader configuration is now dynamically determined on task generation based on the actual modification type from the database. Size-related options (Small, Medium, Large) correctly use "size" as the modification name, while other options use "add-ons". The existing tasks in `dashdoor.csv` have been updated with this fix.

#### Task ID Column Added
Added `task_id` as a dedicated first column in the CSV output for better task identification and tracking.

---

## December 19, 2025

### 🎯 Task System Updates

#### Bootstrap Data Configuration
All 200 tasks now include proper time simulation configuration:

- **Type A Tasks (60 tasks)**: Added base `bootstrap_data` with `date` and `timezone`
  ```json
  "simulator_config": {
    "bootstrap_data": {
      "date": "2025-12-19T12:00:00-08:00",
      "timezone": "America/Los_Angeles"
    }
  }
  ```

- **Type B Tasks (140 tasks)**: Added `bootstrap_data` with `date`, `timezone`, and `user` + removed login instruction from `task_statement`
  ```json
  "simulator_config": {
    "bootstrap_data": {
      "date": "2025-12-19T12:00:00-08:00",
      "timezone": "America/Los_Angeles",
      "user": "email@example.com"
    }
  }
  ```

#### Verifier Index Fixes
Updated 31 task verifiers to use explicit array indexing in JSONPath expressions:

| Metric | Count |
|--------|-------|
| Total Tasks Updated | 39 |
| Verifier Changes | 31 |
| No Changes Required | 8 |

**Key Changes:**
- All `paths_to_expected` now use explicit array indexing (e.g., `$.address.id` → `$[0].address.id`)
- Index `$[n]` references the nth expected state function result from `extract_states_config.expected_state_functions`

#### Operator Changes
Two tasks received operator updates for proper validation:
- `cheapest-liked-combo`: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`
- `healthy-fixed-order`: `JSON_EQUALS` → `ARRAY_STRING_CONTAINS`

These changes split single assertions with multiple paths into separate assertions for independent validation.

---

## December 15, 2025

### 🚀 New Features

#### Merchant Portal
- **Complete Merchant Portal Implementation** — Full-featured merchant portal with dashboard, orders management, menu editing, and analytics
- **Sign In/Sign Up Flow** — Implemented authentication with validation for merchant onboarding
- **Order Management** — Order simulation, status updates, order details UI, and real-time functionality
- **Menu Management** — Create/edit/delete menu items, categories, and modifiers with drag-and-drop reordering
- **Modifier System** — Day timing options, modifier tab UI, and modifier item management
- **Insights & Analytics** — Customer insights, sales insights, and review analytics with dynamic metrics
- **Store Settings** — Bank account settings, delivery requests, marketing pages, and store availability configuration
- **Multi-Store Support** — Store-scoped merchant data with searchable store dropdown and switching capability
- **Pagination** — Proper pagination for orders and other merchant pages

#### Consumer Platform
- **Saved Stores Page** — New page to view all saved/favorite restaurants
- **Search Query Params** — URL-based query params for search and filters for better shareability
- **Deal Display** — First deal now shown on restaurant cards
- **Cal Label** — Added calorie label in menu item dialog for clarity

#### Delivery Portal
- **Initial Delivery Portal** — First implementation of the delivery partner portal with documentation

#### Task System
- **Task Generation Script** — Automated script for generating tasks with template settings
- **200 Tested Tasks** — New batch of verified tasks added
- **Predefined Tasks** — System to ensure predefined tasks are always included
- **Template Improvements** — Multiple new templates with better DB awareness

---

### 🗄️ Database Updates

- Updated database with **594 restaurants**
- Fixed database categorization issues

---

### 🐛 Bug Fixes

#### Input Validation & Forms
- **Phone Number Input** — Fixed hard-restriction to `1 (XXX) XXX-XXXX` format; backspace now works correctly
- **Phone Number Validation** — Updated to require 10 digits by default
- **First/Last Name Validation** — Added proper error messages for name validation in merchant portal
- **Bank Account Validation** — Added maximum length validation for bank account numbers
- **ZIP Code Validation** — Implemented proper ZIP code format validation

#### Restaurant & Menu
- **Restaurant Closed Status** — Fixed restaurants showing as open after closing time
- **Empty Menu Categories** — Hidden menu categories with no items in restaurant detail pages
- **Menu Item Dialog Status** — Proper handling of restaurant status in menu item dialog
- **Add-on Required Handling** — Fixed case where add-on shows as required but prompt doesn't mention it
- **Required Modifications** — Fixed selection to handle correct number of required modifications

#### Cart & Checkout
- **Closed Restaurant Cart** — Prevented deal free items from being added when restaurant is closed
- **Restaurant Status in Cart** — Proper handling of restaurant status for cart items and checkout
- **Delivery Fee Calculation** — Updated based on minimum delivery fee and distance

#### Orders & Reviews
- **Order Confirmation Modal** — Fixed clicking outside modal not redirecting to home
- **Review Sorting** — Newly created reviews now appear at top (sorted by timestamp descending)
- **Helpful Reviews** — Enabled users to mark custom-added reviews as helpful
- **Order ID in Reviews** — Added order ID to review data for tracking

#### Search & Navigation
- **Search Efficiency** — Results now show without delays; search performance improved
- **Trailing Spaces** — Fixed trailing spaces in search returning different results
- **Back Navigation** — Added back navigation on change password and manage account pages
- **Under 30 Minutes Section** — Now guarantees delivery within 30 minutes as advertised

#### Scheduling
- **Scheduled Orders Status** — New status for scheduled orders with appropriate handling
- **Restaurant Closed Scheduling** — Proper handling of "schedule for later" when restaurant is closed

#### Other Fixes
- **Payment Card Template** — Ensured house address availability and expiry date is set well into the future for replace-payment-card
- **Menu File Upload** — Fixed file type handling for menu upload
- **OTP Security** — Removed console logging of generated OTP codes
- **Privacy Policy Link** — Removed non-functional privacy policy link
- **Closed Restaurant Visual** — Added clear visual indicator for closed restaurants
- **Reference Removal** — Removed mentions to the original site (DoorDash → DashDoor)

---

### 🔧 API & Verifiers

#### Expected State Functions
- Added `get_modifications` expected state functions
- Added `has_any_item_keywords` and `has_all_item_keywords` on `get_restaurants`
- Added `ratingXAndAbove` filter to `get_restaurants`
- Added `restaurantName` return field from `get_items`

#### Merchant API
- Created dedicated `merchant.db` for merchant portal
- Implemented merchant-specific APIs replacing user APIs
- Updated merchant to use DB path from `MERCHANT_LIBSQL_URL`
- Cleaned up unused merchant routes from user API

---

### 📚 Documentation

- Added comprehensive merchant portal documentation
- Added delivery portal documentation (`DELIVERY_README.md`)
- Updated task generation documentation (`TASKS_README.md`)
- Added merchant storage structure documentation
- Updated Dockerfiles to properly copy DB files
