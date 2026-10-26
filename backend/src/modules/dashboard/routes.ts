import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { ok } from "../../lib/response";
import { toWib, nowIsoWib } from "../../lib/time";

export const dashboardRoutes = new Hono<AppContext>();

// GET /dashboard/journey
dashboardRoutes.get("/journey", requireAuth, async (c) => {
  const authUser = c.get("user")!;

  const comps = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.logo_url, m.team_id
     FROM team_members m
     JOIN competitions c ON c.id = m.competition_id
     WHERE m.user_id = ?1
     ORDER BY m.joined_at ASC`
  )
    .bind(authUser.id)
    .all<{
      id: string;
      slug: string;
      name: string;
      logo_url: string | null;
      team_id: string;
    }>();

  const currentIso = nowIsoWib();

  const items = await Promise.all(
    comps.results.map(async (comp) => {
      // Get deadline
      const batch = await c.env.DB.prepare(
        `SELECT closes_at FROM competition_batches
         WHERE competition_id = ?1
         ORDER BY CASE WHEN opens_at <= ?2 AND closes_at >= ?2 THEN 0 ELSE 1 END, closes_at ASC
         LIMIT 1`
      )
        .bind(comp.id, currentIso)
        .first<{ closes_at: string }>();

      // Check completeness:
      // total templates for comp
      const totalTemplates = await c.env.DB.prepare(
        "SELECT COUNT(*) as cnt FROM requirement_templates WHERE competition_id = ?1"
      )
        .bind(comp.id)
        .first<{ cnt: number }>();

      // count accepted group submissions for this team + accepted individual submissions for this user
      const acceptedCount = await c.env.DB.prepare(
        `SELECT COUNT(*) as cnt
         FROM requirement_submissions s
         JOIN requirement_templates t ON t.id = s.template_id
         WHERE t.competition_id = ?1
           AND s.status = 'accepted'
           AND (
             (t.type = 'group' AND s.team_id = ?2) OR
             (t.type = 'individual' AND s.user_id = ?3)
           )`
      )
        .bind(comp.id, comp.team_id, authUser.id)
        .first<{ cnt: number }>();

      const isComplete =
        (totalTemplates?.cnt ?? 0) > 0 &&
        (acceptedCount?.cnt ?? 0) >= (totalTemplates?.cnt ?? 0);

      return {
        competitionId: comp.id,
        slug: comp.slug,
        name: comp.name,
        logoUrl: comp.logo_url,
        status: isComplete ? ("complete" as const) : ("in_progress" as const),
        dueDate: batch?.closes_at ? toWib(batch.closes_at) : currentIso,
      };
    })
  );

  return ok(c, items);
});

// GET /dashboard/events
dashboardRoutes.get("/events", requireAuth, async (c) => {
  const authUser = c.get("user")!;

  const rows = await c.env.DB.prepare(
    `SELECT e.id as event_id, e.slug, e.name, e.starts_at,
            r.session_type, s.session_at
     FROM event_registrations r
     JOIN events e ON e.id = r.event_id
     LEFT JOIN event_speakers s ON s.id = r.speaker_id
     WHERE r.user_id = ?1
     ORDER BY r.created_at DESC`
  )
    .bind(authUser.id)
    .all<{
      event_id: string;
      slug: string;
      name: string;
      starts_at: string | null;
      session_type: string;
      session_at: string | null;
    }>();

  const items = rows.results.map((r) => {
    const rawDate = r.session_at || r.starts_at || nowIsoWib();
    return {
      eventId: r.event_id,
      slug: r.slug,
      name: r.name,
      sessionType: r.session_type,
      date: toWib(rawDate),
    };
  });

  return ok(c, items);
});

// GET /dashboard/calendar
dashboardRoutes.get("/calendar", requireAuth, async (c) => {
  const authUser = c.get("user")!;

  // 1. Competition calendar items
  const compItems = await c.env.DB.prepare(
    `SELECT ti.occurs_at as date,
            c.name || ' — ' || ti.label as label,
            'competition' as type,
            c.id as ref_id,
            c.logo_url
     FROM team_members m
     JOIN competitions c ON c.id = m.competition_id
     JOIN competition_timeline_items ti ON ti.competition_id = c.id
     WHERE m.user_id = ?1 AND ti.show_in_calendar = 1`
  )
    .bind(authUser.id)
    .all<{
      date: string;
      label: string;
      type: "competition";
      ref_id: string;
      logo_url: string | null;
    }>();

  // 2. Event calendar items
  const eventItems = await c.env.DB.prepare(
    `SELECT COALESCE(s.session_at, e.starts_at) as date,
            e.name || CASE WHEN s.name IS NOT NULL THEN ' — ' || s.name ELSE '' END as label,
            'event' as type,
            e.id as ref_id,
            NULL as logo_url
     FROM event_registrations r
     JOIN events e ON e.id = r.event_id
     LEFT JOIN event_speakers s ON s.id = r.speaker_id
     WHERE r.user_id = ?1 AND (s.session_at IS NOT NULL OR e.starts_at IS NOT NULL)`
  )
    .bind(authUser.id)
    .all<{
      date: string;
      label: string;
      type: "event";
      ref_id: string;
      logo_url: string | null;
    }>();

  const allItems = [...compItems.results, ...eventItems.results]
    .filter((item) => Boolean(item.date))
    .map((item) => ({
      date: toWib(item.date),
      label: item.label,
      type: item.type,
      refId: item.ref_id,
      logoUrl: item.logo_url,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return ok(c, allItems);
});

// GET /dashboard/assignments
dashboardRoutes.get("/assignments", requireAuth, async (c) => {
  const authUser = c.get("user")!;
  const statusFilter = c.req.query("status") || "pending";

  const rows = await c.env.DB.prepare(
    `SELECT t.id as requirement_id,
            c.slug as competition_slug,
            c.name as competition_name,
            t.name,
            t.type,
            COALESCE(s.status, 'pending') as status,
            t.due_at as due_date,
            t.accepted_formats
     FROM team_members m
     JOIN competitions c ON c.id = m.competition_id
     JOIN requirement_templates t ON t.competition_id = c.id
     LEFT JOIN requirement_submissions s
       ON s.template_id = t.id AND (
         (t.type = 'group' AND s.team_id = m.team_id) OR
         (t.type = 'individual' AND s.user_id = m.user_id)
       )
     WHERE m.user_id = ?1
     ORDER BY t.due_at ASC, t.sort_order ASC`
  )
    .bind(authUser.id)
    .all<{
      requirement_id: string;
      competition_slug: string;
      competition_name: string;
      name: string;
      type: "group" | "individual";
      status: "pending" | "accepted" | "rejected";
      due_date: string;
      accepted_formats: string;
    }>();

  const filtered = rows.results
    .filter((r) => statusFilter === "all" || r.status === statusFilter)
    .map((r) => ({
      requirementId: r.requirement_id,
      competitionSlug: r.competition_slug,
      competitionName: r.competition_name,
      name: r.name,
      type: r.type,
      status: r.status,
      dueDate: toWib(r.due_date),
      acceptedFormats: JSON.parse(r.accepted_formats),
    }));

  return ok(c, filtered);
});
