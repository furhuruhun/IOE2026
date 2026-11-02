"use client";

import Image from "next/image";
import { sponsors } from "@/features/landing/landingContent";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCompetition } from "@/hooks/useCompetitions";

interface CompetitionDetailAboutSectionProps {
  slug: string;
}

const descriptionArtwork = "/images/competitions/ioe-bcc-description-spotlight.svg";

// F-13: description and registration deadline for this competition.
// F-16: development sponsor placeholders remain below the information layout.
export function CompetitionDetailAboutSection({ slug }: CompetitionDetailAboutSectionProps) {
  const { data: competition, isLoading, isError } = useCompetition(slug);

  if (isError) return null; // Hero handles errors and unknown slugs.

  const deadline = competition ? new Date(competition.deadline) : null;
  const hasDeadline = deadline !== null && Number.isFinite(deadline.getTime());

  return (
    <section
      id="about"
      className="relative isolate flex w-full flex-col gap-16 overflow-x-clip px-6 sm:px-8 md:gap-20 md:px-12 lg:mt-28 lg:grid lg:grid-cols-5 lg:gap-12 lg:px-16 xl:mt-40 xl:px-20 2xl:mt-48 2xl:px-24"
    >
      <div className="relative isolate col-span-3 flex h-full min-w-0 w-full flex-col items-center justify-center gap-4 md:gap-8 lg:col-start-3 lg:row-start-1 xl:gap-12 2xl:gap-16">
        <Image
          src={descriptionArtwork}
          alt=""
          aria-hidden="true"
          width={1200}
          height={780}
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-auto w-[240%] max-w-none -translate-x-1/2 -translate-y-1/2 sm:w-[210%] md:w-[185%] lg:hidden [[data-theme=dark]_&]:brightness-[.25]"
        />
        <Image
          src={descriptionArtwork}
          alt=""
          aria-hidden="true"
          width={1200}
          height={780}
          className="pointer-events-none absolute top-1/2 -right-48 z-0 hidden h-auto w-[950px] max-w-none -translate-y-1/2 lg:block xl:-right-56 xl:w-[1050px] 2xl:-right-64 2xl:w-[1200px] [[data-theme=dark]_&]:brightness-[.25]"
        />

        {isLoading || !competition ? (
          <div className="relative z-10 h-32 w-full max-w-[36rem] animate-pulse rounded-3xl bg-neutral-200" aria-label="Memuat informasi kompetisi" />
        ) : (
          <>
            <h2 className="relative z-10 max-w-full text-center font-heading text-h4 text-secondary-1000 sm:text-h3 md:text-h2 xl:text-h1">
              Tentang {competition.name}
            </h2>
            <p className="relative z-10 w-full max-w-[36rem] text-center font-body text-b2 text-neutral-800 md:text-b1 lg:max-w-[36rem] xl:max-w-[42rem] 2xl:max-w-[48rem]">
              {competition.description}
            </p>
          </>
        )}
      </div>

      <div className="z-10 col-span-2 flex h-full min-w-0 flex-col items-center justify-center gap-4 md:gap-8 lg:col-start-1 lg:row-start-1">
        <h2 className="text-center font-heading text-h6 text-secondary-1000 sm:text-h5 md:text-h4 xl:text-h3 2xl:text-h2">
          Batas pendaftaran
        </h2>
        {isLoading || !competition ? (
          <div className="h-28 w-full max-w-[26rem] animate-pulse rounded-lg bg-neutral-200" aria-hidden="true" />
        ) : hasDeadline ? (
          <CountdownTimer key={competition.deadline} targetDate={deadline} variant="competitionDetail" />
        ) : (
          <p className="font-body text-b3 text-neutral-700">Batas pendaftaran belum tersedia.</p>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="flex flex-col items-center gap-4 lg:col-span-5">
          <h4 className="text-b3 font-semibold text-neutral-700">Didukung oleh</h4>
          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor}
                className="flex h-12 items-center rounded-md border border-neutral-300 bg-neutral-200 px-4 text-b3 font-semibold text-neutral-700"
              >
                {sponsor}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
