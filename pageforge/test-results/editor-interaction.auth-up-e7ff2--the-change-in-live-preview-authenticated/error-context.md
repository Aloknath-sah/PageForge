# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor-interaction.auth.spec.ts >> updates the hero title and reflects the change in live preview
- Location: e2e\editor-interaction.auth.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Build products faster with PageForge', exact: true, level: 1 })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Build products faster with PageForge', exact: true, level: 1 }) with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Build products faster with PageForge', exact: true, level: 1 })

```

```yaml
- alert
- banner:
  - heading "PageForge" [level=1]
  - paragraph: "Editing page: 672b91e0-33c7-4277-95e6-ccac603d7c5d"
  - button "Undo last change" [disabled]: ↶
  - button "Redo last undone change" [disabled]: ↷
  - button "Save" [disabled]
  - button "Version History"
  - button "Publish"
  - text: All changes saved Ready to publish
- complementary:
  - heading "Sections" [level=2]
  - paragraph: Drag to reorder your page.
  - button "Select Hero section":
    - button "Drag Hero"
    - paragraph: Hero
    - paragraph: Section 1
    - button "Hide Hero": Hide
    - button "Duplicate Hero": Copy
    - button "Delete Hero": Delete
  - button "Select Features section":
    - button "Drag Features"
    - paragraph: Features
    - paragraph: Section 2
    - button "Hide Features": Hide
    - button "Duplicate Features": Copy
    - button "Delete Features": Delete
  - button "Select Faq section":
    - button "Drag Faq"
    - paragraph: Faq
    - paragraph: Section 3
    - button "Hide Faq": Hide
    - button "Duplicate Faq": Copy
    - button "Delete Faq": Delete
  - button "Select Team section":
    - button "Drag Team"
    - paragraph: Team
    - paragraph: Section 4
    - button "Hide Team": Hide
    - button "Duplicate Team": Copy
    - button "Delete Team": Delete
  - button "Select Testimonials section":
    - button "Drag Testimonials"
    - paragraph: Testimonials
    - paragraph: Section 5
    - button "Hide Testimonials": Hide
    - button "Duplicate Testimonials": Copy
    - button "Delete Testimonials": Delete
  - button "Select Cta section":
    - button "Drag Cta"
    - paragraph: Cta
    - paragraph: Section 6
    - button "Hide Cta": Hide
    - button "Duplicate Cta": Copy
    - button "Delete Cta": Delete
  - button "+ Add Section"
- main:
  - main:
    - text: hero
    - paragraph: PageForge
    - heading "Build your business faster" [level=1]
    - paragraph: Build faster workflows without repetitive manual work.
    - link "Get Started":
      - /url: /signup
    - text: Hero Image
    - heading "Everything you need" [level=2]
    - paragraph: Powerful tools to automate your daily workflow.
    - article:
      - text: •
      - heading "Automate" [level=3]
      - paragraph: Automate repetitive tasks and workflows.
    - article:
      - text: •
      - heading "Collaborate" [level=3]
      - paragraph: Work together from a single workspace.
    - article:
      - text: •
      - heading "Measure" [level=3]
      - paragraph: Understand how your workflows perform.
    - heading "Frequently asked questions" [level=2]
    - group: What is PageForge?
    - group: Can I customize my page?
    - group: Can I reorder sections?
    - heading "Meet the team" [level=2]
    - paragraph: The people behind Acme AI.
    - article:
      - text: AM
      - heading "Alex Morgan" [level=3]
      - paragraph: Co-Founder
      - paragraph: Builds the product and helps shape the company vision.
    - article:
      - text: JL
      - heading "Jamie Lee" [level=3]
      - paragraph: Product Designer
      - paragraph: Creates thoughtful experiences for every customer.
    - article:
      - text: TS
      - heading "Taylor Smith" [level=3]
      - paragraph: Engineer
      - paragraph: Turns product ideas into reliable software.
    - heading "Loved by teams" [level=2]
    - figure "Sarah Johnson Product Manager":
      - blockquote: "\"We reduced repetitive work significantly.\""
      - text: Sarah Johnson Product Manager
    - heading "Ready to get started?" [level=2]
    - paragraph: Create your first landing page in minutes.
    - link "Create Your Page":
      - /url: /signup
