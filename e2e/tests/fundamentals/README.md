# Fundamentals Tests

Simple, basic E2E tests that focus on core functionality without deep edge case testing.

## What's Included

These tests are **light, fast, and forgiving** - they check that basic features work without getting into complex scenarios.

### Test Files

1. **01-auth.spec.ts** - Basic signup and login
2. **02-address.spec.ts** - Address entry and selection
3. **03-stores.spec.ts** - Store browsing and menu display
4. **04-reviews.spec.ts** - Review viewing
5. **05-reorder.spec.ts** - Orders page and reorder buttons
6. **06-checkout.spec.ts** - Cart and checkout basics

## Running Tests

```bash
# Run all fundamental tests (fast - Chromium only)
npx playwright test e2e/tests/fundamentals --config=e2e/playwright.config.ts --project=chromium

# Run a specific test file
npx playwright test e2e/tests/fundamentals/01-auth.spec.ts --config=e2e/playwright.config.ts --project=chromium

# Run with visible browser
npx playwright test e2e/tests/fundamentals --config=e2e/playwright.config.ts --project=chromium --headed

# Run with UI mode (interactive)
npx playwright test e2e/tests/fundamentals --config=e2e/playwright.config.ts --ui
```

## Characteristics

- ✅ **Happy path focused** - Only tests successful scenarios
- ✅ **Forgiving** - Uses `.catch(() => false)` to handle missing elements gracefully
- ✅ **Fast** - Minimal waits, only essential checks
- ✅ **Simple** - No complex setup or teardown
- ✅ **Realistic** - Tests actual user flows

## Expected Results

These tests should have a **much higher pass rate** than the comprehensive tests because they:
- Don't test error conditions
- Have lenient selectors
- Accept "missing" as ok for optional features
- Focus on "does it load" rather than "does every detail work"

## Next Steps

Once fundamentals are passing, use the comprehensive tests in `e2e/tests/auth`, `e2e/tests/store`, etc. to test edge cases and error handling.

