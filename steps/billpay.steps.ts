import { expect } from '@playwright/test';
import { When, Then, accountIdFor } from './fixtures';
import { createBillPayment } from '../utils/testData';
import { type BillPayField } from '../pages/BillPayPage';

// Feature dosyasındaki okunabilir alan adlarını sayfa nesnesindeki alanlara çevirir
const fieldNames: Record<string, BillPayField> = {
  'payee name': 'payeeName',
  address: 'street',
  'phone number': 'phone',
  'account number': 'accountNumber',
  amount: 'amount',
};

When(
  'the customer pays a bill of ${float} to {string}',
  async ({ billPayPage, ctx }, amount: number, payeeName: string) => {
    const payment = createBillPayment({ payeeName, amount: amount.toFixed(2) });
    await billPayPage.goto();
    await billPayPage.pay(payment, accountIdFor('original', ctx));
  }
);

When('the customer submits a bill payment without the {string}', async ({ billPayPage }, field: string) => {
  const skip = fieldNames[field];
  if (!skip) {
    throw new Error(`Bilinmeyen alan: "${field}"`);
  }
  await billPayPage.goto();
  await billPayPage.fillForm(createBillPayment(), undefined, skip);
  await billPayPage.submit();
});

When(
  'the customer submits a bill payment with account {string} and verify account {string}',
  async ({ billPayPage }, accountNumber: string, verifyAccount: string) => {
    await billPayPage.goto();
    await billPayPage.fillForm(createBillPayment({ accountNumber, verifyAccount }));
    await billPayPage.submit();
  }
);

Then(
  'the bill payment confirmation should show ${float} to {string} from the {word} account',
  async ({ billPayPage, ctx }, amount: number, payeeName: string, role: string) => {
    await expect(billPayPage.resultTitle).toHaveText('Bill Payment Complete');
    await expect(billPayPage.payeeNameResult).toHaveText(payeeName);
    await expect(billPayPage.amountResult).toHaveText(`$${amount.toFixed(2)}`);
    await expect(billPayPage.fromAccountResult).toHaveText(accountIdFor(role, ctx));
  }
);

Then('the bill payment should not be sent', async ({ billPayPage }) => {
  // Form doğrulaması tarayıcıda yapılıyor; hata varsa istek hiç gönderilmiyor ve form ekranda kalıyor
  await expect(billPayPage.sendPaymentButton).toBeVisible();
  await expect(billPayPage.resultTitle).toBeHidden();
});
