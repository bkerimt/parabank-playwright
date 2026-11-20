import { expect } from '@playwright/test';
import { Given } from './fixtures';
import { type RegisterPage } from '../pages/RegisterPage';
import { type ScenarioContext } from './fixtures';
import { createCustomer } from '../utils/testData';

// Birden fazla feature'ın kullandığı ortak adımlar

// Kayıt olan müşteri ParaBank'ta otomatik olarak giriş yapmış olur
async function registerNewCustomer(registerPage: RegisterPage, ctx: ScenarioContext) {
  const customer = createCustomer();
  await registerPage.goto();
  await registerPage.register(customer);
  await expect(registerPage.pageTitle).toHaveText(`Welcome ${customer.username}`);
  ctx.customer = customer;
}

Given('a logged-in customer', async ({ registerPage, ctx }) => {
  await registerNewCustomer(registerPage, ctx);
});

// Yetki kontrolü senaryoları için: mevcut müşteri çıkış yapar, yerine yeni bir müşteri girer.
// Önceki müşterinin not edilen verileri (ör. işlem numarası) senaryo verisinde kalır.
Given('another customer is logged in', async ({ overviewPage, loginPage, registerPage, ctx }) => {
  await overviewPage.logout();
  // Çıkış tamamlanmadan kayda geçmiyoruz; giriş formu görününce oturum kapanmış demektir
  await expect(loginPage.loginButton).toBeVisible();
  await registerNewCustomer(registerPage, ctx);
});
