# Next 5 Core E2E Test Flows

Based on the customer-facing website requirements, here are the recommended next 5 E2E test flows to implement:

## 1. **Home Page & Store Browsing** ⭐ High Priority
**File**: `e2e/tests/browse/home-browse.spec.ts`

**Test Cases**:
- Verify home page loads correctly
- Verify restaurant/store listings are displayed
- Test category filtering (food categories)
- Test search functionality
- Verify restaurant cards display correct information (name, rating, delivery time, etc.)
- Test clicking on a restaurant/store to view details
- Verify address selection/location is working
- Test filter options (price range, rating, delivery time, DashPass, etc.)

**Page Objects Needed**:
- `HomePage` - Home page interactions
- `StoreCard` - Store/restaurant card component
- `FilterOptions` - Filter sidebar/modal

**Key Selectors**:
- Restaurant cards: Look for store card components
- Category buttons: Food category navigation
- Search bar: Header search input
- Filter buttons: Filter options UI

---

## 2. **Sign Up Flow** ⭐ High Priority
**File**: `e2e/tests/auth/signup.spec.ts`

**Test Cases**:
- Complete new user registration
- Verify email validation
- Test password requirements
- Verify phone number validation (if applicable)
- Test OTP verification flow (if applicable)
- Verify redirect to home page after successful signup
- Test error handling for duplicate email
- Verify user can immediately login after signup

**Page Objects Needed**:
- Extend `AuthPage` with signup methods
- Or create `SignUpPage` if significantly different

**Key Selectors**:
- Sign up form inputs (name, email, password, phone)
- Sign up button
- OTP inputs (if applicable)

---

## 3. **Adding Items to Cart** ⭐ High Priority
**File**: `e2e/tests/cart/add-to-cart.spec.ts`

**Test Cases**:
- Navigate to a restaurant/store
- Browse menu items
- Add item to cart
- Verify cart count updates in header
- Add multiple items with different quantities
- Add items with customizations/modifications
- Verify cart sidebar opens and displays items correctly
- Test adding items from different restaurants (should show warning/separate carts)
- Verify item prices and totals are calculated correctly

**Page Objects Needed**:
- `StorePage` - Restaurant/store detail page
- `MenuDialog` - Menu item dialog/modal
- `CartSidebar` - Cart sidebar component
- `Header` - Header with cart button

**Key Selectors**:
- Menu item buttons/cards
- "Add to cart" buttons
- Cart sidebar toggle
- Cart item list
- Quantity controls (+/- buttons)

---

## 4. **Checkout Flow** ⭐ High Priority
**File**: `e2e/tests/checkout/checkout.spec.ts`

**Test Cases**:
- Navigate to checkout page with items in cart
- Verify cart items are displayed correctly
- Test address selection/editing
- Test delivery instructions input
- Verify order summary (subtotal, fees, tax, total)
- Test delivery time selection
- Verify payment method selection (if multiple options)
- Test checkout button functionality
- Verify navigation to payment page

**Page Objects Needed**:
- `CheckoutPage` - Checkout page interactions
- `AddressSelection` - Address selection modal/component
- `OrderSummary` - Order summary component

**Key Selectors**:
- Checkout page elements
- Address selector/dropdown
- Delivery instructions textarea
- Order summary section
- "Place Order" or "Continue to Payment" button

---

## 5. **Order History** ⭐ Medium Priority
**File**: `e2e/tests/orders/order-history.spec.ts`

**Test Cases**:
- Navigate to orders page (requires login)
- Verify past orders are displayed
- Test filtering orders (if available)
- Test clicking on an order to view details
- Verify order status is displayed correctly
- Test reorder functionality
- Verify order details (items, prices, address, etc.)
- Test order receipt view

**Page Objects Needed**:
- `OrdersPage` - Orders listing page
- `OrderDetails` - Order detail view/modal
- `ReorderButton` - Reorder functionality

**Key Selectors**:
- Orders list/table
- Order cards/items
- Order detail buttons
- Reorder buttons

---

## Additional Flows to Consider (After Core 5)

6. **Payment Flow (Mocked)** - Test payment form and mocked payment processing
7. **Reordering** - Complete reorder flow from order history
8. **Ratings & Reviews** - Submit and view reviews
9. **Cart Updates** - Modify quantities, remove items, clear cart
10. **Address Management** - Add, edit, delete addresses

---

## Implementation Notes

### Best Practices to Follow:
1. **Page Object Model**: Create reusable page objects for each major page/component
2. **Test Data**: Use test fixtures or factories for consistent test data
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Stable Selectors**: Use IDs, data-testid attributes, or semantic selectors
5. **Wait Strategies**: Use proper wait conditions instead of fixed timeouts
6. **Error Handling**: Test both happy paths and error scenarios

### Test Organization:
```
e2e/tests/
├── auth/
│   ├── login.spec.ts ✅ (Done)
│   └── signup.spec.ts (Next)
├── browse/
│   └── home-browse.spec.ts (Next)
├── cart/
│   └── add-to-cart.spec.ts (Next)
├── checkout/
│   └── checkout.spec.ts (Next)
└── orders/
    └── order-history.spec.ts (Next)
```

### Common Patterns:
- Use `test.beforeEach` for common setup (e.g., login)
- Create helper functions for common actions (e.g., `addItemToCart`)
- Use fixtures for authenticated sessions
- Create test data factories for consistent test data



