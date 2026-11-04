import { unwrapResponse as unwrap } from "@/services/apiResponse";
import type { AssignmentItem, CalendarItem, JourneyItem, RegisteredEventItem } from "@/types/dashboard";

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
