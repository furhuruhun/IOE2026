import { Hono } from "hono";
import type { AppContext } from "../../env";
import { verifyFileSignature } from "../../lib/signedUrl";
import { AppError } from "../../lib/errors";

export const fileRoutes = new Hono<AppContext>();

fileRoutes.get("/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const expStr = c.req.query("exp");
  const sig = c.req.query("sig");

  if (!expStr || !sig) {
    throw new AppError("UNAUTHORIZED", 401, "Link akses file tidak valid");
  }

  const exp = parseInt(expStr, 10);
  if (isNaN(exp)) {
    throw new AppError("UNAUTHORIZED", 401, "Link akses file tidak valid");
  }

  const isValid = await verifyFileSignature(key, exp, sig, c.env.FILE_SIGNING_SECRET);
  if (!isValid) {
    throw new AppError("UNAUTHORIZED", 401, "Link akses file telah kedaluwarsa atau tidak valid");
  }

  const object = await c.env.FILES.get(key);
  if (!object) {
    throw new AppError("NOT_FOUND", 404, "File tidak ditemukan");
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "application/octet-stream"
  );
  headers.set("Cache-Control", "private, max-age=300");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", "inline");

  return new Response(object.body, { headers });
});
