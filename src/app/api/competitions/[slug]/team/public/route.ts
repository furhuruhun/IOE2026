import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import { listPublicMockTeams } from "@/mocks/teams";
import type { ApiResponse } from "@/types/auth";
import type { PublicTeamSummary } from "@/types/team";

// GET /competitions/:id/team/public — F-18 Cabang C, list tim public untuk modal Join Team
// (link "atau pilih dari tim yang membuka pendaftaran"). Auth required.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  const token = await getTokenFromCookies();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sesi berakhir, silakan login lagi" } } satisfies ApiResponse<PublicTeamSummary[]>,
      { status: 401 }
    );
  }

  try {
    const { status, body } = await fetchWorkers<ApiResponse<PublicTeamSummary[]>>(`/competitions/${id}/team/public`, {
      method: "GET",
      token,
    });
    return NextResponse.json(body, { status });
  } catch {
    return NextResponse.json({ success: true, data: listPublicMockTeams(id) } satisfies ApiResponse<PublicTeamSummary[]>);
  }
}
