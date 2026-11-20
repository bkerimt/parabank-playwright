import { type Page, type Locator } from '@playwright/test';
import { parseCurrency } from '../utils/currency';
import { openPage } from '../utils/navigation';

export class AccountDetailsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly accountId: Locator;
  readonly accountType: Locator;
  readonly balance: Locator;
  readonly transactionRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Account Details' });
    this.accountId = page.locator('#accountId');
    this.accountType = page.locator('#accountType');
    this.balance = page.locator('#balance');
    this.transactionRows = page.locator('#transactionTable tbody tr');
  }

  async goto(accountId: string) {
    await openPage(this.page, `activity.htm?id=${accountId}`);
  }

  async getBalance(): Promise<number> {
    // Bakiye arka planda yükleniyor; içinde "$" görünene kadar bekliyoruz
    await this.balance.filter({ hasText: '$' }).waitFor();
    return parseCurrency(await this.balance.innerText());
  }

  // Açıklaması verilen metni içeren hareket satırı(ları)
  transactionRow(description: string): Locator {
    return this.transactionRows.filter({ hasText: description });
  }

  // İşlem numarası ekranda yazmıyor; açıklamadaki linkte duruyor (transaction.htm?id=14476)
  async getTransactionId(description: string, amount: string): Promise<string> {
    const link = this.transactionRow(description).filter({ hasText: amount }).locator('a');
    const href = await link.getAttribute('href');
    const transactionId = href?.match(/id=(\d+)/)?.[1];
    if (!transactionId) {
      throw new Error(`"${description}" (${amount}) işleminin numarası bulunamadı`);
    }
    return transactionId;
  }
}
