import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, AUTH_COOKIE_OPTIONS, COOKIE_NAME } from "@/lib/api";
import type { ApiResponse, LoginRequestBody, WorkersAuthResponseData } from "@/types/auth";

export async function POST(req: NextRequest) {
  const body: LoginRequestBody = await req.json();

  const { status, body: workersBody } = await fetchWorkers<ApiResponse<WorkersAuthResponseData>>(
    "/auth/login",
    { method: "POST", body }
  );

  if (!workersBody.success) {
    return NextResponse.json(workersBody, { status });
  }

  const { token, user } = workersBody.data;

  const response = NextResponse.json(
    { success: true, data: { user }, message: workersBody.message },
    { status }
  );
  response.cookies.set(COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  return response;
}
