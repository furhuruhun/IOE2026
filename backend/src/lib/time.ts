export function toWib(input: string | Date | number): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return String(input);
  const wibTime = d.getTime() + 7 * 60 * 60 * 1000;
  const wibDate = new Date(wibTime);
  const yyyy = wibDate.getUTCFullYear();
  const mm = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(wibDate.getUTCDate()).padStart(2, "0");
  const hh = String(wibDate.getUTCHours()).padStart(2, "0");
  const mi = String(wibDate.getUTCMinutes()).padStart(2, "0");
  const ss = String(wibDate.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+07:00`;
}

export function now(): Date {
  return new Date();
}

export function nowIsoWib(): string {
  return toWib(now());
}
