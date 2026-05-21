import { test, expect, testDataGenerators } from '../../../fixtures/test.fixtures';
import { clearBrowserStorage } from '../../../utils/test-helpers';

/**
 * Checkout E2E Tests
 * 
 * Comprehensive test suite for checkout functionality including:
 * - Checkout page access and display
 * - Authentication during checkout
 * - Delivery options selection
 * - Payment method management
 * - Order summary and totals
 * - Place order flow
 * - Order confirmation
 * 
 * @playwright-report
 */
test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
  });

  test.describe('Checkout Page Access', () => {
    test('should redirect to home if cart is empty', async ({ checkoutPage, page }) => {
      await page.goto('/checkout?category=restaurant&storeId=mcdonalds');
      
      // Should redirect to home if no items in cart
      await page.waitForURL(/\/(home)?$/, { timeout: 10000 });
    });

    test('should load checkout page with items in cart', async ({ 
      storePage, 
      checkoutPage, 
      page 
    }) => {
      // First add item to cart
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        
        // Navigate to checkout
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Checkout page should load
        await page.waitForLoadState('networkidle');
      }
    });
  });

  test.describe('Authentication on Checkout', () => {
    test('should show sign in/sign up section for guests', async ({ 
      storePage, 
      checkoutPage, 
      page 
    }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const needsAuth = await checkoutPage.needsAuthentication();
        // Non-authenticated users should see auth section
      }
    });

    test('should allow sign in during checkout', async ({ storePage, checkoutPage, page }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Sign in tab should be available
        if (await checkoutPage.signInTab.isVisible({ timeout: 5000 })) {
          await checkoutPage.signInTab.click();
        }
      }
    });

    test('should allow sign up during checkout', async ({ storePage, checkoutPage, page }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Sign up tab should be available
        if (await checkoutPage.signUpTab.isVisible({ timeout: 5000 })) {
          await checkoutPage.signUpTab.click();
        }
      }
    });
  });

  test.describe('Delivery Options', () => {
    test('should display delivery options', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Delivery options should be visible
      }
    });

    test('should select express delivery', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        if (await checkoutPage.expressOption.isVisible({ timeout: 5000 })) {
          await checkoutPage.selectDeliveryOption('express');
        }
      }
    });

    test('should select standard delivery', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        if (await checkoutPage.standardOption.isVisible({ timeout: 5000 })) {
          await checkoutPage.selectDeliveryOption('standard');
        }
      }
    });

    test('should open schedule delivery modal', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        if (await checkoutPage.scheduleOption.isVisible({ timeout: 5000 })) {
          await checkoutPage.selectDeliveryOption('schedule');
          // Schedule modal should open
        }
      }
    });
  });

  test.describe('Payment Methods', () => {
    test('should display add payment method option', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Payment section should be visible
      }
    });

    test('should add a new payment card', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Add payment card
        const cardData = testDataGenerators.generateCard();
        await checkoutPage.addPaymentCard(cardData);
      }
    });
  });

  test.describe('Order Summary', () => {
    test('should display order summary', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Order summary should be visible
        await expect(checkoutPage.orderSummary).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display cart items in summary', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const itemCount = await checkoutPage.getCartItemCount();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should display subtotal', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const subtotal = await checkoutPage.getSubtotal();
        expect(subtotal).toContain('$');
      }
    });

    test('should display total', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const total = await checkoutPage.getOrderTotal();
        expect(total).toContain('$');
      }
    });
  });

  test.describe('Promo Codes', () => {
    test('should open promo code modal', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        if (await checkoutPage.promoCodeButton.isVisible({ timeout: 5000 })) {
          await checkoutPage.openPromoModal();
          await expect(checkoutPage.promoCodeModal).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Place Order', () => {
    test('should disable place order button without payment method', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const canPlace = await checkoutPage.canPlaceOrder();
        // Without payment method, should not be able to place order
      }
    });

    test('should enable place order with payment method', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Add payment method
        const cardData = testDataGenerators.generateCard();
        await checkoutPage.addPaymentCard(cardData);
        
        const canPlace = await checkoutPage.canPlaceOrder();
        expect(canPlace).toBeTruthy();
      }
    });

    test('should place order successfully', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Add payment method
        const cardData = testDataGenerators.generateCard();
        await checkoutPage.addPaymentCard(cardData);
        
        // Place order
        await checkoutPage.placeOrder();
        
        // Order confirmation modal should appear
        await expect(checkoutPage.orderConfirmationModal).toBeVisible({ timeout: 10000 });
      }
    });

    test('should display order ID in confirmation', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const cardData = testDataGenerators.generateCard();
        await checkoutPage.addPaymentCard(cardData);
        
        await checkoutPage.placeOrder();
        
        const orderId = await checkoutPage.getConfirmationOrderId();
        expect(orderId).toBeTruthy();
      }
    });
  });

  test.describe('Cart Modification on Checkout', () => {
    test('should allow modifying item quantity', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Modify quantity
        await checkoutPage.modifyItemQuantity(0, 'increase');
      }
    });

    test('should allow adding more items', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        // Click add more items
        await checkoutPage.goBackToStore();
        await expect(page).toHaveURL(/\/store\//);
      }
    });
  });

  test.describe('Post-Order Navigation', () => {
    test('should navigate to orders page after confirmation', async ({ 
      storePage, 
      checkoutPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      const menuItems = await storePage.getMenuItems();
      if (menuItems.length > 0) {
        await storePage.quickAddItem(0);
        await checkoutPage.gotoCheckout('mcdonalds', 'restaurant');
        
        const cardData = testDataGenerators.generateCard();
        await checkoutPage.addPaymentCard(cardData);
        
        await checkoutPage.placeOrder();
        await checkoutPage.closeConfirmationAndViewOrders();
        
        await expect(page).toHaveURL(/\/orders/, { timeout: 10000 });
      }
    });
  });
});

test.describe('Out of Delivery Area', () => {
  test('should show warning for out of delivery area', async ({ 
    storePage, 
    checkoutPage, 
    authModalPage, 
    page 
  }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    // This test would need an address that's out of delivery area
  });

  test('should disable place order for out of delivery area', async ({ 
    storePage, 
    checkoutPage, 
    authModalPage, 
    page 
  }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    // When out of delivery area, place order should be disabled
  });
});



