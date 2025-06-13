import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',              // where your .spec.ts files live
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
  },
});