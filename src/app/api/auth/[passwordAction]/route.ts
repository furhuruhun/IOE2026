import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import type { ApiResponse } from "@/types/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ passwordAction: string }> }) {
  const { passwordAction } = await context.params;
  const fail = (message: string, status: number) => NextResponse.json({ success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR", message } }, { status });
  if (!["change-password", "forgot-password", "reset-password"].includes(passwordAction)) return fail("Endpoint tidak ditemukan.", 404);
  const origin = request.headers.get("origin");
  try {
    if (origin && new URL(origin).host !== request.headers.get("host")) return fail("Permintaan tidak diizinkan.", 403);
  } catch { return fail("Permintaan tidak diizinkan.", 403); }
  const token = passwordAction === "change-password" ? await getTokenFromCookies() : undefined;
  if (passwordAction === "change-password" && !token) return fail("Silakan login kembali.", 401);
  let body;
  try { body = await request.json(); } catch { return fail("Permintaan tidak valid.", 400); }
  try {
    const upstream = await fetchWorkers<ApiResponse<unknown>>(`/auth/${passwordAction}`, { method: "POST", body, token, cache: "no-store", signal: AbortSignal.timeout(15000) });
    const response = NextResponse.json(upstream.body, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
    // Wrong current password is INVALID_CREDENTIALS; it must not clear a working session.
    if ((upstream.body.success && upstream.status < 400 && passwordAction !== "forgot-password") || (!upstream.body.success && upstream.body.error.code === "UNAUTHORIZED")) {
      response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
    }
    return response;
  } catch { return fail("Layanan password belum tersedia. Coba lagi nanti atau hubungi panitia.", 503); }
}
