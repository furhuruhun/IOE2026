import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import { mockEvents } from "@/mocks/events";
import { getErrorEntry } from "@/constants/errorMessages";
import { isHiddenEvent } from "@/lib/eventVisibility";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";
import type { ApiResponse } from "@/types/auth";
import type { EventSummary } from "@/types/event";

function failure(code: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message: getErrorEntry(code).message } }, { status, headers: { "Cache-Control": "private, no-store" } });
}

function demoResponse(slug?: string) {
  const data = slug === undefined ? mockEvents : mockEvents.find(event => event.slug === slug);
  if (!data) return failure("NOT_FOUND", 404);
  return NextResponse.json({ success: true, data }, {
    headers: { "Cache-Control": "private, no-store", "X-IOE-Demo-Data": "true" },
  });
}

// Public reads may carry participant identity. Never cache personalized responses.
// Development defaults to demos. Only an explicit server-side opt-in reads Workers.
// The development selector has no effect in production.
export async function eventProxy(slug?: string) {
  if (!EVENTS_ENABLED) return failure("NOT_FOUND", 404);
  if (slug !== undefined && isHiddenEvent(slug)) return failure("NOT_FOUND", 404);
  if (process.env.NODE_ENV === "development" && process.env.IOE_DEV_EVENTS_SOURCE !== "real") return demoResponse(slug);

  const token = await getTokenFromCookies();
  const headers = token
    ? { "Cache-Control": "private, no-store" }
    : { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30" };
  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<EventSummary[]>>(slug === undefined ? "/events" : `/events/${encodeURIComponent(slug)}`, { token, cache: "no-store" });
      if (slug === undefined && body.success && Array.isArray(body.data)) {
        body.data = body.data.filter(event => !isHiddenEvent(event.slug) && !isHiddenEvent(event.id));
      }
      const response = NextResponse.json(body, { status, headers });
      if (status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch {
      return failure("SERVER_ERROR", 502);
    }
  }
  return failure("SERVER_ERROR", 503);
}
