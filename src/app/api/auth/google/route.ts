import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/api";
import type { ApiResponse, GoogleLoginRequestBody, WorkersAuthResponseData } from "@/types/auth";

export async function POST(req: NextRequest) {
  const body: GoogleLoginRequestBody = await req.json();

  const { status, body: workersBody } = await fetchWorkers<ApiResponse<WorkersAuthResponseData>>(
    "/auth/google",
    { method: "POST", body }
  );

  if (!workersBody.success) {
    return NextResponse.json(workersBody, { status });
  }

  const { token, user, isNewUser } = workersBody.data;

  const response = NextResponse.json(
    { success: true, data: { user, isNewUser }, message: workersBody.message },
    { status }
  );
  response.cookies.set(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  return response;
}
