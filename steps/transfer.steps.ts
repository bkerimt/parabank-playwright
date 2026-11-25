import { expect } from '@playwright/test';
import { Given, When, Then, accountIdFor } from './fixtures';

// Başka senaryolarda ön koşul olarak kullanılan hali: Transfer API ile yapılıyor
Given(
  'the customer has transferred ${float} from the {word} account to the {word} account',
  async ({ api, ctx }, amount: number, fromRole: string, toRole: string) => {
    const response = await api.transfer(
      Number(accountIdFor(fromRole, ctx)),
      Number(accountIdFor(toRole, ctx)),
      amount
    );
    expect(response.status(), `Transfer yapılamadı: ${await response.text()}`).toBe(200);
  }
);

When(
  'the customer transfers ${float} from the {word} account to the {word} account',
  async ({ transferPage, ctx }, amount: number, fromRole: string, toRole: string) => {
    await transferPage.goto();
    await transferPage.transfer(amount, accountIdFor(fromRole, ctx), accountIdFor(toRole, ctx));
  }
);

Then(
  'the transfer confirmation should show ${float} from the {word} account to the {word} account',
  async ({ transferPage, ctx }, amount: number, fromRole: string, toRole: string) => {
    await expect(transferPage.resultTitle).toHaveText('Transfer Complete!');
    await expect(transferPage.amountResult).toHaveText(`$${amount.toFixed(2)}`);
    await expect(transferPage.fromAccountResult).toHaveText(accountIdFor(fromRole, ctx));
    await expect(transferPage.toAccountResult).toHaveText(accountIdFor(toRole, ctx));
  }
);
