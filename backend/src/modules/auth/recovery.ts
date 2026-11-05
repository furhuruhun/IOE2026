import { Hono } from "hono";
import { z } from "zod";
import type { AppContext } from "../../env";
import { AppError } from "../../lib/errors";
import { ok } from "../../lib/response";
import { parseBody } from "../../lib/validate";
import { hashPassword } from "../../lib/password";
import { nowIsoWib } from "../../lib/time";
import { changePasswordSchema } from "./schemas";

export const recoveryRoutes = new Hono<AppContext>();
const emailSchema = z.object({ email: z.string().trim().email().max(254).toLowerCase() });
const resetSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), newPassword: changePasswordSchema.shape.newPassword });
const message = "Jika email terdaftar sebagai peserta, tautan reset akan dikirim. Periksa inbox dan folder spam.";
export async function tokenHash(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

recoveryRoutes.post("/forgot-password", async c => {
  const body = parseBody(emailSchema, await c.req.json());
  const { RESEND_API_KEY, PASSWORD_RESET_FROM, PASSWORD_RESET_ORIGIN } = c.env;
  if (!RESEND_API_KEY || !PASSWORD_RESET_FROM || !PASSWORD_RESET_ORIGIN) throw new AppError("SERVER_ERROR", 503, "Pemulihan password belum tersedia. Hubungi panitia.");
  const origin = new URL(PASSWORD_RESET_ORIGIN);
  if (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(origin.hostname))) throw new AppError("SERVER_ERROR", 503);
  const now = Math.floor(Date.now() / 1000);
  // Atomic database counters bound sending across Workers instances, without storing raw emails/IPs.
  const keys = [await tokenHash(`email:${body.email}`), await tokenHash(`ip:${c.req.header("CF-Connecting-IP") ?? "local"}`)];
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM password_reset_limits WHERE window_start < ?1").bind(now - 3600),
    c.env.DB.prepare("DELETE FROM password_reset_tokens WHERE expires_at <= ?1").bind(now),
  ]);
  for (const [index, key] of keys.entries()) {
    const limit = await c.env.DB.prepare(`INSERT INTO password_reset_limits (key, window_start, count) VALUES (?1, ?2, 1)
      ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count`).bind(key, now).first<{ count: number }>();
    if (!limit || limit.count > (index === 0 ? 3 : 20)) return ok(c, { message });
  }
  const user = await c.env.DB.prepare("SELECT id, session_version FROM users WHERE email = ?1 AND role = 'peserta' LIMIT 1")
    .bind(body.email).first<{ id: string; session_version: number }>();
  if (!user) return ok(c, { message });
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join("");
  const hash = await tokenHash(token);
  await c.env.DB.prepare("INSERT INTO password_reset_tokens (token_hash, user_id, session_version, expires_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(hash, user.id, user.session_version, now + 1800).run();
  const link = new URL("/reset-password", origin.origin);
  // Fragment keeps the secret out of server access logs and Referer headers.
  link.hash = new URLSearchParams({ token }).toString();
  const deliver = async () => { try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": hash },
      body: JSON.stringify({ from: PASSWORD_RESET_FROM, to: [body.email], subject: "Reset password IOE 2027", text: `Buka tautan berikut untuk mengganti password:\n${link}\n\nTautan berlaku 30 menit dan hanya dapat dipakai sekali. Jika bukan Anda yang meminta, abaikan email ini.` }),
    });
    if (!response.ok) throw new Error("Email delivery failed");
  } catch {
    await c.env.DB.prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?1").bind(hash).run();
    // Never disclose account existence or provider response bodies to an anonymous caller.
    console.error("Password recovery delivery failed");
  } };
  // Provider latency/failure must not make the public response reveal account existence.
  c.executionCtx.waitUntil(deliver());
  return ok(c, { message });
});

recoveryRoutes.post("/reset-password", async c => {
  const body = parseBody(resetSchema, await c.req.json());
  const hash = await tokenHash(body.token);
  const now = Math.floor(Date.now() / 1000);
  const valid = await c.env.DB.prepare(`SELECT t.user_id FROM password_reset_tokens t JOIN users u ON u.id = t.user_id
    WHERE t.token_hash = ?1 AND t.expires_at > ?2 AND t.session_version = u.session_version AND u.role = 'peserta'`)
    .bind(hash, now).first();
  if (!valid) throw new AppError("VALIDATION_ERROR", 400, "Tautan tidak valid atau kedaluwarsa. Minta tautan baru.", { token: "Tautan tidak valid atau kedaluwarsa. Minta tautan baru." });
  const password = await hashPassword(body.newPassword);
  // D1 batch is atomic: changing the version makes every sibling token and old JWT invalid.
  const results = await c.env.DB.batch([
    c.env.DB.prepare(`UPDATE users SET password_hash = ?1, updated_at = ?2, session_version = session_version + 1
      WHERE role = 'peserta' AND EXISTS (SELECT 1 FROM password_reset_tokens t WHERE t.token_hash = ?3
      AND t.user_id = users.id AND t.session_version = users.session_version AND t.expires_at > ?4)`)
      .bind(password, nowIsoWib(), hash, now),
    c.env.DB.prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?1").bind(hash),
  ]);
  if (results[0].meta.changes !== 1) throw new AppError("VALIDATION_ERROR", 400, "Tautan tidak valid atau kedaluwarsa. Minta tautan baru.", { token: "Tautan tidak valid atau kedaluwarsa. Minta tautan baru." });
  return ok(c, { changed: true });
});
