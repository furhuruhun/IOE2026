import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import { mockEvents } from "@/mocks/events";
import { getErrorEntry } from "@/constants/errorMessages";

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
// In development, use clearly marked demo data only when the backend cannot be reached.
export async function eventProxy(slug?: string) {
  const token = await getTokenFromCookies();
  const headers = { "Cache-Control": "private, no-store" };
  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers(slug === undefined ? "/events" : `/events/${encodeURIComponent(slug)}`, { token, cache: "no-store" });
      const response = NextResponse.json(body, { status, headers });
      if (status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch {
      if (process.env.NODE_ENV === "development") return demoResponse(slug);
      return failure("SERVER_ERROR", 502);
    }
  }
  if (process.env.NODE_ENV !== "development") return failure("SERVER_ERROR", 503);
  return demoResponse(slug);
}
