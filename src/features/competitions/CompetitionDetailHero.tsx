"use client";

import { useEffect } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Icon } from "@iconify/react/offline";

import { useCompetition } from "@/hooks/useCompetitions";
import { useCurrentUser } from "@/hooks/useAuth";
import { ParticipantAction } from "@/features/auth/RoleJourney";
import { ApiError } from "@/services/authService";
import { useTeamModalStore } from "@/stores/useTeamModalStore";
import { competitionLogos } from "./competitionLogos";
import { useRegisterGuard } from "./useRegisterGuard";

interface CompetitionDetailHeroProps {
  slug: string;
}

// F-12 — Hero dengan CTA Register (auth-guard, lihat useRegisterGuard.ts). useCompetition(slug)
// di sini juga yang memicu notFound() untuk slug tidak valid — dipanggil dari client component
// (bukan page.tsx server component) supaya konsisten dengan pola "tiap section fetch sendiri"
// yang sudah dipakai di /competitions overview. Dicatat sebagai keputusan yang perlu smoke-test
// manual di CHANGELOG.md.
//
// Background artwork follows the /competitions overview hero.
export function CompetitionDetailHero({ slug }: CompetitionDetailHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identity = useCurrentUser();
  const openModal = useTeamModalStore((s) => s.open);
  const { data: competition, isLoading, isError, error } = useCompetition(slug);
  const logoSrc = (competitionLogos as Record<string, string>)[slug];
  const logoWidth = slug === "design-competition" ? 1305 : 1489;
  const logoHeight = slug === "design-competition" ? 1206 : 1056;
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
    if (searchParams.get("openTeamModal") === "1" && identity.isSuccess && identity.data && competition) {
      if (identity.data.role === "peserta") openModal({ competitionId: competition.id, slug, competitionName: competition.name });
      router.replace(`/competitions/${slug}`);
    }
  }, [searchParams, identity.isSuccess, identity.data, competition, slug, openModal, router]);

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
      className="relative w-full overflow-hidden pt-8 pb-16 md:max-lg:pb-10 md:pt-16 lg:pt-[95px]"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, transparent 40%, var(--color-background) 100%), url('/images/competitions/hero_section.webp')",
        backgroundPosition: "center top",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-360 flex-col items-center justify-center gap-12 px-4 md:px-8 lg:flex-row xl:px-23">
        <div className="flex w-full flex-col items-center gap-8 lg:mt-11 lg:w-133.75 lg:flex-none">
          <div className="flex flex-col items-center">
            <span className="mb-3 font-ui text-b4 uppercase tracking-widest text-secondary-1000 md:text-b3 [[data-theme=dark]_&]:text-secondary-100">
              Indonesia Ocean Expo 2027
            </span>

            {logoSrc ? (
              <Image
                src={logoSrc}
                alt=""
                width={logoWidth}
                height={logoHeight}
                sizes="(min-width: 768px) 128px, 96px"
                loading="eager"
                className="mb-3 h-auto w-24 object-contain md:w-32"
              />
            ) : (
              <div
                aria-hidden
                className="mb-3 flex w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg md:max-lg:w-22 md:w-26 aspect-square"
              >
                <Icon icon="mdi:trophy" className="size-8 text-secondary-1000 md:max-lg:size-9 md:size-11" />
              </div>
            )}

            {isLoading || !competition ? (
              <div className="h-12 w-64 animate-pulse rounded-lg bg-neutral-900 md:h-16 md:w-96" aria-hidden />
            ) : (
              <h1 className="max-w-full wrap-anywhere text-center font-heading text-h3 text-secondary-1000 md:text-h1 [[data-theme=dark]_&]:text-secondary-100">{competition.name}</h1>
            )}
          </div>

          <div className="mt-2 flex flex-col items-center gap-6 lg:mt-7">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <ParticipantAction><button
                type="button"
                onClick={handleRegisterClick}
                disabled={isLoading}
                className="ui-action ui-action-primary ui-action-sm"
              >
                Register
                <Icon icon="mdi:pencil" className="size-5 md:size-6" />
              </button></ParticipantAction>

              <a
                href="#about"
                className="ui-action ui-action-secondary ui-action-sm"
              >
                Explore More
                <Icon icon="mdi:arrow-down" className="size-5 md:size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
