import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Checkout page (/checkout)
 */
export class CheckoutPage extends BasePage {
  // Account section
  readonly accountSection: Locator;
  readonly accountEmail: Locator;

  // Shipping section
  readonly shippingSection: Locator;
  readonly shippingEditButton: Locator;
  readonly addressSelector: Locator;
  readonly selectedAddress: Locator;
  readonly deliveryTimeDisplay: Locator;

  // Delivery options
  readonly expressOption: Locator;
  readonly standardOption: Locator;
  readonly scheduleOption: Locator;

  // Payment section
  readonly paymentSection: Locator;
  readonly paymentEditButton: Locator;
  readonly selectedPaymentMethod: Locator;
  readonly addCardButton: Locator;

  // Order summary
  readonly orderSummary: Locator;
  readonly subtotal: Locator;
  readonly deliveryFee: Locator;
  readonly serviceFee: Locator;
  readonly total: Locator;
  readonly cartItems: Locator;

  // Promo/Deals
  readonly promoCodeButton: Locator;
  readonly promoCodeModal: Locator;
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;

  // Actions
  readonly placeOrderButton: Locator;
  readonly addMoreItemsButton: Locator;

  // Modals
  readonly orderConfirmationModal: Locator;
  readonly addressesModal: Locator;
  readonly addCardModal: Locator;
  readonly scheduleModal: Locator;

  // Auth section (for non-authenticated users)
  readonly signInTab: Locator;
  readonly signUpTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    super(page);

    // Account section
    this.accountSection = page.locator('section:has-text("Account"), [class*="account"]:has-text("Account")').first();
    this.accountEmail = page.locator('[class*="account"] span, :text-matches("[^@]+@[^@]+")').first();

    // Shipping section
    this.shippingSection = page.locator(':has-text("Shipping details")').first();
    this.shippingEditButton = this.shippingSection.getByRole('button', { name: /edit/i });
    this.addressSelector = page.locator('[class*="address"], button:has([class*="home" i])');
    this.selectedAddress = page.locator('[class*="selected-address"], p:has-text("Street")').first();
    this.deliveryTimeDisplay = page.locator(':text-matches("\\d+-\\d+ min")').first();

    // Delivery options - specific clickable divs with option names
    this.expressOption = page.locator('div.border.rounded-lg.cursor-pointer:has(h3:has-text("Express"))');
    this.standardOption = page.locator('div.border.rounded-lg.cursor-pointer:has(h3:has-text("Standard"))');
    this.scheduleOption = page.locator('div.border.rounded-lg.cursor-pointer:has(h3:has-text("Schedule"))');

    // Payment section
    this.paymentSection = page.locator(':has-text("Payment details")').first();
    this.paymentEditButton = this.paymentSection.getByRole('button', { name: /edit/i });
    this.selectedPaymentMethod = page.locator('[class*="payment-method"], div:has-text("MasterCard")').first();
    this.addCardButton = page.locator('button:has-text("Credit/Debit Card"), button:has-text("Add")');

    // Order summary
    this.orderSummary = page.locator('[class*="order-summary"], div:has-text("Order Summary")').first();
    this.subtotal = page.locator(':text("Subtotal") + span, div:has-text("Subtotal") span').first();
    this.deliveryFee = page.locator(':text("Delivery Fee") + span, div:has-text("Delivery Fee") span').first();
    this.serviceFee = page.locator(':text("Fees") + span, div:has-text("Fees") span').first();
    this.total = page.locator(':text("Total") + span, div:has-text("Total") span:has-text("$")').last();
    this.cartItems = page.locator('[class*="cart-item"], div:has(img):has(:text("×"))');

    // Promo/Deals
    this.promoCodeButton = page.locator('button:has-text("Deals"), button:has-text("gift cards")');
    this.promoCodeModal = page.locator('[role="dialog"]:has-text("promo"), [role="dialog"]:has-text("Deals")');
    this.promoCodeInput = this.promoCodeModal.locator('input');
    this.applyPromoButton = this.promoCodeModal.getByRole('button', { name: /apply/i });

    // Actions - use .first() to avoid strict mode violations when multiple buttons exist
    this.placeOrderButton = page.getByRole('button', { name: /place order/i }).first();
    this.addMoreItemsButton = page.getByRole('button', { name: /add more items/i });

    // Modals - use fixed overlay pattern, not role="dialog"
    this.orderConfirmationModal = page.locator('div.fixed.inset-0.z-50:has-text("Order Confirmed")');
    this.addressesModal = page.locator('div.fixed.inset-0.z-50:has-text("address")');
    this.addCardModal = page.locator('div.fixed.inset-0.z-50:has-text("card")');
    this.scheduleModal = page.locator('div.fixed.inset-0.z-50:has-text("Schedule")');

