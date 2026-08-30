import type { PublicTeamSummary, Team, TeamMember } from "@/types/team";

// Mock POST/GET /competitions/:id/team* selama WORKERS_API_URL belum ready — sama alasan
// dengan mocks/competitions.ts & mocks/competitionDetails.ts. BEDA dari kedua mock itu:
// endpoint ini state-mutating (create/join team), jadi dipakai in-memory store per
// module-scope (bukan array statis read-only). Ini CUKUP untuk dev/demo lokal (Next.js dev
// server = 1 proses Node persistent), TAPI reset tiap restart dev server dan TIDAK aman
// untuk multi-instance/production — wajib dihapus begitu Workers beneran deploy. Dicatat
// di CHANGELOG.md.
interface MockTeamRecord extends Required<Team> {
  competitionId: string;
  maxMember: number;
}

const MAX_MEMBER = 5;
const MOCK_LEADER: TeamMember = { id: "mock-user-1", name: "You", studentId: "10021234" };

const mockTeams: MockTeamRecord[] = [
  // Pre-seed 1 tim public per kompetisi mock supaya Cabang C (Join via Public Team) ada
  // isinya buat demo, bukan selalu empty-state.
  {
    competitionId: "comp-business-case",
    teamId: "team-seed-1",
    teamName: "Ocean Innovators",
    teamCode: "OCN-7XJ2",
    visibility: "public",
    isLeader: false,
    batch: "Batch 1",
    status: "pending",
    leader: { id: "mock-user-0", name: "Alex" },
    members: [{ id: "mock-user-0", name: "Alex", studentId: "10019999" }],
    maxMember: MAX_MEMBER,
  },
];

// competitionId -> userId -> teamId, supaya "tim saya" konsisten dalam 1 sesi dev meski
// tidak ada auth multi-user sungguhan di mock. Semua request mock diperlakukan sebagai
// "mock-user-1" (lihat MOCK_LEADER) karena tidak ada cara membedakan user asli dari token
// dummy di lingkungan tanpa Workers.
const myTeamByCompetition = new Map<string, string>(); // competitionId -> teamId

function generateTeamCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const alnum = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const pick = (pool: string, len: number) =>
    Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join("");
  return `${pick(letters, 3)}-${pick(alnum, 4)}`;
}

function toPublicSummary(t: MockTeamRecord): PublicTeamSummary {
  return { teamId: t.teamId, teamName: t.teamName, memberCount: t.members.length, maxMember: t.maxMember };
}

export function findMyMockTeam(competitionId: string): MockTeamRecord | undefined {
  const teamId = myTeamByCompetition.get(competitionId);
  return teamId ? mockTeams.find((t) => t.teamId === teamId && t.competitionId === competitionId) : undefined;
}

export function createMockTeam(competitionId: string, teamName: string): MockTeamRecord {
  const team: MockTeamRecord = {
    competitionId,
    teamId: `team-${Date.now()}`,
    teamName,
    teamCode: generateTeamCode(),
    visibility: "private",
    isLeader: true,
    batch: "Batch 1",
    status: "pending",
    leader: MOCK_LEADER,
    members: [MOCK_LEADER],
    maxMember: MAX_MEMBER,
  };
  mockTeams.push(team);
  myTeamByCompetition.set(competitionId, team.teamId);
  return team;
}

export function joinMockTeamByCode(
  competitionId: string,
  teamCode: string
): { team: MockTeamRecord } | { errorCode: "TEAM_CODE_INVALID" | "TEAM_FULL" } {
  const team = mockTeams.find(
    (t) => t.competitionId === competitionId && t.teamCode.toUpperCase() === teamCode.toUpperCase()
  );
  if (!team) return { errorCode: "TEAM_CODE_INVALID" };
  if (team.members.length >= team.maxMember) return { errorCode: "TEAM_FULL" };
  if (!team.members.some((m) => m.id === MOCK_LEADER.id)) team.members.push(MOCK_LEADER);
  myTeamByCompetition.set(competitionId, team.teamId);
  return { team: { ...team, isLeader: false } };
}

export function listPublicMockTeams(competitionId: string): PublicTeamSummary[] {
  return mockTeams.filter((t) => t.competitionId === competitionId && t.visibility === "public").map(toPublicSummary);
}

export function joinPublicMockTeam(
  competitionId: string,
  teamId: string
): { team: MockTeamRecord } | { errorCode: "TEAM_FULL" | "TEAM_NOT_PUBLIC" } {
  const team = mockTeams.find((t) => t.competitionId === competitionId && t.teamId === teamId);
  if (!team || team.visibility !== "public") return { errorCode: "TEAM_NOT_PUBLIC" };
  if (team.members.length >= team.maxMember) return { errorCode: "TEAM_FULL" };
  if (!team.members.some((m) => m.id === MOCK_LEADER.id)) team.members.push(MOCK_LEADER);
  myTeamByCompetition.set(competitionId, team.teamId);
  return { team: { ...team, isLeader: false } };
}
