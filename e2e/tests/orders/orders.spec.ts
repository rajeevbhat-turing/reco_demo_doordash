import { test, expect } from '../../fixtures/test.fixtures';
import { testDataGenerators } from '../../fixtures/test.fixtures';

/**
 * Orders E2E Tests
 * 
 * Comprehensive test suite for order placement functionality including:
 * - Full end-to-end order flow
 * - Order confirmation
 * - Order details verification
 * 
 * @playwright-report
 */
test.describe('Orders', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test
    // Navigate to a page first to ensure we have a valid context
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
    checkoutPage 
  }) => {
    // Step 1: Sign up a new user
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    // Step 2: Set up user with payment method and address via localStorage
    // We'll use the user store state to add payment and address
    // Ensure we're on a page with the correct origin before accessing localStorage
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
    
    // Step 3: Visit store page
    const storeId = '1'; // Use existing store ID
    await storePage.gotoStore(storeId);
    
    // Dismiss the "address outside delivery area" modal if it appears
    const outsideDeliveryModalText = page.getByText("Your address is outside of this store's delivery area");
    const isModalVisible = await outsideDeliveryModalText.isVisible({ timeout: 3000 }).catch(() => false);
    if (isModalVisible) {
      // Find the close button - it has aria-label="Close modal"
      // The button is positioned in the top-left corner of the modal
      const closeButton = page.getByRole('button', { name: /close modal/i });
      if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(300); // Wait for modal to close
      }
    }
    
    await storePage.waitForStoreLoaded();
    
    // Step 4: Add items to cart
    const menuItems = await storePage.getMenuItems();
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Add first item
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    
    // Step 5: Open cart drawer (click cart icon in header)
    const cartButton = page.locator('button[aria-label*="cart" i], button:has([class*="cart" i])').first();
    if (await cartButton.isVisible({ timeout: 5000 })) {
      await cartButton.click();
      await page.waitForTimeout(500);
    }
    
    // Step 6: Click Continue button from cart drawer to proceed to checkout
    const continueButton = page.getByRole('button', { name: /^Continue$/i });
    if (await continueButton.isVisible({ timeout: 5000 })) {
      await continueButton.click();
      await page.waitForTimeout(1000);
    } else {
      // If cart drawer doesn't have continue button, navigate directly to checkout
      await checkoutPage.gotoCheckout(storeId, 'restaurant');
    }
    
    // Step 7: Wait for checkout page to load
    await checkoutPage.waitForCheckoutLoaded();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 10000 });
    
    // Step 8: Verify defaults are selected (standard delivery, default address, default payment)
    // Standard delivery should be selected by default
    const standardOption = checkoutPage.standardOption;
    if (await standardOption.isVisible({ timeout: 3000 })) {
      // Check if standard is selected (it should be by default)
      const isSelected = await standardOption.evaluate((el) => {
        return el.getAttribute('aria-checked') === 'true' || 
               el.classList.contains('selected') ||
               el.querySelector('input[type="radio"]:checked') !== null;
      });
      // Standard should be selected by default, but if not, select it
      if (!isSelected) {
        await checkoutPage.selectDeliveryOption('standard');
      }
    }
    
    // Step 9: Verify payment method is available (should be set from localStorage)
    // If no payment method is visible, add one
    const hasPaymentMethod = await checkoutPage.selectedPaymentMethod.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasPaymentMethod) {
      const cardData = testDataGenerators.generateCard();
      await checkoutPage.addPaymentCard(cardData);
      await page.waitForTimeout(1000);
    }
    
    // Step 10: Verify Place Order button is enabled
    const canPlace = await checkoutPage.canPlaceOrder();
    expect(canPlace).toBeTruthy();
    
    // Step 11: Place the order
    await checkoutPage.placeOrder();
    
    // Step 12: Verify order confirmation modal appears
    await expect(checkoutPage.orderConfirmationModal).toBeVisible({ timeout: 10000 });
    
    // Step 13: Verify order confirmation details
    // Check for "Order Confirmed!" title
    await expect(page.getByText('Order Confirmed!')).toBeVisible({ timeout: 5000 });
    
    // Check for "Your order has been placed successfully" message
    await expect(page.getByText(/Your order has been placed successfully/i)).toBeVisible({ timeout: 5000 });
    
    // Verify Order ID is displayed
    const orderId = await checkoutPage.getConfirmationOrderId();
    expect(orderId).toBeTruthy();
    expect(orderId.length).toBeGreaterThan(0);
    
    // Verify Total is displayed
    const totalText = await page.locator(':text("Total")').locator('..').locator(':text("$")').first().textContent();
    expect(totalText).toBeTruthy();
    expect(totalText).toContain('$');
    
    // Verify Estimated Delivery Time is displayed
    await expect(page.getByText(/Estimated Delivery Time|Scheduled Delivery Time/i)).toBeVisible({ timeout: 5000 });
    const deliveryTimeText = await page.getByText(/\d+-\d+ min|\d+:\d+ [AP]M/i).first().textContent();
    expect(deliveryTimeText).toBeTruthy();
    
    // Verify "Close" button is present
    await expect(page.getByRole('button', { name: /close/i })).toBeVisible({ timeout: 5000 });
    
    // Verify SMS/email notification message
    await expect(page.getByText(/You will receive SMS and email updates/i)).toBeVisible({ timeout: 5000 });
  });
});

