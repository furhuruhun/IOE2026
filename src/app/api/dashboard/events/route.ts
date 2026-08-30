import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockDashboardEvents } from "@/mocks/dashboard";
import type { ApiResponse } from "@/types/auth";
import type { RegisteredEventItem } from "@/types/dashboard";

export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<RegisteredEventItem[]>>("/dashboard/events");
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ success: true, data: mockDashboardEvents } satisfies ApiResponse<RegisteredEventItem[]>);
  }
}
