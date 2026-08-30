import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockCalendar } from "@/mocks/dashboard";
import type { ApiResponse } from "@/types/auth";
import type { CalendarItem } from "@/types/dashboard";

export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<CalendarItem[]>>("/dashboard/calendar");
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ success: true, data: mockCalendar } satisfies ApiResponse<CalendarItem[]>);
  }
}
