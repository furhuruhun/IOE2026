export type TeamStatus = "pendaftar" | "peserta" | "finalis";

export interface TeamMemberDto {
  id: string;
  name: string;
  studentId: string;
}

export interface TeamDto {
  teamId: string;
  teamName: string;
  teamCode: string;
  batch: string;
  status: TeamStatus;
  visibility: "private" | "public";
  isLeader: boolean;
  leader: { id: string; name: string };
  members: TeamMemberDto[];
}

export async function computeTeamStatus(
  db: D1Database,
  competitionId: string,
  teamId: string
): Promise<TeamStatus> {
  // 1. Check status in teams table
  try {
    const row = await db
      .prepare("SELECT status FROM teams WHERE id = ?1 LIMIT 1")
      .bind(teamId)
      .first<{ status?: string }>();
    if (row?.status === "finalis") return "finalis";
    if (row?.status === "peserta") return "peserta";
    if (row?.status === "pendaftar") return "pendaftar";
  } catch {}

  // 2. Check qualification table fallback
  try {
    const qual = await db
      .prepare("SELECT status FROM competition_qualifications WHERE competition_id = ?1 AND team_id = ?2 LIMIT 1")
      .bind(competitionId, teamId)
      .first<{ status?: string }>();
    if (qual?.status === "passed" || qual?.status === "finalis") return "finalis";
    if (qual?.status === "peserta") return "peserta";
  } catch {}

  // Default is always pendaftar
  return "pendaftar";
}

export async function loadTeamForUser(
  db: D1Database,
  competitionId: string,
  userId: string
): Promise<TeamDto | null> {
  // Find member record for user in this competition
  const membership = await db
    .prepare(
      `SELECT m.team_id, m.role, t.name as team_name, t.code as team_code,
              t.visibility, t.leader_user_id, b.name as batch_name
       FROM team_members m
       JOIN teams t ON t.id = m.team_id
       JOIN competition_batches b ON b.id = t.batch_id
       WHERE m.competition_id = ?1 AND m.user_id = ?2
       LIMIT 1`
    )
    .bind(competitionId, userId)
    .first<{
      team_id: string;
      role: "leader" | "member";
      team_name: string;
      team_code: string;
      visibility: "private" | "public";
      leader_user_id: string;
      batch_name: string;
    }>();

  if (!membership) {
    return null;
  }

  // Get leader info
  const leaderUser = await db
    .prepare("SELECT id, name FROM users WHERE id = ?1 LIMIT 1")
    .bind(membership.leader_user_id)
    .first<{ id: string; name: string }>();

  // Get all members
  const memberRows = await db
    .prepare(
      `SELECT u.id, u.name
       FROM team_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.team_id = ?1
       ORDER BY m.joined_at ASC`
    )
    .bind(membership.team_id)
    .all<{ id: string; name: string }>();

  const status = await computeTeamStatus(db, competitionId, membership.team_id);

  return {
    teamId: membership.team_id,
    teamName: membership.team_name,
    teamCode: membership.team_code,
    batch: membership.batch_name,
    status,
    visibility: membership.visibility,
    isLeader: membership.role === "leader",
    leader: {
      id: leaderUser?.id ?? membership.leader_user_id,
      name: leaderUser?.name ?? "Leader",
    },
    members: memberRows.results.map((m) => ({
      id: m.id,
      name: m.name,
      studentId: m.id,
    })),
  };
}
