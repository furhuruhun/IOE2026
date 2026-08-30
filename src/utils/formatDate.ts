// Util formatter WIB terpusat — TECHNICAL_CONSTRAINTS_FE.md baris 152 minta "satu util
// formatter yang konsisten dipakai di countdown dan kalender dashboard" (F-50/F-51).
// CountdownTimer.tsx sudah py formatter lokalnya sendiri (belum diekstrak ke sini —
// di luar scope task ini, dibiarkan apa adanya supaya tidak ada risiko regresi ke
// komponen yang sudah jalan). File ini dipakai fitur dashboard yang baru dibangun.

const WIB_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const WIB_SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Jakarta",
});

export function formatWibDate(iso: string): string {
  return WIB_DATE_FORMATTER.format(new Date(iso));
}

export function formatWibShortDate(iso: string): string {
  return WIB_SHORT_DATE_FORMATTER.format(new Date(iso));
}
