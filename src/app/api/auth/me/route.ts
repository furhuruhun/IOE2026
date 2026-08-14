import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import type { ApiResponse, User } from "@/types/auth";

// Kunci persist session saat hard refresh — dipanggil SessionBootstrap via useCurrentUser.
export async function GET() {
  const token = await getTokenFromCookies();

  if (!token) {
    return NextResponse.json({ success: true, data: null });
  }

  const { body: workersBody } = await fetchWorkers<ApiResponse<User>>("/profile", {
    method: "GET",
    token,
  });

  if (!workersBody.success) {
    // Token expired/invalid di Workers — clear cookie, treat sebagai belum login (bukan error).
    const response = NextResponse.json({ success: true, data: null });
    response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
    return response;
  }

  return NextResponse.json({ success: true, data: workersBody.data });
}
