import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('submit button is disabled until email and password are valid', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await expect(submitBtn).toBeDisabled();

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('short');
    await expect(submitBtn).toBeDisabled(); // password under 6 chars

    await page.getByLabel('Password').fill('longenoughpassword');
    await expect(submitBtn).toBeEnabled();
  });

  test('toggling to sign up changes the heading and button label', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign up/i, exact: false }).click();
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });
});