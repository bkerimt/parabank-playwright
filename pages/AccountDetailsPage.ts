import { type Page, type Locator } from '@playwright/test';

export class AccountDetailsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly accountId: Locator;
  readonly accountType: Locator;
  readonly balance: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Account Details' });
    this.accountId = page.locator('#accountId');
    this.accountType = page.locator('#accountType');
    this.balance = page.locator('#balance');
  }

  async goto(accountId: string) {
    await this.page.goto(`activity.htm?id=${accountId}`);
  }
}
