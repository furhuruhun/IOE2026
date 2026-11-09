import type { TeamStatus } from "../teams/service";

export type RequirementStage = "registration" | "submission" | "final";

const statusRank: Record<TeamStatus, number> = {
  pendaftar: 1,
  peserta: 2,
  finalis: 3,
};

const stageRank: Record<RequirementStage, number> = {
  registration: 1,
  submission: 2,
  final: 3,
};

export function canAccessRequirementStage(status: TeamStatus, stage: RequirementStage): boolean {
  return statusRank[status] >= stageRank[stage];
}
