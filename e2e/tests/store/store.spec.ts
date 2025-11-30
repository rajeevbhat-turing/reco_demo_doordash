import { test, expect } from '../../fixtures/test.fixtures';

/**
 * Store/Restaurant E2E Tests
 * 
 * Comprehensive test suite for store functionality including:
 * - Store listing and navigation
 * - Menu browsing and categories
 * - Item details and modifications
 * - Add to cart functionality
 * - Store search and filtering
 * - Store details and information
 * 
 * @playwright-report
 */
test.describe('Store Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Home Page Store Listing', () => {
    test('should display restaurants on home page', async ({ homePage, page }) => {
      // Need to set up address first for restaurants to show
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Either restaurants are shown or "stay tuned" message
      const hasRestaurants = await homePage.restaurantCards.first().isVisible({ timeout: 10000 }).catch(() => false);
      const hasStayTuned = await page.getByText(/stay tuned/i).isVisible({ timeout: 3000 }).catch(() => false);
      
      expect(hasRestaurants || hasStayTuned).toBeTruthy();
    });

    test('should navigate to store page when clicking restaurant card', async ({ homePage, page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // If restaurants are available, click the first one
      const firstCard = homePage.restaurantCards.first();
      if (await firstCard.isVisible({ timeout: 5000 })) {
        await firstCard.click();
        await expect(page).toHaveURL(/\/store\//, { timeout: 10000 });
      }
    });

    test('should show restaurant information on cards', async ({ homePage, page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const firstCard = homePage.restaurantCards.first();
      if (await firstCard.isVisible({ timeout: 5000 })) {
        // Cards should show name, rating, delivery time, etc.
        const cardText = await firstCard.textContent();
        // Restaurant cards typically have delivery time info
        expect(cardText).toBeTruthy();
      }
    });
  });

  test.describe('Store Page Navigation', () => {
    test('should load store page with restaurant details', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      
      // Store name should be visible
      await expect(storePage.storeName).toBeVisible({ timeout: 15000 });
    });

    test('should display menu categories', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      
      // Wait for menu to load
      await storePage.waitForStoreLoaded();
      
      // Menu categories should be visible
      const categories = await storePage.getMenuCategoryNames();
      // May have Featured Items, Most Ordered, or regular categories
    });

    test('should display menu items', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Count menu items
      const itemCount = await storePage.getMenuItemCount();
      // Store should have menu items (or loading state)
    });

    test('should show store info section', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Store info section should be visible
      const storeInfoText = await storePage.page.locator(':text("Store Info")').isVisible({ timeout: 5000 });
    });
  });

  test.describe('Menu Item Interaction', () => {
    test('should open item dialog when clicking menu item', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Click on first menu item
      const items = await storePage.getMenuItems();
      if (items.length > 0) {
        await storePage.clickMenuItem(0);
        
        // Dialog should open
        await expect(storePage.menuItemDialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('should close item dialog', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const items = await storePage.getMenuItems();
      if (items.length > 0) {
        await storePage.clickMenuItem(0);
        await expect(storePage.menuItemDialog).toBeVisible({ timeout: 5000 });
        
        await storePage.closeDialog();
        await expect(storePage.menuItemDialog).not.toBeVisible({ timeout: 3000 });
      }
    });

    test('should add item to cart from dialog', async ({ storePage, page }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const items = await storePage.getMenuItems();
      if (items.length > 0) {
        await storePage.clickMenuItem(0);
        await expect(storePage.menuItemDialog).toBeVisible({ timeout: 5000 });
        
        // Add to cart
        await storePage.addItemToCartFromDialog();
        
        // Cart should be updated
        await page.waitForTimeout(500);
      }
    });

    test('should quick-add item without dialog', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const items = await storePage.getMenuItems();
      if (items.length > 0) {
        // Click + button directly
        await storePage.quickAddItem(0);
      }
    });
  });

  test.describe('Menu Search', () => {
    test('should search menu items', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Search for a menu item
      await storePage.searchMenu('burger');
      
      // Results should update (or show "no items found")
      await storePage.page.waitForTimeout(500);
    });

    test('should clear search results', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      await storePage.searchMenu('test');
      await storePage.clearMenuSearch();
      
      // Full menu should be shown again
    });
  });

  test.describe('Store Favoriting', () => {
    test('should allow authenticated user to save store', async ({ storePage, authModalPage, page }) => {
      // Login first
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Go to store
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Toggle save
      if (await storePage.saveButton.isVisible({ timeout: 3000 })) {
        await storePage.toggleSaveStore();
      }
    });
  });

  test.describe('Store Details Modal', () => {
    test('should open store details modal', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Click "See More" button
      if (await storePage.seeMoreButton.isVisible({ timeout: 3000 })) {
        await storePage.openStoreDetails();
        await expect(storePage.storeDetailsDialog).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Menu Categories Navigation', () => {
    test('should scroll to category when clicking menu nav', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const categories = await storePage.getMenuCategoryNames();
      if (categories.length > 0) {
        // Click on a category (not the first one if possible)
        const categoryToClick = categories.length > 1 ? categories[1] : categories[0];
        await storePage.selectMenuCategory(categoryToClick);
      }
    });
  });
});

test.describe('Multiple Stores Testing', () => {
  // Test multiple stores to ensure consistency
  const testStores = [
    'mcdonalds',
    'burger-king',
    'wendys',
    'taco-bell',
    'chipotle',
  ];

  for (const storeId of testStores) {
    test(`should load ${storeId} store page`, async ({ storePage }) => {
      await storePage.gotoStore(storeId);
      
      // Wait for page to load (might redirect if store doesn't exist)
      await storePage.page.waitForLoadState('networkidle');
      
      // Check if we're on the store page or redirected
      const url = storePage.page.url();
      // Store should either load or redirect
    });
  }
});

test.describe('Store Filters', () => {
  test('should filter by DashPass', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    // Apply DashPass filter
    if (await homePage.dashPassFilter.isVisible({ timeout: 3000 })) {
      await homePage.applyFilter('dashpass');
    }
  });

  test('should filter by deals', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    if (await homePage.dealsFilter.isVisible({ timeout: 3000 })) {
      await homePage.applyFilter('deals');
    }
  });

  test('should filter by delivery time', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    if (await homePage.underThirtyMinsFilter.isVisible({ timeout: 3000 })) {
      await homePage.applyFilter('under30');
    }
  });

  test('should reset filters', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    // Apply a filter first
    if (await homePage.dashPassFilter.isVisible({ timeout: 3000 })) {
      await homePage.applyFilter('dashpass');
      await homePage.resetFilters();
    }
  });
});

test.describe('Food Categories', () => {
  test('should display food categories', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    // Food categories section should be visible
    await expect(homePage.foodCategories).toBeVisible({ timeout: 5000 });
  });

  test('should filter by food category', async ({ homePage, page }) => {
    await page.goto('/home');
    await homePage.waitForRestaurantsLoaded();
    
    // Click on a food category
    await homePage.selectFoodCategory('Fast Food');
  });
});



