import { Hono } from "hono";
import type { AppContext } from "../../env";
import { requireAuth } from "../../middleware/auth";
import { ok } from "../../lib/response";
import { parseBody } from "../../lib/validate";
import { nowIsoWib } from "../../lib/time";
import { updateProfileSchema } from "./schemas";

export const profileRoutes = new Hono<AppContext>();

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: "peserta" | "panitia";
  avatar_url: string | null;
  institution: string | null;
  phone: string | null;
  domicile: string | null;
}

profileRoutes.get("/", requireAuth, async (c) => {
  const authUser = c.get("user")!;

  const profile = await c.env.DB.prepare(
    `SELECT id, name, email, role, avatar_url, institution, phone, domicile
     FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(authUser.id)
    .first<ProfileRow>();

  return ok(c, {
    id: profile?.id ?? authUser.id,
    name: profile?.name ?? authUser.name,
    email: profile?.email ?? authUser.email,
    role: profile?.role ?? authUser.role,
    avatarUrl: profile?.avatar_url ?? null,
    institution: profile?.institution ?? null,
    phone: profile?.phone ?? null,
    domicile: profile?.domicile ?? null,
  });
});

profileRoutes.put("/", requireAuth, async (c) => {
  const authUser = c.get("user")!;
  const body = parseBody(updateProfileSchema, await c.req.json());
  const timestamp = nowIsoWib();

  await c.env.DB.prepare(
    `UPDATE users
     SET name = ?1,
         institution = ?2,
         phone = ?3,
         domicile = ?4,
         updated_at = ?5
     WHERE id = ?6`
  )
    .bind(
      body.name,
      body.institution ? body.institution.trim() : null,
      body.phone ? body.phone.trim() : null,
      body.domicile ? body.domicile.trim() : null,
      timestamp,
      authUser.id
    )
    .run();

  const updated = await c.env.DB.prepare(
    `SELECT id, name, email, role, avatar_url, institution, phone, domicile
     FROM users WHERE id = ?1 LIMIT 1`
  )
    .bind(authUser.id)
    .first<ProfileRow>();

  return ok(c, {
    id: updated?.id ?? authUser.id,
    name: updated?.name ?? body.name,
    email: updated?.email ?? authUser.email,
    role: updated?.role ?? authUser.role,
    avatarUrl: updated?.avatar_url ?? null,
    institution: updated?.institution ?? null,
    phone: updated?.phone ?? null,
    domicile: updated?.domicile ?? null,
  });
});
