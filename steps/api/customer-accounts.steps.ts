import { expect } from '@playwright/test';
import { Given, When, Then, lastResponse } from './fixtures';
import { createCustomer } from '../../utils/testData';

// ---------- Ön koşul ----------

Given('a new customer has been registered', async ({ api, ctx }) => {
  const customer = createCustomer();
  await api.registerCustomer(customer);

  // Diğer istekler müşteri numarasıyla çalışıyor; numarayı giriş servisinden öğreniyoruz
  const login = await api.login(customer.username, customer.password);
  expect(login.status(), 'Yeni müşteri API ile giriş yapabilmeli').toBe(200);
  ctx.customer = customer;
  ctx.customerId = (await login.json()).id;
});

// ---------- İstekler ----------

When("the client logs in through the API with the customer's credentials", async ({ api, ctx }) => {
  ctx.response = await api.login(ctx.customer!.username, ctx.customer!.password);
});

When('the client logs in through the API with a wrong password', async ({ api, ctx }) => {
  ctx.response = await api.login(ctx.customer!.username, 'WrongPassword1!');
});

When("the client requests the customer's details", async ({ api, ctx }) => {
  ctx.response = await api.getCustomer(ctx.customerId!);
});

When("the client requests the customer's accounts", async ({ api, ctx }) => {
  ctx.response = await api.getAccounts(ctx.customerId!);
});

When("the client requests the details of the customer's first account", async ({ api, ctx }) => {
  const accounts = await (await api.getAccounts(ctx.customerId!)).json();
  ctx.response = await api.getAccount(accounts[0].id);
});

When('the client requests the details of account {int}', async ({ api, ctx }, accountId: number) => {
  ctx.response = await api.getAccount(accountId);
});

When(
  "a client without any credentials requests the customer's accounts",
  async ({ anonymousApi, ctx }) => {
    ctx.response = await anonymousApi.getAccounts(ctx.customerId!);
  }
);

// ---------- Doğrulamalar ----------

Then('the response status should be {int}', async ({ ctx }, status: number) => {
  const response = lastResponse(ctx);
  // Hata mesajında cevabın içeriği de görünsün; sebebi rapordan anlaşılsın
  expect(response.status(), `Cevap: ${await response.text()}`).toBe(status);
});

Then('the response should contain the text {string}', async ({ ctx }, text: string) => {
  expect(await lastResponse(ctx).text()).toContain(text);
});

Then("the response should contain the customer's registration details", async ({ ctx }) => {
  const customer = ctx.customer!;
  const body = await lastResponse(ctx).json();

  // toMatchObject: Cevapta başka alanlar da olabilir, sadece burada yazılanları karşılaştırır
  expect(body).toMatchObject({
    id: ctx.customerId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    address: {
      street: customer.street,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
    },
    phoneNumber: customer.phone,
    ssn: customer.ssn,
  });
});

Then('the number of accounts in the response should be {int}', async ({ ctx }, count: number) => {
  expect(await lastResponse(ctx).json()).toHaveLength(count);
});

Then(
  'the first account should be a {string} account with a balance of ${float}',
  async ({ ctx }, type: string, balance: number) => {
    const [account] = await lastResponse(ctx).json();
    expect(account.type).toBe(type);
    expect(account.balance).toBeCloseTo(balance, 2);
    expect(account.customerId).toBe(ctx.customerId);
  }
);

Then('the account in the response should belong to the customer', async ({ ctx }) => {
  const account = await lastResponse(ctx).json();
  expect(account.customerId).toBe(ctx.customerId);
  expect(typeof account.id).toBe('number');
});
