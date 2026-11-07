import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4186',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    launchOptions: { channel: 'chrome' },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4186 --strictPort',
    url: 'http://127.0.0.1:4186',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
