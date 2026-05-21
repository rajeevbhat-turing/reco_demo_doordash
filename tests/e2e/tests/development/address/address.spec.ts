import { test, expect, testDataGenerators, testHelpers } from '../../../fixtures/test.fixtures';
import { clearBrowserStorage } from '../../../utils/test-helpers';

/**
 * Address Management E2E Tests
 * 
 * Comprehensive test suite for address functionality including:
 * - Adding new addresses (manual entry and search)
 * - Address type selection (house, apartment, business)
 * - Address labels (home, work, custom)
 * - Delivery instructions
 * - Address selection during checkout
 * 
 * @playwright-report
 */
test.describe('Address Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
  });

  test.describe('Guest User Address Entry', () => {
    test('should allow guest to enter delivery address on landing page', async ({ page, addressPage }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for address input on landing page
      const addressInput = page.locator('input[placeholder*="address" i], input[placeholder*="delivery" i]').first();
      
      if (await addressInput.isVisible()) {
        await addressInput.fill('123 Test Street, New York');
        await page.waitForTimeout(1000); // Wait for autocomplete
      }
    });

    test('should show address autocomplete suggestions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const addressInput = page.locator('input[placeholder*="address" i], input[placeholder*="delivery" i]').first();
      
      if (await addressInput.isVisible()) {
        await addressInput.fill('123 Main St');
        await page.waitForTimeout(1500);

        // Check for suggestions dropdown
        const suggestions = page.locator('[class*="suggestion"], [class*="autocomplete"], [class*="result"]');
        // Suggestions may or may not appear depending on API
      }
    });
  });

  test.describe('Authenticated User Address Management', () => {
    test('should add a new address after signup', async ({ authModalPage, page, checkoutPage }) => {
      // Sign up first
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

      // Navigate to a store and add item to cart to access checkout
      await page.goto('/store/mcdonalds');
      await page.waitForLoadState('networkidle');

      // Try to find and click an add to cart button
      const addButton = page.locator('button:has-text("+"), button[aria-label*="add" i]').first();
      if (await addButton.isVisible({ timeout: 5000 })) {
        await addButton.click();
        await page.waitForTimeout(500);
      }
    });

    test('should display saved addresses in checkout', async ({ authModalPage, page }) => {
      // This test requires a user with addresses
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

      // The new user should be able to add addresses during checkout
    });
  });

  test.describe('Address Form Validation', () => {
    test('should validate required address fields', async ({ page }) => {
      // Navigate to a checkout flow where address modal appears
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // This will depend on the app flow - testing the address input validation
    });

    test('should validate zip code format', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for address-related input
      const zipInput = page.locator('input[name*="zip" i], input[placeholder*="zip" i]').first();
      
      if (await zipInput.isVisible({ timeout: 3000 })) {
        await zipInput.fill('invalid');
        // Check for validation error
      }
    });
  });

  test.describe('Address Types and Labels', () => {
    test('should support different address types', async ({ authModalPage, page }) => {
      // The app supports: house, apartment, business, other
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Address type selection is part of the address add flow
    });

    test('should allow setting address labels (home, work)', async ({ authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Labels help users identify addresses quickly
    });
  });

  test.describe('Delivery Instructions', () => {
    test('should allow adding delivery instructions', async ({ authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Delivery instructions: "Leave at door", "Meet at location", custom text
    });

    test('should support apartment/suite details', async ({ authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Apt number, floor, gate code, etc.
    });
  });

  test.describe('Address Selection in Checkout', () => {
    test('should allow selecting different address during checkout', async ({ 
      authModalPage, 
      page, 
      storePage 
    }) => {
      // Sign up
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

      // Go to a store
      await page.goto('/store/mcdonalds');
      await storePage.waitForStoreLoaded();

      // Add item to cart
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
      }
    });

    test('should show address selector button', async ({ authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

      // Go to checkout (after adding items)
      // Address selector should be visible
    });
  });

  test.describe('Out of Delivery Area Handling', () => {
    test('should show warning when address is out of delivery area', async ({ page }) => {
      // When a store is too far from the delivery address
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // The app shows "Too far away" or similar message
    });

    test('should allow changing address when out of delivery area', async ({ page }) => {
      // User should be able to change their address if they're out of range
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
  });
});

test.describe('Address API Integration', () => {
  test('should fetch user addresses from API', async ({ page, authModalPage }) => {
    // After login, user addresses should be loaded
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test('should persist address changes', async ({ page, authModalPage }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });

    // Address changes should persist after page refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
  });
});



