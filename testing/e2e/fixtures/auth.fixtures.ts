import { test as base, expect as baseExpect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import { AuthModalPage } from '../page-objects/auth-modal.page';

export const test = base.extend<{
  authPage: AuthPage;
  authModalPage: AuthModalPage;
}>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  authModalPage: async ({ page }, use) => {
    const modalPage = new AuthModalPage(page);
    await use(modalPage);
  },
});

export const expect = baseExpect;
export { AuthPage, AuthModalPage };
