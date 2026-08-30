import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import { joinMockTeamByCode } from "@/mocks/teams";
import type { ApiResponse } from "@/types/auth";
import type { Team } from "@/types/team";

// POST /competitions/:id/team/join — F-18 Cabang B, join via Team Code. Errors:
// TEAM_CODE_INVALID, TEAM_FULL (API_CONTRACT.md baris 280-282).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  const token = await getTokenFromCookies();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sesi berakhir, silakan login lagi" } } satisfies ApiResponse<Team>,
      { status: 401 }
    );
  }

  const { teamCode } = await req.json();

  try {
    const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team/join`, {
      method: "POST",
      token,
      body: { teamCode },
    });
    return NextResponse.json(body, { status });
  } catch {
    const result = joinMockTeamByCode(id, teamCode);
    if ("errorCode" in result) {
      const message = result.errorCode === "TEAM_CODE_INVALID" ? "Kode tim tidak ditemukan, cek lagi kodenya" : "Tim ini sudah penuh";
      return NextResponse.json(
        { success: false, error: { code: result.errorCode, message } } satisfies ApiResponse<Team>,
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: result.team } satisfies ApiResponse<Team>);
  }
}
