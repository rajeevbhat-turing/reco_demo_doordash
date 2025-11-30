import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object with common functionality shared across all pages
 */
export class BasePage {
  readonly page: Page;

  // Common navigation elements
  readonly sidebar: Locator;
  readonly ordersLink: Locator;
  readonly homeLink: Locator;
  readonly accountText: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;

  // Header elements
  readonly searchInput: Locator;
  readonly addressSelector: Locator;

  // Cart elements
  readonly cartButton: Locator;
  readonly cartSidebar: Locator;
  readonly cartItemCount: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar navigation
    this.sidebar = page.locator('[class*="sidebar"]').first();
    this.ordersLink = page.getByRole('link', { name: /orders/i });
    this.homeLink = page.getByRole('link', { name: /home/i });
    this.accountText = page.getByText(/account/i);

    // Header buttons
    this.signInButton = page.getByRole('button', { name: /^sign in$/i }).first();
    this.signUpButton = page.getByRole('button', { name: /^sign up$/i }).first();

    // Search
    this.searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="delivery address" i]').first();

    // Address
    this.addressSelector = page.locator('[data-testid="address-selector"], button:has-text("Enter delivery address")').first();

    // Cart
    this.cartButton = page.locator('[data-testid="cart-button"], button:has([class*="shopping-cart" i])').first();
    this.cartSidebar = page.locator('[class*="cart-sidebar" i], [data-testid="cart-sidebar"]').first();
    this.cartItemCount = page.locator('[data-testid="cart-count"]').first();
  }

  /**
   * Navigate to a path and wait for page to be ready
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  /**
   * Wait for page to be fully loaded and interactive
   */
  async waitForPageReady() {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for network to be mostly idle, but with a reasonable timeout
    await this.page.waitForLoadState('networkidle').catch(() => {
      // Network might not become fully idle, that's okay
    });
  }

  /**
   * Check if user is authenticated (logged in)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if authenticated user elements are visible
      await this.ordersLink.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to home page
   */
  async goToHome() {
    await this.goto('/home');
  }

  /**
   * Navigate to orders page
   */
  async goToOrders() {
    await this.ordersLink.click();
    await this.page.waitForURL(/\/orders/);
  }

  /**
   * Clear browser storage (localStorage, sessionStorage, cookies)
   */
  async clearBrowserStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.context().clearCookies();
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForStableElement(selector: string, timeout = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await this.page.waitForTimeout(200); // Wait for animations
    return element;
  }

  /**
   * Get text content from an element, with optional fallback
   */
  async getTextContent(locator: Locator, fallback: string = ''): Promise<string> {
    try {
      const text = await locator.textContent();
      return text?.trim() || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(urlPattern: string | RegExp, timeout = 10000) {
    await this.page.waitForURL(urlPattern, { timeout });
    await this.waitForPageReady();
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get count from an element's text (e.g., "(5)" -> 5)
   */
  async extractNumberFromText(locator: Locator): Promise<number> {
    const text = await this.getTextContent(locator);
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}



