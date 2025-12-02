import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Home page (/home)
 */
export class HomePage extends BasePage {
  // Restaurant cards
  readonly restaurantCards: Locator;
  readonly restaurantNames: Locator;
  
  // Category filters
  readonly foodCategories: Locator;
  readonly filterOptions: Locator;
  
  // Sections
  readonly restaurantSections: Locator;
  readonly promoBanners: Locator;
  
  // Filter buttons
  readonly underThirtyMinsFilter: Locator;
  readonly dealsFilter: Locator;
  readonly dashPassFilter: Locator;
  readonly ratingFilter: Locator;
  readonly priceFilter: Locator;

  constructor(page: Page) {
    super(page);

    // Restaurant cards
    this.restaurantCards = page.locator('[class*="restaurant-card"], a[href^="/store/"]');
    this.restaurantNames = page.locator('[class*="restaurant-card"] h3, a[href^="/store/"] h3');

    // Categories
    this.foodCategories = page.locator('[class*="food-categories"], [class*="category"]');
    this.filterOptions = page.locator('[class*="filter"]');

    // Sections
    this.restaurantSections = page.locator('section, [class*="section"]');
    this.promoBanners = page.locator('[class*="promo"], [class*="banner"]');

    // Specific filters
    this.underThirtyMinsFilter = page.getByRole('button', { name: /under 30/i });
    this.dealsFilter = page.getByRole('button', { name: /deals/i });
    this.dashPassFilter = page.getByRole('button', { name: /dashpass/i });
    this.ratingFilter = page.getByRole('button', { name: /rating/i });
    this.priceFilter = page.getByRole('button', { name: /price/i });
  }

  /**
   * Navigate to home page
   */
  async goto() {
    await super.goto('/home');
    await this.waitForRestaurantsLoaded();
  }

  /**
   * Wait for restaurants to be loaded on the page
   */
  async waitForRestaurantsLoaded() {
    try {
      // Wait for either restaurants to load or "stay tuned" message
      await Promise.race([
        this.restaurantCards.first().waitFor({ state: 'visible', timeout: 10000 }),
        this.page.getByText(/stay tuned/i).waitFor({ state: 'visible', timeout: 10000 }),
        this.page.getByText(/no restaurants/i).waitFor({ state: 'visible', timeout: 10000 }),
      ]);
    } catch {
      // Page might be loading, continue
    }
  }

  /**
   * Get all restaurant card elements
   */
  async getRestaurantCards(): Promise<Locator[]> {
    const count = await this.restaurantCards.count();
    const cards: Locator[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.restaurantCards.nth(i));
    }
    return cards;
  }

  /**
   * Get count of visible restaurants
   */
  async getRestaurantCount(): Promise<number> {
    await this.waitForRestaurantsLoaded();
    return await this.restaurantCards.count();
  }

  /**
   * Click on a restaurant card by name
   */
  async clickRestaurantByName(name: string) {
    const card = this.page.locator(`a[href^="/store/"]:has-text("${name}")`).first();
    await card.click();
    await this.page.waitForURL(/\/store\//);
  }

  /**
   * Click on a restaurant card by index
   */
  async clickRestaurantByIndex(index: number) {
    await this.restaurantCards.nth(index).click();
    await this.page.waitForURL(/\/store\//);
  }

  /**
   * Apply filter by clicking a filter button
   */
  async applyFilter(filterName: 'under30' | 'deals' | 'dashpass') {
    const filterMap = {
      under30: this.underThirtyMinsFilter,
      deals: this.dealsFilter,
      dashpass: this.dashPassFilter,
    };
    await filterMap[filterName].click();
    await this.page.waitForTimeout(500); // Wait for filter to apply
  }

  /**
   * Click on a food category
   */
  async selectFoodCategory(categoryName: string) {
    const category = this.page.getByRole('button', { name: new RegExp(categoryName, 'i') }).first();
    await category.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Reset all filters
   */
  async resetFilters() {
    const resetButton = this.page.getByRole('button', { name: /reset/i });
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Search for a restaurant
   */
  async searchRestaurant(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if a restaurant with given name is visible
   */
  async isRestaurantVisible(name: string): Promise<boolean> {
    try {
      const restaurant = this.page.locator(`a[href^="/store/"]:has-text("${name}")`).first();
      await restaurant.waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all visible restaurant names
   */
  async getAllRestaurantNames(): Promise<string[]> {
    const cards = await this.getRestaurantCards();
    const names: string[] = [];
    for (const card of cards) {
      const nameElement = card.locator('h3, [class*="name"]').first();
      const name = await nameElement.textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }
}



