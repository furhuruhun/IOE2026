"use client";

import { useCompetition } from "@/hooks/useCompetitions";
import { CompetitionTimelineTrack } from "./CompetitionTimelineSection";

interface CompetitionDetailTimelineSectionProps {
  slug: string;
}

// F-14 — Each detail page uses its own timeline data with the overview's visual track.
export function CompetitionDetailTimelineSection({ slug }: CompetitionDetailTimelineSectionProps) {
  const { data: competition, isLoading, isError } = useCompetition(slug);

  if (isError) return null;

  // Detail data has no stage status, so avoid presenting unverified progress.
  const items = (competition?.timeline ?? []).map((item) => ({ ...item, status: "future" as const }));

  return (
    <section id="timeline" className="relative z-10 mx-auto flex w-full max-w-[1637.5px] flex-col items-center px-6 py-3xl md:px-20">
      <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Timeline Kompetisi</h2>

      {isLoading ? (
        <div className="mt-xl h-24 w-full animate-pulse rounded-3xl bg-neutral-200" aria-hidden />
      ) : items.length > 0 ? (
        <CompetitionTimelineTrack
          items={items}
          ariaLabel={`Timeline ${competition?.name ?? "kompetisi"}, geser untuk melihat jadwal lainnya`}
        />
      ) : null}
    </section>
  );
}
