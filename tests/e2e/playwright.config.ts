import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, devices } from '@playwright/test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60 * 1000,
  
  expect: {
    timeout: 10 * 1000,
  },
  
  reporter: [
    ['html', { 
      outputFolder: './playwright-report',
      open: 'never',
    }],
    ['list'],
    ['json', { 
      outputFile: './test-results/results.json' 
    }],
    ['junit', { 
      outputFile: './test-results/junit.xml' 
    }],
    ...(process.env.CI ? ([['github']] as const) : []),
  ],
  
  outputDir: './test-results',
  
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    navigationTimeout: 30 * 1000,
    actionTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security', '--allow-insecure-localhost'],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run build && npm run start',
    cwd: repoRoot,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      LIBSQL_URL: process.env.LIBSQL_URL ?? 'file:./data/db/dashdoor.db',
      DELIVERY_LIBSQL_URL: process.env.DELIVERY_LIBSQL_URL ?? 'file:./data/db/delivery.db',
      MERCHANT_LIBSQL_URL: process.env.MERCHANT_LIBSQL_URL ?? 'file:./data/db/merchant.db',
    },
  },
});
