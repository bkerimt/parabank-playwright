import { type Page } from '@playwright/test';

/*
 * ParaBank'ın önünde Cloudflare var. Kısa sürede çok istek gelen IP adreslerini geçici olarak
 * engelliyor (HTTP 429, "Error 1015 - You are being rate limited"). Bu durumda sayfa yerine
 * Cloudflare'in engel sayfası açılıyor ve testler aradıkları elemanı bulamayıp zaman aşımına uğruyor.
 *
 * Bu fonksiyon sayfayı açar; engel gelirse 60 saniye beklemek yerine testi hemen,
 * sebebini açıkça söyleyen bir mesajla durdurur.
 */
export async function openPage(page: Page, path: string) {
  const response = await page.goto(path);
  if (response?.status() === 429) {
    throw new Error(
      `ParaBank istekleri sınırladı (HTTP 429 / Cloudflare 1015 rate limit) - açılmak istenen sayfa: ${path}. ` +
        'Bu bir ortam sorunudur, test hatası değildir; bir süre bekleyip tekrar deneyin.'
    );
  }
}
