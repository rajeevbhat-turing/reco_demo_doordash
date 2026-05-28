/**
 * Track A: capture /home re-rank screenshots per engine.
 *
 * Prereqs:
 *   docker compose -f config/docker-compose.reco.yaml up -d gorse lightfm implicit
 *   RECO_GORSE_URL=http://localhost:8088 scripts/n.sh npx tsx scripts/seed-gorse.ts
 *   RECO_DEMO=1 RECO_GORSE_URL=... RECO_LIGHTFM_URL=... RECO_IMPLICIT_URL=... npm run dev -- -p 3010
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_URL ?? 'http://localhost:3010';
const engines = (process.env.ENGINES ?? 'gorse,lightfm,implicit').split(',').map(s => s.trim());

const tempAddress = {
  id: 'screenshot-addr',
  street: '700 N Brookhurst St',
  city: 'Anaheim',
  state: 'CA',
  zipCode: '92801',
  lat: 33.8402032,
  lng: -117.9587196,
  addressType: 'house',
  default: true,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(addr => {
  const key = 'user-store';
  const raw = localStorage.getItem(key);
  const state = raw ? JSON.parse(raw) : { state: {} };
  state.state = state.state ?? {};
  state.state.tempAddress = addr;
  localStorage.setItem(key, JSON.stringify(state));
}, tempAddress);

await page.goto(`${base}/home`, { waitUntil: 'networkidle', timeout: 90_000 });
const picker = page.getByTestId('reco-engine-picker');
await picker.waitFor({ timeout: 30_000 });
await page.waitForFunction(() => {
  const sel = document.querySelector('[data-testid="reco-engine-picker"]');
  return sel && sel.querySelectorAll('option').length > 2;
}, { timeout: 30_000 });

for (const engine of engines) {
  await picker.selectOption(engine);
  await page.getByTestId('reco-active-badge').filter({ hasText: engine }).waitFor({ timeout: 45_000 });
  await page.waitForTimeout(2000);
  const out = path.join(__dirname, `../docs/screenshots/phase3-rerank-${engine}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved', out);
}

await browser.close();
