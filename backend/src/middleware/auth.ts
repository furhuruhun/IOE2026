import type { MiddlewareHandler } from "hono";
import { AppError } from "../lib/errors";
import { verifyJwt } from "../lib/jwt";
import type { AppContext, AuthUser } from "../env";

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export const requireAuth: MiddlewareHandler<AppContext> = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) {
    throw new AppError("UNAUTHORIZED", 401);
  }

  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) {
    throw new AppError("UNAUTHORIZED", 401);
  }

  const user = await c.env.DB.prepare(
    "SELECT id, email, role, name FROM users WHERE id = ?1 LIMIT 1"
  )
    .bind(payload.sub)
    .first<AuthUser>();

  if (!user) {
    throw new AppError("UNAUTHORIZED", 401);
  }

  c.set("user", user);
  await next();
};

export const optionalAuth: MiddlewareHandler<AppContext> = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (token) {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);
    if (payload) {
      const user = await c.env.DB.prepare(
        "SELECT id, email, role, name FROM users WHERE id = ?1 LIMIT 1"
      )
        .bind(payload.sub)
        .first<AuthUser>();

      if (user) {
        c.set("user", user);
      }
    }
  }
  await next();
};

export function requireRole(role: "panitia"): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new AppError("UNAUTHORIZED", 401);
    }
    if (user.role !== role) {
      throw new AppError("ADMIN_ONLY", 403);
    }
    await next();
  };
}
