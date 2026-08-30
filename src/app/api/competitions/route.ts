import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockCompetitions } from "@/mocks/competitions";
import type { ApiResponse } from "@/types/auth";
import type { CompetitionSummary } from "@/types/competition";

// GET /competitions — public (F-22–F-26), lewat Route Handler proxy sama seperti auth
// (TECHNICAL_CONSTRAINTS_FE.md: semua call Workers server-side, tidak ada NEXT_PUBLIC_API).
// Fallback ke mock selama WORKERS_API_URL belum di-set (staging/production masih kosong,
// lihat CHANGELOG A2) — TANPA fallback ini halaman /competitions akan 500 total di dev lokal
// sebelum BE Workers-nya sendiri ready.
export async function GET() {
  try {
    const { status, body } = await fetchWorkers<ApiResponse<CompetitionSummary[]>>("/competitions");
    if (!body.success) {
      return NextResponse.json(body, { status });
    }
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ success: true, data: mockCompetitions } satisfies ApiResponse<CompetitionSummary[]>);
  }
}
