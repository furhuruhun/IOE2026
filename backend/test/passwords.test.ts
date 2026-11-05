import { env } from "cloudflare:test";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { app } from "../src/app";
import type { Bindings } from "../src/env";
import { resetDatabase } from "./helpers";
import { tokenHash } from "../src/modules/auth/recovery";

const email = "recovery@example.test";
const password = "Original123!";
const nextPassword = "Changed456!";
const settings = (): Bindings => ({ ...env, RESEND_API_KEY: "test-key", PASSWORD_RESET_FROM: "IOE <test@example.test>", PASSWORD_RESET_ORIGIN: "http://localhost:3000" });
async function post(action: string, body: unknown, token?: string, bindings: Bindings = settings()) {
  const tasks: Promise<unknown>[] = [];
  const response = await app.fetch(new Request(`http://localhost/api/auth/${action}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  }), bindings, { waitUntil: task => tasks.push(task), passThroughOnException() {}, props: {} });
  await Promise.all(tasks);
  return response;
}
async function profile(token: string) {
  return app.fetch(new Request("http://localhost/api/profile", { headers: { Authorization: `Bearer ${token}` } }), settings());
}
async function register() {
  const response = await post("register", { name: "Recovery Participant", email, password });
  expect(response.status).toBe(201);
  return (await response.json() as { data: { token: string; user: { id: string } } }).data;
}
function emailCapture() {
  const links: string[] = [];
  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    expect(String(input)).toBe("https://api.resend.com/emails");
    const body = JSON.parse(String(init?.body)) as { text: string };
    links.push(body.text.split("\n")[1]);
    return Response.json({ id: "test-delivery" });
  });
  return { links, spy, token: () => new URLSearchParams(new URL(links[0]).hash.slice(1)).get("token")! };
}

describe("Password management", () => {
  beforeEach(resetDatabase);
  afterEach(() => vi.restoreAllMocks());

  it("preserves the session on wrong-password errors, rejects weak/reused passwords and revokes all sessions on change", async () => {
    const user = await register();
    expect((await post("change-password", { currentPassword: "wrong", newPassword: nextPassword }, user.token)).status).toBe(401);
    expect((await profile(user.token)).status).toBe(200);
    expect((await post("change-password", { currentPassword: password, newPassword: "short" }, user.token)).status).toBe(400);
    expect((await post("change-password", { currentPassword: password, newPassword: password }, user.token)).status).toBe(400);
    expect((await post("change-password", { currentPassword: password, newPassword: nextPassword })).status).toBe(401);
    const legacyToken = await new SignJWT({ role: "peserta" }).setProtectedHeader({ alg: "HS256" }).setSubject(user.user.id).setExpirationTime("1h").sign(new TextEncoder().encode(env.JWT_SECRET));
    expect((await profile(legacyToken)).status).toBe(200);
    expect((await post("change-password", { currentPassword: password, newPassword: nextPassword }, user.token)).status).toBe(200);
    expect((await profile(user.token)).status).toBe(401);
    expect((await profile(legacyToken)).status).toBe(401);
    expect((await post("login", { email, password })).status).toBe(401);
    const login = await post("login", { email, password: nextPassword });
    expect(login.status).toBe(200);
    expect((await profile((await login.json() as { data: { token: string } }).data.token)).status).toBe(200);
  });

  it("sends a hashed expiring token, returns the same message for unknown accounts, and consumes tokens once", async () => {
    const user = await register();
    const mail = emailCapture();
    const unknown = await post("forgot-password", { email: "unknown@example.test" });
    const requested = await post("forgot-password", { email });
    expect(await unknown.json()).toEqual(await requested.json());
    expect(mail.spy).toHaveBeenCalledTimes(1);
    expect(new URL(mail.links[0]).search).toBe("");
    const token = mail.token();
    const saved = await env.DB.prepare("SELECT token_hash, expires_at FROM password_reset_tokens").first<{ token_hash: string; expires_at: number }>();
    expect(saved?.token_hash).toBe(await tokenHash(token));
    expect(saved?.token_hash).not.toBe(token);
    expect(saved!.expires_at).toBeGreaterThan(Date.now() / 1000);
    const results = await Promise.all([post("reset-password", { token, newPassword: nextPassword }), post("reset-password", { token, newPassword: "Other789!" })]);
    expect(results.map(result => result.status).sort()).toEqual([200, 400]);
    expect((await profile(user.token)).status).toBe(401);
    expect((await post("reset-password", { token, newPassword: nextPassword })).status).toBe(400);
    expect((await post("login", { email, password })).status).toBe(401);
  });

  it("rejects expired and malformed links without changing passwords", async () => {
    const user = await register();
    const mail = emailCapture();
    await post("forgot-password", { email });
    await env.DB.prepare("UPDATE password_reset_tokens SET expires_at = 1").run();
    expect((await post("reset-password", { token: mail.token(), newPassword: nextPassword })).status).toBe(400);
    expect((await post("reset-password", { token: "bad", newPassword: nextPassword })).status).toBe(400);
    expect((await profile(user.token)).status).toBe(200);
    expect((await post("login", { email, password })).status).toBe(200);
  });

  it("bounds reset email requests and makes delivery failures indistinguishable", async () => {
    await register();
    const mail = emailCapture();
    for (let index = 0; index < 5; index++) expect((await post("forgot-password", { email })).status).toBe(200);
    expect(mail.spy).toHaveBeenCalledTimes(3);
    await env.DB.prepare("DELETE FROM password_reset_limits").run();
    await env.DB.prepare("DELETE FROM password_reset_tokens").run();
    mail.spy.mockResolvedValue(new Response("provider error", { status: 500 }));
    const failure = await post("forgot-password", { email });
    const unknown = await post("forgot-password", { email: "unknown@example.test" });
    expect(await failure.json()).toEqual(await unknown.json());
    expect((await env.DB.prepare("SELECT count(*) AS total FROM password_reset_tokens").first<{ total: number }>())?.total).toBe(0);
    expect((await post("forgot-password", { email }, undefined, { ...settings(), RESEND_API_KEY: undefined })).status).toBe(503);
  });

  it("admin reset invalidates participant sessions and outstanding recovery links", async () => {
    const user = await register();
    const mail = emailCapture();
    await post("forgot-password", { email });
    const admin = await post("register", { name: "Test Admin", email: "admin@example.test", password });
    const adminData = await admin.json() as { data: { user: { id: string } } };
    await env.DB.prepare("UPDATE users SET role = 'panitia' WHERE id = ?1").bind(adminData.data.user.id).run();
    const login = await post("login", { email: "admin@example.test", password });
    const adminToken = (await login.json() as { data: { token: string } }).data.token;
    const reset = await app.fetch(new Request("http://localhost/api/admin/users/password", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ email, newPassword: nextPassword }) }), settings());
    expect(reset.status).toBe(200);
    expect((await profile(user.token)).status).toBe(401);
    expect((await profile(adminToken)).status).toBe(200);
    expect((await post("reset-password", { token: mail.token(), newPassword: "Other789!" })).status).toBe(400);
    expect((await post("login", { email, password: nextPassword })).status).toBe(200);
  });

  it("preserves Google login after a version change and rejects mock credentials outside explicit test mode", async () => {
    const credential = "mock:recovery-google:google@example.test:Google Participant";
    const first = await post("google", { credential });
    expect(first.status).toBe(200);
    const original = (await first.json() as { data: { token: string; user: { id: string } } }).data;
    await env.DB.prepare("UPDATE users SET session_version = 1 WHERE id = ?1").bind(original.user.id).run();
    const login = await post("google", { credential });
    expect(login.status).toBe(200);
    expect((await profile((await login.json() as { data: { token: string } }).data.token)).status).toBe(200);
    expect((await profile(original.token)).status).toBe(401);
    expect((await post("google", { credential }, undefined, { ...settings(), AUTH_TEST_MODE: undefined })).status).toBe(401);
  });
});
