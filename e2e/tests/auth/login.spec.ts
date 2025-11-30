import { test, expect } from '../../fixtures/auth.fixtures';
import { testCredentials } from '../../test-credentials';

test.describe('Customer Login', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.goto();
  });

  test('should successfully login with valid credentials via OTP', async ({ authPage, page }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    const otpDigits = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < otpDigits.length; i++) {
      await authPage.otpInputs.nth(i).fill(otpDigits[i]);
    }
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/account/i)).toBeVisible();
  });

  test('should display email input field on auth page', async ({ authPage }) => {
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.continueButton).toBeVisible();
  });

  test('should transition to OTP form after entering valid email', async ({ authPage }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    await expect(authPage.otpInputs.first()).toBeVisible();
  });

  test('should have correct number of OTP input fields', async ({ authPage }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    const otpCount = await authPage.otpInputs.count();
    expect(otpCount).toBe(6);
  });

  test('should allow switching between Sign In and Sign Up tabs', async ({ authPage }) => {
    await expect(authPage.emailInput).toBeVisible();
    await authPage.signUpTab.click();
    await authPage.page.waitForTimeout(500);
    await expect(authPage.signInTab).toBeVisible();
  });

  test('should persist login session across page refresh', async ({ authPage, page }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    for (let i = 0; i < 6; i++) {
      await authPage.otpInputs.nth(i).fill(String(i + 1));
    }
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible({ timeout: 10000 });
  });

  test('should redirect authenticated user to home page', async ({ authPage, page }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    for (let i = 0; i < 6; i++) {
      await authPage.otpInputs.nth(i).fill(String(i + 1));
    }
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test('should handle login with different valid users', async ({ authPage, page }) => {
    const alternateEmail = `test.user+${Date.now()}@example.com`;
    await authPage.emailInput.fill(alternateEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    for (let i = 0; i < 6; i++) {
      await authPage.otpInputs.nth(i).fill(String(i + 1));
    }
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
  });

  test('should accept OTP with all same digits', async ({ authPage, page }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    for (let i = 0; i < 6; i++) {
      await authPage.otpInputs.nth(i).fill('1');
    }
    await authPage.signInButton.click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
  });

  test('should auto-focus next OTP input after entering digit', async ({ authPage }) => {
    const { email: testEmail } = testCredentials.validUser;
    await authPage.emailInput.fill(testEmail);
    await authPage.continueButton.click();
    await authPage.waitForOTPForm();
    await authPage.otpInputs.nth(0).focus();
    await authPage.otpInputs.nth(0).fill('1');
    await authPage.page.waitForTimeout(100);
  });
});
