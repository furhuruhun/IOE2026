import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockJourney } from "@/mocks/dashboard";
import type { ApiResponse } from "@/types/auth";
import type { JourneyItem } from "@/types/dashboard";

export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<JourneyItem[]>>("/dashboard/journey");
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ success: true, data: mockJourney } satisfies ApiResponse<JourneyItem[]>);
  }
}
