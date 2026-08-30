"use client";

import { useCompetition } from "@/hooks/useCompetitions";

const GRADIENT_TEXT =
  "linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-600), var(--color-tertiary-600))";

interface CompetitionDetailPrizeSectionProps {
  slug: string;
}

// Section TIDAK ada di PRD F-12–F-21 — perluasan scope mengikuti referensi layout
// (keputusan user). totalPrizePool & prizeBreakdown: placeholder di
// mocks/competitionDetails.ts (gap API_CONTRACT.md, lihat types/competition.ts).
export function CompetitionDetailPrizeSection({ slug }: CompetitionDetailPrizeSectionProps) {
  const { data: competition, isLoading, isError } = useCompetition(slug);

  if (isError) return null;

  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 text-center md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">
        Total <span className="text-primary-600">Prize Pool</span>
      </h2>

      {isLoading || !competition ? (
        <div className="h-12 w-48 animate-pulse rounded-lg bg-neutral-200" aria-hidden />
      ) : (
        <>
          <p
            className="font-heading text-h3 font-bold md:text-h1"
            style={{
              backgroundImage: GRADIENT_TEXT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {competition.totalPrizePool}
          </p>

          <div className="grid w-full max-w-[48rem] grid-cols-1 gap-md sm:grid-cols-3">
            {competition.prizeBreakdown.map((prize) => (
              <div
                key={prize.label}
                className="flex flex-col items-center gap-sm rounded-3xl border border-neutral-300 bg-neutral-100 p-8"
              >
                <h3 className="text-h6 text-secondary-1000">{prize.label}</h3>
                <p className="font-heading text-h5 text-primary-600 md:text-h4">{prize.amount}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
