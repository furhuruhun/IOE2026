import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";

describe("Events Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function createUser(email: string, name: string) {
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: "Password123!",
        }),
      }),
      env
    );
    const body = (await res.json()) as any;
    return { token: body.data.token as string, user: body.data.user };
  }

  it("lists all published events", async () => {
    const res = await app.fetch(new Request("http://localhost/api/events"), env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(4);

    const talkshow = body.data.find((e: any) => e.slug === "talkshow");
    expect(talkshow).toBeDefined();
    expect(talkshow.name).toBe("Talkshow Maritim Nasional");
    expect(talkshow.deadline).toBeDefined();
    expect(talkshow.isRegisteredByUser).toBe(false);
  });

  it("allows participant to register for a free seminar event", async () => {
    const user = await createUser("peserta_event@itb.ac.id", "Peserta Event");

    const formData = new FormData();
    formData.append("phone", "08123456789");
    formData.append("institution", "ITB");
    formData.append("domicile", "Bandung");
    formData.append("sessionType", "seminar");
    formData.append("discoverySource", "INSTAGRAM");

    const res = await app.fetch(
      new Request("http://localhost/api/events/talkshow/register", {
        method: "POST",
        headers: authHeader(user.token),
        body: formData,
      }),
      env
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.registrationId).toBeDefined();
    const saved = await env.DB.prepare("SELECT discovery_source FROM event_registrations WHERE id = ?1")
      .bind(body.data.registrationId).first<{ discovery_source: string }>();
    expect(saved?.discovery_source).toBe("INSTAGRAM");
  });

  it("prevents double registration for the same event", async () => {
    const user = await createUser("double_event@itb.ac.id", "Double Event");

    const formData = new FormData();
    formData.append("phone", "08123456789");
    formData.append("institution", "ITB");
    formData.append("domicile", "Bandung");
    formData.append("sessionType", "seminar");
    formData.append("discoverySource", "INSTAGRAM");

    // First registration
    const res1 = await app.fetch(
      new Request("http://localhost/api/events/talkshow/register", {
        method: "POST",
        headers: authHeader(user.token),
        body: formData,
      }),
      env
    );
    expect(res1.status).toBe(201);

    // Second registration
    const res2 = await app.fetch(
      new Request("http://localhost/api/events/talkshow/register", {
        method: "POST",
        headers: authHeader(user.token),
        body: formData,
      }),
      env
    );

    expect(res2.status).toBe(400);
    const body2 = (await res2.json()) as any;
    expect(body2.error.code).toBe("ALREADY_REGISTERED");
  });

  it("requires a valid discovery source for talkshow registration", async () => {
    const user = await createUser("source_event@itb.ac.id", "Peserta Sumber");
    const formData = new FormData();
    formData.append("phone", "08123456789");
    formData.append("institution", "ITB");
    formData.append("domicile", "Bandung");
    formData.append("sessionType", "seminar");

    const res = await app.fetch(new Request("http://localhost/api/events/talkshow/register", {
      method: "POST", headers: authHeader(user.token), body: formData,
    }), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.fields.discoverySource).toBe("Pilih sumber informasi acara");
  });

  it("stores the selected Short Course day under the Short Course event", async () => {
    const user = await createUser("course_event@itb.ac.id", "Peserta Course");
    const formData = new FormData();
    formData.append("phone", "08123456789");
    formData.append("institution", "ITB");
    formData.append("domicile", "Bandung");
    formData.append("sessionType", "day2");
    formData.append("discoverySource", "WEBSITE");

    const res = await app.fetch(new Request("http://localhost/api/events/short-course/register", {
      method: "POST", headers: authHeader(user.token), body: formData,
    }), env);
    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    const saved = await env.DB.prepare("SELECT event_id, session_type, discovery_source FROM event_registrations WHERE id = ?1")
      .bind(body.data.registrationId).first<{ event_id: string; session_type: string; discovery_source: string }>();
    expect(saved).toMatchObject({ event_id: "event-short-course", session_type: "day2", discovery_source: "WEBSITE" });
  });

  it("rejects a seminar session for Short Course", async () => {
    const user = await createUser("course_invalid@itb.ac.id", "Peserta Course Invalid");
    const formData = new FormData();
    formData.append("phone", "08123456789");
    formData.append("institution", "ITB");
    formData.append("domicile", "Bandung");
    formData.append("sessionType", "seminar");
    formData.append("discoverySource", "WEBSITE");

    const res = await app.fetch(new Request("http://localhost/api/events/short-course/register", {
      method: "POST", headers: authHeader(user.token), body: formData,
    }), env);
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.fields.sessionType).toBe("Pilih Day 1 atau Day 2");
  });
});
