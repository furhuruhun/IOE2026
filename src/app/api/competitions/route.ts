import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockCompetitions } from "@/mocks/competitions";
import type { ApiResponse } from "@/types/auth";
import type { CompetitionSummary } from "@/types/competition";

// GET /competitions — public (F-22–F-26), lewat Route Handler proxy sama seperti auth
// (TECHNICAL_CONSTRAINTS_FE.md: semua call Workers server-side, tidak ada NEXT_PUBLIC_API).
// Demo fixtures are available only in development without a configured backend.
export async function GET() {
  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<CompetitionSummary[]>>("/competitions");
      return NextResponse.json(body, { status, headers: { "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30" } });
    } catch { return failure(502); }
  }
  if (process.env.NODE_ENV !== "development") return failure(503);
  return NextResponse.json({ success: true, data: mockCompetitions } satisfies ApiResponse<CompetitionSummary[]>);
}

function failure(status: number) {
  return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}
