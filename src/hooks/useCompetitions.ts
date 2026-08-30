"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompetition, fetchCompetitions } from "@/services/competitionService";

export const competitionKeys = {
  all: ["competitions"] as const,
  list: () => [...competitionKeys.all, "list"] as const,
  detail: (slug: string) => [...competitionKeys.all, "detail", slug] as const,
};

export function useCompetitions() {
  return useQuery({
    queryKey: competitionKeys.list(),
    queryFn: fetchCompetitions,
    staleTime: 5 * 60 * 1000,
  });
}

// retry: false — slug tidak valid harus cepat mengembalikan NOT_FOUND supaya page.tsx bisa
// panggil notFound(), bukan retry 3x default TanStack Query dulu.
export function useCompetition(slug: string) {
  return useQuery({
    queryKey: competitionKeys.detail(slug),
    queryFn: () => fetchCompetition(slug),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
