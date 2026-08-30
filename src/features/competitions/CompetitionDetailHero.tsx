"use client";

import { useEffect } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import { Button } from "@/components/ui/Button";
import { useCompetition } from "@/hooks/useCompetitions";
import { useIsLoggedIn } from "@/hooks/useAuth";
import { ApiError } from "@/services/authService";
import { useTeamModalStore } from "@/stores/useTeamModalStore";
import { useRegisterGuard } from "./useRegisterGuard";

interface CompetitionDetailHeroProps {
  slug: string;
}

// F-12 — Hero dengan CTA Register (auth-guard, lihat useRegisterGuard.ts) dan Download
// Guidebook. useCompetition(slug) di sini juga yang memicu notFound() untuk slug tidak
// valid — dipanggil dari client component (bukan page.tsx server component) supaya
// konsisten dengan pola "tiap section fetch sendiri" yang sudah dipakai di /competitions
// overview. Dicatat sebagai keputusan yang perlu smoke-test manual di CHANGELOG.md.
export function CompetitionDetailHero({ slug }: CompetitionDetailHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useIsLoggedIn();
  const openModal = useTeamModalStore((s) => s.open);
  const { data: competition, isLoading, isError, error } = useCompetition(slug);
  const handleRegisterClick = useRegisterGuard({
    competitionId: competition?.id,
    slug,
    competitionName: competition?.name,
  });

  // USER_FLOWS_v2.md langkah 5-6: setelah redirect-back dari /login, modal Create/Join
  // Team "otomatis" muncul (bukan user klik Register lagi). Marker `?openTeamModal=1` di-set
  // oleh useRegisterGuard.ts saat redirect ke /login — dibaca & dibersihkan di sini
  // (router.replace) supaya tidak re-trigger saat refresh/back (ROUTES.md §Catatan
  // Trade-off: client-state modal memang tidak persist lintas refresh).
  useEffect(() => {
    if (searchParams.get("openTeamModal") === "1" && isLoggedIn && competition) {
      openModal({ competitionId: competition.id, slug, competitionName: competition.name });
      router.replace(`/competitions/${slug}`);
    }
  }, [searchParams, isLoggedIn, competition, slug, openModal, router]);

  if (isError) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <section className="flex w-full flex-col items-center gap-md px-8 py-3xl text-center">
        <p className="text-b2 text-error-700">Gagal memuat detail kompetisi. Coba muat ulang halaman.</p>
      </section>
    );
  }

  return (
    <section
      className="flex w-full flex-col items-center gap-lg px-8 py-3xl text-center"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <span className="font-ui text-b4 uppercase tracking-widest text-primary-600 md:text-b3">
        Indonesia Ocean Expo 2027
      </span>

      {isLoading || !competition ? (
        <div className="h-12 w-64 animate-pulse rounded-lg bg-neutral-900 md:h-16 md:w-96" aria-hidden />
      ) : (
        <h1 className="font-heading text-h3 text-neutral-100 md:text-h1">{competition.name}</h1>
      )}

      <div className="mt-sm flex flex-wrap items-center justify-center gap-md">
        <Button variant="primary" onClick={handleRegisterClick} disabled={isLoading}>
          Register
        </Button>
        <Button
          variant="secondary"
          disabled={isLoading || !competition?.guidebookUrl}
          onClick={() => {
            if (competition?.guidebookUrl) {
              window.open(competition.guidebookUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <Icon icon="mdi:file-document-outline" className="size-5" />
          Download Guidebook
        </Button>
      </div>
    </section>
  );
}
