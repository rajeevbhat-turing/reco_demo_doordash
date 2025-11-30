# DashDoor E2E Test Suite

Comprehensive end-to-end test suite using Playwright for the DashDoor application.

## Test Coverage

### 1. Authentication Tests (`tests/auth/`)
- **Signup** (`signup.spec.ts`) - User registration flow with OTP verification
- **Signin** (`login.spec.ts`) - Login flow with email and OTP

### 2. Address Tests (`tests/address/`)
- Guest address entry
- Authenticated user address management
- Address types (house, apartment, business)
- Delivery instructions
- Address labels

### 3. Store Tests (`tests/store/`)
- Store listing on home page
- Store page navigation
- Menu browsing and categories
- Item details and modifications
- Add to cart functionality
- Store search and filtering
- Multiple store compatibility testing

### 4. Reviews Tests (`tests/reviews/`)
- Reviews page display
- Review cards content
- Customer photos
- Helpful ratings
- Adding new reviews
- Review from orders page

### 5. Reorder Tests (`tests/reorder/`)
- Reorder button display
- Navigation and cart population
- Order item preservation
- Cart modifications during reorder

### 6. Checkout Tests (`tests/checkout/`)
- Checkout page access
- Authentication during checkout
- Delivery options (express, standard, scheduled)
- Payment method management
- Order summary and totals
- Place order flow
- Order confirmation

## Running Tests

### Prerequisites
1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

### Run All Tests
```bash
# Run all tests with HTML report
npm run test:e2e

# Or directly with npx
npx playwright test --config=e2e/playwright.config.ts
```

### Run Specific Test Suites
```bash
# Authentication tests
npx playwright test tests/auth/ --config=e2e/playwright.config.ts

# Store tests
npx playwright test tests/store/ --config=e2e/playwright.config.ts

# Checkout tests
npx playwright test tests/checkout/ --config=e2e/playwright.config.ts

# Reviews tests
npx playwright test tests/reviews/ --config=e2e/playwright.config.ts

# Reorder tests
npx playwright test tests/reorder/ --config=e2e/playwright.config.ts

# Address tests
npx playwright test tests/address/ --config=e2e/playwright.config.ts
```

### Run in Different Browsers
```bash
# Chromium only
npx playwright test --project=chromium --config=e2e/playwright.config.ts

# Firefox only
npx playwright test --project=firefox --config=e2e/playwright.config.ts

# WebKit (Safari)
npx playwright test --project=webkit --config=e2e/playwright.config.ts

# Mobile Chrome
npx playwright test --project="Mobile Chrome" --config=e2e/playwright.config.ts
```

### Debug Mode
```bash
# Run with UI mode
npx playwright test --ui --config=e2e/playwright.config.ts

# Run headed (visible browser)
npx playwright test --headed --config=e2e/playwright.config.ts

# Debug specific test
npx playwright test tests/auth/login.spec.ts --debug --config=e2e/playwright.config.ts
```

## Viewing Reports

After running tests, view the HTML report:
```bash
npx playwright show-report playwright-report
```

Reports are also available at:
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

## Project Structure

```
e2e/
├── fixtures/           # Test fixtures for dependency injection
│   ├── auth.fixtures.ts
│   └── test.fixtures.ts
├── page-objects/       # Page Object Models
│   ├── base.page.ts
│   ├── auth.page.ts
│   ├── auth-modal.page.ts
│   ├── home.page.ts
│   ├── store.page.ts
│   ├── checkout.page.ts
│   ├── orders.page.ts
│   ├── reviews.page.ts
│   ├── address.page.ts
│   └── index.ts
├── tests/              # Test specs
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── signup.spec.ts
│   ├── address/
│   │   └── address.spec.ts
│   ├── store/
│   │   └── store.spec.ts
│   ├── reviews/
│   │   └── reviews.spec.ts
│   ├── reorder/
│   │   └── reorder.spec.ts
│   └── checkout/
│       └── checkout.spec.ts
├── utils/              # Test utilities
│   └── test-helpers.ts
├── test-credentials.ts # Test user credentials
└── playwright.config.ts
```

## Test Credentials

Test credentials are defined in `test-credentials.ts`. For development:
- OTP verification accepts any 6-digit code
- New user signup creates users in local storage

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Automatic dev server startup
- Screenshot and video capture on failure
- Trace collection for debugging
- Multiple reporter formats (HTML, JSON, JUnit)

## Writing New Tests

1. Create a new spec file in the appropriate `tests/` subdirectory
2. Import fixtures from `fixtures/test.fixtures.ts`
3. Use page objects for element interactions
4. Add `@playwright-report` annotation for documentation

Example:
```typescript
import { test, expect } from '../../fixtures/test.fixtures';

/**
 * Feature E2E Tests
 * @playwright-report
 */
test.describe('Feature Name', () => {
  test('should do something', async ({ storePage, page }) => {
    await storePage.gotoStore('mcdonalds');
    // ... test logic
  });
});
```

## CI/CD Integration

The configuration supports CI environments:
- GitHub Actions reporter enabled in CI
- JUnit XML output for test result integration
- Automatic retry on failure in CI mode
- Screenshots and videos preserved for failed tests
