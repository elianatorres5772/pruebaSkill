import { defineConfig } from '@playwright/test';

import { TEST_BASE_URL } from './src/config/environment.js';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: TEST_BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
      },
    },
  ],
});