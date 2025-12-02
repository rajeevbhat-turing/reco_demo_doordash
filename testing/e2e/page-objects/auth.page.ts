import { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly showPasswordButton: Locator;
  readonly resetPasswordLink: Locator;
  readonly otpInputs: Locator;
  readonly usePasswordInsteadButton: Locator;
  readonly signInTab: Locator;
  readonly signUpTab: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly generalError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.continueButton = page.getByRole('button', { name: /continue to sign in/i });
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('form').getByRole('button', { name: /^sign in$/i });
    this.showPasswordButton = page.getByRole('button', { name: /^(show|hide)$/i });
    this.resetPasswordLink = page.getByRole('button', { name: /reset password/i });
    this.otpInputs = page.locator('input[id^="otp-"]');
    this.usePasswordInsteadButton = page.getByRole('button', { name: /use password instead/i });
    this.signInTab = page.locator('button:has-text("Sign In")').filter({ hasText: /^sign in$/i }).first();
    this.signUpTab = page.getByRole('button', { name: /^sign up$/i });
    this.emailError = page.locator('text=/email/i').filter({ hasText: /required|invalid|incorrect/i });
    this.passwordError = page.locator('text=/password/i').filter({ hasText: /required|invalid/i });
    this.generalError = page.locator('text=/incorrect email|invalid email or password/i');
  }

  async goto() {
    const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
    await this.page.goto(`${baseURL}/auth`);
    await this.page.waitForLoadState('networkidle');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
    await this.page.waitForTimeout(500);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.page.waitForURL(/\/home/, { timeout: 10000 });
  }

  async isLoggedIn() {
    return this.page.url().includes('/home');
  }

  async waitForPasswordForm() {
    await this.passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  async waitForOTPForm() {
    await this.otpInputs.first().waitFor({ state: 'visible', timeout: 5000 });
  }
}
