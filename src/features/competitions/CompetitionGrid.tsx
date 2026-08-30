"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCompetitions } from "@/hooks/useCompetitions";
import { competitionBlurbs } from "./competitionsContent";

// F-24 — CTA List menuju masing-masing halaman competition details. Deskripsi blurb per
// kompetisi diambil dari competitionsContent.ts (copy lokal) karena CompetitionSummary
// (API_CONTRACT.md) tidak punya field description di endpoint list.
export function CompetitionGrid() {
  const router = useRouter();
  const { data, isLoading, isError } = useCompetitions();

  return (
    <section id="our-competition" className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Our Competition</h2>

      {isLoading && (
        <div className="grid w-full max-w-5xl grid-cols-1 gap-md md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-neutral-200" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-b2 text-error-700">Gagal memuat daftar kompetisi. Coba muat ulang halaman.</p>
      )}

      {data && data.length === 0 && (
        <p className="text-b2 text-neutral-700">Belum ada kompetisi yang dibuka saat ini.</p>
      )}

      {data && data.length > 0 && (
        <div className="grid w-full max-w-5xl grid-cols-1 gap-md md:grid-cols-3">
          {data.map((competition) => {
            const blurb = competitionBlurbs.find((b) => b.slug === competition.slug);
            return (
              <div
                key={competition.id}
                className="flex flex-col gap-md rounded-3xl border border-neutral-300 bg-neutral-100 p-8"
              >
                <h3 className="text-h5 text-secondary-1000">{competition.name}</h3>
                {blurb && <p className="flex-1 text-b3 text-neutral-700">{blurb.description}</p>}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/competitions/${competition.slug}`)}
                >
                  Lihat Detail
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
