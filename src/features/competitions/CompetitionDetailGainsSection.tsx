import { TiltedCard } from "@/components/ui/TiltedCard";
import { getCompetitionDetailContent } from "./competitionDetailContent";

interface CompetitionDetailGainsSectionProps {
  slug: string;
}

// F-15 — "What You'll Gain", tilted card layout (design_system_final.md §TiltedCard).
// Konten placeholder lokal (bukan dari API) jadi wrapper ini Server Component; TiltedCard
// sendiri "use client" karena butuh pointer tracking.
export function CompetitionDetailGainsSection({ slug }: CompetitionDetailGainsSectionProps) {
  const { gains } = getCompetitionDetailContent(slug);

  if (gains.length === 0) return null;

  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">
        What You&apos;ll <span className="text-primary-600">Gain</span>
      </h2>
      <TiltedCard items={gains} />
    </section>
  );
}
