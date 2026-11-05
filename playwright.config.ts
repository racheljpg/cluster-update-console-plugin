import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Cluster Update Console Plugin E2E tests
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './playwright-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-tests/screenshots/html' }],
        ['junit', { outputFile: 'playwright-tests/screenshots/junit-results.xml' }],
        ['json', { outputFile: 'playwright-tests/screenshots/test-results.json' }],
      ]
    : [['html', { open: 'never' }]],
  outputDir: 'playwright-tests/screenshots/test-results',
  use: {
    baseURL: process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
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
  ],

  // Web server configuration for local dev
  webServer: process.env.CI
    ? undefined
    : {
        command: 'yarn start',
        url: 'http://localhost:9001',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
