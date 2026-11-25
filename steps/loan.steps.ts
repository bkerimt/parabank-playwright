import { expect } from '@playwright/test';
import { Given, When, Then, accountIdFor } from './fixtures';

Given('the customer has total available funds of ${float}', async ({ api, ctx }, amount: number) => {
  // Kredi kararı müşterinin toplam varlığına göre veriliyor. Senaryolardaki tutarlar bu değere göre
  // seçildiği için ön koşulu açıkça doğruluyoruz; değer farklıysa test burada, sebebiyle birlikte durur.
  expect(await api.getTotalBalance(ctx.customerId!)).toBeCloseTo(amount, 2);
});

When(
  'the customer requests a loan of ${float} with a down payment of ${float}',
  async ({ requestLoanPage, ctx }, amount: number, downPayment: number) => {
    await requestLoanPage.goto();
    await requestLoanPage.requestLoan(amount.toFixed(2), downPayment.toFixed(2));

    // Onaylanırsa ParaBank yeni bir kredi hesabı açıyor; sonraki adımlar için numarasını saklıyoruz
    if ((await requestLoanPage.loanStatus.textContent()) === 'Approved') {
      ctx.loanAccountId = (await requestLoanPage.newAccountLink.innerText()).trim();
    }
  }
);

When('the customer requests a loan without entering an amount', async ({ requestLoanPage }) => {
  await requestLoanPage.goto();
  await requestLoanPage.requestLoan('', '100.00');
});

Then('the loan status should be {string}', async ({ requestLoanPage }, status: string) => {
  await expect(requestLoanPage.loanStatus).toHaveText(status);
});

Then('the loan message should be {string}', async ({ requestLoanPage }, message: string) => {
  await expect(requestLoanPage.visibleMessage()).toHaveText(message);
});

Then(
  'the loan account details should show account type {string} and a balance of ${float}',
  async ({ requestLoanPage, accountDetailsPage, ctx }, accountType: string, balance: number) => {
    // Kullanıcı gibi davranıp sonuç ekranındaki yeni hesap numarasına tıklıyoruz
    await requestLoanPage.newAccountLink.click();

    await expect(accountDetailsPage.accountId).toHaveText(accountIdFor('loan', ctx));
    await expect(accountDetailsPage.accountType).toHaveText(accountType);
    expect(await accountDetailsPage.getBalance()).toBeCloseTo(balance, 2);
  }
);

Then(
  'the original account activity should show the down payment of ${float} for the loan',
  async ({ accountDetailsPage, ctx }, amount: number) => {
    await accountDetailsPage.goto(accountIdFor('original', ctx));
    // ParaBank peşinatı "Down Payment for Loan # <kredi hesap no>" açıklamasıyla kaydediyor
    const row = accountDetailsPage
      .transactionRow(`Down Payment for Loan # ${accountIdFor('loan', ctx)}`)
      .filter({ hasText: `$${amount.toFixed(2)}` });
    await expect(row).toHaveCount(1);
  }
);
