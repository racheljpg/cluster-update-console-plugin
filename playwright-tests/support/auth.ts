import { Page } from '@playwright/test';

/**
 * Login helper for OpenShift Console
 */
export async function login(page: Page) {
  const username = process.env.BRIDGE_KUBEADMIN_USERNAME || 'kubeadmin';
  const password = process.env.BRIDGE_KUBEADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      'BRIDGE_KUBEADMIN_PASSWORD environment variable is required for authentication',
    );
  }

  const baseUrl = process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000';

  await page.goto(baseUrl);

  // Wait for login form
  await page.waitForSelector('input[name="username"]', { timeout: 30000 });

  // Fill in credentials
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);

  // Submit login
  await page.click('button[type="submit"]');

  // Wait for console to load (skip tour if present)
  try {
    const skipTourButton = page.locator('[data-test="tour-step-footer-secondary"]');
    await skipTourButton.waitFor({ timeout: 5000 });
    await skipTourButton.click();
  } catch {
    // Tour might not appear, continue
  }

  // Wait for navigation to complete
  await page.waitForLoadState('networkidle');
}

/**
 * Logout helper for OpenShift Console
 */
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-test="user-dropdown"]');

  // Click logout
  await page.click('[data-test="log-out"]');

  // Wait for redirect to login page
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
}
