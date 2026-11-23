import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type Customer } from '../utils/testData';
import { throwIfRateLimited } from '../utils/navigation';

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
