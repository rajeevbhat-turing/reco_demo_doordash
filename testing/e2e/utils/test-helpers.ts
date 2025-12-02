import { Page } from '@playwright/test';

/**
 * Test helper utilities for common operations
 */

/**
 * Wait for page to be fully loaded and interactive
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Clear browser storage (localStorage, sessionStorage, cookies)
 */
export async function clearBrowserStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}

/**
 * Wait for element to be visible and stable
 */
export async function waitForStableElement(
  page: Page,
  selector: string,
  timeout = 5000
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  // Wait a bit more for any animations or transitions
  await page.waitForTimeout(200);
  return element;
}

/**
 * Fill input field with retry logic
 */
export async function fillInputWithRetry(
  page: Page,
  selector: string,
  value: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const input = page.locator(selector);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.clear();
      await input.fill(value);
      // Verify the value was set
      const actualValue = await input.inputValue();
      if (actualValue === value) {
        return;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'attached', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  await page.waitForURL(urlPattern, { timeout });
  await waitForPageReady(page);
}



