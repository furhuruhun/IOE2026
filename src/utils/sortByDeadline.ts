// Invalid or absent deadlines sort last. Equal deadlines retain input order.
export function sortByDeadline<T extends { dueDate?: string | null }>(items: readonly T[]): T[] {
  const timestamp = (value: string | null | undefined) => {
    if (!value?.trim()) return Infinity;
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : Infinity;
  };
  return [...items].sort((a, b) => {
    const first = timestamp(a.dueDate), second = timestamp(b.dueDate);
    return first === second ? 0 : first - second;
  });
}
