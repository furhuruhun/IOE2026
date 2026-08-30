import type { ApiResponse } from "@/types/auth";
import type { AssignmentItem, CalendarItem, JourneyItem, RegisteredEventItem } from "@/types/dashboard";
import { ApiError } from "@/services/authService";

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Terjadi kesalahan, coba lagi nanti");
  }
  return json.data;
}

export async function fetchJourney(): Promise<JourneyItem[]> {
  const res = await fetch("/api/dashboard/journey");
  return unwrap<JourneyItem[]>(res);
}

export async function fetchDashboardEvents(): Promise<RegisteredEventItem[]> {
  const res = await fetch("/api/dashboard/events");
  return unwrap<RegisteredEventItem[]>(res);
}

export async function fetchCalendar(): Promise<CalendarItem[]> {
  const res = await fetch("/api/dashboard/calendar");
  return unwrap<CalendarItem[]>(res);
}

export async function fetchAssignments(): Promise<AssignmentItem[]> {
  const res = await fetch("/api/dashboard/assignments");
  return unwrap<AssignmentItem[]>(res);
}
