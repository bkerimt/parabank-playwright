import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { OpenAccountPage } from '../pages/OpenAccountPage';
import { AccountDetailsPage } from '../pages/AccountDetailsPage';
import { type Customer } from '../utils/testData';

// Senaryo boyunca adımlar arasında taşınan veri
type ScenarioContext = {
  customer?: Customer;
  newAccountId?: string;
};

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  overviewPage: AccountsOverviewPage;
  openAccountPage: OpenAccountPage;
  accountDetailsPage: AccountDetailsPage;
  ctx: ScenarioContext;
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
  ctx: async ({}, use) => {
    await use({});
  },
});

export const { Given, When, Then } = createBdd(test);
