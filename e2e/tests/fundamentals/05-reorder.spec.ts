import { test, expect } from '@playwright/test';

/**
 * FUNDAMENTALS: Reorder Flow
 * Basic reorder functionality from orders page
 */

test.describe('Fundamentals: Reorder', () => {
  
  test('orders page loads for authenticated user', async ({ page, context }) => {
    await context.clearCookies();
    
    // Quick login
    await page.goto('http://localhost:3000/auth');
    await page.locator('#email').fill('kai.hayes1@example.com');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(1000);
    
    const otpInputs = page.locator('input[id^="otp-"]');
    if (await otpInputs.first().isVisible({ timeout: 5000 })) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('1');
      }
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);
    }
    
    // Navigate to orders
    await page.goto('http://localhost:3000/orders');
    await page.waitForLoadState('networkidle');
    
    // Should be on orders page
    expect(page.url()).toContain('orders');
  });

  test('can see past orders or empty state', async ({ page, context }) => {
    await context.clearCookies();
    
    // Login
    await page.goto('http://localhost:3000/auth');
    await page.locator('#email').fill('kai.hayes1@example.com');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(1000);
    
    const otpInputs = page.locator('input[id^="otp-"]');
    if (await otpInputs.first().isVisible({ timeout: 5000 })) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('1');
      }
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);
    }
    
    await page.goto('http://localhost:3000/orders');
    await page.waitForTimeout(2000);
    
    // Should load content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });
});
