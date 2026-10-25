import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockEvents } from "@/mocks/events";
import type { ApiResponse } from "@/types/auth";
import type { EventSummary } from "@/types/event";

export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<EventSummary[]>>("/events");
    return NextResponse.json(body, { status });
  } catch {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Daftar event belum dapat dimuat" } } satisfies ApiResponse<EventSummary[]>,
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: true, data: mockEvents } satisfies ApiResponse<EventSummary[]>,
      { headers: { "X-IOE-Demo-Data": "true" } }
    );
  }
}
