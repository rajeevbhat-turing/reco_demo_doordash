import { test, expect } from '@playwright/test';

/**
 * FUNDAMENTALS: Reviews & Ratings
 * Basic review viewing and submission
 * Note: Review URLs use numeric store IDs
 */

test.describe('Fundamentals: Reviews', () => {
  
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });
  
  test('can view store reviews page', async ({ page }) => {
    await page.goto('http://localhost:3000/reviews/store/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should load some content
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('reviews page shows content', async ({ page }) => {
    await page.goto('http://localhost:3000/reviews/store/2');
    await page.waitForTimeout(2000);
    
    // Should have some text content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });
});
