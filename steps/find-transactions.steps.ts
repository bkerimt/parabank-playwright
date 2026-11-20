import { expect } from '@playwright/test';
import { Given, When, Then, accountIdFor } from './fixtures';
import { type SearchCriterion } from '../pages/FindTransactionsPage';
import { formatParaBankDate, daysFromToday } from '../utils/dates';

Given(
  'the customer has noted the ID of the {string} transaction of ${float} on the {word} account',
  async ({ accountDetailsPage, ctx }, description: string, amount: number, role: string) => {
    await accountDetailsPage.goto(accountIdFor(role, ctx));
    ctx.transactionId = await accountDetailsPage.getTransactionId(description, `$${amount.toFixed(2)}`);
  }
);

When(
  'the customer searches transactions of the {word} account by amount ${float}',
  async ({ findTransactionsPage, ctx }, role: string, amount: number) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(accountIdFor(role, ctx));
    await findTransactionsPage.searchBy('amount', amount.toFixed(2));
    await findTransactionsPage.waitForResults();
  }
);

When(
  'the customer searches transactions of the {word} account from yesterday to tomorrow',
  async ({ findTransactionsPage, ctx }, role: string) => {
    // "Bugün" ile aramak yerine bir gün öncesi ve sonrasını kapsayan aralık kullanıyoruz:
    // Sunucu ile testi çalıştıran bilgisayarın saat dilimi farklı olabilir (ör. gece yarısına yakın
    // saatlerde sunucuda hâlâ dün olabilir). Aralık bu farkı tolere ediyor.
    await findTransactionsPage.goto();
    await findTransactionsPage.selectAccount(accountIdFor(role, ctx));
    await findTransactionsPage.searchByDateRange(
      formatParaBankDate(daysFromToday(-1)),
      formatParaBankDate(daysFromToday(1))
    );
    await findTransactionsPage.waitForResults();
  }
);

When('the customer searches transactions by the noted transaction ID', async ({ findTransactionsPage, ctx }) => {
  await findTransactionsPage.goto();
  await findTransactionsPage.searchBy('transaction ID', ctx.transactionId!);
  await findTransactionsPage.waitForResults();
});

When(
  'the customer searches transactions by {string} using {string}',
  async ({ findTransactionsPage }, criterion: SearchCriterion, value: string) => {
    await findTransactionsPage.goto();
    await findTransactionsPage.searchBy(criterion, value);
  }
);

Then('the number of transactions found should be {int}', async ({ findTransactionsPage }, count: number) => {
  await expect(findTransactionsPage.resultTitle).toHaveText('Transaction Results');
  await expect(findTransactionsPage.resultRows).toHaveCount(count);
});

Then(
  'the search results should include a {string} {word} of ${float}',
  async ({ findTransactionsPage }, description: string, type: string, amount: number) => {
    if (type !== 'debit' && type !== 'credit') {
      throw new Error(`İşlem tipi "debit" ya da "credit" olmalı, gelen: "${type}"`);
    }
    const rows = findTransactionsPage.resultRowsFor(description, type, `$${amount.toFixed(2)}`);
    await expect(rows).toHaveCount(1);
  }
);

Then('the noted transaction should not be in the search results', async ({ findTransactionsPage, ctx }) => {
  // Başka müşterinin işlemi hiçbir şekilde listelenmemeli. Uygulama bunu "sonuç yok" ya da
  // hata ekranıyla engelleyebilir; ikisini de kabul edip sadece işlemin görünmediğini kontrol ediyoruz.
  await expect(findTransactionsPage.resultRowsForTransactionId(ctx.transactionId!)).toHaveCount(0);
});

Then('no search should be performed', async ({ findTransactionsPage }) => {
  await expect(findTransactionsPage.resultTitle).toBeHidden();
  await expect(findTransactionsPage.errorTitle).toBeHidden();
});
