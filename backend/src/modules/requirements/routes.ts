import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { AppError } from "../../lib/errors";
import { ok } from "../../lib/response";
import { toWib, nowIsoWib } from "../../lib/time";
import { resolveCompetition } from "../../lib/resolve";
import { newId } from "../../lib/ids";
import { validateUploadedFile, sanitizeFileName } from "../../lib/files";
import { generateSignedFileUrl } from "../../lib/signedUrl";

export const requirementRoutes = new Hono<AppContext>();

interface TemplateRow {
  id: string;
  competition_id: string;
  name: string;
  type: "group" | "individual";
  due_at: string;
  instructions: string;
  accepted_formats: string;
}

interface SubmissionRow {
  id: string;
  template_id: string;
  team_id: string | null;
  user_id: string | null;
  status: "pending" | "accepted" | "rejected";
  file_key: string | null;
  file_name: string | null;
  rejection_reason: string | null;
}

requirementRoutes.get("/:id/requirements", requireAuth, async (c) => {
  const compIdOrSlug = c.req.param("id");
  const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
  const authUser = c.get("user")!;
  const origin = new URL(c.req.url).origin;

  const mem = await c.env.DB.prepare(
    "SELECT team_id FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(comp.id, authUser.id)
    .first<{ team_id: string }>();

  if (!mem) {
    throw new AppError("NOT_FOUND", 404, "Kamu belum bergabung di tim untuk kompetisi ini");
  }

  const templates = await c.env.DB.prepare(
    `SELECT id, competition_id, name, type, due_at, instructions, accepted_formats
     FROM requirement_templates
     WHERE competition_id = ?1
     ORDER BY sort_order ASC`
  )
    .bind(comp.id)
    .all<TemplateRow>();

  const items = await Promise.all(
    templates.results.map(async (tmpl) => {
      let sub: SubmissionRow | null = null;
      if (tmpl.type === "group") {
        sub = await c.env.DB.prepare(
          `SELECT id, template_id, team_id, user_id, status, file_key, file_name, rejection_reason
           FROM requirement_submissions
           WHERE template_id = ?1 AND team_id = ?2 LIMIT 1`
        )
          .bind(tmpl.id, mem.team_id)
          .first<SubmissionRow>();
      } else {
        sub = await c.env.DB.prepare(
          `SELECT id, template_id, team_id, user_id, status, file_key, file_name, rejection_reason
           FROM requirement_submissions
           WHERE template_id = ?1 AND user_id = ?2 LIMIT 1`
        )
          .bind(tmpl.id, authUser.id)
          .first<SubmissionRow>();
      }

      let fileObj: { url: string; fileName: string } | null = null;
      if (sub?.file_key) {
        const signedUrl = await generateSignedFileUrl(
          origin,
          sub.file_key,
          c.env.FILE_SIGNING_SECRET
        );
        fileObj = {
          url: signedUrl,
          fileName: sub.file_name ?? "document",
        };
      }

      return {
        requirementId: tmpl.id,
        name: tmpl.name,
        type: tmpl.type,
        status: sub?.status ?? "pending",
        dueDate: toWib(tmpl.due_at),
        instructions: tmpl.instructions,
        rejectionReason: sub?.status === "rejected" ? sub.rejection_reason : null,
        acceptedFormats: JSON.parse(tmpl.accepted_formats),
        file: fileObj,
      };
    })
  );

  return ok(c, items);
});

// POST /competitions/:id/requirements/:requirementId/upload
requirementRoutes.post(
  "/:id/requirements/:requirementId/upload",
  requireAuth,
  async (c) => {
    const compIdOrSlug = c.req.param("id");
    const requirementId = c.req.param("requirementId");
    const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
    const authUser = c.get("user")!;
    const origin = new URL(c.req.url).origin;

    const tmpl = await c.env.DB.prepare(
      `SELECT id, competition_id, name, type, due_at, instructions, accepted_formats
       FROM requirement_templates
       WHERE id = ?1 AND competition_id = ?2 LIMIT 1`
    )
      .bind(requirementId, comp.id)
      .first<TemplateRow>();

    if (!tmpl) {
      throw new AppError("NOT_FOUND", 404, "Persyaratan tidak ditemukan");
    }

    const mem = await c.env.DB.prepare(
      "SELECT team_id FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
    )
      .bind(comp.id, authUser.id)
      .first<{ team_id: string }>();

    if (!mem) {
      throw new AppError("NOT_FOUND", 404, "Kamu belum bergabung di tim untuk kompetisi ini");
    }

    // Check deadline
    const currentIso = nowIsoWib();
    if (new Date().getTime() >= new Date(tmpl.due_at).getTime()) {
      throw new AppError("DEADLINE_PASSED", 400);
    }

    // Check existing submission lock
    let existingSub: SubmissionRow | null = null;
    if (tmpl.type === "group") {
      existingSub = await c.env.DB.prepare(
        `SELECT id, status, file_key
         FROM requirement_submissions
         WHERE template_id = ?1 AND team_id = ?2 LIMIT 1`
      )
        .bind(tmpl.id, mem.team_id)
        .first<SubmissionRow>();
    } else {
      existingSub = await c.env.DB.prepare(
        `SELECT id, status, file_key
         FROM requirement_submissions
         WHERE template_id = ?1 AND user_id = ?2 LIMIT 1`
      )
        .bind(tmpl.id, authUser.id)
        .first<SubmissionRow>();
    }

    if (existingSub?.status === "accepted") {
      throw new AppError("REQUIREMENT_LOCKED", 400);
    }

    // Parse form data
    const formData = await c.req.formData();
    const rawFile = formData.get("file");
    if (!(rawFile instanceof File)) {
      throw new AppError("VALIDATION_ERROR", 400, "File wajib diunggah", {
        file: "File wajib diunggah",
      });
    }

    const allowedFormats: string[] = JSON.parse(tmpl.accepted_formats);
    const { ext, mime, buffer } = await validateUploadedFile(rawFile, allowedFormats);

    const safeName = sanitizeFileName(rawFile.name);
    const fileKey = `submissions/${comp.id}/${tmpl.id}/${newId("fl")}.${ext}`;

    // Put to R2
    await c.env.FILES.put(fileKey, buffer, {
      httpMetadata: { contentType: mime },
    });

    // Delete old file if present
    if (existingSub?.file_key) {
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(c.env.FILES.delete(existingSub.file_key).catch(() => {}));
      } else {
        await c.env.FILES.delete(existingSub.file_key).catch(() => {});
      }
    }

    const timestamp = nowIsoWib();
    if (existingSub) {
      await c.env.DB.prepare(
        `UPDATE requirement_submissions
         SET status = 'pending',
             file_key = ?1,
             file_name = ?2,
             file_size = ?3,
             file_mime = ?4,
             rejection_reason = NULL,
             submitted_at = ?5,
             user_id = ?6,
             updated_at = ?5
         WHERE id = ?7`
      )
        .bind(
          fileKey,
          safeName,
          buffer.byteLength,
          mime,
          timestamp,
          authUser.id,
          existingSub.id
        )
        .run();
    } else {
      const subId = newId("sub");
      await c.env.DB.prepare(
        `INSERT INTO requirement_submissions
         (id, template_id, team_id, user_id, status, file_key, file_name, file_size, file_mime, rejection_reason, submitted_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 'pending', ?5, ?6, ?7, ?8, NULL, ?9, ?9)`
      )
        .bind(
          subId,
          tmpl.id,
          tmpl.type === "group" ? mem.team_id : null,
          authUser.id,
          fileKey,
          safeName,
          buffer.byteLength,
          mime,
          timestamp
        )
        .run();
    }

    const signedUrl = await generateSignedFileUrl(
      origin,
      fileKey,
      c.env.FILE_SIGNING_SECRET
    );

    return ok(c, {
      requirementId: tmpl.id,
      name: tmpl.name,
      type: tmpl.type,
      status: "pending",
      dueDate: toWib(tmpl.due_at),
      instructions: tmpl.instructions,
      rejectionReason: null,
      acceptedFormats: allowedFormats,
      file: {
        url: signedUrl,
        fileName: safeName,
      },
    });
  }
);

