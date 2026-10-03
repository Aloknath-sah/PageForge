import {
  defineConfig,
  devices,
} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
  {
    name: 'auth-setup',

    testMatch: /.*\.setup\.ts/,
  },

  {
    name: 'unauthenticated',

    testMatch: [
      /.*\.spec\.ts$/,
    ],

    testIgnore: [
      /.*\.auth\.spec\.ts$/,
    ],

    use: {
      ...devices['Desktop Chrome'],
    },
  },

  {
    name: 'authenticated',

    testMatch: /.*\.auth\.spec\.ts$/,

    dependencies: ['auth-setup'],

    use: {
      ...devices['Desktop Chrome'],

      storageState: 'playwright/.auth/user.json',
    },
  },
],

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});