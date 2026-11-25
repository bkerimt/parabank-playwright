import { expect } from '@playwright/test';
import { Given, type ScenarioContext } from './fixtures';
import { type ParaBankApiClient } from '../api/ParaBankApiClient';
import { createCustomer } from '../utils/testData';

// Birden fazla feature'ın kullandığı ortak adımlar

/*
 * Ön koşul olan müşteri kaydını formu doldurarak değil, API ile yapıyoruz.
 * Kayıt formunun kendisi register.feature'da arayüzden test ediliyor; diğer senaryolarda
 * kayıt sadece bir hazırlık adımı. Tarayıcıda aynı formu her seferinde doldurmak hem yavaş
 * hem de paylaşılan sitede gereksiz istek (rate limit riski) demek.
 */
async function registerThroughApi(api: ParaBankApiClient, ctx: ScenarioContext) {
  const customer = createCustomer();
  await api.registerCustomer(customer); // Kayıt olan müşteri otomatik olarak giriş yapmış olur

  // Sonraki hazırlık adımları için müşteri ve ilk hesap numarasını API'den öğreniyoruz
  const login = await api.login(customer.username, customer.password);
  expect(login.status(), 'Yeni müşteri API ile giriş yapabilmeli').toBe(200);
  const customerId: number = (await login.json()).id;
  const [firstAccount] = await (await api.getAccounts(customerId)).json();

  ctx.customer = customer;
  ctx.customerId = customerId;
  ctx.originalAccountId = String(firstAccount.id);
}

Given('a logged-in customer', async ({ api, ctx }) => {
  await registerThroughApi(api, ctx);
});

// Yetki kontrolü senaryoları için: mevcut müşteri çıkış yapar, yerine yeni bir müşteri girer.
// Önceki müşterinin not edilen verileri (ör. işlem numarası) senaryo verisinde kalır.
Given('another customer is logged in', async ({ api, ctx }) => {
  await api.logout();
  await registerThroughApi(api, ctx);
});
