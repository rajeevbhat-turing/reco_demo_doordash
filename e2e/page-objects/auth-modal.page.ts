import { Page, Locator, expect } from '@playwright/test';

export class AuthModalPage {
  readonly page: Page;
  readonly landingSignInButton: Locator;
  readonly landingSignUpButton: Locator;
  readonly signInTab: Locator;
  readonly signUpTab: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpSubmitButton: Locator;
  readonly firstNameError: Locator;
  readonly emailError: Locator;
  readonly mobileError: Locator;
  readonly passwordError: Locator;
  readonly generalError: Locator;
  readonly otpInput: Locator;
  readonly otpSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.landingSignInButton = page.getByRole('button', { name: /^sign in$/i }).first();
    this.landingSignUpButton = page.getByRole('button', { name: /^sign up$/i }).first();
    this.signInTab = page.getByRole('button', { name: /^sign in$/i }).nth(1);
    this.signUpTab = page.getByRole('button', { name: /^sign up$/i }).nth(1);
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#email');
    this.mobileNumberInput = page.locator('#mobileNumber');
    this.passwordInput = page.locator('#password');
    this.signUpSubmitButton = page.locator('form').getByRole('button', { name: /^sign up$/i });
    this.firstNameError = page.getByText('First name is required');
    this.emailError = page.getByText('Email format is invalid');
    this.mobileError = page.getByText(/Phone number (is required|is invalid)/i);
    this.passwordError = page.getByText(/Password (is required|must contain at least 10 characters)/i);
    this.generalError = page.locator('text=The email address you entered is already associated with an account')
      .or(page.locator('text=The phone number you entered is already associated with an account'));
    this.otpInput = page.locator('input[type="text"][inputmode="numeric"]').first();
    this.otpSubmitButton = page.getByRole('button', { name: /^submit$/i });
  }

  async openSignupModalFromLanding() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    const modalAlreadyOpen = await this.page.getByText('Sign in or Sign up').isVisible().catch(() => false);
    if (!modalAlreadyOpen) {
      await this.landingSignUpButton.click();
    }
    await expect(this.page.getByText('Sign in or Sign up')).toBeVisible();
  }

  async fillSignupForm(params: { firstName: string; lastName: string; email: string; mobileNumber: string; password: string; }) {
    const { firstName, lastName, email, mobileNumber, password } = params;
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.mobileNumberInput.fill(mobileNumber);
    await this.passwordInput.fill(password);
  }

  async submitSignup() {
    await this.signUpSubmitButton.click();
  }

  async completeOtp(otp = '123456') {
    await this.otpInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.otpInput.fill(otp);
    await this.otpSubmitButton.click();
  }

  async signupSuccessfully() {
    const timestamp = Date.now();
    const uniqueEmail = `e2e.signup+${timestamp}@example.com`;
    await this.openSignupModalFromLanding();
    await this.fillSignupForm({
      firstName: 'E2E',
      lastName: 'User',
      email: uniqueEmail,
      mobileNumber: '5551234567',
      password: 'StrongPass1234',
    });
    await this.submitSignup();
    await this.completeOtp();
    await this.page.waitForURL(/\/home/, { timeout: 15000 });
  }
}
