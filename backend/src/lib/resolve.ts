import { AppError } from "./errors";

export interface CompetitionRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  guidebook_url: string | null;
  logo_url: string | null;
  total_prize_pool_idr: number | null;
  max_team_members: number;
  is_published: number;
  created_at: string;
}

export interface EventRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  starts_at: string | null;
  registration_closes_at: string;
  quota: number | null;
  is_paid: number;
  price_idr: number | null;
  is_published: number;
  created_at: string;
}

export async function resolveCompetition(
  db: D1Database,
  idOrSlug: string
): Promise<CompetitionRow> {
  const comp = await db
    .prepare("SELECT * FROM competitions WHERE id = ?1 OR slug = ?1 LIMIT 1")
    .bind(idOrSlug)
    .first<CompetitionRow>();

  if (!comp || comp.is_published !== 1) {
    throw new AppError("NOT_FOUND", 404, "Kompetisi tidak ditemukan");
  }
  return comp;
}

export async function resolveEvent(
  db: D1Database,
  idOrSlug: string
): Promise<EventRow> {
  const ev = await db
    .prepare("SELECT * FROM events WHERE id = ?1 OR slug = ?1 LIMIT 1")
    .bind(idOrSlug)
    .first<EventRow>();

  if (!ev || ev.is_published !== 1) {
    throw new AppError("NOT_FOUND", 404, "Event tidak ditemukan");
  }
  return ev;
}