// DELETE /competitions/:id/requirements/:requirementId
requirementRoutes.delete(
  "/:id/requirements/:requirementId",
  requireAuth,
  async (c) => {
    const compIdOrSlug = c.req.param("id");
    const requirementId = c.req.param("requirementId");
    const comp = await resolveCompetition(c.env.DB, compIdOrSlug);
    const authUser = c.get("user")!;

    const tmpl = await c.env.DB.prepare(
      `SELECT id, competition_id, name, type, due_at, instructions, accepted_formats
       FROM requirement_templates
       WHERE id = ?1 AND competition_id = ?2 LIMIT 1`
    )
      .bind(requirementId, comp.id)
      .first<TemplateRow>();

    if (!tmpl) {
      throw new AppError("NOT_FOUND", 404, "Persyaratan tidak ditemukan");
    }

    const mem = await c.env.DB.prepare(
      "SELECT team_id FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
    )
      .bind(comp.id, authUser.id)
      .first<{ team_id: string }>();

    if (!mem) {
      throw new AppError("NOT_FOUND", 404, "Kamu belum bergabung di tim untuk kompetisi ini");
    }

    // Check deadline
    if (new Date().getTime() >= new Date(tmpl.due_at).getTime()) {
      throw new AppError("DEADLINE_PASSED", 400);
    }

    let existingSub: SubmissionRow | null = null;
    if (tmpl.type === "group") {
      existingSub = await c.env.DB.prepare(
        `SELECT id, status, file_key
         FROM requirement_submissions
         WHERE template_id = ?1 AND team_id = ?2 LIMIT 1`
      )
        .bind(tmpl.id, mem.team_id)
        .first<SubmissionRow>();
    } else {
      existingSub = await c.env.DB.prepare(
        `SELECT id, status, file_key
         FROM requirement_submissions
         WHERE template_id = ?1 AND user_id = ?2 LIMIT 1`
      )
        .bind(tmpl.id, authUser.id)
        .first<SubmissionRow>();
    }

    if (existingSub?.status === "accepted") {
      throw new AppError("REQUIREMENT_LOCKED", 400);
    }

    if (existingSub?.file_key) {
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(c.env.FILES.delete(existingSub.file_key).catch(() => {}));
      } else {
        await c.env.FILES.delete(existingSub.file_key).catch(() => {});
      }
      const timestamp = nowIsoWib();
      await c.env.DB.prepare(
        `UPDATE requirement_submissions
         SET status = 'pending',
             file_key = NULL,
             file_name = NULL,
             file_size = NULL,
             file_mime = NULL,
             rejection_reason = NULL,
             updated_at = ?1
         WHERE id = ?2`
      )
        .bind(timestamp, existingSub.id)
        .run();
    }

    return ok(c, {
      requirementId: tmpl.id,
      name: tmpl.name,
      type: tmpl.type,
      status: "pending",
      dueDate: toWib(tmpl.due_at),
      instructions: tmpl.instructions,
      rejectionReason: null,
      acceptedFormats: JSON.parse(tmpl.accepted_formats),
      file: null,
    });
  }
);
