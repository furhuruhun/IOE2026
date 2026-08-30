"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCompetitions } from "@/hooks/useCompetitions";

// F-22 — Hero + countdown keseluruhan pendaftaran seluruh kompetisi. Target countdown =
// deadline TERDEKAT di antara semua kompetisi (API_CONTRACT tidak punya field "overall
// registration deadline" terpisah, jadi dihitung dari CompetitionSummary[] yang ada).
export function CompetitionHero() {
  const router = useRouter();
  const { data, isLoading } = useCompetitions();

  const nearestDeadline = useMemo(() => {
    if (!data || data.length === 0) return null;
    return new Date(Math.min(...data.map((c) => new Date(c.deadline).getTime())));
  }, [data]);

  return (
    <section
      className="flex w-full flex-col items-center gap-lg px-8 py-3xl text-center"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <span className="font-ui text-b4 uppercase tracking-widest text-primary-600 md:text-b3">
        Indonesia Ocean Expo 2027
      </span>
      <h1 className="font-heading text-h3 text-neutral-100 md:text-h1">Competition Overview</h1>
      {/* w-full wajib di samping max-w — parent flex pakai items-center (bukan stretch
          default), tanpa w-full elemen text ini menyusut ke min-content dan wrap sempit
          per 1-2 kata. */}
      <p className="w-full max-w-[42rem] text-b3 text-neutral-400 md:text-b1">
        Rangkaian kompetisi nasional IOE 2027 — Business Case, Paper &amp; Poster, dan Design Competition.
      </p>

      {isLoading || !nearestDeadline ? (
        <div className="flex items-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="size-[72px] animate-pulse rounded-full bg-neutral-900 md:size-[112px]" />
          ))}
        </div>
      ) : (
        <CountdownTimer targetDate={nearestDeadline} />
      )}

      <div className="mt-sm flex flex-wrap items-center justify-center gap-md">
        <Button variant="primary" onClick={() => router.push("#our-competition")}>
          Lihat Semua Kompetisi
        </Button>
        {/* variant="secondary", bukan "ghost" — ghost pakai overlay transparan tipis +
            teks gelap (#3E3E3E), didesain utk di atas surface terang, kontrasnya jelek di
            atas Hero gelap ini. secondary tetap opaque (gradient sendiri) jadi aman. */}
        <Button variant="secondary" onClick={() => router.push("#timeline")}>
          Lihat Timeline
        </Button>
      </div>
    </section>
  );
}
