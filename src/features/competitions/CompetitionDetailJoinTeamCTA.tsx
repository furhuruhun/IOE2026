"use client";

import { Button } from "@/components/ui/Button";
import { useCompetition } from "@/hooks/useCompetitions";
import { useRegisterGuard } from "./useRegisterGuard";

interface CompetitionDetailJoinTeamCTAProps {
  slug: string;
}

// "Join a Team Now" — CTA kedua menuju Register, gradient idiom sama dengan
// CompetitionDiscordCTA.tsx. Section TIDAK ada di PRD F-12–F-21 — perluasan scope mengikuti
// referensi layout (keputusan user).
export function CompetitionDetailJoinTeamCTA({ slug }: CompetitionDetailJoinTeamCTAProps) {
  const { data: competition } = useCompetition(slug);
  const handleRegisterClick = useRegisterGuard({
    competitionId: competition?.id,
    slug,
    competitionName: competition?.name,
  });

  return (
    <section
      className="flex w-full flex-col items-center gap-md px-8 py-16 text-center md:px-20"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <h2 className="font-heading text-h4 text-neutral-100 md:text-h2">
        Join a <span className="text-primary-600">Team</span> Now!
      </h2>
      <Button variant="primary" onClick={handleRegisterClick}>
        Join Now!
      </Button>
    </section>
  );
}
