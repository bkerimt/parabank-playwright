import { test as setup, expect } from '@playwright/test';
import { openPage } from '../utils/navigation';

/*
 * ParaBank herkese açık, paylaşılan bir demo ortam. Admin sayfasındaki ayarları
 * herkes değiştirebiliyor. Örneğin "Data Access Mode" JDBC dışında bir değere alınırsa
 * site, olmayan bir kullanıcıyla girişte "yanlış şifre" yerine "internal error" veriyor;
 * kredi ayarları değiştirilirse aynı başvuru bir gün onaylanıp ertesi gün reddediliyor.
 *
 * Bu hazırlık adımı tüm testlerden önce çalışır ve testlerin dayandığı ayarları
 * sitenin varsayılan değerlerine getirir. Ayarlar zaten doğruysa hiçbir şeyi değiştirmez.
 */

// Testlerin dayandığı ayarlar ve ParaBank'ın varsayılan değerleri
const expectedNumbers = {
  initialBalance: 515.5, // Yeni müşterinin ilk hesabına yatan para
  loanProcessorThreshold: 20, // Kredi onayı için gereken en düşük oran (%)
};
const expectedOptions = {
  loanProvider: 'ws', // Kredi sağlayıcı: Web Service
  loanProcessor: 'funds', // Karar kuralı: toplam varlık / kredi tutarı
};

setup('ParaBank settings are at their defaults', async ({ page }) => {
  // CI'da her çalışmada sıfırdan başlatılan kendi ParaBank kopyamızı kullanıyoruz.
  // Orada ayarları kimse değiştiremez ve zaten varsayılan değerdedir; bu kontrole gerek yok.
  setup.skip(process.env.PARABANK_ISOLATED === 'true', 'İzole ParaBank kullanılıyor; ayarlar zaten varsayılan değerde');

  await openPage(page, 'admin.htm');

  const changed: string[] = [];

  const jdbcOption = page.locator('input[name="accessMode"][value="jdbc"]');
  if (!(await jdbcOption.isChecked())) {
    await jdbcOption.check();
    changed.push('accessMode');
  }

  for (const [name, expected] of Object.entries(expectedNumbers)) {
    const input = page.locator(`input[name="${name}"]`);
    // "515.50" ile "515.5" aynı değer; metin değil sayı olarak karşılaştırıyoruz
    if (Number(await input.inputValue()) !== expected) {
      await input.fill(String(expected));
      changed.push(name);
    }
  }

  for (const [name, expected] of Object.entries(expectedOptions)) {
    const select = page.locator(`select[name="${name}"]`);
    if ((await select.inputValue()) !== expected) {
      await select.selectOption(expected);
      changed.push(name);
    }
  }

  if (changed.length === 0) {
    return; // Ortam zaten doğru, dokunmuyoruz
  }

  // Hangi ayarın düzeltildiği raporda görünsün
  setup.info().annotations.push({ type: 'ayar düzeltildi', description: changed.join(', ') });

  await page.locator('input[type="submit"][value="Submit"]').click();
  await expect(page.getByText('Settings saved successfully.')).toBeVisible();
  await expect(jdbcOption).toBeChecked();
});
