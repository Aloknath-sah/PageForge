import { test, expect } from '@playwright/test';

test('keeps published content separate from later draft changes', async ({
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

  const editorUrl = page.url();

  // Verify the editor loaded with the initial Hero content.
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

  // Publish the current configuration.
  const publishResponsePromise = page.waitForResponse(
    (response) =>
      /\/api\/pages\/[^/]+\/publish$/.test(response.url()) &&
      response.request().method() === 'POST',
  );

  await publishButton.click();

  const publishResponse = await publishResponsePromise;
  expect(publishResponse.ok()).toBe(true);

  await expect(
    page.getByRole('status').filter({
      hasText: 'Page published successfully.',
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Return to the dashboard and capture the public URL created by publishing.
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

  const publicLink = pageCard.getByRole('link', {
    name: 'View',
    exact: true,
  });

  await expect(publicLink).toBeVisible();

  const publicUrl = await publicLink.getAttribute('href');

  expect(publicUrl).toMatch(/^\/p\/untitled-/);

  // Re-open the editor and make a draft-only change after publishing.
  await page.goto(editorUrl);

  const titleInput = page.locator('#title');

  await expect(titleInput).toHaveValue(
    'Build your business faster',
  );

  const draftOnlyTitle = 'Draft only - not published';

  await titleInput.fill(draftOnlyTitle);

  // Confirm the editor now contains the unsaved draft change.
  await expect(titleInput).toHaveValue(draftOnlyTitle);

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: draftOnlyTitle,
      exact: true,
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Open the public URL without publishing the draft-only change.
  await page.goto(publicUrl!);

  // The public page must render the previously published configuration.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build your business faster',
      exact: true,
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // The draft-only change must not leak into the public page.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: draftOnlyTitle,
      exact: true,
    }),
  ).not.toBeVisible();
});
