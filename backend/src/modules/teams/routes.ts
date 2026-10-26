import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { AppError } from "../../lib/errors";
import { ok, created } from "../../lib/response";
import { parseBody } from "../../lib/validate";
import { generateTeamCode, newId } from "../../lib/ids";
import { nowIsoWib } from "../../lib/time";
import { resolveCompetition } from "../../lib/resolve";
import {
  createTeamSchema,
  joinTeamSchema,
  joinPublicTeamSchema,
  setVisibilitySchema,
} from "./schemas";
import { loadTeamForUser } from "./service";

export const teamRoutes = new Hono<AppContext>();

// GET /competitions/:id/team
teamRoutes.get("/:id/team", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;

  const team = await loadTeamForUser(c.env.DB, comp.id, authUser.id);
  if (!team) {
    throw new AppError("NOT_FOUND", 404, "Belum punya tim");
  }

  return ok(c, team);
});

// POST /competitions/:id/team (Create Team)
teamRoutes.post("/:id/team", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;
  const body = parseBody(createTeamSchema, await c.req.json());

  const currentIso = nowIsoWib();

  // 1. Check if user already in a team
  const existingMember = await c.env.DB.prepare(
    "SELECT 1 FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first();

  if (existingMember) {
    throw new AppError("ALREADY_IN_TEAM", 400);
  }

  // 2. Check active batch
  const activeBatch = await c.env.DB.prepare(
    `SELECT id, name FROM competition_batches
     WHERE competition_id = ?1 AND opens_at <= ?2 AND closes_at >= ?2
     LIMIT 1`
  )
    .bind(comp.id, currentIso)
    .first<{ id: string; name: string }>();

  if (!activeBatch) {
    throw new AppError("REGISTRATION_CLOSED", 400);
  }

  // 3. Generate unique team code
  let teamCode = generateTeamCode();
  for (let i = 0; i < 5; i++) {
    const codeTaken = await c.env.DB.prepare(
      "SELECT 1 FROM teams WHERE code = ?1 LIMIT 1"
    )
      .bind(teamCode)
      .first();
    if (!codeTaken) break;
    teamCode = generateTeamCode();
  }

  const teamId = newId("team");

  // 4. Insert team and leader member
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO teams (id, competition_id, batch_id, name, code, visibility, leader_user_id, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, 'private', ?6, ?7)`
    ).bind(
      teamId,
      comp.id,
      activeBatch.id,
      body.teamName,
      teamCode,
      authUser.id,
      currentIso
    ),
    c.env.DB.prepare(
      `INSERT INTO team_members (team_id, user_id, competition_id, role, joined_at)
       VALUES (?1, ?2, ?3, 'leader', ?4)`
    ).bind(teamId, authUser.id, comp.id, currentIso),
  ]);

  const team = await loadTeamForUser(c.env.DB, comp.id, authUser.id);
  return created(c, team!);
});

// POST /competitions/:id/team/join (Join by code)
teamRoutes.post("/:id/team/join", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;
  const body = parseBody(joinTeamSchema, await c.req.json());

  const currentIso = nowIsoWib();
  const normalizedCode = body.teamCode.toUpperCase().trim();

  // Find team by code in this competition
  const team = await c.env.DB.prepare(
    `SELECT t.id, t.batch_id, b.closes_at
     FROM teams t
     JOIN competition_batches b ON b.id = t.batch_id
     WHERE t.competition_id = ?1 AND UPPER(t.code) = ?2
     LIMIT 1`
  )
    .bind(comp.id, normalizedCode)
    .first<{ id: string; batch_id: string; closes_at: string }>();

  if (!team) {
    throw new AppError("TEAM_CODE_INVALID", 400);
  }

  if (team.closes_at < currentIso) {
    throw new AppError("REGISTRATION_CLOSED", 400);
  }

  // Check if user already in a team
  const existingMember = await c.env.DB.prepare(
    "SELECT 1 FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first();

  if (existingMember) {
    throw new AppError("ALREADY_IN_TEAM", 400);
  }

  // Atomic insert with max team members check
  const insertResult = await c.env.DB.prepare(
    `INSERT INTO team_members (team_id, user_id, competition_id, role, joined_at)
     SELECT ?1, ?2, ?3, 'member', ?4
     WHERE (SELECT COUNT(*) FROM team_members WHERE team_id = ?1) < (SELECT max_team_members FROM competitions WHERE id = ?3)`
  )
    .bind(team.id, authUser.id, comp.id, currentIso)
    .run();

  if (insertResult.meta.changes === 0) {
    throw new AppError("TEAM_FULL", 400);
  }

  const fullTeam = await loadTeamForUser(c.env.DB, comp.id, authUser.id);
  return ok(c, fullTeam!);
});

// GET /competitions/:id/team/public
teamRoutes.get("/:id/team/public", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);

  const rows = await c.env.DB.prepare(
    `SELECT t.id as team_id, t.name as team_name,
            COUNT(m.user_id) as member_count,
            c.max_team_members as max_member
     FROM teams t
     JOIN competitions c ON c.id = t.competition_id
     LEFT JOIN team_members m ON m.team_id = t.id
     WHERE t.competition_id = ?1 AND t.visibility = 'public'
     GROUP BY t.id
     ORDER BY t.created_at DESC`
  )
    .bind(comp.id)
    .all<{
      team_id: string;
      team_name: string;
      member_count: number;
      max_member: number;
    }>();

  return ok(
    c,
    rows.results.map((r) => ({
      teamId: r.team_id,
      teamName: r.team_name,
      memberCount: r.member_count,
      maxMember: r.max_member,
    }))
  );
});

// POST /competitions/:id/team/join-public
teamRoutes.post("/:id/team/join-public", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;
  const body = parseBody(joinPublicTeamSchema, await c.req.json());

  const currentIso = nowIsoWib();

  // Find team and verify it is public
  const team = await c.env.DB.prepare(
    `SELECT t.id, t.visibility, b.closes_at
     FROM teams t
     JOIN competition_batches b ON b.id = t.batch_id
     WHERE t.id = ?1 AND t.competition_id = ?2
     LIMIT 1`
  )
    .bind(body.teamId, comp.id)
    .first<{ id: string; visibility: string; closes_at: string }>();

  if (!team || team.visibility !== "public") {
    throw new AppError("TEAM_NOT_PUBLIC", 400);
  }

  if (team.closes_at < currentIso) {
    throw new AppError("REGISTRATION_CLOSED", 400);
  }

  const existingMember = await c.env.DB.prepare(
    "SELECT 1 FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first();

  if (existingMember) {
    throw new AppError("ALREADY_IN_TEAM", 400);
  }

  const insertResult = await c.env.DB.prepare(
    `INSERT INTO team_members (team_id, user_id, competition_id, role, joined_at)
     SELECT ?1, ?2, ?3, 'member', ?4
     WHERE (SELECT COUNT(*) FROM team_members WHERE team_id = ?1) < (SELECT max_team_members FROM competitions WHERE id = ?3)`
  )
    .bind(team.id, authUser.id, comp.id, currentIso)
    .run();

  if (insertResult.meta.changes === 0) {
    throw new AppError("TEAM_FULL", 400);
  }

  const fullTeam = await loadTeamForUser(c.env.DB, comp.id, authUser.id);
  return ok(c, fullTeam!);
});

// PATCH /competitions/:id/team/visibility
teamRoutes.patch("/:id/team/visibility", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;
  const body = parseBody(setVisibilitySchema, await c.req.json());

  const mem = await c.env.DB.prepare(
    "SELECT team_id, role FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first<{ team_id: string; role: "leader" | "member" }>();

  if (!mem) {
    throw new AppError("NOT_FOUND", 404, "Belum punya tim di kompetisi ini");
  }

  if (mem.role !== "leader") {
    throw new AppError("NOT_TEAM_LEADER", 403);
  }

  await c.env.DB.prepare("UPDATE teams SET visibility = ?1 WHERE id = ?2")
    .bind(body.visibility, mem.team_id)
    .run();

  return ok(c, { visibility: body.visibility });
});

// DELETE /competitions/:id/team/members/:userId
teamRoutes.delete("/:id/team/members/:userId", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const targetUserId = c.req.param("userId");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;

  const leaderMem = await c.env.DB.prepare(
    "SELECT team_id, role FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first<{ team_id: string; role: "leader" | "member" }>();

  if (!leaderMem) {
    throw new AppError("NOT_FOUND", 404, "Belum punya tim di kompetisi ini");
  }

  if (leaderMem.role !== "leader") {
    throw new AppError("NOT_TEAM_LEADER", 403);
  }

  if (targetUserId === authUser.id) {
    throw new AppError("VALIDATION_ERROR", 400, "Ketua tim tidak dapat mengeluarkan dirinya sendiri", {
      userId: "Ketua tim tidak dapat mengeluarkan dirinya sendiri",
    });
  }

  const targetMem = await c.env.DB.prepare(
    "SELECT 1 FROM team_members WHERE team_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(leaderMem.team_id, targetUserId)
    .first();

  if (!targetMem) {
    throw new AppError("NOT_FOUND", 404, "Member tidak ditemukan di tim ini");
  }

  const team = await c.env.DB.prepare("SELECT name FROM teams WHERE id = ?1 LIMIT 1")
    .bind(leaderMem.team_id)
    .first<{ name: string }>();

  const currentIso = nowIsoWib();
  const notifId = newId("ntf");
  const payload = JSON.stringify({
    teamName: team?.name || "Tim",
    competitionId: comp.id,
    message: `Kamu Bukan Lagi Bagian dari Grup ${team?.name || "Tim"}`,
  });

  // Remove member and delete their individual submissions for this competition
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM team_members WHERE team_id = ?1 AND user_id = ?2").bind(
      leaderMem.team_id,
      targetUserId
    ),
    c.env.DB.prepare(
      `DELETE FROM requirement_submissions
       WHERE user_id = ?1 AND template_id IN (SELECT id FROM requirement_templates WHERE competition_id = ?2)`
    ).bind(targetUserId, comp.id),
    c.env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, payload, created_at)
       VALUES (?1, ?2, 'removed_from_team', ?3, ?4)`
    ).bind(notifId, targetUserId, payload, currentIso),
  ]);

  return ok(c, null, "Member berhasil dihapus");
});
