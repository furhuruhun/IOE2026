import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth, requireRole } from "../../middleware/auth";
import { ok, created } from "../../lib/response";
import { AppError } from "../../lib/errors";
import { nowIsoWib, toWib } from "../../lib/time";
import { newId } from "../../lib/ids";
import { z } from "zod";
import { parseBody } from "../../lib/validate";
import { hashPassword } from "../../lib/password";
import { generateSignedFileUrl } from "../../lib/signedUrl";

export const adminRoutes = new Hono<AppContext>();

adminRoutes.use("*", requireAuth, requireRole("panitia"));

// Named records and their current values for the admin schedule editors.
adminRoutes.get("/schedules", async (c) => {
  const [competitions, batches, timeline, events] = await Promise.all([
    c.env.DB.prepare("SELECT id, name FROM competitions ORDER BY name").all(),
    c.env.DB.prepare("SELECT id, competition_id AS competitionId, name, opens_at AS opensAt, closes_at AS closesAt FROM competition_batches ORDER BY opens_at, id").all(),
    c.env.DB.prepare("SELECT id, competition_id AS competitionId, label, occurs_at AS occursAt, show_in_calendar AS showInCalendar, sort_order AS sortOrder FROM competition_timeline_items ORDER BY sort_order, id").all(),
    c.env.DB.prepare("SELECT id, name, registration_opens_at AS opensAt, registration_closes_at AS closesAt FROM events ORDER BY name").all(),
  ]);
  return ok(c, { competitions: competitions.results, batches: batches.results, timeline: timeline.results, events: events.results });
});

const reviewSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  reason: z.string().optional(),
});

const announcementSchema = z.object({
  competitionId: z.string().optional(),
  body: z.string().min(1, "Konten pengumuman wajib diisi"),
});

const deadlineSchema = z.object({
  dueAt: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Format deadline tidak valid"),
});

const dateInput = z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Format tanggal tidak valid");
const registrationWindowSchema = z.object({
  opensAt: dateInput.optional(),
  closesAt: dateInput.optional(),
}).refine((value) => value.opensAt !== undefined || value.closesAt !== undefined, "Minimal satu tanggal wajib diisi");

const requirementSchema = z.object({
  name: z.string().trim().min(1, "Nama submission wajib diisi"),
  type: z.enum(["group", "individual"]),
  stage: z.enum(["registration", "submission", "final"]),
  dueAt: dateInput,
  instructions: z.string().trim().default(""),
  acceptedFormats: z.array(z.enum(["jpg", "png", "pdf", "pptx", "zip"])).min(1, "Pilih minimal satu format"),
  sortOrder: z.number().int().min(0).default(0),
});

const qualificationSchema = z.object({
  status: z.enum(["pendaftar", "peserta", "finalis", "pending", "passed", "not_passed"]),
});

const timelineUpdateSchema = z.object({
  label: z.string().trim().min(1).optional(),
  occursAt: dateInput.optional(),
  showInCalendar: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
}).refine((value) => Object.keys(value).length > 0, "Minimal satu perubahan wajib diisi");

const adminPasswordSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").toLowerCase(),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

const allowedSubmissionStatuses = new Set(["pending", "accepted", "rejected"]);

interface AdminSubmissionRow {
  id: string;
  status: string;
  file_key: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  requirement_id: string;
  requirement_name: string;
  requirement_type: string;
  stage: "registration" | "submission" | "final";
  due_at: string;
  competition_id: string;
  competition_name: string;
  team_id: string | null;
  team_name: string | null;
  team_code: string | null;
  user_id: string | null;
  participant_name: string | null;
  participant_email: string | null;
  updated_at: string;
}

