"use client";

import { ParticipantAction } from "@/features/auth/RoleJourney";

import { Icon } from "@iconify/react/offline";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { useCompetition } from "@/hooks/useCompetitions";
import { useRegisterGuard } from "./useRegisterGuard";

interface CompetitionDetailJoinTeamCTAProps {
  slug: string;
}

// "Join a Team Now" — CTA kedua menuju Register. Section TIDAK ada di PRD F-12–F-21 —
// perluasan scope mengikuti referensi layout (keputusan user).
export function CompetitionDetailJoinTeamCTA({ slug }: CompetitionDetailJoinTeamCTAProps) {
  const { data: competition } = useCompetition(slug);
  const handleRegisterClick = useRegisterGuard({
    competitionId: competition?.id,
    slug,
    competitionName: competition?.name,
  });

  return (
    <section
      className="relative mt-8 flex min-h-[150px] w-full items-center justify-center overflow-hidden sm:min-h-[190px] md:min-h-[230px] lg:min-h-[280px] xl:min-h-[320px]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--color-background) 0%, transparent 42%), linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)",
      }}
    >
      <div className="relative z-10 grid w-full grid-cols-5 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <Image
          src="/images/competitions/ioe-join-team-logo.svg"
          alt=""
          width={500}
          height={500}
          unoptimized
          className="col-span-2 h-auto w-24 justify-self-center sm:w-36 md:w-48 lg:w-64 xl:w-80 2xl:w-96"
        />

        <div className="col-span-3 flex flex-col items-start gap-3 text-center sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
          <h2 className="font-heading text-h6 leading-tight text-neutral-100 sm:text-h4 md:text-h3 lg:text-h2 xl:text-h1">
            Register <span className="text-primary-300">Your Team</span> Now!
          </h2>
          <ParticipantAction><Button
            variant="primary"
            size="sm"
            onClick={handleRegisterClick}
            className="shrink-0 rounded-xl px-4 py-2 text-s6 md:rounded-2xl md:px-5 md:py-3 md:text-s5"
          >
            Join Now
            <Icon icon="mdi:door-open" className="size-5 md:size-6" aria-hidden="true" />
          </Button></ParticipantAction>
        </div>
      </div>
    </section>
  );
}
