import {
  test,
  expect,
} from '@playwright/test';

test('loads the PageForge home page', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page,
  ).toHaveTitle(/PageForge/i);
});