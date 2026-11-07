import { NextResponse } from "next/server";
import { COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS, getTokenFromCookies } from "@/lib/api";

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const token = await getTokenFromCookies();
  const fail = (code: string, status: number) => NextResponse.json({ success: false, error: { code, message: "Layanan admin tidak tersedia." } }, { status });
  if (!token) return fail("UNAUTHORIZED", 401);
  const { path } = await context.params;
  const resource = path.join("/");
  const allowed = request.method === "GET"
    ? /^(submissions|registrations|registrations\/export|schedules|competitions\/[^/]+\/requirements|competitions\/[^/]+\/qualifications)$/
    : request.method === "POST"
    ? /^(announcements|users\/password|competitions\/[^/]+\/requirements)$/
    : request.method === "PATCH"
    ? /^((submissions\/[^/]+)|(requirements\/[^/]+\/deadline)|(requirements\/[^/]+)|(competition-batches\/[^/]+\/registration-window)|(events\/[^/]+\/registration-window)|(competitions\/[^/]+\/timeline\/[^/]+)|(competitions\/[^/]+\/qualifications\/[^/]+))$/
    : request.method === "DELETE"
    ? /^(requirements\/[^/]+)$/
    : false;
  if (!allowed || !allowed.test(resource)) return fail("NOT_FOUND", 404);
  const base = process.env.WORKERS_API_URL;
  if (!base) return fail("SERVER_ERROR", 503);
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return fail("UNAUTHORIZED", 403);
  }
  try {
    const upstream = await fetch(`${base}/admin/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: request.method === "GET" || request.method === "DELETE" ? undefined : await request.text(),
      cache: "no-store",
    });
    const headers = new Headers({ "Cache-Control": "no-store" });
    for (const key of ["Content-Type", "Content-Disposition"]) {
      const value = upstream.headers.get(key);
      if (value) headers.set(key, value);
    }
    const response = new NextResponse(upstream.body, { status: upstream.status, headers });
    if (upstream.status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
    return response;
  } catch { return fail("SERVER_ERROR", 502); }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
