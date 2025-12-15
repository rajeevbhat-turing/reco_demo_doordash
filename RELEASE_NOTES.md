# Release Notes

##  December 15, 2025

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
- **135 Tested Tasks** — New batch of verified tasks added
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
- **Empty Menu Categoriesf** — Hidden menu categories with no items in restaurant detail pages
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