import { test, expect } from '@playwright/test';

test('updates the hero title and reflects the change in live preview', async ({
  page,
}) => {
  // Prevent any locally persisted editor state from affecting the test.
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  // Start from the authenticated dashboard.
  await page.goto('/dashboard');

  // Create a real page so the test uses a real database-backed page ID.
  const createPageButton = page.getByRole('button', {
    name: '+ Create Landing Page',
    exact: true,
  });

  await expect(createPageButton).toBeVisible();

  await createPageButton.click();

  // The application should redirect to the newly created editor page.
  await expect(page).toHaveURL(/\/editor\/[^/]+$/, {
    timeout: 10000,
  });

  // Verify the editor loaded.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'PageForge',
      exact: true,
    }),
  ).toBeVisible();

  // Verify the initial Hero content is rendered in the live preview.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build your business faster',
      exact: true,
    }),
  ).toBeVisible();

  // Select the Hero section from the section list.
  await page.getByRole('button', {
    name: 'Select Hero section',
    exact: true,
  }).click();

  // Verify Hero settings are open.
  await expect(
    page.getByText('Section settings', {
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'Hero',
      exact: true,
    }),
  ).toBeVisible();

  // Find the Hero title field by its accessible name.
  const titleInput = page.getByRole('textbox', {
    name: 'Title',
    exact: true,
  });

  // Verify the current Hero title.
  await expect(titleInput).toHaveValue(
    'Build your business faster',
  );

  // Edit the Hero title.
  const updatedTitle = 'Build products faster with PageForge';

  await titleInput.fill(updatedTitle);

  // Verify the editor field received the new value.
  await expect(titleInput).toHaveValue(updatedTitle);

  // Verify the live preview reflects the same state.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: updatedTitle,
      exact: true,
    }),
  ).toBeVisible({
    timeout: 10000,
  });

  // Confirm the old Hero heading is no longer visible.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build your business faster',
      exact: true,
    }),
  ).not.toBeVisible();
});