import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";

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
  });
});
