import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env (if present) so these values can be overridden per-environment
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SCRIPT_TIMEOUT = parseInt(process.env.SCRIPT_TIMEOUT || '30000', 10);
const SELECTOR_TIMEOUT = parseInt(process.env.SELECTOR_TIMEOUT || '30000', 10);
const HEADLESS = (process.env.HEADLESS || 'false').toLowerCase() === 'true';
const DEVTOOLS = (process.env.DEVTOOLS || 'false').toLowerCase() === 'true';
const PARALLEL = process.env.PARALLEL ? parseInt(process.env.PARALLEL, 10) : undefined;
const RETRY = parseInt(process.env.RETRY || '0', 10);
const SLOWMO = parseInt(process.env.SLOWMO || '0', 10);
const BROWSER = (process.env.BROWSER || 'all').toLowerCase();

export default defineConfig({
  testDir: './tests',
  timeout: SCRIPT_TIMEOUT,
  expect: { timeout: SELECTOR_TIMEOUT },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: RETRY,
  workers: PARALLEL,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.DEMO_APP_URL || 'https://example.com',
    headless: HEADLESS,
    actionTimeout: SELECTOR_TIMEOUT,
    navigationTimeout: SELECTOR_TIMEOUT,
    video: 'on',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: SLOWMO,
    },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ].filter((project) => BROWSER === 'all' || BROWSER === project.name),
});
