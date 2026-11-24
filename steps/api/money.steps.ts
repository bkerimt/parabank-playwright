import { expect } from '@playwright/test';
import { Given, When, Then, lastResponse, accountIdFor } from './fixtures';
import { type AccountType } from '../../api/ParaBankApiClient';

// Para işlemlerinin sonucu, cevaptaki mesaja güvenilmeden, hesabın güncel bakiyesi
// ayrıca API'den okunarak doğrulanıyor: "Başarılı" mesajı paranın doğru yerde olduğunu kanıtlamaz.

// ---------- Ön koşullar ----------

Given(
  'the customer has opened a {string} account through the API',
  async ({ api, ctx }, type: AccountType) => {
    const response = await api.createAccount(ctx.customerId!, type, ctx.originalAccountId!);
    expect(response.status(), `Hesap açılamadı: ${await response.text()}`).toBe(200);
    ctx.newAccountId = (await response.json()).id;

    // Sonraki adımlar bakiye değişimini ölçebilsin diye iki hesabın da bakiyesini not ediyoruz
    for (const accountId of [ctx.originalAccountId!, ctx.newAccountId!]) {
      ctx.balancesBefore[accountId] = await api.getBalance(accountId);
    }
  }
);

// ---------- İstekler ----------

When(
  'the client opens a new {string} account through the API funded from the original account',
  async ({ api, ctx }, type: AccountType) => {
    ctx.balancesBefore[ctx.originalAccountId!] = await api.getBalance(ctx.originalAccountId!);
    ctx.response = await api.createAccount(ctx.customerId!, type, ctx.originalAccountId!);
    if (ctx.response.ok()) {
      ctx.newAccountId = (await ctx.response.json()).id;
    }
  }
);

When(
  'the client makes a {word} of ${float} on the {word} account through the API',
  async ({ api, ctx }, operation: string, amount: number, role: string) => {
    const accountId = accountIdFor(role, ctx);
    if (operation === 'deposit') {
      ctx.response = await api.deposit(accountId, amount);
    } else if (operation === 'withdrawal') {
      ctx.response = await api.withdraw(accountId, amount);
    } else {
      throw new Error(`İşlem "deposit" ya da "withdrawal" olmalı, gelen: "${operation}"`);
    }
  }
);

When(
  'the client transfers ${float} from the {word} account to the {word} account through the API',
  async ({ api, ctx }, amount: number, fromRole: string, toRole: string) => {
    ctx.response = await api.transfer(accountIdFor(fromRole, ctx), accountIdFor(toRole, ctx), amount);
  }
);

When(
  'the client transfers ${float} from the {word} account to account {int} through the API',
  async ({ api, ctx }, amount: number, fromRole: string, toAccountId: number) => {
    ctx.response = await api.transfer(accountIdFor(fromRole, ctx), toAccountId, amount);
  }
);

// ---------- Doğrulamalar ----------

Then('the request should be rejected as a client error', async ({ ctx }) => {
  // Geçersiz bir işlem 4xx (istemci hatası) ile reddedilmeli; 200 (başarılı) ya da 5xx (sunucu çöktü) değil
  const response = lastResponse(ctx);
  const status = response.status();
  expect(status >= 400 && status < 500, `HTTP ${status} - Cevap: ${await response.text()}`).toBe(true);
});

Then(
  'the API should report a balance of ${float} for the {word} account',
  async ({ api, ctx }, balance: number, role: string) => {
    expect(await api.getBalance(accountIdFor(role, ctx))).toBeCloseTo(balance, 2);
  }
);

Then(
  'the {word} account balance should have {word} by ${float} according to the API',
  async ({ api, ctx }, role: string, direction: string, amount: number) => {
    const accountId = accountIdFor(role, ctx);
    const before = ctx.balancesBefore[accountId];
    const after = await api.getBalance(accountId);
    const changes: Record<string, number> = { decreased: -amount, increased: amount };
    const change = changes[direction];
    if (change === undefined) {
      throw new Error(`Yön "decreased" ya da "increased" olmalı, gelen: "${direction}"`);
    }
    expect(after).toBeCloseTo(before + change, 2);
  }
);

Then('the {word} account balance should be unchanged according to the API', async ({ api, ctx }, role: string) => {
  const accountId = accountIdFor(role, ctx);
  expect(await api.getBalance(accountId)).toBeCloseTo(ctx.balancesBefore[accountId], 2);
});

Then(
  'the new account should hold exactly the amount taken from the original account',
  async ({ api, ctx }) => {
    // Para yoktan var olmamalı, kaybolmamalı: Yeni hesaba geçen tutar, ilk hesaptan çıkan tutara eşit olmalı
    const original = ctx.originalAccountId!;
    const taken = ctx.balancesBefore[original] - (await api.getBalance(original));
    const newBalance = await api.getBalance(ctx.newAccountId!);

    expect(taken, 'İlk hesaptan bir açılış tutarı çekilmiş olmalı').toBeGreaterThan(0);
    expect(newBalance).toBeCloseTo(taken, 2);
  }
);

Then(
  'the {word} account transactions should include a {string} {word} of ${float}',
  async ({ api, ctx }, role: string, description: string, type: string, amount: number) => {
    const response = await api.getTransactions(accountIdFor(role, ctx));
    expect(response.status()).toBe(200);
    const transactions: { description: string; type: string; amount: number }[] = await response.json();

    const matching = transactions.filter(
      (t) => t.description === description && t.type === type && Math.abs(t.amount - amount) < 0.005
    );
    expect(matching, `Hesap hareketleri: ${JSON.stringify(transactions)}`).toHaveLength(1);
  }
);
