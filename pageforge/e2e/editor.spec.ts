import { test, expect } from '@playwright/test';

test('redirects unauthenticated users from the editor to login', async ({
  page,
}) => {
  await page.goto('/editor/e2e-test');

  await expect(page).toHaveURL(
    /\/login(?:\?.*)?$/,
  );
});