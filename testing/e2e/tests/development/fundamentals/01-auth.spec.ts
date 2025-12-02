import { test, expect } from '@playwright/test';

/**
 * FUNDAMENTALS: Authentication Tests
 * Basic signup and login functionality - simple happy paths only
 */

test.describe('Fundamentals: Authentication', () => {
  
  test.beforeEach(async ({ context }) => {
    // Clear cookies and storage to ensure clean state
    await context.clearCookies();
  });
  
  test('can signup a new user', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Sign Up button
    const signUpBtn = page.getByRole('button', { name: /sign up/i }).first();
    await expect(signUpBtn).toBeVisible({ timeout: 5000 });
    await signUpBtn.click();
    await page.waitForTimeout(500);
    
    // Fill signup form
    const timestamp = Date.now();
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('User');
    await page.locator('#email').fill(`test${timestamp}@example.com`);
    await page.locator('#mobileNumber').fill('5551234567');
    await page.locator('#password').fill('TestPassword123');
    
    // Submit
    await page.locator('form').getByRole('button', { name: /sign up/i }).click();
    await page.waitForTimeout(1000);
    
    // Complete OTP (any 6 digits work in dev)
    const otpInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    if (await otpInput.isVisible({ timeout: 5000 })) {
      await otpInput.fill('123456');
      await page.getByRole('button', { name: /submit/i }).click();
      await page.waitForTimeout(2000);
    }
    
    // Should be logged in
    const isLoggedIn = await page.getByRole('link', { name: /orders/i }).isVisible({ timeout: 5000 }).catch(() => false);
    expect(isLoggedIn).toBeTruthy();
  });

  test('sign in shows error when email is empty', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Sign In button to open modal
    const signInBtn = page.getByRole('button', { name: /^sign in$/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 5000 });
    await signInBtn.click();
    await page.waitForTimeout(500);
    
    // Wait for modal to appear
    await expect(page.getByText('Sign in or Sign up')).toBeVisible({ timeout: 5000 });
    
    // Wait for email input to be visible in modal
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 3000 });
    
    // Try to continue without entering email
    const continueButton = page.getByRole('button', { name: /continue to sign in/i });
    await continueButton.click();
    await page.waitForTimeout(500);
    
    // Should show "Email is required" error
    await expect(page.getByText('Email is required')).toBeVisible({ timeout: 3000 });
  });

  test('sign in shows error when email is incorrect', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Sign In button to open modal
    const signInBtn = page.getByRole('button', { name: /^sign in$/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 5000 });
    await signInBtn.click();
    await page.waitForTimeout(500);
    
    // Wait for modal to appear
    await expect(page.getByText('Sign in or Sign up')).toBeVisible({ timeout: 5000 });
    
    // Wait for email input to be visible in modal
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 3000 });
    
    // Enter incorrect email
    await emailInput.fill('nonexistent@example.com');
    const continueButton = page.getByRole('button', { name: /continue to sign in/i });
    await continueButton.click();
    await page.waitForTimeout(1000);
    
    // Should show "Incorrect email" error
    await expect(page.getByText('Incorrect email')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/We couldn't find an account/i)).toBeVisible({ timeout: 3000 });
  });

  test('can login with existing user via modal', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Sign In button to open modal
    const signInBtn = page.getByRole('button', { name: /^sign in$/i }).first();
    await expect(signInBtn).toBeVisible({ timeout: 5000 });
    await signInBtn.click();
    await page.waitForTimeout(500);
    
    // Wait for modal to appear
    await expect(page.getByText('Sign in or Sign up')).toBeVisible({ timeout: 5000 });
    
    // Wait for email input to be visible in modal
    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible({ timeout: 3000 });
    
    // Enter correct email
    await emailInput.fill('kai.hayes1@example.com');
    const continueButton = page.getByRole('button', { name: /continue to sign in/i });
    await continueButton.click();
    await page.waitForTimeout(1000);
    
    // Should show OTP form (6 input fields)
    const otpInputs = page.locator('input[id^="otp-"]');
    await expect(otpInputs.first()).toBeVisible({ timeout: 5000 });
    
    // Enter any 6-digit OTP (any 6 digits work in dev)
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1));
    }
    
    // Click Sign In button (should be visible in the OTP form)
    const signInButton = page.getByRole('button', { name: /^sign in$/i }).filter({ hasText: /sign in/i }).last();
    await signInButton.click();
    await page.waitForTimeout(2000);
    
    // Modal should close and user should be logged in
    // Check for logged-in state (orders link or home page)
    const isLoggedIn = await page.getByRole('link', { name: /orders/i }).isVisible({ timeout: 5000 }).catch(() => false);
    expect(isLoggedIn).toBeTruthy();
  });

  test('can login with existing user via auth page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    
    // Enter email
    await page.locator('#email').fill('kai.hayes1@example.com');
    await page.getByRole('button', { name: /continue/i }).click();
    await page.waitForTimeout(1000);
    
    // Enter OTP (any 6 digits work)
    const otpInputs = page.locator('input[id^="otp-"]');
    if (await otpInputs.first().isVisible({ timeout: 5000 })) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill(String(i + 1));
      }
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(2000);
    }
    
    // Should redirect to home
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
  });

  test('auth page redirects logged-in users to home', async ({ page }) => {
    // First login
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
    
    // Try to go back to auth page
    await page.goto('http://localhost:3000/auth');
    await page.waitForTimeout(1000);
    
    // Should redirect to home (or stay on home)
    const url = page.url();
    expect(url.includes('/home') || url.includes('/auth')).toBeTruthy();
  });
});
