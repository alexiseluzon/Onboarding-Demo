import { test, expect } from '@playwright/test';

test.describe('Quiz flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the answers endpoints so the test doesn't need a live backend/auth
    await page.route('**/api/quiz/answers', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: { answers: [] } });
      } else {
        await route.fulfill({ json: { answer: {} } });
      }
    });
  });

  test('Next stays disabled until the current step is answered', async ({ page }) => {
    await page.goto('/quiz');

    const nextBtn = page.getByRole('button', { name: /next/i });
    await expect(nextBtn).toBeDisabled();

    await page.getByPlaceholder('Your name').fill('Alexis');
    await expect(nextBtn).toBeEnabled();
  });

  test('progress indicator advances after answering a step', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.getByText('Step 1 of 9')).toBeVisible();

    await page.getByPlaceholder('Your name').fill('Alexis');
    await page.getByRole('button', { name: /next/i }).click();

    await expect(page.getByText('Step 2 of 9')).toBeVisible();
  });
});