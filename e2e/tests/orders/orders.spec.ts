import { test, expect } from '../../fixtures/test.fixtures';
import { testDataGenerators } from '../../fixtures/test.fixtures';

/**
 * Orders E2E Tests
 * 
 * Comprehensive test suite for order placement functionality including:
 * - Full end-to-end order flow
 * - Order confirmation
 * - Order details verification
 * - Review submission
 * 
 * @playwright-report
 */
test.describe('Orders', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await context.clearCookies();
  });

  test('can place an order end-to-end as logged in user', async ({ 
    page, 
    authModalPage, 
    storePage, 
    checkoutPage,
    ordersPage 
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
          // Add a default address
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
          
          // Add a default payment method
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
          
          // Update user store
          currentUser.addresses = [address];
          currentUser.paymentMethods = [paymentMethod];
          
          if (!userStore.state) {
            userStore.state = {};
          }
          userStore.state.currentUser = currentUser;
          userStore.state.users = userStore.state.users || [];
          
          // Update user in users array if exists
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
    
    // Wait a bit for localStorage to be processed
    await page.waitForTimeout(500);
    
    // Step 3: Navigate to a store within delivery range (Salads House - store 83)
    const storeId = '83';
    await storePage.gotoStore(storeId);
    await storePage.waitForStoreLoaded();
    
    // Step 4: Add items to cart - click on the menu item CARD to open the dialog
    const menuItemCards = page.locator('div.border.border-gray-200.rounded-lg.cursor-pointer:has(h3)');
    await expect(menuItemCards.first()).toBeVisible({ timeout: 10000 });
    const menuItemCount = await menuItemCards.count();
    expect(menuItemCount).toBeGreaterThan(0);
    
    // Click on the first menu item card to open the menu item dialog
    await menuItemCards.first().click();
    await page.waitForTimeout(500);
    
    // Step 5: Wait for menu item dialog to open
    const menuItemDialog = page.locator('div.fixed.inset-0.z-50').first();
    await expect(menuItemDialog).toBeVisible({ timeout: 5000 });
    
    // Step 6: Select a side option (checkbox modification - e.g., Side Salad)
    const sideOption = page.locator('button div.h-5.w-5.rounded.border-2').first();
    if (await sideOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sideOption.click();
      await page.waitForTimeout(300);
    }
    
    // Step 7: Select a food preference option (radio button modification - e.g., Spice level)
    const spiceOption = page.locator('button div.h-5.w-5.rounded-full.border-2').first();
    if (await spiceOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await spiceOption.click();
      await page.waitForTimeout(300);
    }
    
    // Step 8: Click increase quantity button
    const increaseQuantityButton = page.locator('button[aria-label="Increase quantity"]');
    if (await increaseQuantityButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await increaseQuantityButton.click();
      await page.waitForTimeout(300);
    }
    
    // Step 9: Click "Add to cart" button in the dialog
    const addToCartButton = page.locator('div.fixed.inset-0.z-50 button').filter({ hasText: /add to cart/i }).first();
    await addToCartButton.click();
    await page.waitForTimeout(500);
    
    // Step 10: Open cart drawer by clicking cart icon in header
    const cartButton = page.locator('button[aria-label*="cart" i], button:has([class*="cart" i])').first();
    if (await cartButton.isVisible({ timeout: 5000 })) {
      await cartButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 11: Click Continue button from cart drawer to proceed to checkout
    const continueButton = page.getByRole('button', { name: /^Continue$/i });
    if (await continueButton.isVisible({ timeout: 5000 })) {
      await continueButton.click();
      await page.waitForTimeout(1000);
    } else {
      await checkoutPage.gotoCheckout(storeId, 'restaurant');
    }
    
    // Step 12: Wait for checkout page to load
    await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
    // Wait for Place Order button to be visible
    const placeOrderButton = page.getByRole('button', { name: /place order/i }).first();
    await expect(placeOrderButton).toBeVisible({ timeout: 10000 });
    
    // Step 13: Standard delivery should be selected by default - no action needed
    // Wait for page to settle
    await page.waitForTimeout(1000);
    
    // Step 14: Payment method should already be set from localStorage
    // Check if payment shows "...4655" pattern (use .first() to avoid strict mode)
    const paymentIndicator = page.getByText('...4655').first();
    const hasPaymentMethod = await paymentIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    
    // If no payment method found, try to add one via clicking Credit/Debit Card button
    if (!hasPaymentMethod) {
      const addCardBtn = page.locator('button:has-text("Credit/Debit Card")').first();
      if (await addCardBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addCardBtn.click();
        await page.waitForTimeout(500);
        // Fill card details in the modal
        const cardNumberInput = page.locator('input[name*="card" i], input[placeholder*="card" i]').first();
        if (await cardNumberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await cardNumberInput.fill('5555 5555 5555 4444');
          await page.locator('input[name*="expir" i], input[placeholder*="MM" i]').first().fill('12/28');
          await page.locator('input[name*="cvc" i], input[placeholder*="CVC" i]').first().fill('123');
          await page.locator('input[name*="zip" i], input[placeholder*="ZIP" i]').first().fill('12345');
          const saveBtn = page.getByRole('button', { name: /save|add|submit/i }).first();
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Step 15: Click Place Order button directly
    await placeOrderButton.click();
    await page.waitForTimeout(500);
    
    // Step 16: Verify order confirmation modal appears
    await expect(page.getByText('Order Confirmed!')).toBeVisible({ timeout: 10000 });
    
    // Step 17: Verify order confirmation details
    await expect(page.getByText(/Your order has been placed successfully/i)).toBeVisible({ timeout: 5000 });
    
    // Verify Order ID is displayed (alphanumeric code like "YKR4N9LE0")
    const orderIdElement = page.locator('text=/[A-Z0-9]{6,}/').first();
    const orderId = await orderIdElement.textContent();
    expect(orderId).toBeTruthy();
    
    // Verify Total is displayed
    await expect(page.getByText(/Total.*\$/i).first()).toBeVisible({ timeout: 5000 });
    
    // Verify Estimated Delivery Time is displayed
    await expect(page.getByText(/Estimated Delivery Time|Scheduled Delivery Time/i)).toBeVisible({ timeout: 5000 });
    
    // Step 19: Close the order confirmation modal
    const closeButton = page.getByRole('button', { name: /^close$/i });
    await expect(closeButton).toBeVisible({ timeout: 5000 });
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Step 20: Verify we're back on the home page
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    
    // Step 21: Click on "Orders" in the sidebar
    const ordersLink = page.locator('a[href="/orders"]');
    await ordersLink.click();
    await page.waitForTimeout(500);
    
    // Step 22: Wait for orders page to load
    await expect(page).toHaveURL(/\/orders/, { timeout: 10000 });
    await ordersPage.waitForOrdersLoaded();
    
    // Step 23: Find the last order and click on a star to rate it
    await page.waitForTimeout(1000);
    
    // Find the first order card (most recent order)
    const firstOrderCard = page.locator('div.hover\\:bg-gray-50.transition-colors.cursor-pointer').first();
    await expect(firstOrderCard).toBeVisible({ timeout: 10000 });
    
    // Click on a star to open the review dialog (5th star for 5-star rating)
    const starButton = firstOrderCard.locator('svg.lucide-star').nth(4);
    await starButton.click();
    await page.waitForTimeout(500);
    
    // Step 24: Wait for review dialog to appear
    const reviewDialog = page.locator('div.fixed.inset-0.z-50').first();
    await expect(reviewDialog).toBeVisible({ timeout: 5000 });
    
    // Step 25: Enter review text in the textarea
    const reviewTextarea = page.locator('textarea');
    await expect(reviewTextarea).toBeVisible({ timeout: 3000 });
    await reviewTextarea.fill('The food was good. This is my official review of the store and I know they hope it was good, because it was indeed good!');
    await page.waitForTimeout(300);
    
    // Step 26: Click "Submit Review" button
    const submitReviewButton = page.getByRole('button', { name: /submit review/i });
    await submitReviewButton.click();
    await page.waitForTimeout(1000);
    
    // Verify the review was submitted successfully
    await expect(page.getByText(/Thanks for leaving a review|review.*submitted/i)).toBeVisible({ timeout: 5000 }).catch(async () => {
      await expect(reviewDialog).toBeHidden({ timeout: 5000 });
    });
  });
});
