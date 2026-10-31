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
// During local development, event pages use the existing demo fixtures even
// when a backend URL is configured. Production reads continue through Workers.
export async function eventProxy(slug?: string) {
  if (process.env.NODE_ENV === "development") return demoResponse(slug);

  const token = await getTokenFromCookies();
  const headers = { "Cache-Control": "private, no-store" };
  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers(slug === undefined ? "/events" : `/events/${encodeURIComponent(slug)}`, { token, cache: "no-store" });
      const response = NextResponse.json(body, { status, headers });
      if (status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch {
      return failure("SERVER_ERROR", 502);
    }
  }
  return failure("SERVER_ERROR", 503);
}
