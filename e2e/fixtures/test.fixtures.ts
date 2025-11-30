import { test as base, expect } from '@playwright/test';
import { BasePage } from '../page-objects/base.page';
import { HomePage } from '../page-objects/home.page';
import { StorePage } from '../page-objects/store.page';
import { CheckoutPage } from '../page-objects/checkout.page';
import { OrdersPage } from '../page-objects/orders.page';
import { ReviewsPage } from '../page-objects/reviews.page';
import { AddressPage } from '../page-objects/address.page';
import { AuthPage } from '../page-objects/auth.page';
import { AuthModalPage } from '../page-objects/auth-modal.page';

/**
 * Extended test fixtures with all page objects available
 */
export const test = base.extend<{
  basePage: BasePage;
  homePage: HomePage;
  storePage: StorePage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  reviewsPage: ReviewsPage;
  addressPage: AddressPage;
  authPage: AuthPage;
  authModalPage: AuthModalPage;
}>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  storePage: async ({ page }, use) => {
    const storePage = new StorePage(page);
    await use(storePage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  ordersPage: async ({ page }, use) => {
    const ordersPage = new OrdersPage(page);
    await use(ordersPage);
  },

  reviewsPage: async ({ page }, use) => {
    const reviewsPage = new ReviewsPage(page);
    await use(reviewsPage);
  },

  addressPage: async ({ page }, use) => {
    const addressPage = new AddressPage(page);
    await use(addressPage);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  authModalPage: async ({ page }, use) => {
    const authModalPage = new AuthModalPage(page);
    await use(authModalPage);
  },
});

export { expect };

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Generate unique email for testing
   */
  generateEmail: (prefix: string = 'e2e.test') => {
    return `${prefix}+${Date.now()}@example.com`;
  },

  /**
   * Generate unique phone number
   */
  generatePhone: () => {
    return `555${Math.floor(1000000 + Math.random() * 9000000)}`;
  },

  /**
   * Generate test address
   */
  generateAddress: () => ({
    street: `${Math.floor(1000 + Math.random() * 9000)} Test Street`,
    apartment: `Apt ${Math.floor(100 + Math.random() * 900)}`,
    city: 'Test City',
    state: 'CA',
    zipCode: `9${Math.floor(1000 + Math.random() * 9000)}`,
  }),

  /**
   * Generate test card
   */
  generateCard: () => ({
    cardNumber: '5555 5555 5555 4444',
    expiry: '12/28',
    cvc: '123',
    zipCode: '12345',
  }),

  /**
   * Generate test user data
   */
  generateUser: () => ({
    firstName: 'E2E',
    lastName: 'Tester',
    email: testDataGenerators.generateEmail(),
    phone: testDataGenerators.generatePhone(),
    password: 'TestPassword123!',
  }),
};

/**
 * Common test helpers
 */
export const testHelpers = {
  /**
   * Wait with timeout that doesn't fail the test
   */
  safeWait: async (page: any, timeout: number = 1000) => {
    await page.waitForTimeout(timeout);
  },

  /**
   * Login with test credentials
   */
  loginWithTestUser: async (authPage: AuthPage, email: string) => {
    await authPage.goto();
    await authPage.emailInput.fill(email);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    
    // Enter any 6-digit OTP (OTP validation is disabled in dev mode)
    for (let i = 0; i < 6; i++) {
      await authPage.otpInputs.nth(i).fill(String(i + 1));
    }
    await authPage.signInButton.click();
  },

  /**
   * Sign up a new user
   */
  signUpNewUser: async (authModalPage: AuthModalPage, userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    const user = {
      firstName: userData?.firstName || 'E2E',
      lastName: userData?.lastName || 'User',
      email: userData?.email || testDataGenerators.generateEmail(),
      mobileNumber: userData?.phone || testDataGenerators.generatePhone(),
      password: userData?.password || 'StrongPass1234',
    };

    await authModalPage.openSignupModalFromLanding();
    await authModalPage.fillSignupForm(user);
    await authModalPage.submitSignup();
    await authModalPage.completeOtp();

    return user;
  },

  /**
   * Add item to cart and go to checkout
   */
  addItemAndCheckout: async (
    storePage: StorePage,
    checkoutPage: CheckoutPage,
    storeId: string
  ) => {
    await storePage.gotoStore(storeId);
    await storePage.waitForStoreLoaded();
    
    // Add first available item
    await storePage.clickMenuItem(0);
    await storePage.addItemToCartFromDialog();
    
    // Navigate to checkout
    await checkoutPage.gotoCheckout(storeId, 'restaurant');
  },

  /**
   * Complete a full order flow
   */
  completeOrder: async (
    authModalPage: AuthModalPage,
    storePage: StorePage,
    checkoutPage: CheckoutPage,
    storeId: string
  ) => {
    // Sign up new user
    await authModalPage.signupSuccessfully();

    // Add item and go to checkout
    await storePage.gotoStore(storeId);
    await storePage.waitForStoreLoaded();
    await storePage.clickMenuItem(0);
    await storePage.addItemToCartFromDialog();
    
    await checkoutPage.gotoCheckout(storeId, 'restaurant');

    // Add payment method
    await checkoutPage.addPaymentCard(testDataGenerators.generateCard());

    // Place order
    await checkoutPage.placeOrder();
    
    return await checkoutPage.getConfirmationOrderId();
  },
};

/**
 * Test credentials for consistent testing
 */
export { testCredentials } from '../test-credentials';



