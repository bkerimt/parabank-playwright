import { type Page, type Locator } from '@playwright/test';

export class TransferPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly toAccountSelect: Locator;
  readonly transferButton: Locator;
  readonly resultTitle: Locator;
  readonly amountResult: Locator;
  readonly fromAccountResult: Locator;
  readonly toAccountResult: Locator;
  readonly errorTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator('#amount');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.toAccountSelect = page.locator('#toAccountId');
    this.transferButton = page.locator('input[type="submit"][value="Transfer"]');
    this.resultTitle = page.locator('#showResult h1.title');
    this.amountResult = page.locator('#amountResult');
    this.fromAccountResult = page.locator('#fromAccountIdResult');
    this.toAccountResult = page.locator('#toAccountIdResult');
    this.errorTitle = page.locator('#showError h1.title');
  }

  async goto() {
    await this.page.goto('transfer.htm');
  }

  async transfer(amount: number, fromAccountId: string, toAccountId: string) {
    // Hesap listeleri sayfa açıldıktan sonra arka planda (AJAX) dolduruluyor.
    // Seçmek istediğimiz hesaplar listede görünene kadar bekliyoruz.
    await this.fromAccountSelect.locator(`option[value="${fromAccountId}"]`).waitFor({ state: 'attached' });
    await this.toAccountSelect.locator(`option[value="${toAccountId}"]`).waitFor({ state: 'attached' });

    await this.amountInput.fill(amount.toFixed(2));
    await this.fromAccountSelect.selectOption(fromAccountId);
    await this.toAccountSelect.selectOption(toAccountId);
    await this.transferButton.click();

    // Transfer arka planda gönderiliyor. Sonuç (başarı ya da hata) ekranda görünmeden
    // başka sayfaya geçersek istek yarıda kalabilir; bu yüzden sonucu bekliyoruz.
        await this.resultTitle.or(this.errorTitle).filter({ visible: true }).waitFor();
  }
}
