import type { Page } from 'playwright';
import type { AgentAction } from './types.js';

/**
 * Action vocabulary dispatcher. Phase 4 §3.
 *
 * Each branch maps an `AgentAction` to one Playwright call. Failures
 * (selector not found, navigation timeout, etc.) bubble up as thrown
 * errors; the run loop catches them, records the failure on the step,
 * and gives the LLM up to 2 retries before counting a forced `finish`.
 *
 * Cart additions are detected by clicking an "add to cart" CTA on the
 * current store page — the verifier-store will record the change in
 * `lastQuantityChangeInfo`, which the trajectory extractor (§4) reads
 * back.
 */
export async function dispatch(page: Page, action: AgentAction): Promise<void> {
  switch (action.type) {
    case 'goto': {
      // Resolve relative URLs against the current page origin so the
      // agent can emit `/home` instead of `http://localhost:3000/home`.
      const resolved = action.url.startsWith('http')
        ? action.url
        : new URL(action.url, page.url()).toString();
      await page.goto(resolved, { waitUntil: 'domcontentloaded' });
      return;
    }
    case 'clickByTestId':
      await page.locator(`[data-testid="${action.testId}"]`).first().click();
      return;
    case 'clickBySelector':
      await page.locator(action.selector).first().click();
      return;
    case 'type':
      await page.locator(action.selector).first().fill(action.text);
      return;
    case 'scroll':
      await page.evaluate(dy => window.scrollBy(0, dy), action.deltaY);
      return;
    case 'read':
      // No-op as far as the page is concerned; the step's observation
      // already captures what the LLM wanted to inspect. We keep the
      // action in the vocabulary so the LLM can signal intent.
      await page.locator(action.selector).first().waitFor({ state: 'attached' });
      return;
    case 'addToCart':
      // Convention: any visible "Add to cart" / "Add" button on the
      // current store page. We try testid first, then a text fallback.
      {
        const byTestId = page.getByTestId('add-to-cart').first();
        if (await byTestId.count()) {
          await byTestId.click();
          return;
        }
        await page.getByRole('button', { name: /add( to cart)?/i }).first().click();
      }
      return;
    case 'finish':
      // Terminal — caller exits the loop after this is recorded.
      return;
    default: {
      const _exhaustive: never = action;
      throw new Error(`dispatch: unknown action ${JSON.stringify(_exhaustive)}`);
    }
  }
}
