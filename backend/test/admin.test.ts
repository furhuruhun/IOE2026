import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";
import { signJwt } from "../src/lib/jwt";

describe("Admin Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function getTokens() {
    // Participant
    const userRes = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Regular User",
          email: "participant_admin_test@itb.ac.id",
          password: "Password123!",
        }),
      }),
      env
    );
    const userBody = (await userRes.json()) as any;
    const participantToken = userBody.data.token as string;

    // Panitia (Admin)
    const adminId = "usr_adm_test";
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, role, created_at, updated_at)
       VALUES (?1, 'panitia_test@ioe2027.itb.ac.id', 'Admin Test', 'panitia', '2026-10-01', '2026-10-01')`
    )
      .bind(adminId)
      .run();

    const adminToken = await signJwt(
      { id: adminId, role: "panitia" },
      env.JWT_SECRET
    );

    return { participantToken, adminToken };
  }

  it("denies access to regular participants with 403 ADMIN_ONLY", async () => {
    const { participantToken } = await getTokens();

    const res = await app.fetch(
      new Request("http://localhost/api/admin/registrations", {
        headers: authHeader(participantToken),
      }),
      env
    );

    expect(res.status).toBe(403);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("ADMIN_ONLY");
  });

  it("grants access to panitia for registrations list", async () => {
    const { adminToken } = await getTokens();

    const res = await app.fetch(
      new Request("http://localhost/api/admin/registrations", {
        headers: authHeader(adminToken),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.teams).toBeDefined();
    expect(body.data.eventRegistrations).toBeDefined();
  });

  it("allows panitia to export registrations CSV", async () => {
    const { adminToken } = await getTokens();

    const res = await app.fetch(
      new Request("http://localhost/api/admin/registrations/export", {
        headers: authHeader(adminToken),
      }),
      env
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("Team ID,Competition,Team Name,Team Code");
  });

  it("allows panitia to broadcast announcement", async () => {
    const { adminToken } = await getTokens();

    const res = await app.fetch(
      new Request("http://localhost/api/admin/announcements", {
        method: "POST",
        headers: {
          ...authHeader(adminToken),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId: "comp-business-case",
          body: "Pengumuman penting: Batas akhir registrasi diperpanjang!",
        }),
      }),
      env
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.body).toContain("Batas akhir registrasi diperpanjang!");
  });
});
