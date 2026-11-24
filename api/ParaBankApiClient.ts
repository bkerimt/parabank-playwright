import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type Customer } from '../utils/testData';
import { throwIfRateLimited } from '../utils/navigation';

// ParaBank hesap tipini sayıyla bekliyor: 0 = CHECKING, 1 = SAVINGS
const accountTypeCodes = { CHECKING: 0, SAVINGS: 1 } as const;
export type AccountType = keyof typeof accountTypeCodes;

/*
 * ParaBank'ın REST servisi (services/bank/...) için istemci.
 * Page Object'lerin API karşılığı: Adımlar adres ve parametre ayrıntısını bilmez,
 * "müşterinin hesaplarını getir" gibi iş diliyle konuşur.
 *
 * Metotlar cevabı (APIResponse) olduğu gibi döner. Durum kodunu ve içeriği adımlar doğrular;
 * böylece aynı metot hem başarılı hem hatalı senaryolarda kullanılabiliyor.
 */
export class ParaBankApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // ParaBank varsayılan olarak XML döner; JSON istediğimizi Accept başlığıyla söylüyoruz
  private async get(path: string): Promise<APIResponse> {
    const response = await this.request.get(`services/bank/${path}`, {
      headers: { Accept: 'application/json' },
    });
    throwIfRateLimited(response.status(), path);
    return response;
  }

  // Para işlemleri POST ile, parametreler adresin sorgu kısmında (?accountId=..&amount=..) gönderiliyor
  private async post(path: string, params: Record<string, string | number>): Promise<APIResponse> {
    const response = await this.request.post(`services/bank/${path}`, {
      params,
      headers: { Accept: 'application/json' },
    });
    throwIfRateLimited(response.status(), path);
    return response;
  }

  login(username: string, password: string): Promise<APIResponse> {
    // Kullanıcı adı ve şifre adresin içinde gidiyor; özel karakterler bozulmasın diye kodluyoruz
    return this.get(`login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`);
  }

  getCustomer(customerId: number): Promise<APIResponse> {
    return this.get(`customers/${customerId}`);
  }

  getAccounts(customerId: number): Promise<APIResponse> {
    return this.get(`customers/${customerId}/accounts`);
  }

  getAccount(accountId: number): Promise<APIResponse> {
    return this.get(`accounts/${accountId}`);
  }

  getTransactions(accountId: number): Promise<APIResponse> {
    return this.get(`accounts/${accountId}/transactions`);
  }

  // Doğrulama adımları için kısa yol: hesabın güncel bakiyesini sayı olarak döner
  async getBalance(accountId: number): Promise<number> {
    const response = await this.getAccount(accountId);
    if (!response.ok()) {
      throw new Error(`#${accountId} hesabının bakiyesi okunamadı (HTTP ${response.status()}): ${await response.text()}`);
    }
    return (await response.json()).balance;
  }

  // Yeni hesap açar; ParaBank açılış tutarını (minimum bakiye) kaynak hesaptan aktarır
  createAccount(customerId: number, type: AccountType, fromAccountId: number): Promise<APIResponse> {
    return this.post('createAccount', {
      customerId,
      newAccountType: accountTypeCodes[type],
      fromAccountId,
    });
  }

  // Tutarlar kuruş hassasiyetinde, metin olarak gönderiliyor (ör. 50 → "50.00")
  deposit(accountId: number, amount: number): Promise<APIResponse> {
    return this.post('deposit', { accountId, amount: amount.toFixed(2) });
  }

  withdraw(accountId: number, amount: number): Promise<APIResponse> {
    return this.post('withdraw', { accountId, amount: amount.toFixed(2) });
  }

  transfer(fromAccountId: number, toAccountId: number, amount: number): Promise<APIResponse> {
    return this.post('transfer', { fromAccountId, toAccountId, amount: amount.toFixed(2) });
  }

  /*
   * ParaBank'ın REST servisinde müşteri kaydı yok; kayıt sadece web formuyla yapılıyor.
   * Formu tarayıcı açmadan, doğrudan HTTP ile gönderiyoruz:
   * 1) Önce formu GET ile açıyoruz: Sunucu oturumu (cookie) burada başlatıyor.
   * 2) Sonra aynı oturumla formu POST ediyoruz. GET yapılmadan gönderilen form reddediliyor.
   * APIRequestContext cookie'leri kendisi saklayıp ikinci istekte geri gönderiyor.
   */
  async registerCustomer(customer: Customer): Promise<void> {
    const formPage = await this.request.get('register.htm');
    throwIfRateLimited(formPage.status(), 'register.htm');

    const response = await this.request.post('register.htm', {
      form: {
        'customer.firstName': customer.firstName,
        'customer.lastName': customer.lastName,
        'customer.address.street': customer.street,
        'customer.address.city': customer.city,
        'customer.address.state': customer.state,
        'customer.address.zipCode': customer.zipCode,
        'customer.phoneNumber': customer.phone,
        'customer.ssn': customer.ssn,
        'customer.username': customer.username,
        'customer.password': customer.password,
        repeatedPassword: customer.password,
      },
    });
    throwIfRateLimited(response.status(), 'register.htm');

    // Başarılı kayıtta sayfa "Welcome <kullanıcı adı>" başlığıyla açılıyor
    const html = await response.text();
    if (!html.includes(`Welcome ${customer.username}`)) {
      throw new Error(`Müşteri kaydı başarısız oldu (HTTP ${response.status()}): ${customer.username}`);
    }
  }
}
