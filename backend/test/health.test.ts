import { env } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import { app } from "../src/app";

describe("Health Check", () => {
  it("GET /api/health returns 200 and WIB timestamp", async () => {
    const res = await app.fetch(new Request("http://localhost/api/health"), env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("healthy");
    expect(body.data.timestamp).toContain("+07:00");
  });
});
