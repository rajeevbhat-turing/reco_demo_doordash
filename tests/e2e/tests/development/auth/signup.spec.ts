import { test, expect } from '../../../fixtures/auth.fixtures';
import { clearBrowserStorage } from '../../../utils/test-helpers';

test.describe('Customer Signup via Authentication Modal', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
  });

  test('should successfully sign up a new user via modal', async ({ authModalPage, page }) => {
    await authModalPage.signupSuccessfully();
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
    await expect(page.getByText(/account/i)).toBeVisible();
  });

  test('should show validation errors when required fields are empty', async ({ authModalPage }) => {
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.submitSignup();
    await expect(authModalPage.firstNameError).toBeVisible();
    await expect(authModalPage.passwordError).toBeVisible();
  });

  test('should validate email format', async ({ authModalPage }) => {
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.fillSignupForm({
      firstName: 'E2E',
      lastName: 'User',
      email: 'not-an-email',
      mobileNumber: '5551234567',
      password: 'StrongPass1234@',
    });
    await authModalPage.submitSignup();
    await expect(authModalPage.emailError).toBeVisible();
  });

  test('should enforce minimum password length', async ({ authModalPage }) => {
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.fillSignupForm({
      firstName: 'E2E',
      lastName: 'User',
      email: `e2e.passlength+${Date.now()}@example.com`,
      mobileNumber: '5551234567',
      password: 'short',
    });
    await authModalPage.submitSignup();
    await expect(authModalPage.passwordError).toBeVisible();
  });

  test('should allow user to switch between Sign In and Sign Up tabs', async ({ authModalPage }) => {
    await authModalPage.openSignupModalFromLanding();
    await expect(authModalPage.firstNameInput).toBeVisible();
    await authModalPage.signInTab.click();
    await expect(authModalPage.emailInput).toBeVisible();
    await expect(authModalPage.firstNameInput).not.toBeVisible();
    await authModalPage.signUpTab.click();
    await expect(authModalPage.firstNameInput).toBeVisible();
  });

  test('should complete OTP verification with any 6-digit code', async ({ authModalPage, page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `e2e.otp+${timestamp}@example.com`;
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.fillSignupForm({
      firstName: 'OTP',
      lastName: 'Test',
      email: uniqueEmail,
      mobileNumber: '5559876543',
      password: 'SecurePassword123@',
    });
    await authModalPage.submitSignup();
    await authModalPage.otpInput.waitFor({ state: 'visible', timeout: 10000 });
    await authModalPage.completeOtp('654321');
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test('should persist user data after successful signup', async ({ authModalPage, page }) => {
    const timestamp = Date.now();
    const userData = {
      firstName: 'Persist',
      lastName: 'Test',
      email: `e2e.persist+${timestamp}@example.com`,
      mobileNumber: '5551112222',
      password: 'PersistPass123@',
    };
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.fillSignupForm(userData);
    await authModalPage.submitSignup();
    await authModalPage.completeOtp();
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible({ timeout: 10000 });
  });

  test('should require all mandatory fields for signup', async ({ authModalPage }) => {
    await authModalPage.openSignupModalFromLanding();
    await authModalPage.lastNameInput.fill('OnlyLast');
    await authModalPage.emailInput.fill('partial@example.com');
    await authModalPage.mobileNumberInput.fill('5551234567');
    await authModalPage.passwordInput.fill('ValidPassword123');
    await authModalPage.submitSignup();
    await expect(authModalPage.firstNameError).toBeVisible();
  });
});
