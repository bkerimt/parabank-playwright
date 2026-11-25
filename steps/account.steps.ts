import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { type OpenAccountPage } from '../pages/OpenAccountPage';
import { type ScenarioContext } from './fixtures';
import { type AccountType } from '../api/ParaBankApiClient';

// İki step de aynı işi yapıyor; kodu tekrar yazmamak için ortak fonksiyon
async function openNewAccount(openAccountPage: OpenAccountPage, ctx: ScenarioContext, accountType: string) {
  await openAccountPage.goto();
  const opened = await openAccountPage.openAccount(accountType);
  ctx.newAccountId = opened.newAccountId;
  ctx.originalAccountId = opened.fromAccountId;
}

When('the customer opens a new {string} account', async ({ openAccountPage, ctx }, accountType: string) => {
  await openNewAccount(openAccountPage, ctx, accountType);
});

// Başka senaryolarda ön koşul olarak kullanılan hali: Hesap açma ekranı open-account.feature'da
// test ediliyor; burada sadece hazırlık olduğu için hesabı API ile açıyoruz.
Given(
  'the customer has opened a new {string} account',
  async ({ api, ctx }, accountType: AccountType) => {
    const response = await api.createAccount(ctx.customerId!, accountType, Number(ctx.originalAccountId));
    expect(response.status(), `Hesap açılamadı: ${await response.text()}`).toBe(200);
    ctx.newAccountId = String((await response.json()).id);
  }
);

Then('the account opened confirmation should be displayed', async ({ openAccountPage, ctx }) => {
  await expect(openAccountPage.resultTitle).toHaveText('Account Opened!');
  await expect(openAccountPage.newAccountLink).toHaveText(ctx.newAccountId!);
});

Then(
  'the new account details should show account type {string}',
  async ({ openAccountPage, accountDetailsPage, ctx }, accountType: string) => {
    // Kullanıcı gibi davranıp onay ekranındaki hesap numarasına tıklıyoruz
    await openAccountPage.newAccountLink.click();

    await expect(accountDetailsPage.heading).toBeVisible();
    await expect(accountDetailsPage.accountId).toHaveText(ctx.newAccountId!);
    await expect(accountDetailsPage.accountType).toHaveText(accountType);
  }
);
