import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
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

  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<PublicTeamSummary[]>>(`/competitions/${id}/team/public`, {
        method: "GET",
        token,
      });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, "", CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure(502); }
  }
  if (process.env.NODE_ENV !== "development") return failure(503);
  return NextResponse.json({ success: true, data: listPublicMockTeams(id) } satisfies ApiResponse<PublicTeamSummary[]>);
}

function failure(status: number) {
  return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}
