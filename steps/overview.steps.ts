import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('the customer has noted the total balance', async ({ overviewPage, ctx }) => {
  await overviewPage.goto();
  ctx.totalBalanceBefore = await overviewPage.getTotalBalance();
});

When('the customer views the accounts overview', async ({ overviewPage }) => {
  await overviewPage.goto();
});

Then('the new account should be listed in the accounts overview', async ({ overviewPage, ctx }) => {
  const accountIds = await overviewPage.getAccountIds();
  expect(accountIds).toContain(ctx.newAccountId!);
});

Then('the accounts overview should list {int} accounts', async ({ overviewPage }, count: number) => {
  await expect(overviewPage.accountRows).toHaveCount(count);
});

Then('the total balance should equal the sum of the account balances', async ({ overviewPage }) => {
  const balances = await overviewPage.getAccountBalances();
  const sum = balances.reduce((total, balance) => total + balance, 0);

  // Ondalıklı sayılarda küçük yuvarlama farkları olabilir; kuruşa kadar (2 hane) karşılaştırıyoruz
  expect(sum).toBeCloseTo(await overviewPage.getTotalBalance(), 2);
});

Then('the total balance should be unchanged', async ({ overviewPage, ctx }) => {
  // Yeni hesabın ilk parası mevcut hesaptan transfer ediliyor; toplam varlık değişmemeli
  expect(await overviewPage.getTotalBalance()).toBeCloseTo(ctx.totalBalanceBefore!, 2);
});
