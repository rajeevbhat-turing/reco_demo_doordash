# Orders E2E Tests

This folder contains end-to-end tests for the complete order placement flow.

## Test Files

### `orders.spec.ts` - Main Order Flow ✅ PASSING
The primary E2E test covering the complete user journey:
1. **User Authentication** - Sign up a new user
2. **Address & Payment Setup** - Configure user with default address and payment method
3. **Store Navigation** - Navigate to Salads House (store 83, within delivery range)
4. **Item Selection** - Open menu item dialog, select modifications (sides, spice level)
5. **Quantity Adjustment** - Increase item quantity
6. **Add to Cart** - Add customized item to cart
7. **Checkout Process** - Navigate to checkout via cart drawer
8. **Place Order** - Complete the order placement
9. **Order Confirmation** - Verify confirmation modal with order details
10. **Review Submission** - Navigate to orders page and leave a 5-star review

### `orders-outside-delivery.spec.ts` - Outside Delivery Area Flow
Tests ordering from a store outside the user's delivery area (store 1):
- Handles the "address outside delivery area" modal
- Verifies the user can still proceed to checkout

## Running the Tests

### Prerequisites
```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers (if not already installed)
npx playwright install
```

### Run All Order Tests
```bash
# Run in headless mode
npm run test:e2e -- --grep "Orders"

# Or run specific file
npx playwright test e2e/tests/orders/orders.spec.ts
```

### Run in Debug Mode (with Playwright Inspector)
```bash
# Debug mode with step-by-step execution
npm run debug:chromium orders.spec

# Or using npx directly
npx playwright test e2e/tests/orders/orders.spec.ts --debug
```

### Run with UI Mode (Interactive)
```bash
npx playwright test e2e/tests/orders/orders.spec.ts --ui
```

### View HTML Report
After running tests, view the detailed HTML report:
```bash
npx playwright show-report e2e/playwright-report
```

## Test Configuration

- **Browser**: Chromium (default)
- **Base URL**: `http://localhost:3000`
- **Timeout**: Tests have extended timeouts for network operations
- **Store Used**: Store 83 (Salads House) - within delivery range

## Key Selectors Used

| Element | Selector |
|---------|----------|
| Menu Item Cards | `div.border.border-gray-200.rounded-lg.cursor-pointer:has(h3)` |
| Menu Item Dialog | `div.fixed.inset-0.z-50` |
| Checkbox Options | `button div.h-5.w-5.rounded.border-2` |
| Radio Options | `button div.h-5.w-5.rounded-full.border-2` |
| Place Order Button | `getByRole('button', { name: /place order/i }).first()` |
| Order Stars | `svg.lucide-star` |

## Test Duration
- Average run time: ~40-60 seconds
- Includes network waits and UI transitions

## Notes
- Test clears localStorage/sessionStorage before each run
- Payment method is set up via localStorage injection
- Hydration warnings may appear in console (does not affect test execution)

