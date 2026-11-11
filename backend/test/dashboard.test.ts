import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";
import caseMigration from "../migrations/0011_competition_cases.sql?raw";

describe("Dashboard Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function createRegisteredUser(suffix = "1") {
    const email = `dash_${Date.now()}_${suffix}_${Math.random()}@itb.ac.id`;
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Dashboard User",
          email,
          password: "Password123!",
        }),
      }),
      env
    );
    const body = (await res.json()) as any;
    return body.data.token as string;
  }

  it("only releases Case to participants and finalists of the matching competition", async () => {
    await env.DB.prepare(caseMigration).run();
    await env.DB.prepare("INSERT OR REPLACE INTO competition_cases (competition_id, url) VALUES ('comp-business-case', 'https://example.com/business-case')").run();
    const path = "http://localhost/api/dashboard/case/business-case-competition";
    const request = (token?: string) => app.fetch(new Request(path, { headers: token ? authHeader(token) : {} }), env);
    expect((await request()).status).toBe(401);
    const token = await createRegisteredUser("case");
    expect((await request(token)).status).toBe(403);
    const created = await app.fetch(new Request("http://localhost/api/competitions/business-case-competition/team", {
      method: "POST", headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ teamName: "Case Access Team" }),
    }), env);
    expect(created.status).toBe(201);
    const body = await created.json() as any;
    expect((await request(token)).status).toBe(403);
    for (const status of ["peserta", "finalis"]) {
      await env.DB.prepare("UPDATE teams SET status = ?1 WHERE id = ?2").bind(status, body.data.teamId).run();
      const res = await request(token);
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toContain("no-store");
      expect((await res.json() as any).data.url).toBe("https://example.com/business-case");
    }
    const other = await app.fetch(new Request("http://localhost/api/dashboard/case/design-competition", { headers: authHeader(token) }), env);
    expect(other.status).toBe(403);
    const publicDetail = await app.fetch(new Request("http://localhost/api/competitions/business-case-competition"), env);
    expect(await publicDetail.text()).not.toContain("https://example.com/business-case");
    await env.DB.prepare("UPDATE competition_cases SET url = '' WHERE competition_id = 'comp-business-case'").run();
    expect((await request(token)).status).toBe(404);
    await env.DB.prepare("UPDATE competition_cases SET url = 'javascript:alert(1)' WHERE competition_id = 'comp-business-case'").run();
    expect((await request(token)).status).toBe(500);
    await env.DB.prepare("UPDATE teams SET status = 'pendaftar' WHERE id = ?1").bind(body.data.teamId).run();
    expect((await request(token)).status).toBe(403);
  });

  it("returns empty journey list for user with no teams", async () => {
    const token = await createRegisteredUser("empty");

    const res = await app.fetch(
      new Request("http://localhost/api/dashboard/journey", {
        headers: authHeader(token),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });

  it("returns journey status when participant has a team", async () => {
    const token = await createRegisteredUser("team");

    // Create a team in business-case
    await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: "Journey Team" }),
        }
      ),
      env
    );

    const res = await app.fetch(
      new Request("http://localhost/api/dashboard/journey", {
        headers: authHeader(token),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].slug).toBe("business-case-competition");
    expect(body.data[0].status).toBe("in_progress");
    expect(body.data[0].dueDate).toBeDefined();
  });

  it("returns merged dashboard calendar items for registered user", async () => {
    const token = await createRegisteredUser("calendar");

    // Join team so user has calendar items
    await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: "Calendar Team" }),
        }
      ),
      env
    );

    const res = await app.fetch(
      new Request("http://localhost/api/dashboard/calendar", {
        headers: authHeader(token),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].date).toBeDefined();
    expect(body.data[0].label).toBeDefined();
    expect(body.data[0].type).toBeDefined();
    expect(body.data.every((item: { date: string }) => Number.isFinite(Date.parse(item.date)))).toBe(true);
    expect(body.data.some((item: { date: string; label: string }) =>
      item.date === "2026-11-10T00:00:00+07:00" && item.label.includes("10 - 15 Nov 2026")
    )).toBe(true);
  });
});
