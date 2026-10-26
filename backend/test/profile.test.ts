import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";

describe("Profile Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function registerUser(suffix = "1") {
    const email = `dewi_${suffix}@itb.ac.id`;
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Dewi Lestari",
          email,
          password: "Password123!",
          institution: "ITB",
        }),
      }),
      env
    );
    const body = (await res.json()) as any;
    return { token: body.data.token as string, email };
  }

  it("requires authorization for GET /api/profile", async () => {
    const res = await app.fetch(new Request("http://localhost/api/profile"), env);
    expect(res.status).toBe(401);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("fetches user profile successfully with valid token", async () => {
    const { token, email } = await registerUser("fetch");
    const res = await app.fetch(
      new Request("http://localhost/api/profile", {
        headers: authHeader(token),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(email);
    expect(body.data.name).toBe("Dewi Lestari");
    expect(body.data.institution).toBe("ITB");
  });

  it("updates user profile data", async () => {
    const { token } = await registerUser("update");
    const res = await app.fetch(
      new Request("http://localhost/api/profile", {
        method: "PUT",
        headers: {
          ...authHeader(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Dewi Lestari S.T.",
          institution: "Institut Teknologi Bandung",
          phone: "081299998888",
          domicile: "Bandung",
        }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Dewi Lestari S.T.");
    expect(body.data.phone).toBe("081299998888");
    expect(body.data.domicile).toBe("Bandung");
  });
});
