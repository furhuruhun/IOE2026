import { AppError } from "../../lib/errors";

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
  status: "verified" | "pending";
  visibility: "private" | "public";
  isLeader: boolean;
  leader: { id: string; name: string };
  members: TeamMemberDto[];
}

export async function computeTeamStatus(
  db: D1Database,
  competitionId: string,
  teamId: string
): Promise<"verified" | "pending"> {
  // Count group templates and accepted group submissions
  const groupStats = await db
    .prepare(
      `SELECT
         COUNT(t.id) as total_group_templates,
         COUNT(s.id) as accepted_group_submissions
       FROM requirement_templates t
       LEFT JOIN requirement_submissions s
         ON s.template_id = t.id AND s.team_id = ?1 AND s.status = 'accepted'
       WHERE t.competition_id = ?2 AND t.type = 'group'`
    )
    .bind(teamId, competitionId)
    .first<{ total_group_templates: number; accepted_group_submissions: number }>();

  const totalGroup = groupStats?.total_group_templates ?? 0;
  const acceptedGroup = groupStats?.accepted_group_submissions ?? 0;

  if (totalGroup > 0 && acceptedGroup < totalGroup) {
    return "pending";
  }

  // Count individual templates
  const indTemplates = await db
    .prepare(
      `SELECT COUNT(id) as cnt FROM requirement_templates
       WHERE competition_id = ?1 AND type = 'individual'`
    )
    .bind(competitionId)
    .first<{ cnt: number }>();

  const totalIndTemplates = indTemplates?.cnt ?? 0;

  if (totalIndTemplates > 0) {
    // Check if every member has accepted submissions for all individual templates
    const members = await db
      .prepare("SELECT user_id FROM team_members WHERE team_id = ?1")
      .bind(teamId)
      .all<{ user_id: string }>();

    for (const m of members.results) {
      const acceptedCount = await db
        .prepare(
          `SELECT COUNT(s.id) as cnt
           FROM requirement_templates t
           JOIN requirement_submissions s
             ON s.template_id = t.id AND s.user_id = ?1 AND s.status = 'accepted'
           WHERE t.competition_id = ?2 AND t.type = 'individual'`
        )
        .bind(m.user_id, competitionId)
        .first<{ cnt: number }>();

      if ((acceptedCount?.cnt ?? 0) < totalIndTemplates) {
        return "pending";
      }
    }
  }

  return "verified";
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
