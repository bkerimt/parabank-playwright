import { type Page, type Locator } from '@playwright/test';
import { openPage } from '../utils/navigation';

export class RequestLoanPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly downPaymentInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly applyButton: Locator;
  readonly resultTitle: Locator;
  readonly loanStatus: Locator;
  readonly approvedMessage: Locator;
  readonly deniedMessage: Locator;
  readonly newAccountLink: Locator;
  readonly errorTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('#amount');
    this.downPaymentInput = page.locator('#downPayment');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.applyButton = page.locator('input[type="button"][value="Apply Now"]');

    // Sonuç ekranı sayfada baştan var ama gizli; başvuru cevabı gelince görünür oluyor
    this.resultTitle = page.locator('#requestLoanResult h1.title');
    this.loanStatus = page.locator('#loanStatus');
    this.approvedMessage = page.locator('#loanRequestApproved p').first();
    this.deniedMessage = page.locator('#loanRequestDenied p.error');
    this.newAccountLink = page.locator('#newAccountId');
    this.errorTitle = page.locator('#requestLoanError h1.title');
  }

  async goto() {
    await openPage(this.page, 'requestloan.htm');
  }

  async requestLoan(amount: string, downPayment: string) {
    // Hesap listesi dolmadan başvuru gönderilirse "fromAccountId" boş gider
    await this.fromAccountSelect.locator('option').first().waitFor({ state: 'attached' });

    await this.amountInput.fill(amount);
    await this.downPaymentInput.fill(downPayment);
    await this.applyButton.click();

    // Başvuru arka planda (AJAX) gönderiliyor; sonuç ya da hata ekranı görünene kadar bekliyoruz
    await this.resultTitle.or(this.errorTitle).filter({ visible: true }).waitFor();
  }

  // Onay veya ret mesajından hangisi görünüyorsa o
  visibleMessage(): Locator {
    return this.approvedMessage.or(this.deniedMessage).filter({ visible: true });
  }
}
