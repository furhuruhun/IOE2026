// Shape: API_CONTRACT.md §[TAMBAHAN] Data Models → `Team` (baris 86-99), dipakai response
// POST /team, POST /team/join, GET /team, PATCH /team/visibility. `batch`/`status`/`leader`/
// `members` opsional di sini karena response 201 POST /team (F-18) & 200 POST /team/join
// cuma balikin subset field ({teamId, teamName, teamCode, visibility, isLeader}) — bukan
// full shape seperti GET /team.
export interface TeamMember {
  id: string;
  name: string;
  studentId: string;
}

export interface Team {
  teamId: string;
  teamName: string;
  teamCode: string;
  visibility: "private" | "public";
  isLeader: boolean;
  batch?: string;
  status?: "verified" | "pending";
  leader?: { id: string; name: string };
  members?: TeamMember[];
}

// Shape: API_CONTRACT.md §GET /competitions/:id/team/public (baris 287).
export interface PublicTeamSummary {
  teamId: string;
  teamName: string;
  memberCount: number;
  maxMember: number;
}
