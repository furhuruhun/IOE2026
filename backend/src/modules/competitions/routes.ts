import { Hono } from "hono";
import type { AppContext } from "../../env";
import { optionalAuth } from "../../middleware/auth";
import { ok } from "../../lib/response";
import { toWib, nowIsoWib } from "../../lib/time";
import { resolveCompetition, type CompetitionRow } from "../../lib/resolve";

export const competitionRoutes = new Hono<AppContext>();

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "Rp 0";
  return "Rp " + amount.toLocaleString("id-ID");
}

async function getCompetitionDeadline(
  db: D1Database,
  competitionId: string
): Promise<string> {
  const currentIso = nowIsoWib();
  const batch = await db
    .prepare(
      `SELECT closes_at FROM competition_batches
       WHERE competition_id = ?1
       ORDER BY CASE WHEN opens_at <= ?2 AND closes_at >= ?2 THEN 0 ELSE 1 END, closes_at ASC
       LIMIT 1`
    )
    .bind(competitionId, currentIso)
    .first<{ closes_at: string }>();

  return batch?.closes_at ? toWib(batch.closes_at) : currentIso;
}

competitionRoutes.get("/", optionalAuth, async (c) => {
  const authUser = c.get("user");

  const comps = await c.env.DB.prepare(
    "SELECT id, slug, name FROM competitions WHERE is_published = 1 ORDER BY created_at ASC"
  ).all<{ id: string; slug: string; name: string }>();

  const result = await Promise.all(
    comps.results.map(async (comp) => {
      const deadline = await getCompetitionDeadline(c.env.DB, comp.id);

      let isRegisteredByUser = false;
      if (authUser) {
        const mem = await c.env.DB.prepare(
          "SELECT 1 FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
        )
          .bind(comp.id, authUser.id)
          .first();
        isRegisteredByUser = Boolean(mem);
      }

      return {
        id: comp.id,
        slug: comp.slug,
        name: comp.name,
        deadline,
        isRegisteredByUser,
      };
    })
  );

  return ok(c, result);
});

competitionRoutes.get("/:slug", optionalAuth, async (c) => {
  const slug = c.req.param("slug");
  const comp = await resolveCompetition(c.env.DB, slug);
  const authUser = c.get("user");

  const deadline = await getCompetitionDeadline(c.env.DB, comp.id);

  let isRegisteredByUser = false;
  if (authUser) {
    const mem = await c.env.DB.prepare(
      "SELECT 1 FROM team_members WHERE competition_id = ?1 AND user_id = ?2 LIMIT 1"
    )
      .bind(comp.id, authUser.id)
      .first();
    isRegisteredByUser = Boolean(mem);
  }

  const timelineRows = await c.env.DB.prepare(
    `SELECT label, occurs_at FROM competition_timeline_items
     WHERE competition_id = ?1 ORDER BY sort_order ASC`
  )
    .bind(comp.id)
    .all<{ label: string; occurs_at: string }>();

  const prizeRows = await c.env.DB.prepare(
    `SELECT label, amount_idr FROM competition_prizes
     WHERE competition_id = ?1 ORDER BY sort_order ASC`
  )
    .bind(comp.id)
    .all<{ label: string; amount_idr: number }>();

  return ok(c, {
    id: comp.id,
    slug: comp.slug,
    name: comp.name,
    deadline,
    isRegisteredByUser,
    description: comp.description,
    timeline: timelineRows.results.map((t) => ({
      date: toWib(t.occurs_at),
      label: t.label,
    })),
    totalPrizePool: formatCurrency(comp.total_prize_pool_idr),
    prizeBreakdown: prizeRows.results.map((p) => ({
      label: p.label,
      amount: formatCurrency(p.amount_idr),
    })),
    guidebookUrl: comp.guidebook_url,
  });
});
