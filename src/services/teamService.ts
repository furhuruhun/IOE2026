import type { ApiResponse } from "@/types/auth";
import type { PublicTeamSummary, Team } from "@/types/team";
import { ApiError } from "@/services/authService";

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Terjadi kesalahan, coba lagi nanti");
  }
  return json.data;
}

export async function createTeam(competitionId: string, teamName: string): Promise<Team> {
  const res = await fetch(`/api/competitions/${competitionId}/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamName }),
  });
  return unwrap<Team>(res);
}

export async function joinTeamByCode(competitionId: string, teamCode: string): Promise<Team> {
  const res = await fetch(`/api/competitions/${competitionId}/team/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamCode }),
  });
  return unwrap<Team>(res);
}

export async function fetchPublicTeams(competitionId: string): Promise<PublicTeamSummary[]> {
  const res = await fetch(`/api/competitions/${competitionId}/team/public`);
  return unwrap<PublicTeamSummary[]>(res);
}

export async function joinPublicTeam(competitionId: string, teamId: string): Promise<Team> {
  const res = await fetch(`/api/competitions/${competitionId}/team/join-public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId }),
  });
  return unwrap<Team>(res);
}

// 404 di sini itu state NORMAL ("belum punya tim", bukan error) — API_CONTRACT.md
// baris 302. Sengaja TIDAK lewat unwrap() (yang selalu throw ApiError di !success)
// supaya pemanggil bisa treat 404 sebagai `null`, bukan error yang perlu di-toast.
export async function fetchMyTeam(competitionId: string): Promise<Team | null> {
  const res = await fetch(`/api/competitions/${competitionId}/team`);
  if (res.status === 404) return null;
  return unwrap<Team>(res);
}
