// Helper murni untuk grid bulan CalendarWidget (F-50/F-51) — semua tanggal direpresentasikan
// sebagai angka Y/M/D "WIB" (bukan JS Date instance) supaya tidak ada ambiguitas
// timezone/DST saat generate grid. PRD_IOE_2027_v4.md §6 NFR: "Kalender pada dashboard
// SHALL menggunakan timezone WIB dan tetap akurat hingga Mei 2027".

export const WIB_YMD_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function wibDateKey(date: Date): string {
  return WIB_YMD_FORMATTER.format(date); // "2027-03-15"
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export interface MonthGridCell {
  year: number;
  month: number; // 1-12
  day: number;
  key: string; // "YYYY-MM-DD"
  inCurrentMonth: boolean;
}

// month: 1-12. Grid dimulai Senin, panjang kelipatan 7 (menutupi seluruh hari di bulan
// tsb, plus padding hari dari bulan sebelum/sesudah).
export function buildMonthGrid(year: number, month: number): MonthGridCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const jsWeekday = firstOfMonth.getUTCDay(); // 0=Sun..6=Sat
  const mondayIndex = (jsWeekday + 6) % 7; // 0=Mon..6=Sun

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const [prevYear, prevMonth] = month === 1 ? [year - 1, 12] : [year, month - 1];
  const [nextYear, nextMonth] = month === 12 ? [year + 1, 1] : [year, month + 1];

  const cells: MonthGridCell[] = [];

  for (let i = mondayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ year: prevYear, month: prevMonth, day, key: ymdKey(prevYear, prevMonth, day), inCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ year, month, day, key: ymdKey(year, month, day), inCurrentMonth: true });
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const toAdd = 7 - remainder;
    for (let day = 1; day <= toAdd; day++) {
      cells.push({ year: nextYear, month: nextMonth, day, key: ymdKey(nextYear, nextMonth, day), inCurrentMonth: false });
    }
  }

  return cells;
}
