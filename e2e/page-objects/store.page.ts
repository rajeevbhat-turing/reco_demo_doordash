import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Store/Restaurant page (/store/[id])
 */
export class StorePage extends BasePage {
  // Store info
  readonly storeName: Locator;
  readonly storeRating: Locator;
  readonly storeCuisine: Locator;
  readonly storeDistance: Locator;
  readonly deliveryTime: Locator;
  readonly deliveryFee: Locator;
  readonly saveButton: Locator;

  // Menu navigation
  readonly menuCategories: Locator;
  readonly searchInput: Locator;

  // Menu items
  readonly menuItems: Locator;
  readonly featuredItems: Locator;
  readonly mostOrderedItems: Locator;
  readonly addToCartButtons: Locator;

  // Menu item dialog
  readonly menuItemDialog: Locator;
  readonly dialogItemName: Locator;
  readonly dialogAddToCartButton: Locator;
  readonly dialogQuantity: Locator;
  readonly dialogIncrease: Locator;
  readonly dialogDecrease: Locator;
  readonly dialogClose: Locator;

  // Reviews section
  readonly reviewsSection: Locator;
  readonly viewAllReviewsLink: Locator;

  // Store details
  readonly seeMoreButton: Locator;
  readonly storeDetailsDialog: Locator;

  constructor(page: Page) {
    super(page);

    // Store info
    this.storeName = page.locator('h1').first();
    this.storeRating = page.locator('[class*="rating"], .font-semibold:has-text("★")').first();
    this.storeCuisine = page.locator('[class*="cuisine"]').first();
    this.storeDistance = page.locator('[class*="distance"]').first();
    this.deliveryTime = page.locator('[class*="delivery-time"], :text-matches("\\d+-\\d+ min")').first();
    this.deliveryFee = page.locator('[class*="delivery-fee"], :text("delivery fee")').first();
    this.saveButton = page.getByRole('button', { name: /save/i });

    // Menu navigation
    this.menuCategories = page.locator('ul li button, [class*="menu-category"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');

    // Menu items
    this.menuItems = page.locator('[class*="menu-item"], [class*="border"]:has(h3):has(button)');
    this.featuredItems = page.locator('[class*="featured"] [class*="item"], section:has-text("Featured") [class*="border"]:has(h3)');
    this.mostOrderedItems = page.locator('section:has-text("Most Ordered") [class*="border"]:has(h3)');
    this.addToCartButtons = page.locator('button:has-text("+"), button[aria-label="Add to cart"]');

    // Menu item dialog
    this.menuItemDialog = page.locator('[role="dialog"], [class*="dialog"]').first();
    this.dialogItemName = this.menuItemDialog.locator('h2, h3').first();
    this.dialogAddToCartButton = this.menuItemDialog.getByRole('button', { name: /add to (cart|order)/i });
    this.dialogQuantity = this.menuItemDialog.locator('[class*="quantity"], span:has-text("×")');
    this.dialogIncrease = this.menuItemDialog.locator('button:has-text("+")').last();
    this.dialogDecrease = this.menuItemDialog.locator('button:has-text("-")').last();
    this.dialogClose = this.menuItemDialog.locator('button:has([class*="x" i]), button[aria-label*="close" i]').first();

    // Reviews
    this.reviewsSection = page.locator('section:has-text("Reviews"), [class*="reviews"]');
    this.viewAllReviewsLink = page.getByRole('link', { name: /view all reviews|see all/i });

    // Store details
    this.seeMoreButton = page.getByRole('button', { name: /see more/i });
    this.storeDetailsDialog = page.locator('[role="dialog"]:has-text("Store Info")');
  }

  /**
   * Navigate to a specific store
   */
  async gotoStore(storeId: string) {
    await super.goto(`/store/${encodeURIComponent(storeId)}`);
    await this.waitForStoreLoaded();
  }

