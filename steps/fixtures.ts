import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { type Customer } from '../utils/testData';

// Senaryo boyunca adımlar arasında taşınan veri
type ScenarioContext = {
  customer?: Customer;
};

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  overviewPage: AccountsOverviewPage;
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
  ctx: async ({}, use) => {
    await use({});
  },
});

export const { Given, When, Then } = createBdd(test);
