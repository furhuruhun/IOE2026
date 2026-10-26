import { Hono } from "hono";
import type { AppContext } from "../../env";
import { optionalAuth, requireAuth } from "../../middleware/auth";
import { ok, created } from "../../lib/response";
import { toWib, nowIsoWib } from "../../lib/time";
import { resolveEvent } from "../../lib/resolve";
import { AppError } from "../../lib/errors";
import { newId } from "../../lib/ids";
import { validateUploadedFile } from "../../lib/files";

export const eventRoutes = new Hono<AppContext>();

eventRoutes.get("/", optionalAuth, async (c) => {
  const authUser = c.get("user");

  const rows = await c.env.DB.prepare(
    "SELECT id, slug, name, registration_closes_at FROM events WHERE is_published = 1 ORDER BY created_at ASC"
  ).all<{ id: string; slug: string; name: string; registration_closes_at: string }>();

  const items = await Promise.all(
    rows.results.map(async (ev) => {
      let isRegisteredByUser = false;
      if (authUser) {
        const reg = await c.env.DB.prepare(
          "SELECT 1 FROM event_registrations WHERE event_id = ?1 AND user_id = ?2 LIMIT 1"
        )
          .bind(ev.id, authUser.id)
          .first();
        isRegisteredByUser = Boolean(reg);
      }

      return {
        id: ev.id,
        slug: ev.slug,
        name: ev.name,
        deadline: toWib(ev.registration_closes_at),
        isRegisteredByUser,
      };
    })
  );

  return ok(c, items);
});

eventRoutes.get("/:slug", optionalAuth, async (c) => {
  const slug = c.req.param("slug");
  const ev = await resolveEvent(c.env.DB, slug);
  const authUser = c.get("user");

  let isRegisteredByUser = false;
  if (authUser) {
    const reg = await c.env.DB.prepare(
      "SELECT 1 FROM event_registrations WHERE event_id = ?1 AND user_id = ?2 LIMIT 1"
    )
      .bind(ev.id, authUser.id)
      .first();
    isRegisteredByUser = Boolean(reg);
  }

  const speakers = await c.env.DB.prepare(
    "SELECT id, name FROM event_speakers WHERE event_id = ?1 ORDER BY sort_order ASC"
  )
    .bind(ev.id)
    .all<{ id: string; name: string }>();

  return ok(c, {
    id: ev.id,
    slug: ev.slug,
    name: ev.name,
    deadline: toWib(ev.registration_closes_at),
    isRegisteredByUser,
    speakers: speakers.results,
  });
});

// POST /events/:id/register
eventRoutes.post("/:id/register", requireAuth, async (c) => {
  const idOrSlug = c.req.param("id");
  const ev = await resolveEvent(c.env.DB, idOrSlug);
  const authUser = c.get("user")!;
  const currentIso = nowIsoWib();

  if (ev.registration_closes_at < currentIso) {
    throw new AppError("REGISTRATION_CLOSED", 400);
  }

  const alreadyReg = await c.env.DB.prepare(
    "SELECT 1 FROM event_registrations WHERE event_id = ?1 AND user_id = ?2 LIMIT 1"
  )
    .bind(ev.id, authUser.id)
    .first();

  if (alreadyReg) {
    throw new AppError("ALREADY_REGISTERED", 400);
  }

  const formData = await c.req.formData();
  const sessionType = (formData.get("sessionType") as string) || "seminar";
  const speakerId = (formData.get("speakerId") as string) || null;
  const phone = (formData.get("phone") as string)?.trim();
  const lineId = (formData.get("lineId") as string)?.trim() || null;
  const institution = (formData.get("institution") as string)?.trim();
  const domicile = (formData.get("domicile") as string)?.trim();

  const validationFields: Record<string, string> = {};
  if (!phone) validationFields.phone = "Nomor WhatsApp wajib diisi";
  if (!institution) validationFields.institution = "Institusi wajib diisi";
  if (!domicile) validationFields.domicile = "Domisili wajib diisi";

  if (sessionType !== "seminar" && sessionType !== "workshop") {
    validationFields.sessionType = "Sesi harus seminar atau workshop";
  }

  // Check speaker for workshop
  if (sessionType === "workshop") {
    const speakerCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM event_speakers WHERE event_id = ?1"
    )
      .bind(ev.id)
      .first<{ cnt: number }>();

    if ((speakerCount?.cnt ?? 0) > 1 && !speakerId) {
      validationFields.speakerId = "Pilih pembicara / sesi workshop";
    }
  }

  if (Object.keys(validationFields).length > 0) {
    throw new AppError("VALIDATION_ERROR", 400, undefined, validationFields);
  }

  // Handle CV file
  const rawCv = formData.get("cvFile");
  let cvKey: string | null = null;
  if (rawCv instanceof File && rawCv.size > 0) {
    const { ext, mime, buffer } = await validateUploadedFile(rawCv, ["pdf"]);
    cvKey = `events/${ev.id}/${newId("cv")}.${ext}`;
    await c.env.FILES.put(cvKey, buffer, {
      httpMetadata: { contentType: mime },
    });
  }

  // Handle payment proof if event is paid
  const rawPayment = formData.get("paymentProof");
  let paymentProofKey: string | null = null;
  if (ev.is_paid === 1) {
    if (!(rawPayment instanceof File) || rawPayment.size === 0) {
      throw new AppError("VALIDATION_ERROR", 400, "Bukti pembayaran wajib diunggah", {
        paymentProof: "Bukti pembayaran wajib diunggah",
      });
    }
    const { ext, mime, buffer } = await validateUploadedFile(rawPayment, ["jpg", "png"]);
    paymentProofKey = `events/${ev.id}/${newId("pay")}.${ext}`;
    await c.env.FILES.put(paymentProofKey, buffer, {
      httpMetadata: { contentType: mime },
    });
  }

  const registrationId = newId("reg");

  // Atomic insert with quota check
  const insertResult = await c.env.DB.prepare(
    `INSERT INTO event_registrations
     (id, event_id, user_id, session_type, speaker_id, phone, line_id, institution, domicile, cv_key, payment_proof_key, created_at)
     SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
     WHERE (SELECT quota FROM events WHERE id = ?2) IS NULL
        OR (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?2) < (SELECT quota FROM events WHERE id = ?2)`
  )
    .bind(
      registrationId,
      ev.id,
      authUser.id,
      sessionType,
      speakerId,
      phone,
      lineId,
      institution,
      domicile,
      cvKey,
      paymentProofKey,
      currentIso
    )
    .run();

  if (insertResult.meta.changes === 0) {
    if (cvKey) {
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(c.env.FILES.delete(cvKey).catch(() => {}));
      } else {
        await c.env.FILES.delete(cvKey).catch(() => {});
      }
    }
    if (paymentProofKey) {
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(c.env.FILES.delete(paymentProofKey).catch(() => {}));
      } else {
        await c.env.FILES.delete(paymentProofKey).catch(() => {});
      }
    }
    throw new AppError("QUOTA_FULL", 400);
  }

  return created(c, { registrationId });
});
