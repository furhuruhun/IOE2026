import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
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

  let teamCode: string;
  try {
    const input = await req.json();
    if (typeof input?.teamCode !== "string" || !input.teamCode.trim()) throw new Error("Invalid input");
    teamCode = input.teamCode;
  } catch {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: ERROR_MESSAGES.VALIDATION_ERROR.message } }, { status: 400 });
  }

  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team/join`, {
        method: "POST",
        token,
        body: { teamCode },
      });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure(502); }
  }
  if (process.env.NODE_ENV !== "development") return failure(503);
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

function failure(status: number) {
  return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}
