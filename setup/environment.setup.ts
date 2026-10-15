import { test as setup, expect } from '@playwright/test';
import { openPage } from '../utils/navigation';

/*
 * ParaBank herkese açık, paylaşılan bir demo ortam. Admin sayfasındaki ayarları
 * herkes değiştirebiliyor. "Data Access Mode" JDBC dışında bir değere alınırsa
 * site, olmayan bir kullanıcıyla girişte "yanlış şifre" yerine "internal error" veriyor.
 *
 * Bu hazırlık adımı tüm testlerden önce çalışır ve ortamı sitenin
 * varsayılan ayarına (JDBC) getirir. Ayar zaten doğruysa hiçbir şeyi değiştirmez.
 */
setup('ParaBank data access mode is JDBC', async ({ page }) => {
  await openPage(page, 'admin.htm');

  const jdbcOption = page.locator('input[name="accessMode"][value="jdbc"]');

  if (await jdbcOption.isChecked()) {
    return; // Ortam zaten doğru, dokunmuyoruz
  }

  await jdbcOption.check();
  await page.locator('input[type="submit"][value="Submit"]').click();

  await expect(page.getByText('Settings saved successfully.')).toBeVisible();
  await expect(jdbcOption).toBeChecked();
});