- complementary:
  - paragraph: Section settings
  - heading "Hero" [level=2]
  - paragraph: Introduce your product and primary call to action.
  - paragraph: Visible
  - paragraph: Show this section on the landing page.
  - checkbox "Toggle section visibility" [checked]
  - text: Title
  - textbox "Title":
    - /placeholder: Build something amazing
    - text: Build your business faster
  - text: Description
  - textbox "Description":
    - /placeholder: Explain what your product does.
    - text: Build faster workflows without repetitive manual work.
  - text: CTA Text
  - textbox "CTA Text":
    - /placeholder: Get Started
    - text: Get Started
  - text: CTA URL
  - textbox "CTA URL":
    - /placeholder: https://example.com
    - text: /signup
- status
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('updates the hero title and reflects the change in live preview', async ({
  4   |   page,
  5   | }) => {
  6   |   // Prevent any locally persisted editor state from affecting the test.
  7   |   await page.addInitScript(() => {
  8   |     window.localStorage.clear();
  9   |   });
  10  | 
  11  |   // Start from the authenticated dashboard.
  12  |   await page.goto('/dashboard');
  13  | 
  14  |   // Create a real page so the test uses a real database-backed page ID.
  15  |   const createPageButton = page.getByRole('button', {
  16  |     name: '+ Create Landing Page',
  17  |     exact: true,
  18  |   });
  19  | 
  20  |   await expect(createPageButton).toBeVisible();
  21  | 
  22  |   await createPageButton.click();
  23  | 
  24  |   // The application should redirect to the newly created editor page.
  25  |   await expect(page).toHaveURL(/\/editor\/[^/]+$/, {
  26  |     timeout: 10000,
  27  |   });
  28  | 
  29  |   // Verify the editor loaded.
  30  |   await expect(
  31  |     page.getByRole('heading', {
  32  |       level: 1,
  33  |       name: 'PageForge',
  34  |       exact: true,
  35  |     }),
  36  |   ).toBeVisible();
  37  | 
  38  |   // Verify the initial Hero content is rendered in the live preview.
  39  |   await expect(
  40  |     page.getByRole('heading', {
  41  |       level: 1,
  42  |       name: 'Build your business faster',
  43  |       exact: true,
  44  |     }),
  45  |   ).toBeVisible();
  46  | 
  47  |   // Select the Hero section from the section list.
  48  |   await page.getByRole('button', {
  49  |     name: 'Select Hero section',
  50  |     exact: true,
  51  |   }).click();
  52  | 
  53  |   // Verify Hero settings are open.
  54  |   await expect(
  55  |     page.getByText('Section settings', {
  56  |       exact: true,
  57  |     }),
  58  |   ).toBeVisible();
  59  | 
  60  |   await expect(
  61  |     page.getByRole('heading', {
  62  |       name: 'Hero',
  63  |       exact: true,
  64  |     }),
  65  |   ).toBeVisible();
  66  | 
  67  |   // Find the Hero title field by its accessible name.
  68  |   const titleInput = page.getByRole('textbox', {
  69  |     name: 'Title',
  70  |     exact: true,
  71  |   });
  72  | 
  73  |   // Verify the current Hero title.
  74  |   await expect(titleInput).toHaveValue(
  75  |     'Build your business faster',
  76  |   );
  77  | 
  78  |   // Edit the Hero title.
  79  |   const updatedTitle = 'Build products faster with PageForge';
  80  | 
  81  |   await titleInput.fill(updatedTitle);
  82  | 
  83  |   // Verify the editor field received the new value.
  84  |   await expect(titleInput).toHaveValue(updatedTitle);
  85  | 
  86  |   // Verify the live preview reflects the same state.
  87  |   await expect(
  88  |     page.getByRole('heading', {
  89  |       level: 1,
  90  |       name: updatedTitle,
  91  |       exact: true,
  92  |     }),
> 93  |   ).toBeVisible({
      |     ^ Error: expect(locator).toBeVisible() failed
  94  |     timeout: 10000,
  95  |   });
  96  | 
  97  |   // Confirm the old Hero heading is no longer visible.
  98  |   await expect(
  99  |     page.getByRole('heading', {
  100 |       level: 1,
  101 |       name: 'Build your business faster',
  102 |       exact: true,
  103 |     }),
  104 |   ).not.toBeVisible();
  105 | });
```