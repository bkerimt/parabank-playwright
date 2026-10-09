import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { createCustomer } from '../utils/testData';

Given('a registered customer exists', async ({ registerPage, overviewPage, ctx }) => {
  const customer = createCustomer();
  await registerPage.goto();
  await registerPage.register(customer);
  await overviewPage.logout();
  ctx.customer = customer; // sonraki adımlar kullansın diye sakla
});

Given('the user is on the login page', async ({ loginPage }) => {
  await loginPage.goto();
});

When('the customer logs in with valid credentials', async ({ loginPage, ctx }) => {
  const customer = ctx.customer!; // "!" = bu değerin dolu olduğundan eminim
  await loginPage.login(customer.username, customer.password);
});

When(
  'the user logs in with username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
  }
);

When('the user clicks the login button without entering credentials', async ({ loginPage }) => {
  await loginPage.loginButton.click();
});

Then('the accounts overview page should be displayed', async ({ overviewPage, ctx }) => {
  const customer = ctx.customer!;
  await expect(overviewPage.heading).toBeVisible();
  await expect(overviewPage.welcomeText).toContainText(
    `${customer.firstName} ${customer.lastName}`
  );
});

Then('the error message {string} should be displayed', async ({ loginPage }, message: string) => {
  await expect(loginPage.errorMessage).toContainText(message);
});
