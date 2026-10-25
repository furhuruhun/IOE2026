import { ApiError } from "@/services/authService";
import type { ApiResponse } from "@/types/auth";
import type { EventDetailResult, EventListResult, EventSummary } from "@/types/event";
import { z } from "zod";

const eventDetailSchema = z.object({
  id: z.string().min(1), slug: z.string().min(1), name: z.string().min(1),
  deadline: z.string(), isRegisteredByUser: z.boolean(),
  speakers: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })).optional(),
});

export async function fetchEvent(slug: string): Promise<EventDetailResult> {
  try {
    const response = await fetch(`/api/events/${encodeURIComponent(slug)}`, { cache: "no-store" });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Detail event belum dapat dimuat");
    }
    const parsed = eventDetailSchema.safeParse(json.data);
    if (!parsed.success || parsed.data.slug !== slug) throw new ApiError("SERVER_ERROR", "Data event tidak sesuai");
    return { event: parsed.data, isDemo: response.headers.get("X-IOE-Demo-Data") === "true" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("SERVER_ERROR", "Detail event belum dapat dimuat");
  }
}

export async function fetchEvents(): Promise<EventListResult> {
  const response = await fetch("/api/events", { cache: "no-store" });
  const json = (await response.json()) as ApiResponse<EventSummary[]>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Daftar event belum dapat dimuat");
  }
  return { events: json.data, isDemo: response.headers.get("X-IOE-Demo-Data") === "true" };
}
