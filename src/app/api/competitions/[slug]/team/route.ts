import { NextRequest, NextResponse } from "next/server";
import { fetchWorkers, getTokenFromCookies } from "@/lib/api";
import { createMockTeam, findMyMockTeam } from "@/mocks/teams";
import type { ApiResponse } from "@/types/auth";
import type { Team } from "@/types/team";

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

  try {
    const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team`, {
      method: "POST",
      token,
      body: { teamName },
    });
    return NextResponse.json(body, { status });
  } catch {
    const team = createMockTeam(id, teamName);
    return NextResponse.json(
      {
        success: true,
        data: { teamId: team.teamId, teamName: team.teamName, teamCode: team.teamCode, visibility: team.visibility, isLeader: team.isLeader },
      } satisfies ApiResponse<Team>,
      { status: 201 }
    );
  }
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

  try {
    const { status, body } = await fetchWorkers<ApiResponse<Team>>(`/competitions/${id}/team`, { method: "GET", token });
    return NextResponse.json(body, { status });
  } catch {
    const team = findMyMockTeam(id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Belum punya tim" } } satisfies ApiResponse<Team>,
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: team } satisfies ApiResponse<Team>);
  }
}
