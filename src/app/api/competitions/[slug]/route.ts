import { NextResponse } from "next/server";
import { fetchWorkers } from "@/lib/api";
import { mockCompetitionDetails } from "@/mocks/competitionDetails";
import type { ApiResponse } from "@/types/auth";
import type { CompetitionDetail } from "@/types/competition";

// GET /competitions/:slug — public (F-12–F-17), lewat Route Handler proxy sama seperti
// GET /competitions (route.ts sibling). Fallback ke mock selama WORKERS_API_URL belum
// di-set. Beda dengan list endpoint: di sini WAJIB return 404/NOT_FOUND asli untuk slug
// yang tidak ada, supaya page.tsx bisa panggil notFound().
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const { status, body } = await fetchWorkers<ApiResponse<CompetitionDetail>>(`/competitions/${slug}`);
    return NextResponse.json(body, { status });
  } catch {
    const mock = mockCompetitionDetails.find((c) => c.slug === slug);
    if (!mock) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Kompetisi tidak ditemukan" },
        } satisfies ApiResponse<CompetitionDetail>,
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: mock } satisfies ApiResponse<CompetitionDetail>);
  }
}
