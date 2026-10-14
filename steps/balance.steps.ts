import { expect } from '@playwright/test';
import { Given, Then, accountIdFor } from './fixtures';

// Para hareketi olan tüm feature'ların (transfer, fatura ödeme) kullandığı bakiye ve hareket adımları

Given(
  'the customer has noted the balances of the original and new accounts',
  async ({ accountDetailsPage, ctx }) => {
    for (const role of ['original', 'new']) {
      const accountId = accountIdFor(role, ctx);
      await accountDetailsPage.goto(accountId);
      ctx.balancesBefore[accountId] = await accountDetailsPage.getBalance();
    }
  }
);

Then(
  'the {word} account balance should decrease by ${float}',
  async ({ accountDetailsPage, ctx }, role: string, amount: number) => {
    const accountId = accountIdFor(role, ctx);
    await accountDetailsPage.goto(accountId);
    // Ondalıklı sayılarda kuruşa kadar (2 hane) karşılaştırıyoruz
    expect(await accountDetailsPage.getBalance()).toBeCloseTo(ctx.balancesBefore[accountId] - amount, 2);
  }
);

Then(
  'the {word} account balance should increase by ${float}',
  async ({ accountDetailsPage, ctx }, role: string, amount: number) => {
    const accountId = accountIdFor(role, ctx);
    await accountDetailsPage.goto(accountId);
    expect(await accountDetailsPage.getBalance()).toBeCloseTo(ctx.balancesBefore[accountId] + amount, 2);
  }
);

Then('the {word} account balance should be unchanged', async ({ accountDetailsPage, ctx }, role: string) => {
  const accountId = accountIdFor(role, ctx);
  await accountDetailsPage.goto(accountId);
  expect(await accountDetailsPage.getBalance()).toBeCloseTo(ctx.balancesBefore[accountId], 2);
});

Then(
  'the {word} account activity should show a {string} transaction of ${float}',
  async ({ accountDetailsPage, ctx }, role: string, description: string, amount: number) => {
    await accountDetailsPage.goto(accountIdFor(role, ctx));
    // Dikkat: Yeni hesap açılırken ParaBank açılış tutarını da bir transferle gönderiyor.
    // Bu yüzden aynı açıklamaya sahip başka satırlar olabilir; açıklama VE tutar ile filtreliyoruz.
    const row = accountDetailsPage
      .transactionRow(description)
      .filter({ hasText: `$${amount.toFixed(2)}` });
    await expect(row).toHaveCount(1);
  }
);
