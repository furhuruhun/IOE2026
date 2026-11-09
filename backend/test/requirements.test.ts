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

  it("unlocks submission stages only as the team advances", async () => {
    await env.DB.prepare(
      "UPDATE competition_batches SET opens_at = '2026-01-01T00:00:00+07:00', closes_at = '2027-12-01T23:59:00+07:00' WHERE competition_id = 'comp-business-case'"
    ).run();
    const { token, team } = await createTeamLeader("stages");
    const base = "http://localhost/api/competitions/business-case-competition/requirements";
    const stageIds = { submission: "stage-work", final: "stage-final" };
    for (const [stage, id] of Object.entries(stageIds)) {
      await env.DB.prepare(
        `INSERT INTO requirement_templates (id, competition_id, name, type, stage, due_at, instructions, accepted_formats, sort_order)
         VALUES (?1, 'comp-business-case', ?2, 'group', ?3, '2027-12-01T23:59:00+07:00', '', '["png"]', 10)`
      ).bind(id, stage, stage).run();
    }

    async function listStages() {
      const res = await app.fetch(new Request(base, { headers: authHeader(token) }), env);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      return body.data.map((item: { stage: string }) => item.stage);
    }

    async function listAssignmentStages() {
      const res = await app.fetch(new Request("http://localhost/api/dashboard/assignments?status=all", {
        headers: authHeader(token),
      }), env);
      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      return body.data.map((item: { stage: string }) => item.stage);
    }

    async function assertStageAction(stage: "submission" | "final", method: "POST" | "DELETE", expected: number) {
      const url = `${base}/${stageIds[stage]}${method === "POST" ? "/upload" : ""}`;
      const options: RequestInit = { method, headers: authHeader(token) };
      if (method === "POST") {
        const form = new FormData();
        form.append("file", makePngFile());
        options.body = form;
      }
      const res = await app.fetch(new Request(url, options), env);
      expect(res.status).toBe(expected);
      if (expected === 403) {
        const body = (await res.json()) as any;
        expect(body.error.code).toBe("NOT_QUALIFIED");
      }
    }

    expect(new Set(await listStages())).toEqual(new Set(["registration"]));
    expect(new Set(await listAssignmentStages())).toEqual(new Set(["registration"]));
    await assertStageAction("submission", "POST", 403);
    await assertStageAction("submission", "DELETE", 403);
    await assertStageAction("final", "POST", 403);

    await env.DB.prepare("UPDATE teams SET status = 'peserta' WHERE id = ?1").bind(team.teamId).run();
    expect(new Set(await listStages())).toEqual(new Set(["registration", "submission"]));
    expect(new Set(await listAssignmentStages())).toEqual(new Set(["registration", "submission"]));
    await assertStageAction("submission", "POST", 200);
    await assertStageAction("final", "POST", 403);
    await assertStageAction("final", "DELETE", 403);

    await env.DB.prepare("UPDATE teams SET status = 'finalis' WHERE id = ?1").bind(team.teamId).run();
    expect(new Set(await listStages())).toEqual(new Set(["registration", "submission", "final"]));
    expect(new Set(await listAssignmentStages())).toEqual(new Set(["registration", "submission", "final"]));
    await assertStageAction("final", "POST", 200);
    await assertStageAction("final", "DELETE", 200);
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
