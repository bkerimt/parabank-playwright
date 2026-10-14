# ParaBank — Playwright ile Bankacılık Test Otomasyonu

![Playwright Tests](https://github.com/bkerimt/parabank-playwright/actions/workflows/playwright.yml/badge.svg)

[ParaBank](https://parabank.parasoft.com) demo bankacılık uygulaması için **Playwright + TypeScript** ile yazılmış, **BDD (Given / When / Then)** yaklaşımıyla kurgulanmış uçtan uca test otomasyonu projesi.

> ⚠️ **Not:** ParaBank, Parasoft'un test pratiği için herkese açık sunduğu bir demo sitedir. Gerçek bir banka ya da gerçek müşteri verisi kullanılmaz.

## Neden bu proje?

Bankacılık uygulamalarında bir işlemin "başarılı" mesajı vermesi yetmez; **paranın doğru yerde ve doğru tutarda olması** gerekir. Bu proje şu sorulara cevap arar:

- Müşteri kayıt olabiliyor ve hesabına giriş yapabiliyor mu? Hatalı girişler doğru mesajla engelleniyor mu? → **Fonksiyonel test**
- Yeni hesap (Checking / Savings) açılabiliyor ve doğru tipte oluşuyor mu? → **Veri odaklı test (Scenario Outline)**
- Hesap özetindeki toplam bakiye, hesapların toplamına eşit mi? → **Finansal tutarlılık**
- Yeni hesap açıldığında müşterinin toplam varlığı değişmeden kalıyor mu? → **İş kuralı doğrulaması**
- Paylaşılan test ortamı yanlış ayarlandığında testler bunu fark ediyor mu? → **Ortam yönetimi**

## Teknolojiler

| Araç | Kullanım |
|---|---|
| [Playwright](https://playwright.dev) | Tarayıcı otomasyonu ve test koşucusu (runner) |
| TypeScript | Test kodu dili |
| [playwright-bdd](https://github.com/vitalets/playwright-bdd) | Gherkin senaryolarını Playwright runner üzerinde çalıştırma |
| Page Object Model | Sayfa locator'ları ve işlemlerinin testlerden ayrılması |
| GitHub Actions | Her push'ta testlerin otomatik çalışması (CI) |

## Proje Yapısı

```
parabank-playwright/
├── features/                   # Gherkin senaryoları: NE test ediliyor
│   ├── login.feature
│   ├── register.feature
│   ├── open-account.feature
│   └── accounts-overview.feature
├── steps/                      # Step tanımları: her adım NASIL çalışıyor
│   ├── fixtures.ts             # Page Object'leri ve senaryo verisini step'lere verir
│   ├── common.steps.ts         # Birden fazla feature'ın kullandığı ortak adımlar
│   └── *.steps.ts
├── pages/                      # Page Object Model: locator'lar ve sayfa işlemleri
├── setup/
│   └── environment.setup.ts    # Testlerden önce ortamı doğrulayan hazırlık adımı
├── utils/                      # Test verisi üretimi, tutar dönüştürme
├── .github/workflows/          # GitHub Actions (CI) tanımı
└── playwright.config.ts        # Tarayıcı, paralellik, timeout ve rapor ayarları
```

## Mimari Kararlar

- **BDD ile ortak dil:** Senaryolar Given / When / Then yapısında yazıldığı için iş birimi ve analistler tarafından da okunabilir.
- **Katmanlı yapı:** Feature → Step → Page Object. Sitede bir buton değişirse sadece ilgili Page Object güncellenir; senaryolara dokunulmaz.
- **Bağımsız testler:** Her senaryo kendi benzersiz müşterisini oluşturur. Testler birbirinin verisine veya paylaşılan veritabanındaki hazır kullanıcılara bağımlı değildir.
- **Fixture'lar:** Page Object'ler ve senaryo içi veri, Playwright fixture'ları ile step'lere enjekte edilir. Paralel çalışmada testler birbirinin verisini bozmaz.

### Ortam hazırlığı

ParaBank paylaşılan bir demo ortam ve admin ayarlarını herkes değiştirebiliyor. Bir gün login testi beklenen "hatalı şifre" mesajı yerine "internal error" ile kırıldı. Kök neden analizinde, başka bir kullanıcının **Data Access Mode** ayarını varsayılan değer olan JDBC'den REST'e çevirdiği görüldü.

Testi gevşetmek yerine Playwright'ın **setup project** özelliğiyle bir hazırlık adımı eklendi: Testlerden önce ayar kontrol ediliyor, gerekirse varsayılan değere döndürülüyor. BDD testleri bu adıma bağımlı olduğu için yanlış ayarlanmış bir ortamda hiç çalışmıyor.

### Paralellik ve timeout

Worker sayısı ölçümle belirlendi: 6 paralel worker ile süre 1.5 dakikayken, 3 worker ile 1.1 dakikaya düştü. Darboğaz yerel makine değil, paylaşılan ParaBank sunucusuydu. Daha fazla paralellik her zaman daha hızlı demek değil.

## Kurulum ve Çalıştırma

Gereksinim: [Node.js](https://nodejs.org) (LTS sürümü)

```bash
npm install                      # Bağımlılıkları kur
npx playwright install chromium  # Tarayıcıyı indir
npm test                         # Feature'ları teste dönüştür ve çalıştır
npm run report                   # HTML raporunu aç
```

> Windows'ta PowerShell betik çalıştırmayı engelliyorsa `npm` yerine `npm.cmd`, `npx` yerine `npx.cmd` kullanın.

## Test Kapsamı

| Özellik | Senaryolar |
|---|---|
| Ortam hazırlığı | Data Access Mode'un varsayılan (JDBC) değerde olduğunu doğrulama |
| Müşteri Kaydı | Başarılı kayıt, şifreler eşleşmediğinde kaydın engellenmesi |
| Müşteri Girişi | Geçerli giriş, hatalı şifre, boş alanlar |
| Yeni Hesap Açma | CHECKING ve SAVINGS hesap açma (Scenario Outline), hesap detayında tip doğrulama |
| Hesap Özeti | Yeni hesabın listede görünmesi, toplam bakiyenin hesapların toplamına eşit olması, hesap açılınca toplam varlığın değişmemesi |
| Para Transferi | İki hesapta da bakiye doğrulama (gönderen azalır, alan artar), işlemin iki hesabın hareketlerinde görünmesi, bakiye fazlası transferin reddedilmesi (bilinen hata) |

## Bilinen Hatalar

Testler sırasında ParaBank'ta bulunan ve **`@fail`** etiketiyle işaretlenen hatalar. Bu etiket, senaryonun şu an başarısız olmasının beklendiğini belirtir; böylece suite yeşil kalır ama hata görünür olur. Hata düzeltilirse test beklenmedik şekilde geçer ve kırmızıya döner; bu da etiketin kaldırılması gerektiğini haber verir.

| Hata | Beklenen | Gerçekleşen | Senaryo |
|---|---|---|---|
| Transferde bakiye kontrolü yok | Bakiyeyi aşan transfer reddedilmeli | Transfer gerçekleşiyor, hesap eksiye düşüyor | `transfer.feature` → *Transfer exceeding the available balance should be rejected* |

## Yol Haritası

- [x] **Aşama 1** — BDD altyapısı (playwright-bdd), Page Object Model, kayıt ve giriş senaryoları, CI
- [x] **Aşama 2** — Yeni hesap açma (Scenario Outline), hesap özeti ve bakiye tutarlılığı, ortam hazırlığı (setup project)
- [ ] **Aşama 3** — Hesaplar arası para transferi ve iki hesapta bakiye doğrulama, fatura ödeme
- [ ] **Aşama 4** — Kredi başvurusu (farklı tutar ve sonuçlarla), işlem arama
- [ ] **Aşama 5** — API testleri, API ile hızlı test verisi hazırlama (hibrit test)
- [ ] **Aşama 6** — Etiketler (@smoke, @regression), çoklu tarayıcı, sonuçların raporlanması

## Yazar

**Beytullah Kerim Türkel** — Senior Software Testing & Quality Specialist
[LinkedIn](https://www.linkedin.com/in/bkerimt) · [GitHub](https://github.com/bkerimt)
