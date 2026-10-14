import { expect } from '@playwright/test';
import { When, Then, accountIdFor } from './fixtures';

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
