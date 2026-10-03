import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.resolve(
  'playwright/.auth/user.json',
);

setup('authenticate user', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing E2E_EMAIL or E2E_PASSWORD environment variables.',
    );
  }

  await page.goto('/login');

  await page.getByLabel('Email').fill(email);

  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', {
    name: 'Sign in',
  }).click();

  try {
    await expect(page).toHaveURL(
      /\/dashboard(?:\?.*)?$/,
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    const alert = page.getByRole('alert');

    let loginError = '';

    if (await alert.isVisible().catch(() => false)) {
      loginError =
        (await alert.textContent())?.trim() ?? '';
    }

    if (loginError) {
      throw new Error(
        `E2E login failed: ${loginError}`,
      );
    }

    throw error;
  }

  await page.context().storageState({
    path: authFile,
  });
});