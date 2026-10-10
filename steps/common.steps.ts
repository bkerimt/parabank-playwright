import { expect } from '@playwright/test';
import { Given } from './fixtures';
import { createCustomer } from '../utils/testData';

// Birden fazla feature'ın kullandığı ortak adımlar

// Kayıt olan müşteri ParaBank'ta otomatik olarak giriş yapmış olur
Given('a logged-in customer', async ({ registerPage, ctx }) => {
  const customer = createCustomer();
  await registerPage.goto();
  await registerPage.register(customer);
  await expect(registerPage.pageTitle).toHaveText(`Welcome ${customer.username}`);
  ctx.customer = customer;
});
