import { test, expect } from '@playwright/test';

test('publishes the current page and marks it as published', async ({
  page,
}) => {
  // Prevent any locally persisted editor state from affecting the test.
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  // Start from the authenticated dashboard.
  await page.goto('/dashboard');

  // Create a real database-backed page for this test.
  const createPageButton = page.getByRole('button', {
    name: '+ Create Landing Page',
    exact: true,
  });

  await expect(createPageButton).toBeVisible();
  await createPageButton.click();

  // The application should redirect to the new editor page.
  await expect(page).toHaveURL(/\/editor\/[^/]+$/, {
    timeout: 10000,
  });

  // Verify the editor loaded and the initial page content is present.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'PageForge',
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build your business faster',
      exact: true,
    }),
  ).toBeVisible();

  // The initial sample configuration should satisfy publish readiness.
  await expect(
    page.getByText('Ready to publish', {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  const publishButton = page.getByRole('button', {
    name: 'Publish',
    exact: true,
  });

  await expect(publishButton).toBeEnabled();

  // Confirm the publish request reaches the server successfully.
  const publishResponsePromise = page.waitForResponse(
    (response) =>
      /\/api\/pages\/[^/]+\/publish$/.test(response.url()) &&
      response.request().method() === 'POST',
  );

  await publishButton.click();

  const publishResponse = await publishResponsePromise;
  expect(publishResponse.ok()).toBe(true);

  // The editor should report a successful publish.
  await expect(
    page.getByRole('status').filter({
      hasText: 'Page published successfully.',
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Reload the dashboard and verify the persisted page status.
  await page.goto('/dashboard');

  const pageCard = page.locator('article').filter({
    hasText: '/p/untitled-',
  }).first();

  await expect(pageCard).toBeVisible({
    timeout: 10000,
  });

  await expect(
    pageCard.getByText('Published', {
      exact: true,
    }),
  ).toBeVisible();

  // A published page should expose the public View action.
  await expect(
    pageCard.getByRole('link', {
      name: 'View',
      exact: true,
    }),
  ).toBeVisible();
});
