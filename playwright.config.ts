import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  webServer: {
    command: 'npm run preview',
    url:     'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000           // give Vite plenty of time in cold runners
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});