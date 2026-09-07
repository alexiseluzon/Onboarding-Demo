import { test, expect } from '@playwright/test';

test.describe('Payment page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/payments/create-intent', async (route) => {
      await route.fulfill({ json: { clientSecret: 'pi_mock_secret_test' } });
    });
  });

  test('renders plan toggle and loads checkout form', async ({ page }) => {
    await page.goto('/payment');

    await expect(page.getByRole('radio', { name: 'Basic' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Pro' })).toBeVisible();

    // Confirm-and-pay button should render once Stripe Elements mounts
    await expect(page.getByRole('button', { name: /confirm and pay/i })).toBeVisible();
  });

  test('switching plan re-requests a client secret', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/payments/create-intent', async (route) => {
      requestCount += 1;
      await route.fulfill({ json: { clientSecret: `pi_mock_${requestCount}` } });
    });

    await page.goto('/payment');
    await page.getByRole('radio', { name: 'Pro' }).click();

    expect(requestCount).toBeGreaterThanOrEqual(2);
  });
});