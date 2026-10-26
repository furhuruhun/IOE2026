import { Hono } from "hono";
import type { AppContext } from "../../env";
import { AppError } from "../../lib/errors";
import { ok, created } from "../../lib/response";
import { parseBody } from "../../lib/validate";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signJwt } from "../../lib/jwt";
import { verifyGoogleIdToken } from "../../lib/google";
import { newId } from "../../lib/ids";
import { nowIsoWib } from "../../lib/time";
import { registerSchema, loginSchema, googleSchema } from "./schemas";

export const authRoutes = new Hono<AppContext>();

interface UserDbRow {
  id: string;
  email: string;
  name: string;
  role: "peserta" | "panitia";
  password_hash: string | null;
  google_sub: string | null;
  avatar_url: string | null;
  institution: string | null;
  phone: string | null;
  domicile: string | null;
}

authRoutes.post("/register", async (c) => {
  const body = parseBody(registerSchema, await c.req.json());

  // Check if email already registered
  const existing = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email = ?1 LIMIT 1"
  )
    .bind(body.email)
    .first<{ id: string }>();

  if (existing) {
    throw new AppError("EMAIL_ALREADY_REGISTERED", 400);
  }

  const userId = newId("usr");
  const hashed = await hashPassword(body.password);
  const timestamp = nowIsoWib();
  const institution = body.institution || null;
  const phone = body.phone || null;
  const domicile = body.domicile || null;

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, name, password_hash, role, institution, phone, domicile, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, 'peserta', ?5, ?6, ?7, ?8, ?8)`
  )
    .bind(userId, body.email, body.name, hashed, institution, phone, domicile, timestamp)
    .run();

  const token = await signJwt({ id: userId, role: "peserta" }, c.env.JWT_SECRET);

  return created(c, {
    token,
    user: {
      id: userId,
      name: body.name,
      email: body.email,
      role: "peserta" as const,
      avatarUrl: null,
      institution,
      phone,
      domicile,
    },
  });
});

authRoutes.post("/login", async (c) => {
  const body = parseBody(loginSchema, await c.req.json());

  const user = await c.env.DB.prepare(
    `SELECT id, email, name, role, password_hash, avatar_url, institution, phone, domicile
     FROM users WHERE email = ?1 LIMIT 1`
  )
    .bind(body.email)
    .first<UserDbRow>();

  if (!user || !user.password_hash) {
    // Run dummy verify to avoid timing attack
    await verifyPassword(
      "dummy",
      "pbkdf2$sha256$100000$c2FsdHNhbHRzYWx0$aGFzaGhhc2hoYXNo"
    );
    throw new AppError("INVALID_CREDENTIALS", 401);
  }

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) {
    throw new AppError("INVALID_CREDENTIALS", 401);
  }

  const token = await signJwt({ id: user.id, role: user.role }, c.env.JWT_SECRET);

  return ok(c, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      institution: user.institution,
      phone: user.phone,
      domicile: user.domicile,
    },
  });
});

authRoutes.post("/google", async (c) => {
  const body = parseBody(googleSchema, await c.req.json());
  const rawToken = (body.idToken || body.credential)!;

  const googlePayload = await verifyGoogleIdToken(
    rawToken,
    c.env.GOOGLE_CLIENT_ID
  );

  let user = await c.env.DB.prepare(
    `SELECT id, email, name, role, avatar_url, institution, phone, domicile
     FROM users WHERE google_sub = ?1 OR email = ?2 LIMIT 1`
  )
    .bind(googlePayload.sub, googlePayload.email)
    .first<UserDbRow>();

  let isNewUser = false;
  const timestamp = nowIsoWib();

  if (user) {
    // Link or update avatar
    await c.env.DB.prepare(
      `UPDATE users
       SET google_sub = COALESCE(google_sub, ?1),
           avatar_url = COALESCE(?2, avatar_url),
           updated_at = ?3
       WHERE id = ?4`
    )
      .bind(googlePayload.sub, googlePayload.picture || null, timestamp, user.id)
      .run();

    if (googlePayload.picture && !user.avatar_url) {
      user.avatar_url = googlePayload.picture;
    }
  } else {
    isNewUser = true;
    const userId = newId("usr");
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, name, password_hash, google_sub, role, avatar_url, created_at, updated_at)
       VALUES (?1, ?2, ?3, NULL, ?4, 'peserta', ?5, ?6, ?6)`
    )
      .bind(
        userId,
        googlePayload.email,
        googlePayload.name,
        googlePayload.sub,
        googlePayload.picture || null,
        timestamp
      )
      .run();

    user = {
      id: userId,
      email: googlePayload.email,
      name: googlePayload.name,
      role: "peserta",
      password_hash: null,
      google_sub: googlePayload.sub,
      avatar_url: googlePayload.picture || null,
      institution: null,
      phone: null,
      domicile: null,
    };
  }

  const token = await signJwt({ id: user.id, role: user.role }, c.env.JWT_SECRET);

  return ok(c, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      institution: user.institution,
      phone: user.phone,
      domicile: user.domicile,
    },
    isNewUser,
  });
});
