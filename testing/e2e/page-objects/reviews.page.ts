import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for the Store Reviews page (/reviews/store/[storeId])
 */
export class ReviewsPage extends BasePage {
  // Page header
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  readonly storeName: Locator;

  // Overall rating section
  readonly overallRating: Locator;
  readonly ratingCount: Locator;
  readonly publicReviewsCount: Locator;

  // Add review button
  readonly addReviewButton: Locator;

  // Review cards
  readonly reviewCards: Locator;
  readonly reviewUserNames: Locator;
  readonly reviewRatings: Locator;
  readonly reviewDates: Locator;
  readonly reviewContents: Locator;
  readonly reviewPhotos: Locator;

  // Helpful buttons
  readonly helpfulButtons: Locator;

  // Customer photos section
  readonly customerPhotosSection: Locator;
  readonly customerPhotos: Locator;

  // Review dialog
  readonly reviewDialog: Locator;
  readonly reviewStars: Locator;
  readonly reviewTextarea: Locator;
  readonly reviewSubmitButton: Locator;
  readonly reviewDialogClose: Locator;

  // Photo viewer modal
  readonly photoViewerModal: Locator;
  readonly photoViewerImage: Locator;
  readonly photoViewerClose: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('h2:has-text("Ratings and reviews")');
    this.backButton = page.locator('button:has([class*="chevron-left" i])').first();
    this.storeName = page.locator('h1').first();

    // Overall rating section
    this.overallRating = page.locator('[class*="rating"], .text-3xl:has-text(".")').first();
    this.ratingCount = page.locator(':text-matches("\\d+\\+ ratings")');
    this.publicReviewsCount = page.locator(':text-matches("\\d+ public reviews")');

    // Add review button
    this.addReviewButton = page.getByRole('button', { name: /add a review/i });

    // Review cards
    this.reviewCards = page.locator('[class*="review-card"], div:has(div[class*="star"]):has(p)');
    this.reviewUserNames = page.locator('[class*="user-name"], span.font-bold');
    this.reviewRatings = page.locator('[class*="review-rating"], div:has([class*="star"])');
    this.reviewDates = page.locator(':text-matches("\\d+/\\d+/\\d+")');
    this.reviewContents = page.locator('[class*="review-content"], p.text-\\[16px\\]');
    this.reviewPhotos = page.locator('[class*="review-photo"], img[src*="review"]');

    // Helpful buttons
    this.helpfulButtons = page.locator('button:has-text("Helpful")');

    // Customer photos section
    this.customerPhotosSection = page.locator('section:has-text("Customer photos"), div:has-text("Customer photos")');
    this.customerPhotos = this.customerPhotosSection.locator('img');

    // Review dialog
    this.reviewDialog = page.locator('[role="dialog"]:has-text("review"), [role="dialog"]:has(textarea)');
    this.reviewStars = this.reviewDialog.locator('button:has(svg[class*="star" i])');
    this.reviewTextarea = this.reviewDialog.locator('textarea');
    this.reviewSubmitButton = this.reviewDialog.getByRole('button', { name: /submit|post|save/i });
    this.reviewDialogClose = this.reviewDialog.locator('button:has([class*="x" i]), button[aria-label*="close" i]').first();

    // Photo viewer modal
    this.photoViewerModal = page.locator('[role="dialog"]:has(img:not([src*="avatar"]))');
    this.photoViewerImage = this.photoViewerModal.locator('img');
    this.photoViewerClose = this.photoViewerModal.locator('button:has([class*="x" i]), button[aria-label*="close" i]').first();
  }

  /**
   * Navigate to store reviews page
   */
  async gotoStoreReviews(storeId: string) {
    await super.goto(`/reviews/store/${encodeURIComponent(storeId)}`);
    await this.waitForReviewsLoaded();
  }

  /**
   * Wait for reviews page to be fully loaded
   */
  async waitForReviewsLoaded() {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // Might redirect if no reviews
    }
  }

  /**
   * Go back to store page
   */
  async goBackToStore() {
    await this.backButton.click();
    await this.page.waitForURL(/\/store\//);
  }

  /**
   * Get overall rating value
   */
  async getOverallRating(): Promise<number> {
    const text = await this.getTextContent(this.overallRating);
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  /**
   * Get count of reviews
   */
  async getReviewCount(): Promise<number> {
    return await this.reviewCards.count();
  }

  /**
   * Open add review dialog
   */
  async openAddReviewDialog() {
    await this.addReviewButton.click();
    await this.reviewDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Submit a new review
   */
  async submitReview(rating: number, content: string) {
    await this.openAddReviewDialog();

    // Click rating star
    await this.reviewStars.nth(rating - 1).click();

    // Fill content
    await this.reviewTextarea.fill(content);

    // Submit
    await this.reviewSubmitButton.click();
    await this.reviewDialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Close review dialog
   */
  async closeReviewDialog() {
    if (await this.reviewDialog.isVisible()) {
      await this.reviewDialogClose.click();
      await this.reviewDialog.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Click helpful on a review
   */
  async clickHelpful(reviewIndex: number) {
    await this.helpfulButtons.nth(reviewIndex).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if helpful button is active (already clicked by current user)
   */
  async isHelpfulActive(reviewIndex: number): Promise<boolean> {
    const button = this.helpfulButtons.nth(reviewIndex);
    const className = await button.getAttribute('class') || '';
    return className.includes('bg-[#191919ff]') || className.includes('text-white');
  }

  /**
   * Get review details by index
   */
  async getReviewDetails(reviewIndex: number): Promise<{
    userName: string;
    rating: number;
    date: string;
    content: string;
  }> {
    const reviewCard = this.reviewCards.nth(reviewIndex);
    const userName = await reviewCard.locator('span.font-bold').first().textContent() || '';
    const dateText = await reviewCard.locator(':text-matches("\\d+/\\d+/\\d+")').first().textContent() || '';
    const content = await reviewCard.locator('p.text-\\[16px\\], p[class*="content"]').first().textContent() || '';
    
    // Count filled stars
    const filledStars = await reviewCard.locator('[class*="fill-"]').count();

    return {
      userName: userName.trim(),
      rating: filledStars,
      date: dateText.trim(),
      content: content.trim(),
    };
  }

  /**
   * Click on a customer photo to open viewer
   */
  async openPhotoViewer(photoIndex: number = 0) {
    await this.customerPhotos.nth(photoIndex).click();
    await this.photoViewerModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Close photo viewer
   */
  async closePhotoViewer() {
    if (await this.photoViewerModal.isVisible()) {
      await this.photoViewerClose.click();
      await this.photoViewerModal.waitFor({ state: 'hidden', timeout: 3000 });
    }
  }

  /**
   * Get count of customer photos
   */
  async getCustomerPhotoCount(): Promise<number> {
    return await this.customerPhotos.count();
  }

  /**
   * Navigate to user profile from a review
   */
  async goToUserProfile(reviewIndex: number) {
    const reviewCard = this.reviewCards.nth(reviewIndex);
    const profileLink = reviewCard.locator('a[href*="/consumer/profile/"]').first();
    await profileLink.click();
    await this.page.waitForURL(/\/consumer\/profile\//);
  }
}



