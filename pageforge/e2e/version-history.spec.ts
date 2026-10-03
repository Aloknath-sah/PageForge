import { test, expect } from '@playwright/test';

test('restores a previously published page version', async ({ page }) => {
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

  const editorUrl = page.url();
  const pageId = new URL(editorUrl).pathname.split('/').pop();

  expect(pageId).toBeTruthy();

  const titleInput = page.locator('#title');

  // Verify the initial configuration.
  await expect(titleInput).toHaveValue(
    'Build your business faster',
  );

  // Verify publishing is currently allowed.
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

  // Publish version 1.
  const firstPublishResponsePromise = page.waitForResponse(
    (response) =>
      /\/api\/pages\/[^/]+\/publish$/.test(response.url()) &&
      response.request().method() === 'POST',
  );

  await publishButton.click();

  const firstPublishResponse = await firstPublishResponsePromise;
  expect(firstPublishResponse.ok()).toBe(true);

  await expect(
    page.getByRole('status').filter({
      hasText: 'Page published successfully.',
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Create a different configuration and publish version 2.
  const secondTitle = 'Version two - published';

  await titleInput.fill(secondTitle);

  await expect(titleInput).toHaveValue(secondTitle);

  const secondPublishResponsePromise = page.waitForResponse(
    (response) =>
      /\/api\/pages\/[^/]+\/publish$/.test(response.url()) &&
      response.request().method() === 'POST',
  );

  await publishButton.click();

  const secondPublishResponse = await secondPublishResponsePromise;
  expect(secondPublishResponse.ok()).toBe(true);

  await expect(
    page.getByRole('status').filter({
      hasText: 'Page published successfully.',
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Restore version 1 directly through the existing restore API.
  // A freshly created page has no earlier version snapshots, so the
  // first successful publish creates version 1.
  const restoreResult = await page.evaluate(async (id) => {
    const response = await fetch(`/api/pages/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 1,
      }),
    });

    const body = await response.json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  }, pageId);

  expect(restoreResult.ok).toBe(true);
  expect(restoreResult.body?.config).toBeTruthy();

  // Reload the editor so the restored draft is loaded from the server.
  await page.goto(editorUrl);

  // Version 1 should now be the active draft again.
  await expect(
    page.locator('#title'),
  ).toHaveValue('Build your business faster', {
    timeout: 10000,
  });

  // Version 2 must no longer be the active draft.
  await expect(
    page.locator('#title'),
  ).not.toHaveValue(secondTitle);
});
