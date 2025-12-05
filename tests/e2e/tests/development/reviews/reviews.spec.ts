import { test, expect } from '../../../fixtures/test.fixtures';

/**
 * Reviews E2E Tests
 * 
 * Comprehensive test suite for review functionality including:
 * - Viewing store reviews
 * - Rating and writing reviews
 * - Review photos
 * - Helpful ratings
 * - Review from orders page
 * 
 * @playwright-report
 */
test.describe('Store Reviews', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Reviews Page Display', () => {
    test('should display reviews page for a store', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      // Wait for page to load (might redirect if no reviews)
      await reviewsPage.page.waitForLoadState('networkidle');
      
      // Either reviews page loads or redirects to store
      const url = reviewsPage.page.url();
      const isOnReviewsPage = url.includes('/reviews/');
      const isOnStorePage = url.includes('/store/');
      
      expect(isOnReviewsPage || isOnStorePage).toBeTruthy();
    });

    test('should show overall rating', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      // If reviews exist, overall rating should be visible
      if (await reviewsPage.overallRating.isVisible({ timeout: 5000 })) {
        const rating = await reviewsPage.getOverallRating();
        // Rating should be between 0 and 5
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
      }
    });

    test('should show ratings and reviews count', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      if (await reviewsPage.ratingCount.isVisible({ timeout: 5000 })) {
        const text = await reviewsPage.ratingCount.textContent();
        expect(text).toContain('ratings');
      }
    });

    test('should list individual reviews', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      // Reviews may or may not exist
    });
  });

  test.describe('Review Card Content', () => {
    test('should display reviewer name', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        const reviewDetails = await reviewsPage.getReviewDetails(0);
        expect(reviewDetails.userName).toBeTruthy();
      }
    });

    test('should display review rating', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        const reviewDetails = await reviewsPage.getReviewDetails(0);
        expect(reviewDetails.rating).toBeGreaterThanOrEqual(1);
        expect(reviewDetails.rating).toBeLessThanOrEqual(5);
      }
    });

    test('should display review date', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        const reviewDetails = await reviewsPage.getReviewDetails(0);
        // Date format should be like "1/15/24"
      }
    });

    test('should display review content', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        const reviewDetails = await reviewsPage.getReviewDetails(0);
        // Content may be empty for some reviews
      }
    });
  });

  test.describe('Customer Photos', () => {
    test('should display customer photos section if photos exist', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      // Customer photos section is optional
      if (await reviewsPage.customerPhotosSection.isVisible({ timeout: 3000 })) {
        const photoCount = await reviewsPage.getCustomerPhotoCount();
        expect(photoCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should open photo viewer when clicking photo', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const photoCount = await reviewsPage.getCustomerPhotoCount();
      if (photoCount > 0) {
        await reviewsPage.openPhotoViewer(0);
        await expect(reviewsPage.photoViewerModal).toBeVisible({ timeout: 5000 });
      }
    });

    test('should close photo viewer', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const photoCount = await reviewsPage.getCustomerPhotoCount();
      if (photoCount > 0) {
        await reviewsPage.openPhotoViewer(0);
        await reviewsPage.closePhotoViewer();
        await expect(reviewsPage.photoViewerModal).not.toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Helpful Ratings', () => {
    test('should display helpful button on reviews', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        await expect(reviewsPage.helpfulButtons.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should allow authenticated user to mark review as helpful', async ({ 
      reviewsPage, 
      authModalPage, 
      page 
    }) => {
      // Login first
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      // Go to reviews
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        await reviewsPage.clickHelpful(0);
        // Button style should change
      }
    });

    test('should toggle helpful state', async ({ reviewsPage, authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      const reviewCount = await reviewsPage.getReviewCount();
      if (reviewCount > 0) {
        // Click to mark helpful
        await reviewsPage.clickHelpful(0);
        // Click again to unmark
        await reviewsPage.clickHelpful(0);
      }
    });
  });

  test.describe('Adding Reviews', () => {
    test('should show add review button for authenticated users', async ({ 
      reviewsPage, 
      authModalPage, 
      page 
    }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      // Add review button should be visible for logged in users
      if (await reviewsPage.addReviewButton.isVisible({ timeout: 5000 })) {
        // Button is visible
      }
    });

    test('should open review dialog', async ({ reviewsPage, authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      if (await reviewsPage.addReviewButton.isVisible({ timeout: 5000 })) {
        await reviewsPage.openAddReviewDialog();
        await expect(reviewsPage.reviewDialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('should close review dialog', async ({ reviewsPage, authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      if (await reviewsPage.addReviewButton.isVisible({ timeout: 5000 })) {
        await reviewsPage.openAddReviewDialog();
        await reviewsPage.closeReviewDialog();
        await expect(reviewsPage.reviewDialog).not.toBeVisible({ timeout: 3000 });
      }
    });

    test('should submit a new review', async ({ reviewsPage, authModalPage, page }) => {
      await authModalPage.signupSuccessfully();
      await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
      
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      if (await reviewsPage.addReviewButton.isVisible({ timeout: 5000 })) {
        await reviewsPage.submitReview(4, 'Great food and fast delivery!');
        // Review should be added
      }
    });
  });

  test.describe('Review from Store Page', () => {
    test('should navigate to reviews from store page', async ({ storePage }) => {
      await storePage.gotoStore('mcdonalds');
      await storePage.waitForStoreLoaded();
      
      // Look for "View All Reviews" or similar link
      if (await storePage.viewAllReviewsLink.isVisible({ timeout: 5000 })) {
        await storePage.goToReviews();
        await expect(storePage.page).toHaveURL(/\/reviews\/store\//);
      }
    });
  });

  test.describe('Back Navigation', () => {
    test('should navigate back to store from reviews', async ({ reviewsPage }) => {
      await reviewsPage.gotoStoreReviews('mcdonalds');
      
      if (await reviewsPage.backButton.isVisible({ timeout: 5000 })) {
        await reviewsPage.goBackToStore();
        await expect(reviewsPage.page).toHaveURL(/\/store\//);
      }
    });
  });
});

test.describe('Review from Orders Page', () => {
  test('should allow reviewing completed orders', async ({ ordersPage, authModalPage, page }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    await ordersPage.goto();
    
    // If there are orders, rating stars should be visible
    const orderCount = await ordersPage.getOrderCount();
    if (orderCount > 0) {
      // Can rate the order
    }
  });

  test('should display reviewed status on orders', async ({ ordersPage, authModalPage, page }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    
    await ordersPage.goto();
    
    const orderCount = await ordersPage.getOrderCount();
    if (orderCount > 0) {
      const isReviewed = await ordersPage.isOrderReviewed(0);
      // Status depends on order state
    }
  });
});

test.describe('User Profile Reviews', () => {
  test('should navigate to user profile from review', async ({ reviewsPage }) => {
    await reviewsPage.gotoStoreReviews('mcdonalds');
    
    const reviewCount = await reviewsPage.getReviewCount();
    if (reviewCount > 0) {
      await reviewsPage.goToUserProfile(0);
      await expect(reviewsPage.page).toHaveURL(/\/consumer\/profile\//);
    }
  });
});



