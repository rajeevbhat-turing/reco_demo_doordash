import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '../docs/screenshots/phase0-reco-eval.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('console', msg => console.log('console:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('pageerror:', err.message));

await page.goto('http://localhost:3000/reco-eval', { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(3000);
await page.getByRole('heading', { name: 'Recommendation eval' }).waitFor({ timeout: 60_000 });
await page.getByText('Loading…').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
await page.locator('label[for^="eng-"]').first().waitFor({ timeout: 30_000 });

for (const name of ['random', 'popularity', 'gorse']) {
  const label = page.locator(`label[for="eng-${name}"]`);
  const box = page.locator(`#eng-${name}`);
  const checked = await box.isChecked().catch(() => false);
  if (!checked) await label.click();
}

await page.getByRole('combobox').first().click();
await page.getByRole('option', { name: /history/ }).click();

await page.getByRole('button', { name: 'Run eval' }).click();
await page.getByText('Aggregate').waitFor({ timeout: 120_000 });
await page.getByRole('cell', { name: 'gorse' }).waitFor({ timeout: 5_000 });
await page.waitForTimeout(500);

await page.screenshot({ path: out, fullPage: true });
console.log('Saved', out);
await browser.close();
