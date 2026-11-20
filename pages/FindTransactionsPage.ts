import { type Page, type Locator } from '@playwright/test';
import { openPage } from '../utils/navigation';

// Feature dosyasındaki okunabilir arama kriteri adları
export type SearchCriterion = 'transaction ID' | 'date' | 'amount';

export class FindTransactionsPage {
  readonly page: Page;
  readonly accountSelect: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly findByDateRangeButton: Locator;
  readonly resultTitle: Locator;
  readonly resultRows: Locator;
  readonly errorTitle: Locator;

  // Her arama kriterinin kendi alanı ve kendi "Find Transactions" butonu var
  private readonly criteria: Record<SearchCriterion, { input: Locator; button: Locator }>;

  constructor(page: Page) {
    this.page = page;
    this.accountSelect = page.locator('#accountId');
    this.fromDateInput = page.locator('#fromDate');
    this.toDateInput = page.locator('#toDate');
    this.findByDateRangeButton = page.locator('#findByDateRange');
    this.criteria = {
      'transaction ID': { input: page.locator('#transactionId'), button: page.locator('#findById') },
      date: { input: page.locator('#transactionDate'), button: page.locator('#findByDate') },
      amount: { input: page.locator('#amount'), button: page.locator('#findByAmount') },
    };

    // Sonuç ve hata ekranları sayfada baştan var ama gizli
    this.resultTitle = page.locator('#resultContainer h1.title');
    this.resultRows = page.locator('#transactionBody tr');
    this.errorTitle = page.locator('#errorContainer h1.title');
  }

  async goto() {
    await openPage(this.page, 'findtrans.htm');
  }

  async selectAccount(accountId: string) {
    // Hesap listesi sayfayla birlikte geliyor, yine de seçmeden önce seçeneğin var olduğundan emin oluyoruz
    await this.accountSelect.locator(`option[value="${accountId}"]`).waitFor({ state: 'attached' });
    await this.accountSelect.selectOption(accountId);
  }

  // Kriteri doldurup arar; sonucu beklemez (geçersiz değerde arama hiç gönderilmiyor)
  async searchBy(criterion: SearchCriterion, value: string) {
    await this.criteria[criterion].input.fill(value);
    await this.criteria[criterion].button.click();
  }

  async searchByDateRange(fromDate: string, toDate: string) {
    await this.fromDateInput.fill(fromDate);
    await this.toDateInput.fill(toDate);
    await this.findByDateRangeButton.click();
  }

  // Arama arka planda (AJAX) yapılıyor; sonuç ya da hata ekranı görünene kadar bekliyoruz
  async waitForResults() {
    await this.resultTitle.or(this.errorTitle).filter({ visible: true }).waitFor();
  }

  // Açıklaması ve borç (debit) ya da alacak (credit) sütunundaki tutarı verilen sonuç satırları
  resultRowsFor(description: string, type: 'debit' | 'credit', amount: string): Locator {
    // Sütunlar: Date | Transaction | Debit (-) | Credit (+)
    const amountCell = this.page.locator(`td:nth-child(${type === 'debit' ? 3 : 4})`, { hasText: amount });
    return this.resultRows.filter({ hasText: description }).filter({ has: amountCell });
  }

  // Sonuçtaki her işlem, kendi detay sayfasına (transaction.htm?id=...) link veriyor
  resultRowsForTransactionId(transactionId: string): Locator {
    return this.resultRows.filter({ has: this.page.locator(`a[href$="id=${transactionId}"]`) });
  }
}
