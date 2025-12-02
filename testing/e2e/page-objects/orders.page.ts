import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Orders page (/orders)
 */
export class OrdersPage extends BasePage {
  // Page header
  readonly pageTitle: Locator;

  // Tabs
  readonly personalTab: Locator;
  readonly businessTab: Locator;

  // Order list
  readonly orderCards: Locator;
  readonly emptyOrdersMessage: Locator;

  // Order card elements
  readonly orderDates: Locator;
  readonly orderRestaurantNames: Locator;
  readonly orderTotals: Locator;
  readonly orderItems: Locator;

  // Order actions
  readonly reorderButtons: Locator;
  readonly viewReceiptButtons: Locator;
  readonly leaveReviewButtons: Locator;

  // Rating stars on orders
  readonly orderStars: Locator;

  // Review dialog (appears on the orders page)
  readonly reviewDialog: Locator;
  readonly reviewTextarea: Locator;
  readonly submitReviewButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('h1:has-text("Orders")');

    // Tabs
    this.personalTab = page.getByRole('button', { name: /personal/i });
    this.businessTab = page.getByRole('button', { name: /business/i });

    // Order list
    this.orderCards = page.locator('[class*="order"], div:has(h3):has(button:has-text("Reorder"))');
    this.emptyOrdersMessage = page.locator(':text("No"), :text("orders")').first();

    // Order card elements
    this.orderDates = page.locator('[class*="order-date"], h3:has-text("Today"), h3:has-text("Yesterday")');
    this.orderRestaurantNames = page.locator('h4, [class*="restaurant-name"]');
    this.orderTotals = page.locator(':text-matches("\\$\\d+\\.\\d{2}")');
    this.orderItems = page.locator('p:has-text(",")');

    // Order actions
    this.reorderButtons = page.locator('button:has-text("Reorder")');
    this.viewReceiptButtons = page.locator('button:has-text("View Receipt")');
    this.leaveReviewButtons = page.locator('button:has-text("Leave a review"), :text("Leave a review")');

    // Rating stars
    this.orderStars = page.locator('[class*="star"], button:has(svg[class*="star" i])');

    // Review dialog
    this.reviewDialog = page.locator('[role="dialog"]:has-text("review"), [role="dialog"]:has-text("rating")');
    this.reviewTextarea = this.reviewDialog.locator('textarea');
    this.submitReviewButton = this.reviewDialog.getByRole('button', { name: /submit|post|save/i });
  }

  /**
   * Navigate to orders page
   */
  async goto() {
    await super.goto('/orders');
    await this.waitForOrdersLoaded();
  }

  /**
   * Wait for orders page to be fully loaded
   */
  async waitForOrdersLoaded() {
    try {
      await Promise.race([
        this.pageTitle.waitFor({ state: 'visible', timeout: 10000 }),
        this.emptyOrdersMessage.waitFor({ state: 'visible', timeout: 10000 }),
      ]);
    } catch {
      // Page might still be loading
    }
  }

  /**
   * Switch to Personal tab
   */
  async switchToPersonal() {
    await this.personalTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Switch to Business tab
   */
  async switchToBusiness() {
    await this.businessTab.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get count of orders displayed
   */
  async getOrderCount(): Promise<number> {
    return await this.orderCards.count();
  }

  /**
   * Check if orders page is empty
   */
  async hasNoOrders(): Promise<boolean> {
    try {
      await this.emptyOrdersMessage.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click reorder button for an order
   */
  async clickReorder(orderIndex: number = 0) {
    await this.reorderButtons.nth(orderIndex).click();
    // Should redirect to store page with cart open
    await this.page.waitForURL(/\/store\/.*openCart/);
  }

  /**
   * Click view receipt for an order
   */
  async clickViewReceipt(orderIndex: number = 0) {
    await this.viewReceiptButtons.nth(orderIndex).click();
    await this.page.waitForURL(/\/orders\//);
  }

  /**
   * Click to leave a review for an order
   */
  async clickLeaveReview(orderIndex: number = 0) {
    await this.leaveReviewButtons.nth(orderIndex).click();
    await this.reviewDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Rate an order using stars
   */
  async rateOrder(orderIndex: number, rating: number) {
    const orderCard = this.orderCards.nth(orderIndex);
    const stars = orderCard.locator('button:has(svg[class*="star" i])');
    await stars.nth(rating - 1).click();
    await this.reviewDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Submit a review with rating and text
   */
  async submitReview(rating: number, reviewText: string) {
    // Click the rating stars in dialog
    const dialogStars = this.reviewDialog.locator('button:has(svg[class*="star" i])');
    await dialogStars.nth(rating - 1).click();

    // Fill review text
    await this.reviewTextarea.fill(reviewText);

    // Submit
    await this.submitReviewButton.click();
    await this.reviewDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Close review dialog
   */
  async closeReviewDialog() {
    const closeButton = this.reviewDialog.locator('button:has([class*="x" i]), button[aria-label*="close" i]').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await this.reviewDialog.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Get order details by index
   */
  async getOrderDetails(orderIndex: number): Promise<{
    restaurantName: string;
    total: string;
    items: string;
  }> {
    const orderCard = this.orderCards.nth(orderIndex);
    const restaurantName = await orderCard.locator('h4').first().textContent() || '';
    const total = await orderCard.locator(':text-matches("\\$\\d+\\.\\d{2}")').first().textContent() || '';
    const items = await orderCard.locator('p:has-text(",")').first().textContent() || '';

    return {
      restaurantName: restaurantName.trim(),
      total: total.trim(),
      items: items.trim(),
    };
  }

  /**
   * Navigate to order receipt page
   */
  async goToOrderReceipt(orderIndex: number = 0) {
    await this.clickViewReceipt(orderIndex);
  }

  /**
   * Check if an order has been reviewed
   */
  async isOrderReviewed(orderIndex: number): Promise<boolean> {
    const orderCard = this.orderCards.nth(orderIndex);
    try {
      await orderCard.locator(':text("Reviewed")').waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}



