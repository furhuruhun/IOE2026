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

  it("associates individual and group submissions with the team in the matching competition", async () => {
    const { adminToken } = await getTokens();
    for (const [id, competition, batch] of [
      ["team-bc", "comp-business-case", "batch-bc-1"],
      ["team-ds", "comp-design", "batch-ds-1"],
    ]) {
      await env.DB.prepare(`INSERT INTO teams (id, competition_id, batch_id, name, code, leader_user_id, created_at)
        VALUES (?1, ?2, ?3, ?1, ?1, 'usr_adm_test', '2026-10-01')`).bind(id, competition, batch).run();
      await env.DB.prepare(`INSERT INTO team_members (team_id, user_id, competition_id, role, joined_at)
        VALUES (?1, 'usr_adm_test', ?2, 'leader', '2026-10-01')`).bind(id, competition).run();
    }
    for (const type of ["individual", "group"]) {
      await env.DB.prepare(`INSERT INTO requirement_templates (id, competition_id, name, type, due_at)
        VALUES (?1, 'comp-business-case', ?1, ?2, '2026-12-01')`).bind(`req-test-${type}`, type).run();
      await env.DB.prepare(`INSERT INTO requirement_submissions (id, template_id, team_id, user_id, status, file_key, updated_at)
        VALUES (?1, ?2, ?3, 'usr_adm_test', 'accepted', ?1, '2026-10-01')`)
        .bind(`sub-test-${type}`, `req-test-${type}`, type === "group" ? "team-bc" : null).run();
    }
    const list = async (query = "") => {
      const response = await app.fetch(new Request(`http://localhost/api/admin/submissions${query}`, {
        headers: authHeader(adminToken),
      }), env);
      expect(response.status).toBe(200);
      return (await response.json() as any).data;
    };
    for (const query of ["", "?competitionId=comp-business-case&status=accepted"]) {
      const rows = await list(query);
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        expect(row.team_id).toBe("team-bc");
        expect(row.team_name).toBe("team-bc");
        expect(row.team_code).toBe("team-bc");
        expect(row.status).toBe("accepted");
        expect(row.fileUrl).toBeTruthy();
      }
    }
    expect(await list("?competitionId=comp-design")).toEqual([]);
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

  it("lists editable schedules only for panitia and persists schedule updates", async () => {
    const { participantToken, adminToken } = await getTokens();
    const request = (path: string, token: string, body?: unknown) => app.fetch(new Request(`http://localhost/api/admin/${path}`, {
      method: body === undefined ? "GET" : "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }), env);
    expect((await request("schedules", participantToken)).status).toBe(403);
    const list = await request("schedules", adminToken);
    expect(list.status).toBe(200);
    const { data } = await list.json() as any;
    expect(data.competitions.length).toBeGreaterThan(0);
    const batch = data.batches[0], event = data.events[0], milestone = data.timeline[0];
    const closesAt = "2028-03-31T23:59:00+07:00";
    expect((await request(`competition-batches/${batch.id}/registration-window`, adminToken, { closesAt })).status).toBe(200);
    expect((await request(`events/${event.id}/registration-window`, adminToken, { closesAt })).status).toBe(200);
    expect((await request(`competitions/${milestone.competitionId}/timeline/${milestone.id}`, adminToken, { label: "Updated milestone", occursAt: closesAt, showInCalendar: false, sortOrder: 7 })).status).toBe(200);
    expect((await request(`events/${event.id}/registration-window`, adminToken, { opensAt: "2029-01-01T00:00:00+07:00" })).status).toBe(400);
    expect((await request(`competition-batches/${batch.id}/registration-window`, adminToken, { closesAt: "invalid" })).status).toBe(400);
    expect((await request(`competitions/${milestone.competitionId}/timeline/missing`, adminToken, { occursAt: closesAt })).status).toBe(404);
    const refreshed = await (await request("schedules", adminToken)).json() as any;
    expect(refreshed.data.batches.find((item: any) => item.id === batch.id).closesAt).toBe(closesAt);
    expect(refreshed.data.events.find((item: any) => item.id === event.id).closesAt).toBe(closesAt);
    expect(refreshed.data.timeline.find((item: any) => item.id === milestone.id)).toMatchObject({ label: "Updated milestone", occursAt: closesAt, showInCalendar: 0, sortOrder: 7 });
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
