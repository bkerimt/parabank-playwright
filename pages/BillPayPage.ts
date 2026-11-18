import { type Page, type Locator } from '@playwright/test';
import { type BillPayment } from '../utils/testData';
import { openPage } from '../utils/navigation';

export type BillPayField = keyof BillPayment;

export class BillPayPage {
  readonly page: Page;
  readonly fromAccountSelect: Locator;
  readonly sendPaymentButton: Locator;
  readonly resultTitle: Locator;
  readonly payeeNameResult: Locator;
  readonly amountResult: Locator;
  readonly fromAccountResult: Locator;
  readonly errorTitle: Locator;

  // Form alanları "name" niteliğiyle bulunuyor.
  // Not: ParaBank telefon alanının id ve class değerlerini her sayfa açılışında rastgele üretiyor
  // (kırılgan locator'ları göstermek için bilerek yapılmış). Bu yüzden id yerine name kullanıyoruz.
  private readonly fields: Record<BillPayField, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.fields = {
      payeeName: page.locator('[name="payee.name"]'),
      street: page.locator('[name="payee.address.street"]'),
      city: page.locator('[name="payee.address.city"]'),
      state: page.locator('[name="payee.address.state"]'),
      zipCode: page.locator('[name="payee.address.zipCode"]'),
      phone: page.locator('[name="payee.phoneNumber"]'),
      accountNumber: page.locator('[name="payee.accountNumber"]'),
      verifyAccount: page.locator('[name="verifyAccount"]'),
      amount: page.locator('[name="amount"]'),
    };
    this.fromAccountSelect = page.locator('select[name="fromAccountId"]');
    this.sendPaymentButton = page.locator('input[type="button"][value="Send Payment"]');
    this.resultTitle = page.locator('#billpayResult h1.title');
    this.payeeNameResult = page.locator('#billpayResult #payeeName');
    this.amountResult = page.locator('#billpayResult #amount');
    this.fromAccountResult = page.locator('#billpayResult #fromAccountId');
    this.errorTitle = page.locator('#billpayError h1.title');
  }

  async goto() {
    await openPage(this.page, 'billpay.htm');
  }

  // Formu doldurur; "skip" verilen alan boş bırakılır (zorunlu alan kontrolü için).
  // Hesap verilmezse listedeki ilk hesap (varsayılan seçim) kullanılır.
  async fillForm(payment: BillPayment, fromAccountId?: string, skip?: BillPayField) {
    for (const [field, locator] of Object.entries(this.fields) as [BillPayField, Locator][]) {
      if (field !== skip) {
        await locator.fill(payment[field]);
      }
    }
    if (fromAccountId) {
      await this.fromAccountSelect.selectOption(fromAccountId);
    }
  }

  async submit() {
    await this.sendPaymentButton.click();
  }

  // Ödemeyi gönderir ve sonucun (başarı ya da hata) ekranda görünmesini bekler
  async pay(payment: BillPayment, fromAccountId?: string) {
    await this.fillForm(payment, fromAccountId);
    await this.submit();
    // İki başlık da sayfada baştan var (biri gizli); sadece görünür olanı bekliyoruz
    await this.resultTitle.or(this.errorTitle).filter({ visible: true }).waitFor();
  }
}
