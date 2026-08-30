import type { ApiResponse } from "@/types/auth";
import type { CompetitionDetail, CompetitionSummary } from "@/types/competition";
import { ApiError } from "@/services/authService";

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "SERVER_ERROR", json.error?.message ?? "Terjadi kesalahan, coba lagi nanti");
  }
  return json.data;
}

export async function fetchCompetitions(): Promise<CompetitionSummary[]> {
  const res = await fetch("/api/competitions");
  return unwrap<CompetitionSummary[]>(res);
}

export async function fetchCompetition(slug: string): Promise<CompetitionDetail> {
  const res = await fetch(`/api/competitions/${slug}`);
  return unwrap<CompetitionDetail>(res);
}
