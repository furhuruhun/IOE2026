import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase } from "./helpers";

describe("Auth Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registers a new participant successfully", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Budi Santoso",
          email: "budi@itb.ac.id",
          password: "Password123!",
          institution: "Institut Teknologi Bandung",
          phone: "081234567890",
        }),
      }),
      env
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe("budi@itb.ac.id");
    expect(body.data.user.role).toBe("peserta");
    expect(body.data.user.institution).toBe("Institut Teknologi Bandung");
  });

  it("rejects duplicate email with 409", async () => {
    // First register
    await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Budi Santoso",
          email: "budi2@itb.ac.id",
          password: "Password123!",
        }),
      }),
      env
    );

    // Duplicate register
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Budi Clone",
          email: "budi2@itb.ac.id",
          password: "Password456!",
        }),
      }),
      env
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("fails login with invalid credentials", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@itb.ac.id",
          password: "WrongPassword!",
        }),
      }),
      env
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("logs in successfully with valid credentials", async () => {
    await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Siti Rahma",
          email: "siti@itb.ac.id",
          password: "Password123!",
        }),
      }),
      env
    );

    const res = await app.fetch(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "siti@itb.ac.id",
          password: "Password123!",
        }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe("siti@itb.ac.id");
  });

  it("authenticates via mock Google credential", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: "mock:google-12345:googleuser@gmail.com:Google User:https://avatar.url/me.jpg",
        }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("googleuser@gmail.com");
    expect(body.data.user.name).toBe("Google User");
  });
});
