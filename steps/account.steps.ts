import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

When('the customer opens a new {string} account', async ({ openAccountPage, ctx }, accountType: string) => {
  await openAccountPage.goto();
  ctx.newAccountId = await openAccountPage.openAccount(accountType);
});

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
