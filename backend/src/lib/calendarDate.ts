// Calendar entries use the first day of a display range; keep the range in the label.
export function calendarDate(value: string): string | null {
  const range = value.match(/^(\d{1,2})(?:\s+([A-Za-z]+))?(?:\s+(\d{4}))?\s*[-–]\s*\d{1,2}\s+([A-Za-z]+)\s+(\d{4})$/);
  if (range) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = months.indexOf((range[2] ?? range[4]).toLowerCase());
    const endMonth = months.indexOf(range[4].toLowerCase());
    if (month < 0 || endMonth < 0) return null;
    const year = Number(range[3] ?? range[5]) - (!range[3] && month > endMonth ? 1 : 0);
    const day = Number(range[1]);
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+07:00`;
  }
  return Number.isFinite(Date.parse(value)) ? value : null;
}
