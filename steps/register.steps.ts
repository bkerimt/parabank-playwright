import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { createCustomer } from '../utils/testData';

Given('the user is on the registration page', async ({ registerPage }) => {
  await registerPage.goto();
});

When('the user registers with valid customer details', async ({ registerPage, ctx }) => {
  const customer = createCustomer();
  ctx.customer = customer;
  await registerPage.register(customer);
});

When(
  'the user registers with password confirmation {string}',
  async ({ registerPage }, repeatedPassword: string) => {
    await registerPage.register(createCustomer(), repeatedPassword);
  }
);

Then('the welcome message for the new customer should be displayed', async ({ registerPage, ctx }) => {
  const customer = ctx.customer!;
  await expect(registerPage.pageTitle).toHaveText(`Welcome ${customer.username}`);
});

// Genel amaçlı mesaj kontrolü. Bazı sayfalarda aynı metin gizli olarak birden fazla yerde duruyor
// (ör. fatura ödemede "Account number is required." iki alan için var); sadece görünür olana bakıyoruz.
Then('the message {string} should be displayed', async ({ page }, message: string) => {
  await expect(page.getByText(message).filter({ visible: true })).toBeVisible();
});
