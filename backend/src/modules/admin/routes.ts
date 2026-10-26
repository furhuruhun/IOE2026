import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth, requireRole } from "../../middleware/auth";
import { ok, created } from "../../lib/response";
import { AppError } from "../../lib/errors";
import { nowIsoWib } from "../../lib/time";
import { newId } from "../../lib/ids";
import { z } from "zod";
import { parseBody } from "../../lib/validate";

export const adminRoutes = new Hono<AppContext>();

adminRoutes.use("*", requireAuth, requireRole("panitia"));

const reviewSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  reason: z.string().optional(),
});

const announcementSchema = z.object({
  competitionId: z.string().optional(),
  body: z.string().min(1, "Konten pengumuman wajib diisi"),
});

// GET /admin/registrations
adminRoutes.get("/registrations", async (c) => {
  const compTeams = await c.env.DB.prepare(
    `SELECT t.id as team_id, t.name as team_name, t.code as team_code,
            c.name as competition_name, b.name as batch_name,
            u.name as leader_name, u.email as leader_email, t.created_at
     FROM teams t
     JOIN competitions c ON c.id = t.competition_id
     JOIN competition_batches b ON b.id = t.batch_id
     JOIN users u ON u.id = t.leader_user_id
     ORDER BY t.created_at DESC`
  ).all();

  const eventRegs = await c.env.DB.prepare(
    `SELECT r.id as registration_id, e.name as event_name, r.session_type,
            u.name as participant_name, u.email, r.phone, r.institution, r.domicile, r.created_at
     FROM event_registrations r
     JOIN events e ON e.id = r.event_id
     JOIN users u ON u.id = r.user_id
     ORDER BY r.created_at DESC`
  ).all();

  return ok(c, {
    teams: compTeams.results,
    eventRegistrations: eventRegs.results,
  });
});

// GET /admin/registrations/export
adminRoutes.get("/registrations/export", async (c) => {
  const compTeams = await c.env.DB.prepare(
    `SELECT t.id, t.name as team_name, t.code as team_code,
            c.name as competition_name, b.name as batch_name,
            u.name as leader_name, u.email as leader_email, t.created_at
     FROM teams t
     JOIN competitions c ON c.id = t.competition_id
     JOIN competition_batches b ON b.id = t.batch_id
     JOIN users u ON u.id = t.leader_user_id
     ORDER BY t.created_at DESC`
  ).all<{
    id: string;
    team_name: string;
    team_code: string;
    competition_name: string;
    batch_name: string;
    leader_name: string;
    leader_email: string;
    created_at: string;
  }>();

  let csv = "Team ID,Competition,Team Name,Team Code,Batch,Leader Name,Leader Email,Created At\n";
  for (const t of compTeams.results) {
    csv += `"${t.id}","${t.competition_name}","${t.team_name}","${t.team_code}","${t.batch_name}","${t.leader_name}","${t.leader_email}","${t.created_at}"\n`;
  }

  const headers = new Headers();
  headers.set("Content-Type", "text/csv; charset=utf-8");
  headers.set("Content-Disposition", 'attachment; filename="teams-export.csv"');
  return new Response(csv, { headers });
});

// PATCH /admin/submissions/:submissionId
adminRoutes.patch("/submissions/:submissionId", async (c) => {
  const submissionId = c.req.param("submissionId");
  const authUser = c.get("user")!;
  const body = parseBody(reviewSchema, await c.req.json());

  const sub = await c.env.DB.prepare(
    "SELECT id, status, file_key FROM requirement_submissions WHERE id = ?1 LIMIT 1"
  )
    .bind(submissionId)
    .first<{ id: string; status: string; file_key: string | null }>();

  if (!sub) {
    throw new AppError("NOT_FOUND", 404, "Submission tidak ditemukan");
  }

  const timestamp = nowIsoWib();

  if (body.status === "rejected") {
    if (!body.reason || !body.reason.trim()) {
      throw new AppError("VALIDATION_ERROR", 400, "Alasan penolakan wajib diisi", {
        reason: "Alasan penolakan wajib diisi",
      });
    }

    // Auto-delete file on rejection as per PRD/USER_FLOWS
    if (sub.file_key) {
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(c.env.FILES.delete(sub.file_key).catch(() => {}));
      } else {
        await c.env.FILES.delete(sub.file_key).catch(() => {});
      }
    }

    await c.env.DB.prepare(
      `UPDATE requirement_submissions
       SET status = 'rejected',
           file_key = NULL,
           file_name = NULL,
           file_size = NULL,
           file_mime = NULL,
           rejection_reason = ?1,
           reviewed_by = ?2,
           reviewed_at = ?3,
           updated_at = ?3
       WHERE id = ?4`
    )
      .bind(body.reason.trim(), authUser.id, timestamp, submissionId)
      .run();
  } else {
    await c.env.DB.prepare(
      `UPDATE requirement_submissions
       SET status = 'accepted',
           rejection_reason = NULL,
           reviewed_by = ?1,
           reviewed_at = ?2,
           updated_at = ?2
       WHERE id = ?3`
    )
      .bind(authUser.id, timestamp, submissionId)
      .run();
  }

  return ok(c, {
    submissionId,
    status: body.status,
    reviewedAt: timestamp,
  });
});

// POST /admin/announcements
adminRoutes.post("/announcements", async (c) => {
  const authUser = c.get("user")!;
  const body = parseBody(announcementSchema, await c.req.json());
  const timestamp = nowIsoWib();
  const id = newId("anc");

  await c.env.DB.prepare(
    `INSERT INTO announcements (id, competition_id, body, created_by, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5)`
  )
    .bind(id, body.competitionId || null, body.body, authUser.id, timestamp)
    .run();

  return created(c, { id, competitionId: body.competitionId, body: body.body, createdAt: timestamp });
});
