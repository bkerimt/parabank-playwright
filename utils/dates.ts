// ParaBank'ın arama ekranındaki tarih biçimi: AA-GG-YYYY (ör. 11-19-2026)
export function formatParaBankDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${date.getFullYear()}`;
}

// Bugünden verilen gün kadar ilerideki (eksi değerde gerideki) tarih
export function daysFromToday(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
