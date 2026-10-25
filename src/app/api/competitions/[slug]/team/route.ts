import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies, COOKIE_NAME, CLEAR_AUTH_COOKIE_OPTIONS } from "@/lib/api";
import { createMockTeam, findMyMockTeam } from "@/mocks/teams";
import type { ApiResponse } from "@/types/auth";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import type { Team } from "@/types/team";

function failure(status: number) {
  return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: ERROR_MESSAGES.SERVER_ERROR.message } }, { status });
}

// POST /competitions/:id/team — F-18/F-18a, create team. Auth required.
// GET  /competitions/:id/team  — cek status tim user, 404 kalau belum punya (trigger FE
// tampilkan modal Create/Join, ATAU skip modal & redirect /dashboard kalau sudah punya).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  const token = await getTokenFromCookies();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sesi berakhir, silakan login lagi" } } satisfies ApiResponse<Team>,
      { status: 401 }
    );
  }

  const { teamName } = await req.json();

  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team`, {
        method: "POST",
        token,
        body: { teamName },
      });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure(502); }
  }
  if (process.env.NODE_ENV !== 'development') return failure(503);
  const team = createMockTeam(id, teamName);
  return NextResponse.json(
    {
      success: true,
      data: { teamId: team.teamId, teamName: team.teamName, teamCode: team.teamCode, visibility: team.visibility, isLeader: team.isLeader },
    } satisfies ApiResponse<Team>,
    { status: 201 }
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = await params;
  const token = await getTokenFromCookies();
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Sesi berakhir, silakan login lagi" } } satisfies ApiResponse<Team>,
      { status: 401 }
    );
  }

  if (process.env.WORKERS_API_URL) {
    try {
      const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team`, { method: "GET", token });
      const response = NextResponse.json(body, { status });
      if (status === 401) response.cookies.set(COOKIE_NAME, '', CLEAR_AUTH_COOKIE_OPTIONS);
      return response;
    } catch { return failure(502); }
  }
  if (process.env.NODE_ENV !== 'development') return failure(503);
  const team = findMyMockTeam(id);
  if (!team) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Belum punya tim" } } satisfies ApiResponse<Team>,
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: team } satisfies ApiResponse<Team>);
}
