import { ApiError } from "@/services/authService";
import type { ApiResponse } from "@/types/auth";
import type { EventListResult, EventSummary } from "@/types/event";

export async function fetchEvents(): Promise<EventListResult> {
  const response = await fetch("/api/events");
  const json = (await response.json()) as ApiResponse<EventSummary[]>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Daftar event belum dapat dimuat");
  }
  return { events: json.data, isDemo: response.headers.get("X-IOE-Demo-Data") === "true" };
}
