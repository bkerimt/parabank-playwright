import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { AccountDetailsPage } from '../pages/AccountDetailsPage';
import { TransferPage } from '../pages/TransferPage';
import { type Customer } from '../utils/testData';

// Senaryo boyunca adımlar arasında taşınan veri
export type ScenarioContext = {
  customer?: Customer;
  originalAccountId?: string; // Kayıtta otomatik açılan ilk hesap
  newAccountId?: string; // Senaryo içinde açılan yeni hesap
  totalBalanceBefore?: number;
  balancesBefore: Record<string, number>; // İşlemden önceki bakiyeler (hesap no -> bakiye)
};

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  overviewPage: AccountsOverviewPage;
  openAccountPage: OpenAccountPage;
  accountDetailsPage: AccountDetailsPage;
  transferPage: TransferPage;
  ctx: ScenarioContext;
  requestGuard: void;
};

// Her senaryoya hazır sayfa nesneleri ve boş bir veri kutusu verir
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  overviewPage: async ({ page }, use) => {
    await use(new AccountsOverviewPage(page));
  },
  openAccountPage: async ({ page }, use) => {
    await use(new OpenAccountPage(page));
  },
  accountDetailsPage: async ({ page }, use) => {
    await use(new AccountDetailsPage(page));
  },
  transferPage: async ({ page }, use) => {
    await use(new TransferPage(page));
  },
  ctx: async ({}, use) => {
    await use({ balancesBefore: {} });
  },

  // Her senaryoya otomatik uygulanır ("auto: true"), step'lerde ayrıca istemeye gerek yok.
  // 1) Resim, font ve medya dosyalarını indirmiyoruz: Testlerin doğruladığı hiçbir şey bunlara bağlı değil,
  //    ama her sayfada isteklerin büyük kısmını oluşturuyorlar. Daha az istek = rate limit'e takılma riski daha düşük.
  // 2) ParaBank bir isteği sınırlarsa (HTTP 429) bunu rapora not olarak ekliyoruz; böylece zaman aşımı gibi
  //    görünen bir hatanın asıl sebebi raporda hemen görülüyor.
  requestGuard: [
    async ({ page }, use, testInfo) => {
      await page.route('**/*', (route) =>
        ['image', 'font', 'media'].includes(route.request().resourceType()) ? route.abort() : route.continue()
      );

      let rateLimited = false;
      page.on('response', (response) => {
        if (response.status() === 429 && !rateLimited) {
          rateLimited = true;
          testInfo.annotations.push({
            type: 'rate-limit',
            description: `ParaBank isteği sınırladı (HTTP 429): ${response.url()}`,
          });
        }
      });

      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);

// Feature dosyasındaki "original" / "new" kelimesini gerçek hesap numarasına çevirir
export function accountIdFor(role: string, ctx: ScenarioContext): string {
  const accountId = role === 'original' ? ctx.originalAccountId : role === 'new' ? ctx.newAccountId : undefined;
  if (!accountId) {
    throw new Error(`"${role}" hesabı bu senaryoda henüz oluşturulmadı`);
  }
  return accountId;
}
