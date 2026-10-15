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
  // CI'da 1 tekrar deneme: Rate limit'e takıldığımızda hemen tekrar tekrar denemek engeli uzatıyor
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 3,
  timeout: 60_000,
  // CI'da hatalar ayrıca GitHub'daki çalışma özet sayfasında da görünsün (github reporter)
  reporter: process.env.CI ? [['list'], ['github'], ['html']] : 'html',

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
