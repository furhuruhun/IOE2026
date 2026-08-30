"use client";

import { sponsors } from "@/features/landing/landingContent";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCompetition } from "@/hooks/useCompetitions";

const GRADIENT_BORDER =
  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-600) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)";

interface CompetitionDetailAboutSectionProps {
  slug: string;
}

// F-13 (About + countdown menuju deadline pendaftaran KOMPETISI INI, bukan gabungan
// seluruh kompetisi seperti overview page) + F-16 (Sponsor, digabung ke About — pola sama
// dengan CompetitionAboutSection.tsx overview page).
export function CompetitionDetailAboutSection({ slug }: CompetitionDetailAboutSectionProps) {
  const { data: competition, isLoading, isError } = useCompetition(slug);

  if (isError) return null; // Hero sudah menampilkan pesan error/notFound

  return (
    <section id="about" className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Tentang Kompetisi</h2>

      {isLoading || !competition ? (
        <div className="h-32 w-full max-w-[48rem] animate-pulse rounded-3xl bg-neutral-200" aria-hidden />
      ) : (
        <>
          <div className="w-full max-w-[48rem] rounded-3xl p-0.5" style={{ background: GRADIENT_BORDER }}>
            <div className="flex flex-col gap-sm rounded-[22px] bg-neutral-100 px-8 py-5 md:px-16 md:py-10">
              <p className="text-b3 text-neutral-700 md:text-b2">{competition.description}</p>
            </div>
          </div>

          <CountdownTimer targetDate={new Date(competition.deadline)} />
        </>
      )}

      <div className="flex flex-col items-center gap-sm">
        <h4 className="text-b3 font-semibold text-neutral-700">Didukung oleh</h4>
        <div className="flex flex-wrap justify-center gap-sm">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor}
              className="flex h-12 items-center rounded-md border border-neutral-300 bg-neutral-200 px-md text-b3 font-semibold text-neutral-600"
            >
              {sponsor}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
