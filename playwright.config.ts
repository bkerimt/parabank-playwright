import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// Feature dosyalarını ve step'leri Playwright testlerine dönüştürür.
// Arayüz ve API senaryoları ayrı tutuluyor: Her biri kendi step'lerini ve fixture'larını kullanıyor.
const uiTestDir = defineBddConfig({
  outputDir: '.features-gen/ui',
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

const apiTestDir = defineBddConfig({
  outputDir: '.features-gen/api',
  features: 'features/api/*.feature',
  steps: 'steps/api/*.ts',
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
    // Varsayılan: herkese açık ParaBank. CI'da BASE_URL ile kendi ParaBank kopyamıza yönlendiriliyor.
    baseURL: process.env.BASE_URL ?? 'https://parabank.parasoft.com/parabank/',
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
    // 2) Arayüz (BDD) testleri: setup başarılı olmadan başlamaz
    {
      name: 'chromium',
      testDir: uiTestDir,
      dependencies: ['setup'],
      use: browser,
    },
    // 3) API (BDD) testleri: tarayıcı açmaz, doğrudan REST servisine istek atar
    {
      name: 'api',
      testDir: apiTestDir,
      dependencies: ['setup'],
    },
  ],
});
