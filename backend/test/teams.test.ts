import { env } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../src/app";
import { resetDatabase, authHeader } from "./helpers";

describe("Teams Module", () => {
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

  it("allows participant to create a team", async () => {
    const user1 = await createUser("leader@itb.ac.id", "Team Leader");

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(user1.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamName: "Ocean Guardians",
          }),
        }
      ),
      env
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.teamName).toBe("Ocean Guardians");
    expect(body.data.teamCode).toMatch(/^[A-Z]{3}-[A-Z0-9]{4}$/);
    expect(body.data.members.length).toBe(1);
    expect(body.data.isLeader).toBe(true);
  });

  it("prevents user from creating two teams in the same competition", async () => {
    const user1 = await createUser("leader2@itb.ac.id", "Team Leader 2");

    await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(user1.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: "Team One" }),
        }
      ),
      env
    );

    const res2 = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(user1.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: "Team Two" }),
        }
      ),
      env
    );

    expect(res2.status).toBe(400);
    const body2 = (await res2.json()) as any;
    expect(body2.error.code).toBe("ALREADY_IN_TEAM");
  });

  it("allows another participant to join team with valid code", async () => {
    const leader = await createUser("leader3@itb.ac.id", "Leader 3");
    const member = await createUser("member1@itb.ac.id", "Member 1");

    const createRes = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team",
        {
          method: "POST",
          headers: {
            ...authHeader(leader.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamName: "Alpha Squad" }),
        }
      ),
      env
    );
    const teamData = (await createRes.json()) as any;
    const teamCode = teamData.data.teamCode;

    const joinRes = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team/join",
        {
          method: "POST",
          headers: {
            ...authHeader(member.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamCode }),
        }
      ),
      env
    );

    expect(joinRes.status).toBe(200);
    const joinBody = (await joinRes.json()) as any;
    expect(joinBody.success).toBe(true);
    expect(joinBody.data.members.length).toBe(2);
    expect(joinBody.data.members.some((m: any) => m.name === "Member 1")).toBe(true);
  });

  it("rejects invalid team code with TEAM_CODE_INVALID", async () => {
    const member = await createUser("member2@itb.ac.id", "Member 2");

    const res = await app.fetch(
      new Request(
        "http://localhost/api/competitions/business-case-competition/team/join",
        {
          method: "POST",
          headers: {
            ...authHeader(member.token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teamCode: "ZZZ-9999" }),
        }
      ),
      env
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.code).toBe("TEAM_CODE_INVALID");
  });
});
