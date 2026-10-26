import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase } from "./helpers";

describe("Competitions Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("lists all published competitions with deadline and registration status", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/competitions"),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(3);

    const bcc = body.data.find(
      (c: any) => c.slug === "business-case-competition"
    );
    expect(bcc).toBeDefined();
    expect(bcc.name).toBe("Business Case Competition");
    expect(bcc.deadline).toBeDefined();
    expect(bcc.isRegisteredByUser).toBe(false);
  });

  it("retrieves competition by slug with timeline and prizes", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/competitions/business-case-competition"),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.slug).toBe("business-case-competition");
    expect(body.data.name).toBe("Business Case Competition");
    expect(body.data.description).toContain("Business Case Competition menantang peserta");
    expect(body.data.timeline.length).toBeGreaterThan(0);
    expect(body.data.prizeBreakdown.length).toBe(3);
    expect(body.data.totalPrizePool).toContain("Rp");
  });

  it("returns 404 for unknown competition slug", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/competitions/unknown-slug-competition"),
      env
    );

    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
