import { type Page, type Locator } from '@playwright/test';
import { parseCurrency } from '../utils/currency';
import { openPage } from '../utils/navigation';

export class AccountsOverviewPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly logoutLink: Locator;
  readonly accountRows: Locator;
  readonly totalRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Accounts Overview' });
    this.welcomeText = page.locator('#leftPanel p.smallText');
    this.logoutLink = page.getByRole('link', { name: 'Log Out' });

    // Hesap satırlarında hesap numarası link olarak duruyor; "Total" satırında link yok
    const rows = page.locator('#accountTable tbody tr');
    this.accountRows = rows.filter({ has: page.locator('a') });
    this.totalRow = rows.filter({ hasText: 'Total' });
  }

  async goto() {
    await openPage(this.page, 'overview.htm');
    // Tablo sayfa açıldıktan sonra arka planda dolduruluyor; Total satırı en son ekleniyor
    await this.totalRow.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.logoutLink.click();
  }

  async getAccountIds(): Promise<string[]> {
    const ids = await this.accountRows.locator('a').allInnerTexts();
    return ids.map((id) => id.trim());
  }

  async getAccountBalances(): Promise<number[]> {
    const balances = await this.accountRows.locator('td:nth-child(2)').allInnerTexts();
    return balances.map(parseCurrency);
  }

  async getTotalBalance(): Promise<number> {
    return parseCurrency(await this.totalRow.locator('td').nth(1).innerText());
  }
}
