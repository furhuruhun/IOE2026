"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ApiError } from "@/services/authService";
import { useIsLoggedIn } from "@/hooks/useAuth";
import { fetchMyTeam } from "@/services/teamService";
import { useTeamModalStore } from "@/stores/useTeamModalStore";

interface RegisterGuardContext {
  competitionId: string | undefined;
  slug: string;
  competitionName: string | undefined;
}

// Force-auth di route Public (/competitions/[slug]) — guard di level komponen, BUKAN
// middleware. Lihat TECHNICAL_CONSTRAINTS_FE.md §Force-auth di route Public. Pola
// `?redirect=` konsisten dengan yang sudah dibaca useLogin/useGoogleLogin.
//
// Belum login → redirect ke /login?redirect=/competitions/[slug]?openTeamModal=1 (marker
// query param dibaca CompetitionDetailHero setelah redirect-back untuk auto-buka modal —
// USER_FLOWS_v2.md langkah 5-6 minta modal "otomatis" muncul, tapi TIDAK menjelaskan
// mekanismenya; ini keputusan implementasi, dicatat di CHANGELOG).
// Sudah login → cek GET .../team (F-18 edge case: user yang sudah punya tim di kompetisi
// ini, modal di-skip, langsung ke /dashboard) baru buka modal Create/Join Team.
export function useRegisterGuard({ competitionId, slug, competitionName }: RegisterGuardContext) {
  const router = useRouter();
  const handleError = useErrorHandler();
  const isLoggedIn = useIsLoggedIn();
  const openModal = useTeamModalStore((s) => s.open);

  return useCallback(async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(`/competitions/${slug}?openTeamModal=1`)}`);
      return;
    }
    if (!competitionId || !competitionName) return; // data kompetisi belum selesai fetch

    const myTeam = await fetchMyTeam(competitionId).catch((error) => {
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        handleError(error, { redirectTo: `/login?redirect=${encodeURIComponent(`/competitions/${slug}?openTeamModal=1`)}` });
        return undefined;
      }
      return null;
    });
    if (myTeam === undefined) return;
    if (myTeam) {
      router.push("/dashboard");
      return;
    }

    openModal({ competitionId, slug, competitionName });
  }, [isLoggedIn, router, competitionId, slug, competitionName, openModal, handleError]);
}
