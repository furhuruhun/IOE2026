import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import type { ApiResponse, User } from "@/types/auth";

// Kunci persist session saat hard refresh — dipanggil SessionBootstrap via useCurrentUser.
export async function GET() {
  const token = await getTokenFromCookies();

  if (!token) {
    return NextResponse.json({ success: true, data: null });
  }

  try {
    const { status, body: workersBody } = await fetchWorkers<ApiResponse<User>>("/profile", {
      method: "GET",
      token,
    });

    if (status === 401) {
      // Token expired/invalid di Workers — clear cookie, treat sebagai belum login (bukan error).
      const response = NextResponse.json({ success: true, data: null });
      response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    }

    if (!workersBody.success || status >= 400) return NextResponse.json(workersBody, { status });

    return NextResponse.json({ success: true, data: workersBody.data });
  } catch {
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: ERROR_MESSAGES.SERVER_ERROR.message } }, { status: 502 });
  }
}
