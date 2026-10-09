import { type Page, type Locator } from '@playwright/test';

export class AccountsOverviewPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Accounts Overview' });
    this.welcomeText = page.locator('#leftPanel p.smallText');
    this.logoutLink = page.getByRole('link', { name: 'Log Out' });
  }

  async logout() {
    await this.logoutLink.click();
  }
}