// GET /admin/submissions
adminRoutes.get("/submissions", async (c) => {
  const status = c.req.query("status");
  const competitionId = c.req.query("competitionId");
  if (status && !allowedSubmissionStatuses.has(status)) {
    throw new AppError("VALIDATION_ERROR", 400, "Status submission tidak valid");
  }

  const conditions: string[] = [];
  const binds: string[] = [];
  if (status) {
    conditions.push(`s.status = ?${binds.length + 1}`);
    binds.push(status);
  }
  if (competitionId) {
    conditions.push(`t.competition_id = ?${binds.length + 1}`);
    binds.push(competitionId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await c.env.DB.prepare(
    `SELECT s.id, s.status, s.file_key, s.file_name, s.file_size, s.file_mime,
            s.rejection_reason, s.submitted_at, s.reviewed_at,
            rt.id AS requirement_id, rt.name AS requirement_name, rt.type AS requirement_type,
            rt.stage, rt.due_at, c.id AS competition_id, c.name AS competition_name,
            s.team_id, tm.name AS team_name, tm.code AS team_code,
            u.id AS user_id, u.name AS participant_name, u.email AS participant_email
     FROM requirement_submissions s
     JOIN requirement_templates rt ON rt.id = s.template_id
     JOIN competitions c ON c.id = rt.competition_id
     LEFT JOIN teams tm ON tm.id = s.team_id
     LEFT JOIN users u ON u.id = s.user_id
     ${where}
     ORDER BY COALESCE(s.submitted_at, s.updated_at) DESC`
  )
    .bind(...binds)
    .all<AdminSubmissionRow>();

  const origin = new URL(c.req.url).origin;
  const submissions = await Promise.all(
    rows.results.map(async (row) => ({
      ...row,
      dueAt: row.due_at,
      fileUrl: row.file_key
        ? await generateSignedFileUrl(origin, row.file_key, c.env.FILE_SIGNING_SECRET)
        : null,
    }))
  );

  return ok(c, submissions);
});

// GET /admin/competitions/:competitionId/requirements
adminRoutes.get("/competitions/:competitionId/requirements", async (c) => {
  const competitionId = c.req.param("competitionId");
  const rows = await c.env.DB.prepare(
    `SELECT id, competition_id AS competitionId, name, type, stage, due_at AS dueAt,
            instructions, accepted_formats AS acceptedFormats, sort_order AS sortOrder
     FROM requirement_templates WHERE competition_id = ?1 ORDER BY stage, sort_order, id`
  ).bind(competitionId).all<{
    id: string; competitionId: string; name: string; type: "group" | "individual";
    stage: "registration" | "submission" | "final"; dueAt: string; instructions: string;
    acceptedFormats: string; sortOrder: number;
  }>();
  return ok(c, rows.results.map((row) => ({
    ...row,
    dueAt: toWib(row.dueAt),
    acceptedFormats: JSON.parse(row.acceptedFormats),
  })));
});

// POST /admin/competitions/:competitionId/requirements
adminRoutes.post("/competitions/:competitionId/requirements", async (c) => {
  const competitionId = c.req.param("competitionId");
  const body = parseBody(requirementSchema, await c.req.json());
  const competition = await c.env.DB.prepare("SELECT id FROM competitions WHERE id = ?1 LIMIT 1").bind(competitionId).first<{ id: string }>();
  if (!competition) throw new AppError("NOT_FOUND", 404, "Kompetisi tidak ditemukan");
  const id = newId("req");
  const dueAt = toWib(body.dueAt);
  await c.env.DB.prepare(
    `INSERT INTO requirement_templates
      (id, competition_id, name, type, stage, due_at, instructions, accepted_formats, sort_order)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  ).bind(id, competitionId, body.name, body.type, body.stage, dueAt, body.instructions, JSON.stringify(body.acceptedFormats), body.sortOrder).run();
  return created(c, { requirementId: id, competitionId, ...body, dueAt });
});

// PATCH /admin/requirements/:requirementId
adminRoutes.patch("/requirements/:requirementId", async (c) => {
  const requirementId = c.req.param("requirementId");
  const body = parseBody(requirementSchema.partial(), await c.req.json());
  const existing = await c.env.DB.prepare(
    "SELECT id, name, type, stage, due_at, instructions, accepted_formats, sort_order FROM requirement_templates WHERE id = ?1 LIMIT 1"
  ).bind(requirementId).first<{ id: string; name: string; type: "group" | "individual"; stage: "registration" | "submission" | "final"; due_at: string; instructions: string; accepted_formats: string; sort_order: number }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Submission tidak ditemukan");
  const values = {
    name: body.name ?? existing.name,
    type: body.type ?? existing.type,
    stage: body.stage ?? existing.stage,
    dueAt: toWib(body.dueAt ?? existing.due_at),
    instructions: body.instructions ?? existing.instructions,
    acceptedFormats: body.acceptedFormats ?? JSON.parse(existing.accepted_formats),
    sortOrder: body.sortOrder ?? existing.sort_order,
  };
  await c.env.DB.prepare(
    `UPDATE requirement_templates SET name = ?1, type = ?2, stage = ?3, due_at = ?4,
      instructions = ?5, accepted_formats = ?6, sort_order = ?7 WHERE id = ?8`
  ).bind(values.name, values.type, values.stage, values.dueAt, values.instructions, JSON.stringify(values.acceptedFormats), values.sortOrder, requirementId).run();
  return ok(c, { requirementId, ...values });
});

// DELETE /admin/requirements/:requirementId
adminRoutes.delete("/requirements/:requirementId", async (c) => {
  const requirementId = c.req.param("requirementId");
  const existing = await c.env.DB.prepare(
    "SELECT id FROM requirement_templates WHERE id = ?1 LIMIT 1"
  ).bind(requirementId).first<{ id: string }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Submission tidak ditemukan");

  await c.env.DB.prepare("DELETE FROM requirement_templates WHERE id = ?1").bind(requirementId).run();
  return ok(c, { success: true, message: "Submission berhasil dihapus" });
});

// GET /admin/competitions/:competitionId/qualifications
adminRoutes.get("/competitions/:competitionId/qualifications", async (c) => {
  const competitionId = c.req.param("competitionId");
  const rows = await c.env.DB.prepare(
    `SELECT t.id AS teamId, t.name AS teamName, t.code AS teamCode,
            u.name AS leaderName,
            COALESCE(t.status, CASE WHEN q.status = 'passed' THEN 'finalis' ELSE 'pendaftar' END) AS status,
            q.updated_at AS updatedAt
     FROM teams t JOIN users u ON u.id = t.leader_user_id
     LEFT JOIN competition_qualifications q ON q.team_id = t.id AND q.competition_id = t.competition_id
     WHERE t.competition_id = ?1 ORDER BY t.created_at ASC`
  ).bind(competitionId).all();
  return ok(c, rows.results);
});

// PATCH /admin/competitions/:competitionId/qualifications/:teamId
adminRoutes.patch("/competitions/:competitionId/qualifications/:teamId", async (c) => {
  const competitionId = c.req.param("competitionId");
  const teamId = c.req.param("teamId");
  const body = parseBody(qualificationSchema, await c.req.json());
  const authUser = c.get("user")!;
  const team = await c.env.DB.prepare("SELECT id FROM teams WHERE id = ?1 AND competition_id = ?2 LIMIT 1").bind(teamId, competitionId).first<{ id: string }>();
  if (!team) throw new AppError("NOT_FOUND", 404, "Tim tidak ditemukan");
  const updatedAt = nowIsoWib();
  const rawStatus = body.status;
  const mappedStatus = (rawStatus === "passed" || rawStatus === "finalis")
    ? "finalis"
    : rawStatus === "peserta"
    ? "peserta"
    : "pendaftar";


  await c.env.DB.prepare(
    `INSERT INTO competition_qualifications (competition_id, team_id, status, updated_by, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(competition_id, team_id) DO UPDATE SET status = excluded.status, updated_by = excluded.updated_by, updated_at = excluded.updated_at`
  ).bind(competitionId, teamId, mappedStatus === "finalis" ? "passed" : "pending", authUser.id, updatedAt).run();


  try {
    await c.env.DB.prepare("UPDATE teams SET status = ?1 WHERE id = ?2 AND competition_id = ?3").bind(mappedStatus, teamId, competitionId).run();
  } catch {}
  return ok(c, { competitionId, teamId, status: mappedStatus, updatedAt });
});

// PATCH /admin/requirements/:requirementId/deadline
adminRoutes.patch("/requirements/:requirementId/deadline", async (c) => {
  const requirementId = c.req.param("requirementId");
  const body = parseBody(deadlineSchema, await c.req.json());
  const dueAt = toWib(body.dueAt);
  const existing = await c.env.DB.prepare(
    "SELECT id FROM requirement_templates WHERE id = ?1 LIMIT 1"
  )
    .bind(requirementId)
    .first<{ id: string }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Requirement tidak ditemukan");

  await c.env.DB.prepare(
    "UPDATE requirement_templates SET due_at = ?1 WHERE id = ?2"
  )
    .bind(dueAt, requirementId)
    .run();

  return ok(c, { requirementId, dueAt });
});

// PATCH /admin/competition-batches/:batchId/registration-window
adminRoutes.patch("/competition-batches/:batchId/registration-window", async (c) => {
  const batchId = c.req.param("batchId");
  const body = parseBody(registrationWindowSchema, await c.req.json());
  const existing = await c.env.DB.prepare(
    "SELECT id, opens_at, closes_at FROM competition_batches WHERE id = ?1 LIMIT 1"
  ).bind(batchId).first<{ id: string; opens_at: string; closes_at: string }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Batch kompetisi tidak ditemukan");

  const opensAt = toWib(body.opensAt ?? existing.opens_at);
  const closesAt = toWib(body.closesAt ?? existing.closes_at);
  if (new Date(opensAt).getTime() > new Date(closesAt).getTime()) {
    throw new AppError("VALIDATION_ERROR", 400, "Tanggal mulai harus sebelum atau sama dengan tanggal tutup");
  }
  await c.env.DB.prepare(
    "UPDATE competition_batches SET opens_at = ?1, closes_at = ?2 WHERE id = ?3"
  ).bind(opensAt, closesAt, batchId).run();
  return ok(c, { batchId, opensAt, closesAt });
});

// PATCH /admin/events/:eventId/registration-window
adminRoutes.patch("/events/:eventId/registration-window", async (c) => {
  const eventId = c.req.param("eventId");
  const body = parseBody(registrationWindowSchema, await c.req.json());
  const existing = await c.env.DB.prepare(
    "SELECT id, registration_opens_at, registration_closes_at FROM events WHERE id = ?1 OR slug = ?1 LIMIT 1"
  ).bind(eventId).first<{ id: string; registration_opens_at: string; registration_closes_at: string }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Event tidak ditemukan");

  const opensAt = toWib(body.opensAt ?? existing.registration_opens_at);
  const closesAt = toWib(body.closesAt ?? existing.registration_closes_at);
  if (new Date(opensAt).getTime() > new Date(closesAt).getTime()) {
    throw new AppError("VALIDATION_ERROR", 400, "Tanggal mulai harus sebelum atau sama dengan tanggal tutup");
  }
  await c.env.DB.prepare(
    "UPDATE events SET registration_opens_at = ?1, registration_closes_at = ?2 WHERE id = ?3"
  ).bind(opensAt, closesAt, existing.id).run();
  return ok(c, { eventId: existing.id, opensAt, closesAt });
});

// PATCH /admin/competitions/:competitionId/timeline/:timelineId
adminRoutes.patch("/competitions/:competitionId/timeline/:timelineId", async (c) => {
  const competitionId = c.req.param("competitionId");
  const timelineId = c.req.param("timelineId");
  const body = parseBody(timelineUpdateSchema, await c.req.json());
  const existing = await c.env.DB.prepare(
    "SELECT id, label, occurs_at, show_in_calendar, sort_order FROM competition_timeline_items WHERE id = ?1 AND competition_id = ?2 LIMIT 1"
  ).bind(timelineId, competitionId).first<{ id: string; label: string; occurs_at: string; show_in_calendar: number; sort_order: number }>();
  if (!existing) throw new AppError("NOT_FOUND", 404, "Timeline kompetisi tidak ditemukan");

  const label = body.label ?? existing.label;
  const occursAt = toWib(body.occursAt ?? existing.occurs_at);
  const showInCalendar = body.showInCalendar === undefined ? existing.show_in_calendar : (body.showInCalendar ? 1 : 0);
  const sortOrder = body.sortOrder ?? existing.sort_order;
  await c.env.DB.prepare(
    "UPDATE competition_timeline_items SET label = ?1, occurs_at = ?2, show_in_calendar = ?3, sort_order = ?4 WHERE id = ?5 AND competition_id = ?6"
  ).bind(label, occursAt, showInCalendar, sortOrder, timelineId, competitionId).run();
  return ok(c, { competitionId, timelineId, label, occursAt, showInCalendar: Boolean(showInCalendar), sortOrder });
});

// POST /admin/users/password — admin reset tanpa meminta password lama peserta
adminRoutes.post("/users/password", async (c) => {
  const body = parseBody(adminPasswordSchema, await c.req.json());
  const user = await c.env.DB.prepare(
    "SELECT id, role FROM users WHERE email = ?1 LIMIT 1"
  )
    .bind(body.email)
    .first<{ id: string; role: "peserta" | "panitia" }>();

  if (!user) throw new AppError("NOT_FOUND", 404, "Peserta tidak ditemukan");
  if (user.role !== "peserta") {
    throw new AppError("VALIDATION_ERROR", 400, "Password akun panitia tidak diubah dari endpoint ini");
  }

  const passwordHash = await hashPassword(body.newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?1, updated_at = ?2, session_version = session_version + 1 WHERE id = ?3"
  )
    .bind(passwordHash, nowIsoWib(), user.id)
    .run();

  return ok(c, { email: body.email, changed: true });
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
    `SELECT r.id as registration_id, e.slug as event_slug, e.name as event_name, r.session_type,
            u.name as participant_name, u.email, r.phone, r.institution, r.domicile, r.discovery_source,
            r.cv_key, r.payment_proof_key, r.created_at
     FROM event_registrations r
     JOIN events e ON e.id = r.event_id
     JOIN users u ON u.id = r.user_id
     ORDER BY r.created_at DESC`
  ).all();

  // Berkas event disimpan pada kolom cv_key/payment_proof_key, terpisah dari
  // requirement_submissions milik kompetisi. Kembalikan URL bertanda tangan,
  // bukan key R2 mentah, agar tetap hanya dapat diakses panitia.
  const origin = new URL(c.req.url).origin;
  const eventRegistrations = await Promise.all(eventRegs.results.map(async (row) => {
    const item = row as Record<string, unknown>;
    return {
      ...item,
      cv_url: item.cv_key ? await generateSignedFileUrl(origin, String(item.cv_key), c.env.FILE_SIGNING_SECRET) : null,
      payment_proof_url: item.payment_proof_key
        ? await generateSignedFileUrl(origin, String(item.payment_proof_key), c.env.FILE_SIGNING_SECRET)
        : null,
      cv_key: undefined,
      payment_proof_key: undefined,
    };
  }));

  return ok(c, {
    teams: compTeams.results,
    eventRegistrations,
  });
});

// GET /admin/registrations/export
adminRoutes.get("/registrations/export", async (c) => {
  const kind = c.req.query("kind") ?? "teams";
  const competition = c.req.query("competition");
  const event = c.req.query("event");
  const session = c.req.query("session");
  const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const headers = new Headers();
  headers.set("Content-Type", "text/csv; charset=utf-8");
  let csv: string;
  let filename: string;

  if (kind === "events") {
    const allowedSessions = new Set(["seminar", "workshop", "day1", "day2"]);
    if (session && !allowedSessions.has(session)) {
      throw new AppError("VALIDATION_ERROR", 400, "Sesi event tidak valid");
    }
    const conditions: string[] = [];
    const binds: string[] = [];
    if (event) {
      conditions.push(`(e.slug = ?${binds.length + 1} OR e.id = ?${binds.length + 1})`);
      binds.push(event);
    }
    if (session) {
      conditions.push(`r.session_type = ?${binds.length + 1}`);
      binds.push(session);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await c.env.DB.prepare(
      `SELECT r.id AS registration_id, e.slug AS event_slug, e.name AS event_name,
              r.session_type, u.name AS participant_name, u.email, r.phone,
              r.institution, r.domicile, r.discovery_source,
              CASE WHEN r.cv_key IS NULL THEN 'No' ELSE 'Yes' END AS cv_uploaded,
              CASE WHEN r.payment_proof_key IS NULL THEN 'No' ELSE 'Yes' END AS payment_proof_uploaded,
              r.created_at
       FROM event_registrations r
       JOIN events e ON e.id = r.event_id
       JOIN users u ON u.id = r.user_id
       ${where}
       ORDER BY e.name, r.session_type, r.created_at DESC`
    ).bind(...binds).all<Record<string, unknown>>();
    csv = "Registration ID,Event,Session,Participant,Email,Phone,Institution,Domicile,Discovery Source,CV Uploaded,Payment Proof Uploaded,Created At\n";
    for (const row of rows.results) {
      csv += [row.registration_id, row.event_name, row.session_type, row.participant_name, row.email, row.phone, row.institution, row.domicile, row.discovery_source, row.cv_uploaded, row.payment_proof_uploaded, row.created_at].map(csvCell).join(",") + "\n";
    }
    const eventPart = event ? event.replace(/[^a-z0-9-]/gi, "-") : "all";
    const sessionPart = session ? `-${session}` : "";
    filename = `events-${eventPart}${sessionPart}-export.csv`;
  } else if (kind === "teams") {
    const conditions: string[] = [];
    const binds: string[] = [];
    if (competition) {
      conditions.push(`(c.slug = ?${binds.length + 1} OR c.id = ?${binds.length + 1} OR c.name = ?${binds.length + 1})`);
      binds.push(competition);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const compTeams = await c.env.DB.prepare(
      `SELECT t.id, t.name as team_name, t.code as team_code,
              c.name as competition_name, b.name as batch_name,
              u.name as leader_name, u.email as leader_email, t.created_at
       FROM teams t
       JOIN competitions c ON c.id = t.competition_id
       JOIN competition_batches b ON b.id = t.batch_id
       JOIN users u ON u.id = t.leader_user_id
       ${where}
       ORDER BY c.name, t.created_at DESC`
    ).bind(...binds).all<Record<string, unknown>>();
    csv = "Team ID,Competition,Team Name,Team Code,Batch,Leader Name,Leader Email,Created At\n";
    for (const row of compTeams.results) {
      csv += [row.id, row.competition_name, row.team_name, row.team_code, row.batch_name, row.leader_name, row.leader_email, row.created_at].map(csvCell).join(",") + "\n";
    }
    const competitionPart = competition ? competition.replace(/[^a-z0-9-]/gi, "-") : "all";
    filename = `teams-${competitionPart}-export.csv`;
  } else {
    throw new AppError("VALIDATION_ERROR", 400, "Jenis export tidak valid");
  }

  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
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
