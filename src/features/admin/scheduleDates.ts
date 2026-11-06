import type { RegistrationWindow, TimelineMilestone } from "@/services/adminService";

// datetime-local has no timezone; always display and submit Jakarta wall time.
export function wibInput(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp + 7 * 3600000).toISOString().slice(0, 19) : "";
}

export function scheduleChanges(record: RegistrationWindow | TimelineMilestone, data: FormData): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  const fields = "occursAt" in record ? ["occursAt"] as const : ["opensAt", "closesAt"] as const;
  for (const field of fields) {
    const value = String(data.get(field));
    const previous = record[field as keyof typeof record] as string;
    const timestamp = `${value.length === 16 ? `${value}:00` : value}+07:00`;
    if (Date.parse(timestamp) !== Date.parse(previous)) changes[field] = timestamp;
  }
  if ("occursAt" in record) {
    const label = String(data.get("label")).trim();
    const sortOrder = Number(data.get("sortOrder"));
    const showInCalendar = data.has("showInCalendar");
    if (label !== record.label) changes.label = label;
    if (sortOrder !== record.sortOrder) changes.sortOrder = sortOrder;
    if (showInCalendar !== Boolean(record.showInCalendar)) changes.showInCalendar = showInCalendar;
  }
  return changes;
}