  /**
   * Wait for store page to be fully loaded
   */
  async waitForStoreLoaded() {
    try {
      await Promise.race([
        this.storeName.waitFor({ state: 'visible', timeout: 15000 }),
        this.page.getByText(/loading/i).waitFor({ state: 'hidden', timeout: 15000 }),
      ]);
      await this.page.waitForTimeout(500); // Wait for menu items
    } catch {
      // Store might be loading
    }
  }

  /**
   * Get the store name
   */
  async getStoreName(): Promise<string> {
    return await this.getTextContent(this.storeName);
  }

  /**
   * Get all menu items
   */
  async getMenuItems(): Promise<Locator[]> {
    const count = await this.menuItems.count();
    const items: Locator[] = [];
    for (let i = 0; i < count; i++) {
      items.push(this.menuItems.nth(i));
    }
    return items;
  }

  /**
   * Get count of menu items
   */
  async getMenuItemCount(): Promise<number> {
    return await this.menuItems.count();
  }

  /**
   * Click on a menu item to open details dialog
   */
  async clickMenuItem(index: number = 0) {
    await this.menuItems.nth(index).click();
    await this.menuItemDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Click on a menu item by name
   */
  async clickMenuItemByName(name: string) {
    const item = this.page.locator(`[class*="border"]:has(h3:has-text("${name}"))`).first();
    await item.click();
    await this.menuItemDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Add current item from dialog to cart
   */
  async addItemToCartFromDialog() {
    await this.dialogAddToCartButton.click();
    // Wait for dialog to close or cart to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Add item directly without opening dialog (quick add)
   */
  async quickAddItem(index: number = 0) {
    const addButton = this.menuItems.nth(index).locator('button:has-text("+"), button[aria-label="Add to cart"]').first();
    await addButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Set quantity in dialog
   */
  async setQuantityInDialog(quantity: number) {
    // Reset to 1 first by clicking decrease until we hit 1
    for (let i = 0; i < 10; i++) {
      const currentQty = await this.dialogQuantity.textContent();
      if (currentQty && parseInt(currentQty) <= 1) break;
      await this.dialogDecrease.click();
    }
    // Now increase to desired quantity
    for (let i = 1; i < quantity; i++) {
      await this.dialogIncrease.click();
    }
  }

  /**
   * Close the menu item dialog
   */
  async closeDialog() {
    if (await this.menuItemDialog.isVisible()) {
      await this.dialogClose.click();
      await this.menuItemDialog.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Search menu items
   */
  async searchMenu(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear menu search
   */
  async clearMenuSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to a menu category
   */
  async selectMenuCategory(categoryName: string) {
    const category = this.menuCategories.filter({ hasText: categoryName }).first();
    await category.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle save/favorite store
   */
  async toggleSaveStore() {
    await this.saveButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if store is saved/favorited
   */
  async isStoreSaved(): Promise<boolean> {
    const saveButtonHtml = await this.saveButton.innerHTML();
    return saveButtonHtml.includes('fill-red') || saveButtonHtml.includes('fill="red"');
  }

  /**
   * Open store details modal
   */
  async openStoreDetails() {
    await this.seeMoreButton.click();
    await this.storeDetailsDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Navigate to reviews page
   */
  async goToReviews() {
    if (await this.viewAllReviewsLink.isVisible()) {
      await this.viewAllReviewsLink.click();
      await this.page.waitForURL(/\/reviews\/store\//);
    }
  }

  /**
   * Get all menu category names
   */
  async getMenuCategoryNames(): Promise<string[]> {
    const categories: string[] = [];
    const count = await this.menuCategories.count();
    for (let i = 0; i < count; i++) {
      const text = await this.menuCategories.nth(i).textContent();
      if (text) categories.push(text.trim());
    }
    return categories;
  }

  /**
   * Get menu item info by index
   */
  async getMenuItemInfo(index: number): Promise<{ name: string; price: string }> {
    const item = this.menuItems.nth(index);
    const name = await item.locator('h3').first().textContent() || '';
    const price = await item.locator(':text-matches("\\$[\\d.]+")').first().textContent() || '';
    return { name: name.trim(), price: price.trim() };
  }
}



