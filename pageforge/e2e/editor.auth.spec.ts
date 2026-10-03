import { test, expect } from '@playwright/test';

test('loads the editor for an authenticated user', async ({
  page,
}) => {
  await page.goto('/editor/e2e-test');

  await expect(page).toHaveURL(
    /\/editor\/e2e-test$/,
  );

  await expect(
    page.getByRole('heading', {
      name: 'PageForge',
    }),
  ).toBeVisible();

  await expect(
    page.getByText(
      'Editing page: e2e-test',
    ),
  ).toBeVisible();
});