    // Auth (for non-authenticated users)
    this.signInTab = page.getByRole('button', { name: /^sign in$/i });
    this.signUpTab = page.getByRole('button', { name: /^sign up$/i });
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
  }

  /**
   * Navigate to checkout with specific cart
   */
  async gotoCheckout(storeId: string, category: string = 'restaurant') {
    await super.goto(`/checkout?category=${category}&storeId=${storeId}`);
    await this.waitForCheckoutLoaded();
  }

  /**
   * Wait for checkout page to be fully loaded
   */
  async waitForCheckoutLoaded() {
    try {
      await this.placeOrderButton.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // Checkout might require auth
    }
  }

  /**
   * Check if user needs to authenticate
   */
  async needsAuthentication(): Promise<boolean> {
    try {
      await this.signInTab.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Select delivery option
   */
  async selectDeliveryOption(option: 'express' | 'standard' | 'schedule') {
    const optionMap = {
      express: this.expressOption,
      standard: this.standardOption,
      schedule: this.scheduleOption,
    };
    await optionMap[option].click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Open addresses modal
   */
  async openAddressesModal() {
    await this.addressSelector.first().click();
    await this.addressesModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Open add card modal
   */
  async openAddCardModal() {
    await this.addCardButton.click();
    await this.addCardModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Add a new payment card
   */
  async addPaymentCard(cardData: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    zipCode: string;
  }) {
    await this.openAddCardModal();

    const cardNumberInput = this.addCardModal.locator('input[name*="card" i], input[placeholder*="card" i]').first();
    const expiryInput = this.addCardModal.locator('input[name*="expir" i], input[placeholder*="MM" i]').first();
    const cvcInput = this.addCardModal.locator('input[name*="cvc" i], input[name*="cvv" i], input[placeholder*="CVC" i]').first();
    const zipInput = this.addCardModal.locator('input[name*="zip" i], input[placeholder*="ZIP" i]').first();

    await cardNumberInput.fill(cardData.cardNumber);
    await expiryInput.fill(cardData.expiry);
    await cvcInput.fill(cardData.cvc);
    await zipInput.fill(cardData.zipCode);

    const saveButton = this.addCardModal.getByRole('button', { name: /save|add|submit/i });
    await saveButton.click();

    await this.addCardModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Open promo code modal
   */
  async openPromoModal() {
    await this.promoCodeButton.click();
    await this.promoCodeModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Apply a promo code
   */
  async applyPromoCode(code: string) {
    await this.openPromoModal();
    await this.promoCodeInput.fill(code);
    await this.applyPromoButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Place the order
   */
  async placeOrder() {
    await this.placeOrderButton.click();
    await this.orderConfirmationModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Check if Place Order button is enabled
   */
  async canPlaceOrder(): Promise<boolean> {
    return await this.placeOrderButton.isEnabled();
  }

  /**
   * Get order total
   */
  async getOrderTotal(): Promise<string> {
    return await this.getTextContent(this.total);
  }

  /**
   * Get subtotal
   */
  async getSubtotal(): Promise<string> {
    return await this.getTextContent(this.subtotal);
  }

  /**
   * Get number of items in cart
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Modify item quantity in order summary
   */
  async modifyItemQuantity(itemIndex: number, action: 'increase' | 'decrease') {
    const item = this.cartItems.nth(itemIndex);
    const button = action === 'increase'
      ? item.locator('button:has-text("+")').last()
      : item.locator('button:has-text("-"), button:has([class*="minus" i])').last();
    await button.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemIndex: number) {
    const item = this.cartItems.nth(itemIndex);
    const removeButton = item.locator('button:has([class*="trash" i])').first();
    if (await removeButton.isVisible()) {
      await removeButton.click();
    } else {
      // Item might have quantity > 1, decrease to 1 first then click minus/trash
      await this.modifyItemQuantity(itemIndex, 'decrease');
    }
    await this.page.waitForTimeout(300);
  }

  /**
   * Go back to store to add more items
   */
  async goBackToStore() {
    await this.addMoreItemsButton.click();
    await this.page.waitForURL(/\/store\//);
  }

  /**
   * Get order confirmation order ID
   */
  async getConfirmationOrderId(): Promise<string> {
    const orderIdElement = this.orderConfirmationModal.locator(':text-matches("[A-Z0-9]{6,}")').first();
    return await this.getTextContent(orderIdElement);
  }

  /**
   * Close order confirmation and go to orders
   */
  async closeConfirmationAndViewOrders() {
    const viewOrdersButton = this.orderConfirmationModal.getByRole('button', { name: /view orders|track order/i });
    await viewOrdersButton.click();
    await this.page.waitForURL(/\/orders/);
  }
}



