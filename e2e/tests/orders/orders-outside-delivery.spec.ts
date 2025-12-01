import { test, expect } from '../../fixtures/test.fixtures';
import { testDataGenerators } from '../../fixtures/test.fixtures';

/**
 * Orders E2E Tests - Store Outside Delivery Area
 * 
 * Tests ordering from a store outside the delivery range
 * 
 * @playwright-report
 */
test.describe('Orders - Outside Delivery Area', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await context.clearCookies();
  });

  test('can order from store outside delivery area and reach checkout', async ({ 
    page, 
    authModalPage, 
    storePage, 
    checkoutPage 
  }) => {
    // Step 1: Sign up a new user
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    // Step 2: Set up user with payment method and address via localStorage
    await page.evaluate(() => {
      try {
        const userStoreStr = localStorage.getItem('user-store');
        if (!userStoreStr) return;
        
        const userStore = JSON.parse(userStoreStr);
        const currentUser = userStore?.state?.currentUser;
        
        if (currentUser) {
          const address = {
            id: `addr-${Date.now()}`,
            street: '700 N Brookhurst St',
            city: 'Anaheim',
            state: 'CA',
            zipCode: '92801',
            lat: 33.8366,
            lng: -117.9143,
            addressType: 'house',
            default: true,
          };
          
          const paymentMethod = {
            id: `pm-${Date.now()}`,
            type: 'amex',
            cardNumber: '378282246310005',
            lastFour: '4655',
            cvc: '1234',
            expiry: '12/28',
            zipCode: '92801',
            default: true,
          };
          
          currentUser.addresses = [address];
          currentUser.paymentMethods = [paymentMethod];
          
          if (!userStore.state) {
            userStore.state = {};
          }
          userStore.state.currentUser = currentUser;
          userStore.state.users = userStore.state.users || [];
          
          const userIndex = userStore.state.users.findIndex((u: any) => u.id === currentUser.id);
          if (userIndex >= 0) {
            userStore.state.users[userIndex] = currentUser;
          } else {
            userStore.state.users.push(currentUser);
          }
          
          localStorage.setItem('user-store', JSON.stringify(userStore));
        }
      } catch (e) {
        console.error('Error setting up user:', e);
      }
    });
    
    await page.waitForTimeout(500);
    
    // Step 3: Visit store that is OUTSIDE delivery area (store 1)
    const storeId = '1';
    await storePage.gotoStore(storeId);
    
    // Step 4: Dismiss the "address outside delivery area" modal
    const outsideDeliveryModalText = page.getByText("Your address is outside of this store's delivery area");
    const isModalVisible = await outsideDeliveryModalText.isVisible({ timeout: 3000 }).catch(() => false);
    if (isModalVisible) {
      const closeModalButton = page.getByRole('button', { name: /close modal/i });
      if (await closeModalButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeModalButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    await storePage.waitForStoreLoaded();
    
    // Step 5: Add items to cart
    const menuItemCards = page.locator('div.border.border-gray-200.rounded-lg.cursor-pointer:has(h3)');
    await expect(menuItemCards.first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first menu item card to open the dialog
    await menuItemCards.first().click();
    await page.waitForTimeout(500);
    
    // Step 6: Wait for menu item dialog to open
    const menuItemDialog = page.locator('div.fixed.inset-0.z-50').first();
    await expect(menuItemDialog).toBeVisible({ timeout: 5000 });
    
    // Step 7: Select a side option if available
    const sideOption = page.locator('button div.h-5.w-5.rounded.border-2').first();
    if (await sideOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sideOption.click();
      await page.waitForTimeout(300);
    }
    
    // Step 8: Click "Add to cart" button in the dialog
    const addToCartButton = page.locator('div.fixed.inset-0.z-50 button').filter({ hasText: /add to cart/i }).first();
    await addToCartButton.click();
    await page.waitForTimeout(500);
    
    // Step 9: Open cart drawer
    const cartButton = page.locator('button[aria-label*="cart" i], button:has([class*="cart" i])').first();
    if (await cartButton.isVisible({ timeout: 5000 })) {
      await cartButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 10: Click Continue button to proceed to checkout
    const continueButton = page.getByRole('button', { name: /^Continue$/i });
    if (await continueButton.isVisible({ timeout: 5000 })) {
      await continueButton.click();
      await page.waitForTimeout(1000);
    } else {
      await checkoutPage.gotoCheckout(storeId, 'restaurant');
    }
    
    // Step 11: Verify we reached the checkout page
    await checkoutPage.waitForCheckoutLoaded();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
    
    // Verify checkout page elements are visible
    await expect(checkoutPage.placeOrderButton).toBeVisible({ timeout: 5000 });
  });
});

