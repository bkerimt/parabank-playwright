// ParaBank tutarları "$1515.50" veya "-$100.00" formatında gösteriyor.
// Bu fonksiyon metni hesaplama yapılabilecek bir sayıya çevirir.
export function parseCurrency(text: string): number {
  const value = Number(text.replace(/[$,\s]/g, ''));
  if (Number.isNaN(value)) {
    throw new Error(`Tutar okunamadı: "${text}"`);
  }
  return value;
}
