import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { createCustomer } from '../utils/testData';

test.describe('Müşteri Kaydı', () => {
  test('yeni müşteri başarıyla kayıt olabilmeli', async ({ page }) => {
    const customer = createCustomer();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(customer);

    await expect(registerPage.pageTitle).toHaveText(`Welcome ${customer.username}`);
    await expect(page.getByText('Your account was created successfully')).toBeVisible();
  });

  test('şifreler eşleşmezse kayıt yapılmamalı', async ({ page }) => {
    const customer = createCustomer();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(customer, 'FarkliSifre123');

    await expect(page.getByText('Passwords did not match.')).toBeVisible();
  });
});
