import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    fullyParallel: false,
    workers: 1,
    timeout: 30000,
    use: {
        baseURL: process.env.TEST_URL ?? 'http://127.0.0.1:5187',
        channel: 'msedge',
        screenshot: 'off',
        video: 'off',
        trace: 'off',
        reducedMotion: 'reduce',
    },
    projects: [
        { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
        { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
    ],
    webServer: process.env.TEST_URL
        ? undefined
        : {
              command: 'npm run dev -- --host 127.0.0.1 --port 5187',
              url: 'http://127.0.0.1:5187',
              reuseExistingServer: !process.env.CI,
          },
});
