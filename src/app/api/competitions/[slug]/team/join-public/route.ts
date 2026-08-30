import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import { joinPublicMockTeam } from "@/mocks/teams";
import type { ApiResponse } from "@/types/auth";
import type { Team } from "@/types/team";

// POST /competitions/:id/team/join-public — F-18 Cabang C, join tim public tanpa Team
// Code. Errors: TEAM_FULL, TEAM_NOT_PUBLIC (API_CONTRACT.md baris 292-296).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  const token = await getTokenFromCookies();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sesi berakhir, silakan login lagi" } } satisfies ApiResponse<Team>,
      { status: 401 }
    );
  }

  const { teamId } = await req.json();

  try {
    const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team/join-public`, {
      method: "POST",
      token,
      body: { teamId },
    });
    return NextResponse.json(body, { status });
  } catch {
    const result = joinPublicMockTeam(id, teamId);
    if ("errorCode" in result) {
      const message =
        result.errorCode === "TEAM_FULL" ? "Tim ini sudah penuh" : "Tim ini tidak lagi membuka pendaftaran publik";
      return NextResponse.json(
        { success: false, error: { code: result.errorCode, message } } satisfies ApiResponse<Team>,
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: result.team } satisfies ApiResponse<Team>);
  }
}
