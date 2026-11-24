# ParaBank — Playwright ile Bankacılık Test Otomasyonu

![Playwright Tests](https://github.com/bkerimt/parabank-playwright/actions/workflows/playwright.yml/badge.svg)

[ParaBank](https://parabank.parasoft.com) demo bankacılık uygulaması için **Playwright + TypeScript** ile yazılmış, **BDD (Given / When / Then)** yaklaşımıyla kurgulanmış uçtan uca **arayüz ve API** test otomasyonu projesi.

> ⚠️ **Not:** ParaBank, Parasoft'un test pratiği için herkese açık sunduğu bir demo sitedir. Gerçek bir banka ya da gerçek müşteri verisi kullanılmaz.

## Neden bu proje?

Bankacılık uygulamalarında bir işlemin "başarılı" mesajı vermesi yetmez; **paranın doğru yerde ve doğru tutarda olması** gerekir. Bu proje şu sorulara cevap arar:

- Müşteri kayıt olabiliyor ve hesabına giriş yapabiliyor mu? Hatalı girişler doğru mesajla engelleniyor mu? → **Fonksiyonel test**
- Yeni hesap (Checking / Savings) açılabiliyor ve doğru tipte oluşuyor mu? → **Veri odaklı test (Scenario Outline)**
- Hesap özetindeki toplam bakiye, hesapların toplamına eşit mi? → **Finansal tutarlılık**
- Yeni hesap açıldığında müşterinin toplam varlığı değişmeden kalıyor mu? → **İş kuralı doğrulaması**
- Kredi başvurusu, onay sınırının tam üstünde ve hemen altında doğru kararı veriyor mu? → **Sınır değer analizi**
- Bir müşteri başka bir müşterinin işlemlerini görebiliyor mu? → **Yetkilendirme (güvenlik) kontrolü**
- REST API doğru veriyi dönüyor ve hatalı isteklere doğru cevap veriyor mu? Yetkisiz erişimi engelliyor mu? → **API testi**
- Yarıda kalan bir transfer parayı kaybettiriyor mu? Arayüzdeki eksik kontroller sunucu tarafında da eksik mi? → **Atomiklik ve sunucu tarafı doğrulama**
- Paylaşılan test ortamı yanlış ayarlandığında testler bunu fark ediyor mu? → **Ortam yönetimi**

## Teknolojiler

| Araç | Kullanım |
|---|---|
| [Playwright](https://playwright.dev) | Tarayıcı otomasyonu ve test koşucusu (runner) |
| Playwright APIRequestContext | Tarayıcı açmadan REST API testi |
| TypeScript | Test kodu dili |
| [playwright-bdd](https://github.com/vitalets/playwright-bdd) | Gherkin senaryolarını Playwright runner üzerinde çalıştırma |
| Page Object Model | Sayfa locator'ları ve işlemlerinin testlerden ayrılması |
| GitHub Actions | Her push'ta testlerin otomatik çalışması (CI) |
| Docker | CI'da her çalışmada sıfırdan başlatılan, izole ParaBank kopyası |

## Proje Yapısı

```
parabank-playwright/
├── features/                   # Gherkin senaryoları: NE test ediliyor
│   ├── login.feature
│   ├── register.feature
│   ├── open-account.feature
│   ├── accounts-overview.feature
│   ├── transfer.feature
│   ├── bill-pay.feature
│   ├── request-loan.feature
│   ├── find-transactions.feature
│   └── api/                    # API senaryoları
│       ├── customer-accounts.feature
│       └── money-operations.feature
├── steps/                      # Step tanımları: her adım NASIL çalışıyor
│   ├── fixtures.ts             # Page Object'leri ve senaryo verisini step'lere verir
│   ├── common.steps.ts         # Birden fazla feature'ın kullandığı ortak adımlar
│   ├── balance.steps.ts        # Para hareketi olan feature'ların ortak bakiye adımları
│   ├── *.steps.ts
│   └── api/                    # API step'leri ve fixture'ları (tarayıcı açmaz)
├── pages/                      # Page Object Model: locator'lar ve sayfa işlemleri
├── api/
│   └── ParaBankApiClient.ts    # REST servisi istemcisi (Page Object'lerin API karşılığı)
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
- **Dayanıklı locator'lar:** ParaBank, fatura ödeme formundaki telefon alanının `id` ve `class` değerlerini her sayfa açılışında rastgele üretiyor. Bu tür alanlar değişmeyen `name` niteliğiyle bulunuyor.
- **Saat dilimine dayanıklı tarih araması:** İşlemler "bugün" yerine dünden yarına uzanan bir tarih aralığında aranıyor. Testi çalıştıran bilgisayar ile sunucu farklı saat dilimlerindeyse (ör. gece yarısına yakın saatlerde) "bugün" iki tarafta farklı gün olabilir; aralık bu farkı tolere ediyor.
- **API testleri ayrı katmanda:** API senaryoları da Gherkin ile yazılıyor ama kendi step'leri ve fixture'ları var (`steps/api/`). Arayüz fixture'ları her test için tarayıcı sayfası açtığından API testleri bunlardan ayrı tutuldu; API testleri hiç tarayıcı açmıyor. İstekler `ParaBankApiClient` üzerinden gidiyor: Step'ler adres ayrıntısını bilmiyor, Page Object'lerde olduğu gibi iş diliyle konuşuyor.
- **Mesaja değil, bakiyeye güvenmek:** Para işlemlerinde "başarılı" cevabı yeterli sayılmıyor. İşlemden önce ve sonra hesap bakiyesi ayrıca okunup farkın tam işlem tutarı kadar olduğu doğrulanıyor; arayüzde ekrandan, API'de ayrı bir istekle.
- **Asenkron işlemleri beklemek:** Transfer, hesap açma ve fatura ödeme istekleri arka planda (AJAX) gönderiliyor. Page Object'ler, işlem sonucu ekranda görünmeden bir sonraki adıma geçmiyor; böylece yarıda kalan istekler yüzünden oluşacak yanıltıcı sonuçlar önleniyor.

### Ortam hazırlığı

ParaBank paylaşılan bir demo ortam ve admin ayarlarını herkes değiştirebiliyor. Bir gün login testi beklenen "hatalı şifre" mesajı yerine "internal error" ile kırıldı. Kök neden analizinde, başka bir kullanıcının **Data Access Mode** ayarını varsayılan değer olan JDBC'den REST'e çevirdiği görüldü.

Testi gevşetmek yerine Playwright'ın **setup project** özelliğiyle bir hazırlık adımı eklendi: Testlerden önce ayar kontrol ediliyor, gerekirse varsayılan değere döndürülüyor. BDD testleri bu adıma bağımlı olduğu için yanlış ayarlanmış bir ortamda hiç çalışmıyor.

Kredi senaryoları eklenince aynı risk bu kez iş kuralında ortaya çıktı: Kredi kararını veren kural ve onay eşiği de admin sayfasından değiştirilebiliyor. Bu ayarlar değişirse aynı başvuru bir gün onaylanıp ertesi gün reddedilir; test kırılır ama uygulamada hata yoktur. Hazırlık adımı artık testlerin dayandığı tüm ayarları (data access mode, yeni müşterinin başlangıç bakiyesi, kredi sağlayıcı, karar kuralı ve eşik) kontrol ediyor ve düzelttiği ayarları rapora not olarak ekliyor. Kredi senaryoları da başlangıç bakiyesi varsayımını Background'da açıkça doğruluyor.

### Rate limit (istek sınırlama)

Testler bir gün yerelde geçerken CI'da zaman aşımıyla kırıldı. Log'da "kayıt formu bulunamadı" görünüyordu, ama CI'ın yüklediği rapordaki ekran görüntüsü asıl sebebi gösterdi: **Cloudflare Error 1015 – You are being rate limited.** ParaBank'ın önündeki Cloudflare, kısa sürede çok istek gelen IP adreslerini geçici olarak engelliyor. GitHub Actions sunucuları paylaşılan IP adresleri kullandığı için bu risk CI'da daha yüksek.

Yapılan iyileştirmeler:
- **Hızlı ve anlaşılır hata:** Sayfa açılırken ya da API isteğinde HTTP 429 gelirse test 60 saniye beklemek yerine hemen, sebebini açıkça söyleyen bir mesajla duruyor (`utils/navigation.ts`). Sayfa dışı isteklerdeki 429'lar da rapora not olarak ekleniyor.
- **Daha az istek:** Resim, font ve medya dosyaları indirilmiyor; testlerin doğruladığı hiçbir şey bunlara bağlı değil (`steps/fixtures.ts` → `requestGuard`). Yan etkisi olarak suite süresi aynı makinede **1.4 dakikadan 54 saniyeye** düştü.
- **Daha az tekrar:** CI'da retry sayısı 2'den 1'e indirildi; engellenmiş bir IP'den hemen tekrar denemek engeli uzatıyor.

### İzole test ortamı (CI)

Paylaşılan ParaBank'ta yaşanan üç sorunun (admin ayarının başkası tarafından değiştirilmesi, veritabanının bozulup kayıt işleminin herkes için çalışmaz hale gelmesi, rate limit) ortak sebebi **ortamın paylaşılmasıydı**. Kalıcı çözüm olarak CI, testleri artık herkese açık site yerine ParaBank'ın resmi Docker imajından (`parasoft/parabank`) her çalışmada sıfırdan başlatılan **kendi kopyasına** karşı çalıştırıyor:

- GitHub Actions, ParaBank'ı bir **service container** olarak başlatıyor ve testlerden önce ortamı hazırlıyor: Docker imajındaki veritabanı **boş** başlıyor (örnek müşteriler, ayarlar ve numara sayaçları yok). Bu yüzden admin sayfası çöküyor, ilk kayıtlar numara çakışmasıyla kırılıyordu. Hazırlık adımı veritabanını ParaBank'ın REST API'sindeki **initializeDB** servisiyle doldurup, örnek kullanıcıyla API girişi ve bir deneme kaydı başarılı olana kadar bekliyor. Sebep, CI'a eklenen sunucu log adımı sayesinde bulundu.
- Testlerin hangi adrese gideceği `BASE_URL` ortam değişkeniyle belirleniyor; tanımlı değilse herkese açık ParaBank kullanılıyor.
- Her çalışma temiz bir veritabanıyla başladığı için sonuçlar tekrarlanabilir; başka kullanıcıların işlemlerinden etkilenmiyor.
- İzole ortamda ayarları kimse değiştiremediği için ortam hazırlık adımı (`setup`) CI'da atlanıyor (`PARABANK_ISOLATED=true`).
- CI kırılırsa ParaBank'ın sunucu logları otomatik olarak çalışma çıktısına yazdırılıyor; uygulama tarafındaki hatalar da görülebiliyor.

### Paralellik ve timeout

Worker sayısı ölçümle belirlendi: 6 paralel worker ile süre 1.5 dakikayken, 3 worker ile 1.1 dakikaya düştü. Darboğaz yerel makine değil, paylaşılan ParaBank sunucusuydu. Daha fazla paralellik her zaman daha hızlı demek değil.

## Kurulum ve Çalıştırma

Gereksinim: [Node.js](https://nodejs.org) (LTS sürümü)

```bash
npm install                      # Bağımlılıkları kur
npx playwright install chromium  # Tarayıcıyı indir
npm test                         # Feature'ları teste dönüştür ve çalıştır
npm run test:api                 # Sadece API testlerini çalıştır
npm run report                   # HTML raporunu aç
```

> Windows'ta PowerShell betik çalıştırmayı engelliyorsa `npm` yerine `npm.cmd`, `npx` yerine `npx.cmd` kullanın.

Docker yüklüyse testleri yerelde de izole bir ParaBank'a karşı çalıştırabilirsiniz:

```bash
docker run -d -p 8080:8080 parasoft/parabank
BASE_URL=http://localhost:8080/parabank/ npm test
```


## Test Kapsamı

| Özellik | Senaryolar |
|---|---|
| Ortam hazırlığı | Testlerin dayandığı admin ayarlarının (data access mode, başlangıç bakiyesi, kredi ayarları) varsayılan değerde olduğunu doğrulama |
| Müşteri Kaydı | Başarılı kayıt, şifreler eşleşmediğinde kaydın engellenmesi |
| Müşteri Girişi | Geçerli giriş, hatalı şifre, boş alanlar |
| Yeni Hesap Açma | CHECKING ve SAVINGS hesap açma (Scenario Outline), hesap detayında tip doğrulama |
| Hesap Özeti | Yeni hesabın listede görünmesi, toplam bakiyenin hesapların toplamına eşit olması, hesap açılınca toplam varlığın değişmemesi |
| Para Transferi | İki hesapta da bakiye doğrulama (gönderen azalır, alan artar), işlemin iki hesabın hareketlerinde görünmesi, bakiye fazlası transferin reddedilmesi (bilinen hata) |
| Fatura Ödeme | Başarılı ödeme sonrası bakiye ve hesap hareketi doğrulama, zorunlu alanların kontrolü (Scenario Outline), hesap numaralarının eşleşmemesi |
| Kredi Başvurusu | Farklı tutar ve peşinatlarla onay/ret kararı (Scenario Outline, %20 sınırının iki yanı), onaylanan kredide LOAN hesabının açılması ve peşinatın çekilmesi, boş tutar kontrolü (bilinen hata) |
| İşlem Arama | Tutara göre arama (gönderen ve alan hesapta, Scenario Outline), tarih aralığıyla arama, sonuç çıkmayan arama, işlem numarasıyla arama, başka müşterinin işlemine erişim (bilinen hata), geçersiz arama değerleri (Scenario Outline) |
| API — Müşteri ve Hesap | API ile giriş ve müşteri bilgilerinin kayıttaki bilgilerle eşleşmesi, hatalı şifre, müşteri ve hesap detayı, yeni müşterinin tek CHECKING hesabı ve başlangıç bakiyesi, olmayan hesap, kimlik doğrulamasız erişim (bilinen hata) |
| API — Para İşlemleri | Yeni hesap açılışında açılış tutarının ilk hesaptan aktarılması, para yatırma ve çekme (Scenario Outline; bakiye ve hesap hareketi), hesaplar arası transfer, var olmayan hesaba transferin geri alınması (atomiklik), bakiyeden fazla çekim ve negatif tutarlı transfer (bilinen hatalar) |

## Bilinen Hatalar

Testler sırasında ParaBank'ta bulunan ve **`@fail`** etiketiyle işaretlenen hatalar. Bu etiket, senaryonun şu an başarısız olmasının beklendiğini belirtir; böylece suite yeşil kalır ama hata görünür olur. Hata düzeltilirse test beklenmedik şekilde geçer ve kırmızıya döner; bu da etiketin kaldırılması gerektiğini haber verir.

> **Dikkat:** `@fail` her türlü hatayı "beklenen" sayar. Bu yüzden bu senaryoların raporda **doğru adımda ve doğru sebeple** başarısız olduğu kontrol edilir. Ayrıca `@fail`, Background adımlarındaki (ör. kayıt) hataları kapsamaz; bunlar normal hata olarak raporlanır.

| Hata | Beklenen | Gerçekleşen | Senaryo |
|---|---|---|---|
| Bakiye kontrolü yok (arayüz ve API) | Bakiyeyi aşan transfer ve para çekme reddedilmeli | İşlem gerçekleşiyor, hesap eksiye düşüyor. Kontrol sadece arayüzde değil, sunucu tarafında da yok | `transfer.feature` → *Transfer exceeding the available balance should be rejected*, `api/money-operations.feature` → *Withdrawal exceeding the balance should be rejected* |
| Kredi başvurusunda boş tutar kontrolü yok | "The loan amount cannot be empty." mesajı gösterilmeli (mesaj uygulamada tanımlı) | Genel "An internal error has occurred" hatası gösteriliyor | `request-loan.feature` → *Loan request without an amount should show a validation message* |
| İşlem numarasıyla aramada yetki kontrolü yok (güvenlik) | Müşteri sadece kendi işlemlerini görebilmeli | Başka bir müşteri, numarasını bildiği her işlemin tutarını ve açıklamasını görebiliyor | `find-transactions.feature` → *Customer cannot see another customer's transaction by its ID* |
| REST API kimlik doğrulaması istemiyor (güvenlik) | Giriş yapmamış bir istemci müşteri verisine erişememeli (HTTP 401) | Müşteri numarasını bilen herkes, giriş yapmadan hesapları ve bakiyeleri okuyabiliyor | `api/customer-accounts.feature` → *Customer accounts cannot be read without authentication* |
| Negatif tutarlı transfer kabul ediliyor (API) | Sıfır ve negatif tutarlar reddedilmeli | Transfer gerçekleşiyor ve para ters yöne, alıcı hesaptan gönderen hesaba akıyor | `api/money-operations.feature` → *Transfer with a negative amount should be rejected* |

## Yol Haritası

- [x] **Aşama 1** — BDD altyapısı (playwright-bdd), Page Object Model, kayıt ve giriş senaryoları, CI
- [x] **Aşama 2** — Yeni hesap açma (Scenario Outline), hesap özeti ve bakiye tutarlılığı, ortam hazırlığı (setup project)
- [x] **Aşama 3** — Hesaplar arası para transferi ve iki hesapta bakiye doğrulama, fatura ödeme, bilinen hata yönetimi (`@fail`), rate limit'e karşı dayanıklılık, CI'da izole test ortamı (Docker)
- [x] **Aşama 4** — Kredi başvurusu (farklı tutar ve sonuçlarla, sınır değer analizi), işlem arama, yetkilendirme açığının tespiti, ortam hazırlığının kredi ayarlarını da kapsaması
- [ ] **Aşama 5** — API testleri, API ile hızlı test verisi hazırlama (hibrit test)
- [ ] **Aşama 6** — Etiketler (@smoke, @regression), çoklu tarayıcı, sonuçların raporlanması

## Yazar

**Beytullah Kerim Türkel** — Senior Software Testing & Quality Specialist
[LinkedIn](https://www.linkedin.com/in/bkerimt) · [GitHub](https://github.com/bkerimt)
