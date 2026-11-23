import { test as base, createBdd } from 'playwright-bdd';
import { type APIResponse } from '@playwright/test';
import { ParaBankApiClient } from '../../api/ParaBankApiClient';
import { type Customer } from '../../utils/testData';

/*
 * API senaryolarının kendi fixture'ları var. Arayüz fixture'larından (steps/fixtures.ts) ayrı tutmamızın
 * sebebi: Arayüz tarafındaki otomatik fixture'lar her test için tarayıcı sayfası açıyor.
 * API testleri tarayıcıya hiç ihtiyaç duymuyor; ayrı tutunca tarayıcı hiç açılmıyor ve testler hızlı çalışıyor.
 */

// Senaryo boyunca adımlar arasında taşınan veri
export type ApiScenarioContext = {
  customer?: Customer;
  customerId?: number;
  response?: APIResponse; // Son API isteğinin cevabı; "Then" adımları bunu doğrular
};

type Fixtures = {
  api: ParaBankApiClient;
  anonymousApi: ParaBankApiClient;
  ctx: ApiScenarioContext;
};

export const test = base.extend<Fixtures>({
  // Playwright'ın hazır "request" nesnesi: baseURL'i config'den alır, cookie'leri test boyunca saklar
  api: async ({ request }, use) => {
    await use(new ParaBankApiClient(request));
  },

  // Hiçbir cookie ya da oturum bilgisi taşımayan, sıfırdan açılmış istemci (yetki kontrolü senaryoları için)
  anonymousApi: async ({ playwright, baseURL }, use) => {
    const context = await playwright.request.newContext({ baseURL });
    await use(new ParaBankApiClient(context));
    await context.dispose();
  },

  ctx: async ({}, use) => {
    await use({});
  },
});

export const { Given, When, Then } = createBdd(test);

// Son cevabı döner; henüz istek atılmadıysa anlaşılır bir hata verir
export function lastResponse(ctx: ApiScenarioContext): APIResponse {
  if (!ctx.response) {
    throw new Error('Henüz bir API isteği gönderilmedi; önce bir "When" adımı çalışmalı');
  }
  return ctx.response;
}
