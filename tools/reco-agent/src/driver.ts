import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

/**
 * Playwright launch + page lifecycle. Phase 4 §3.
 *
 * Returns a small façade so the run loop doesn't talk to Playwright
 * directly; the same façade can be mocked in unit tests.
 */
export interface DriverHandle {
  page: Page;
  screenshot(path: string): Promise<void>;
  domSnapshot(): Promise<string>;
  /**
   * Snapshot of the persisted `verifier-state` Zustand store from
   * localStorage. Returns `{}` when the key isn't set yet (fresh page).
   * Polled by the run loop after every action so the trajectory has
   * everything it needs by `finish`.
   */
  verifierState(): Promise<Record<string, unknown>>;
  close(): Promise<void>;
}

export interface LaunchOptions {
  startUrl: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
  /** Per-action default timeout. Defaults to 8 s. */
  actionTimeoutMs?: number;
  /**
   * Pre-authenticate the browser context by seeding
   * `localStorage['user-store']` with this user's record (fetched from
   * `/api/auth/generate-otp`) before any page loads. Skips the
   * sign-in modal entirely — the agent lands on `/home` already
   * logged in with the user's default address set.
   *
   * Unset = no pre-auth; the agent will see the sign-in modal as a
   * normal visitor would.
   */
  preAuthUserEmail?: string;
}

export async function launch(opts: LaunchOptions): Promise<DriverHandle> {
  const browser: Browser = await chromium.launch({ headless: opts.headless ?? true });
  const context: BrowserContext = await browser.newContext({
    viewport: opts.viewport ?? { width: 1280, height: 800 },
  });

  if (opts.preAuthUserEmail) {
    const user = await fetchUser(opts.startUrl, opts.preAuthUserEmail);
    if (user) {
      const persisted = JSON.stringify({
        state: {
          users: [user],
          currentUser: user,
          changePasswordPhoneVerified: false,
          deletedUserIds: [],
          tempAddress: null,
          isInitialized: true,
        },
        version: 0,
      });
      // addInitScript runs in every new page before any application
      // JS — so the Zustand store hydrates with currentUser populated
      // and the gym renders as if the user just signed in.
      await context.addInitScript(
        ({ raw }) => {
          window.localStorage.setItem('user-store', raw);
        },
        { raw: persisted }
      );
    } else {
      console.error(
        `[reco-agent] pre-auth lookup failed for ${opts.preAuthUserEmail}; agent will see the sign-in modal`
      );
    }
  }

  const page = await context.newPage();
  page.setDefaultTimeout(opts.actionTimeoutMs ?? 8_000);

  await page.goto(opts.startUrl, { waitUntil: 'domcontentloaded' });

  return {
    page,
    async screenshot(path: string) {
      await page.screenshot({ path, fullPage: false });
    },
    async domSnapshot() {
      return page.content();
    },
    async verifierState() {
      try {
        return (await page.evaluate(() => {
          const raw = window.localStorage.getItem('verifier-state');
          return raw ? JSON.parse(raw) : {};
        })) as Record<string, unknown>;
      } catch {
        return {};
      }
    },
    async close() {
      await context.close();
      await browser.close();
    },
  };
}

export type { Browser, Page };

/**
 * Look up a user record via the gym's `/api/auth/generate-otp` endpoint
 * — gym affordance, same one the OTP sign-in flow uses. Returns the
 * `user` portion (addresses, payment methods, etc.) the user-store
 * expects. Returns null on any failure so the caller can fall back to
 * the UI sign-in path.
 */
async function fetchUser(
  startUrl: string,
  email: string
): Promise<Record<string, unknown> | null> {
  try {
    const origin = new URL(startUrl).origin;
    const res = await fetch(`${origin}/api/auth/generate-otp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { user?: Record<string, unknown> } };
    return body.data?.user ?? null;
  } catch {
    return null;
  }
}
