import { unwrapResponse as unwrap } from "@/services/apiResponse";
import type { CompetitionDetail, CompetitionSummary } from "@/types/competition";

export async function fetchCompetitions(): Promise<CompetitionSummary[]> {
  const res = await fetch("/api/competitions");
  return unwrap<CompetitionSummary[]>(res);
}

export async function fetchCompetition(slug: string): Promise<CompetitionDetail> {
  const res = await fetch(`/api/competitions/${slug}`);
  return unwrap<CompetitionDetail>(res);
}
