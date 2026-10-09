import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { createCustomer } from '../utils/testData';

test.describe('Müşteri Girişi', () => {
  test('kayıtlı müşteri geçerli bilgilerle giriş yapabilmeli', async ({ page }) => {
    // Ön koşul: yeni müşteri oluştur ve oturumu kapat
    const customer = createCustomer();
    const registerPage = new RegisterPage(page);
    const overviewPage = new AccountsOverviewPage(page);
    const loginPage = new LoginPage(page);

    await registerPage.goto();
    await registerPage.register(customer);
    await overviewPage.logout();

    // Test adımı
    await loginPage.login(customer.username, customer.password);

    await expect(overviewPage.heading).toBeVisible();
    await expect(overviewPage.welcomeText).toContainText(
      `${customer.firstName} ${customer.lastName}`
    );
  });

  test('hatalı şifre ile giriş yapılamamalı', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('olmayanKullanici999', 'yanlisSifre');

    await expect(loginPage.errorMessage).toContainText(
      'The username and password could not be verified.'
    );
  });

  test('boş alanlarla giriş yapılamamalı', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toContainText(
      'Please enter a username and password.'
    );
  });
});
