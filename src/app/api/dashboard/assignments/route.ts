import { NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import { getMockAssignments } from "@/mocks/requirements";
import type { ApiResponse } from "@/types/auth";
import type { AssignmentItem } from "@/types/dashboard";

export async function GET() {
  const token = await getTokenFromCookies();
  if (!token) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sesi berakhir, silakan login lagi' } }, { status: 401 });
  try {
    const { status, body } = await fetchWorkers<ApiResponse<AssignmentItem[]>>("/dashboard/assignments", { token });
    const response = NextResponse.json(body, { status });
    if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
    return response;
  } catch {
    // Demo data only when no Workers backend is configured.
    if (process.env.WORKERS_API_URL || process.env.NODE_ENV !== 'development') return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan, coba lagi nanti' } }, { status: 502 });
    const pending = process.env.NODE_ENV === "development" && !process.env.WORKERS_API_URL ? getMockAssignments() : [];
    return NextResponse.json({ success: true, data: pending } satisfies ApiResponse<AssignmentItem[]>);
  }
}
