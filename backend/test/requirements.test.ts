import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";

function makePngFile(name = "test.png", size = 100): File {
  const header = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const padding = new Uint8Array(Math.max(0, size - header.length));
  const full = new Uint8Array(header.length + padding.length);
  full.set(header, 0);
  full.set(padding, header.length);
  return new File([full], name, { type: "image/png" });
}

function makeExeFile(): File {
  return new File(["MZ-binary-executable"], "hack.exe", {
    type: "application/x-msdownload",
  });
}

describe("Requirements Module", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function createTeamLeader(suffix = "1") {
    const email = `req_leader_${Date.now()}_${suffix}_${Math.random()}@itb.ac.id`;
    const res = await app.fetch(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Req Leader",
          email,
          password: "Password123!",
        }),
      }),
      env
    );
    const body = (await res.json()) as any;
    const token = body.data.token as string;

    // Create team
    const teamRes = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: `Team ${suffix}` }),
        }
      ),
      env
    );
    const teamData = (await teamRes.json()) as any;

    return { token, team: teamData.data };
  }

  it("lists all requirements for the competition", async () => {
    const { token } = await createTeamLeader("list");

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/requirements",
        {
          headers: authHeader(token),
        }
      ),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(5);
    expect(body.data[0].status).toBe("pending");
  });

  it("rejects non-allowed file formats using magic bytes", async () => {
    const { token } = await createTeamLeader("magic");

    const formData = new FormData();
    formData.append("file", makeExeFile());

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/requirements/comp-business-case-req-1/upload",
        {
          method: "POST",
          headers: authHeader(token),
          body: formData,
        }
      ),
      env
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("INVALID_FILE_FORMAT");
  });

  it("rejects files exceeding 500 KB limit", async () => {
    const { token } = await createTeamLeader("large");

    const largePng = makePngFile("huge.png", 512 * 1024); // 512 KB
    const formData = new FormData();
    formData.append("file", largePng);

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/requirements/comp-business-case-req-1/upload",
        {
          method: "POST",
          headers: authHeader(token),
          body: formData,
        }
      ),
      env
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("FILE_TOO_LARGE");
  });

  it("successfully uploads a valid requirement and returns signed URL", async () => {
    const { token } = await createTeamLeader("upload");

    const validPng = makePngFile("valid_proof.png", 1024);
    const formData = new FormData();
    formData.append("file", validPng);

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/requirements/comp-business-case-req-1/upload",
        {
          method: "POST",
          headers: authHeader(token),
          body: formData,
        }
      ),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("pending");
    expect(body.data.file.url).toContain("/api/files/");
    expect(body.data.file.url).toContain("sig=");

    // Verify file can be accessed via the signed URL
    const fileRes = await app.fetch(new Request(body.data.file.url), env);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers.get("Content-Type")).toBe("image/png");
  });
});
