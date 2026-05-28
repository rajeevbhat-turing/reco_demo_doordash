/**
 * Probe whether Phase 3 /home screenshots are capturable (picker + feed).
 * Usage: RECO_DEMO=1 BASE_URL=http://localhost:3010 node scripts/screenshot-phase3-probe.mjs
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_URL ?? 'http://localhost:3010';
const out = path.join(__dirname, '../docs/screenshots/phase3-probe.png');

const tempAddress = {
  id: 'probe-addr',
  street: '700 N Brookhurst St',
  city: 'Anaheim',
  state: 'CA',
  zipCode: '92801',
  country: 'USA',
  lat: 33.8402032,
  lng: -117.9587196,
  addressType: 'house',
  default: true,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

try {
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.evaluate(addr => {
    const key = 'user-store';
    const raw = localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : { state: {} };
    state.state = state.state ?? {};
    state.state.tempAddress = addr;
    localStorage.setItem(key, JSON.stringify(state));
  }, tempAddress);
  await page.goto(`${base}/home`, { waitUntil: 'networkidle', timeout: 90_000 });
  const url = page.url();
  const picker = page.getByTestId('reco-engine-picker');
  const pickerCount = await picker.count();
  const badge = page.getByTestId('reco-active-badge');
  const restaurants = page.locator('[data-testid="restaurant-card"], a[href^="/store/"]');
  const restCount = await restaurants.count();

  console.log('final_url:', url);
  console.log('picker_visible:', pickerCount > 0);
  console.log('restaurant_links:', restCount);

  if (pickerCount > 0) {
    await page.waitForFunction(() => {
      const sel = document.querySelector('[data-testid="reco-engine-picker"]');
      return sel && sel.querySelectorAll('option').length > 2;
    }, { timeout: 30_000 });
    await picker.selectOption('popularity');
    await page.waitForTimeout(4000);
    const badgeVisible = (await badge.count()) > 0;
    console.log('badge_after_popularity:', badgeVisible);
    if (badgeVisible) console.log('badge_text:', await badge.textContent());
  }

  await page.screenshot({ path: out, fullPage: false });
  console.log('saved:', out);
} catch (e) {
  console.error('PROBE_FAILED:', e.message);
  await page.screenshot({ path: out.replace('.png', '-error.png'), fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
