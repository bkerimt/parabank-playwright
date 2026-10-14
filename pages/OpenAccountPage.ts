import { type Page, type Locator } from '@playwright/test';

export type OpenedAccount = {
  newAccountId: string;
  fromAccountId: string; // Açılış tutarının çekildiği mevcut hesap
};

export class OpenAccountPage {
  readonly page: Page;
  readonly accountTypeSelect: Locator;
  readonly fromAccountSelect: Locator;
  readonly openAccountButton: Locator;
  readonly resultTitle: Locator;
  readonly newAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountTypeSelect = page.locator('#type');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.openAccountButton = page.locator('input[value="Open New Account"]');
    this.resultTitle = page.locator('#openAccountResult h1.title');
    this.newAccountLink = page.locator('#newAccountId');
  }

  async goto() {
    await this.page.goto('openaccount.htm');
  }

  // Yeni hesap açar; yeni hesap numarasını ve paranın çekildiği hesabı döndürür
  async openAccount(accountType: string): Promise<OpenedAccount> {
    await this.accountTypeSelect.selectOption({ label: accountType });

    // Kaynak hesap listesi sayfa açıldıktan sonra arka planda (AJAX) yükleniyor.
    // Liste dolmadan butona basılırsa ParaBank hata veriyor, bu yüzden bekliyoruz.
    await this.fromAccountSelect.locator('option').first().waitFor({ state: 'attached' });
    const fromAccountId = await this.fromAccountSelect.inputValue();

    await this.openAccountButton.click();
    await this.newAccountLink.waitFor({ state: 'visible' });

    const newAccountId = (await this.newAccountLink.innerText()).trim();
    return { newAccountId, fromAccountId };
  }
}
