"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import { useCompetitions } from "@/hooks/useCompetitions";

interface CompetitionDetailOtherCompetitionsCarouselProps {
  slug: string;
}

// "Other Competitions" — section TIDAK ada di PRD F-12–F-21 — perluasan scope mengikuti
// referensi layout (keputusan user). Struktur index+dots diadaptasi dari
// CompetitionTestimonialCarousel.tsx (tidak ada library carousel di project ini, semua
// hand-rolled — lihat CHANGELOG).
export function CompetitionDetailOtherCompetitionsCarousel({
  slug,
}: CompetitionDetailOtherCompetitionsCarouselProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useCompetitions();
  const [active, setActive] = useState(0);

  const others = (data ?? []).filter((c) => c.slug !== slug);

  const goTo = (next: number) => {
    if (others.length === 0) return;
    setActive(((next % others.length) + others.length) % others.length);
  };

  if (isError || (!isLoading && others.length === 0)) return null;

  const competition = others[active];

  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Other Competitions</h2>

      {isLoading || !competition ? (
        <div className="h-40 w-full max-w-[32rem] animate-pulse rounded-3xl bg-neutral-200" aria-hidden />
      ) : (
        <>
          <div className="flex w-full max-w-[32rem] items-center gap-md">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Kompetisi sebelumnya"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-200"
            >
              <Icon icon="mdi:chevron-left" className="size-6" />
            </button>

            <button
              type="button"
              onClick={() => router.push(`/competitions/${competition.slug}`)}
              className="flex flex-1 flex-col gap-sm rounded-3xl border border-neutral-300 bg-neutral-100 p-8 text-center transition-colors hover:bg-neutral-200"
            >
              <h3 className="text-h5 text-secondary-1000">{competition.name}</h3>
              <span className="text-b4 text-neutral-500">Lihat Detail</span>
            </button>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Kompetisi selanjutnya"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-200"
            >
              <Icon icon="mdi:chevron-right" className="size-6" />
            </button>
          </div>

          <div className="flex gap-2">
            {others.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke kompetisi ${i + 1}`}
                aria-current={i === active}
                className="rounded-full transition-[width,background] duration-[260ms] ease-out"
                style={{
                  height: "8px",
                  width: i === active ? "26px" : "8px",
                  background: i === active ? "var(--color-secondary-1000)" : "var(--color-neutral-300)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
