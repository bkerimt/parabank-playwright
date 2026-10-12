import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// Feature dosyalarını ve step'leri Playwright testlerine dönüştürür
const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

// Lokalde bilgisayardaki Chrome, CI'da Playwright'ın Chromium'u
const browser = {
  ...devices['Desktop Chrome'],
  channel: process.env.CI ? undefined : 'chrome',
};

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 3,
  timeout: 60_000,
  reporter: 'html',

  use: {
    baseURL: 'https://parabank.parasoft.com/parabank/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1) Ortam hazırlığı: testlerden önce bir kez çalışır
    {
      name: 'setup',
      testDir: './setup',
      testMatch: /.*\.setup\.ts/,
      use: browser,
    },
    // 2) BDD testleri: setup başarılı olmadan başlamaz
    {
      name: 'chromium',
      testDir: bddTestDir,
      dependencies: ['setup'],
      use: browser,
    },
  ],
});
