import { test, expect } from '@playwright/test';
import { login, logout } from '../support/auth';
import { navigateTo } from '../support/console-helpers';

const PLUGIN_NAME = 'cluster-update-console-plugin';
const CLUSTER_UPDATE_PATH = '/administration/cluster-update';

test.describe('Cluster Update Console Plugin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('should load the cluster update page', async ({ page }) => {
    await navigateTo(page, CLUSTER_UPDATE_PATH);

    // Verify page title
    await expect(page).toHaveTitle(/Cluster Update/);

    // Verify main heading exists
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should display the three tabs', async ({ page }) => {
    await navigateTo(page, CLUSTER_UPDATE_PATH);

    // Check for tab navigation
    const updatePlanTab = page.locator('text=Update Plan');
    const activePlansTab = page.locator('text=Active Update Plans');
    const updateHistoryTab = page.locator('text=Update History');

    await expect(updatePlanTab).toBeVisible();
    await expect(activePlansTab).toBeVisible();
    await expect(updateHistoryTab).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await navigateTo(page, CLUSTER_UPDATE_PATH);

    // Click Active Update Plans tab
    await page.click('text=Active Update Plans');
    await expect(page).toHaveURL(/.*cluster-update/);

    // Click Update History tab
    await page.click('text=Update History');
    await expect(page).toHaveURL(/.*cluster-update/);

    // Click back to Update Plan tab
    await page.click('text=Update Plan');
    await expect(page).toHaveURL(/.*cluster-update/);
  });

  test('should show update history from ClusterVersion', async ({ page }) => {
    await navigateTo(page, CLUSTER_UPDATE_PATH);

    // Navigate to Update History tab
    await page.click('text=Update History');

    // The ClusterVersion resource always exists, so we should see some content
    // Check for table or empty state
    const hasTable = await page.locator('table').count();
    const hasEmptyState = await page.locator('text=No update history').count();

    expect(hasTable > 0 || hasEmptyState > 0).toBeTruthy();
  });

  test('should handle missing Lightspeed CRD gracefully', async ({ page }) => {
    await navigateTo(page, CLUSTER_UPDATE_PATH);

    // If Lightspeed is not installed, should show warning banner
    const warningBanner = page.locator('[data-test="lightspeed-not-available"]');

    // Check if banner exists (it's okay if it doesn't - means Lightspeed is installed)
    const bannerCount = await warningBanner.count();

    if (bannerCount > 0) {
      // If banner exists, it should explain AI features are unavailable
      await expect(warningBanner).toContainText(/AI.*unavailable|Lightspeed/i);
    }

    // Page should still be functional even without Lightspeed
    await expect(page.locator('h1')).toBeVisible();
  });
});
