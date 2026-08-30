"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, fetchMyTeam, fetchPublicTeams, joinPublicTeam, joinTeamByCode } from "@/services/teamService";

export const teamKeys = {
  all: ["team"] as const,
  mine: (competitionId: string) => [...teamKeys.all, "mine", competitionId] as const,
  public: (competitionId: string) => [...teamKeys.all, "public", competitionId] as const,
};

// enabled dikontrol pemanggil (hanya query kalau user sudah login DAN competitionId ada) —
// dipakai useRegisterGuard untuk keputusan skip-modal (F-18: user yang sudah py tim di
// kompetisi ini, modal di-skip otomatis, langsung ke /dashboard).
export function useMyTeam(competitionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: teamKeys.mine(competitionId ?? ""),
    queryFn: () => fetchMyTeam(competitionId!),
    enabled: enabled && Boolean(competitionId),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function usePublicTeams(competitionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: teamKeys.public(competitionId ?? ""),
    queryFn: () => fetchPublicTeams(competitionId!),
    enabled: enabled && Boolean(competitionId),
    staleTime: 30 * 1000,
  });
}

export function useCreateTeam(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamName: string) => createTeam(competitionId, teamName),
    onSuccess: (team) => queryClient.setQueryData(teamKeys.mine(competitionId), team),
  });
}

export function useJoinTeamByCode(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamCode: string) => joinTeamByCode(competitionId, teamCode),
    onSuccess: (team) => queryClient.setQueryData(teamKeys.mine(competitionId), team),
  });
}

export function useJoinPublicTeam(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => joinPublicTeam(competitionId, teamId),
    onSuccess: (team) => {
      queryClient.setQueryData(teamKeys.mine(competitionId), team);
      queryClient.invalidateQueries({ queryKey: teamKeys.public(competitionId) });
    },
  });
}
