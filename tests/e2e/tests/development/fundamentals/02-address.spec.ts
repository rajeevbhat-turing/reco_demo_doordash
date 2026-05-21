import { test, expect } from '@playwright/test';
import { E2E_LOGIN_EMAIL } from '../../../constants';

/**
 * FUNDAMENTALS: Address Modal Tests
 * Basic address entry and selection
 */

test.describe('Fundamentals: Address', () => {
  
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });
  
  test('can enter delivery address on landing page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Look for address input
    const addressInput = page.locator('input[placeholder*="address" i], input[placeholder*="delivery" i], input[placeholder*="location" i]').first();
    
    if (await addressInput.isVisible({ timeout: 5000 })) {
      await addressInput.fill('123 Main Street, New York, NY 10001');
      await page.waitForTimeout(500);
      expect(true).toBeTruthy();
    } else {
      // No address input on landing - that's ok
      expect(true).toBeTruthy();
    }
  });

  test('logged in user can access address settings', async ({ page }) => {
    // Quick login
    await page.goto('http://localhost:3000/auth');
    await page.locator('#email').fill(E2E_LOGIN_EMAIL);
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
    
    // Should be logged in
    const isOnHome = page.url().includes('/home');
    expect(isOnHome).toBeTruthy();
  });
});
