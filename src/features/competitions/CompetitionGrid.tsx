"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CTA_GRADIENT } from "@/components/ui/Navbar";
import { GradientBorderBox } from "@/components/ui/GradientBorderBox";
import { useCompetitions } from "@/hooks/useCompetitions";
import { competitionBlurbs, type CompetitionBlurb } from "./competitionsContent";
import type { CompetitionSummary } from "@/types/competition";

// F-24 — CTA List menuju masing-masing halaman competition details. Deskripsi/gambar per
// kompetisi diambil dari competitionsContent.ts (copy lokal) karena CompetitionSummary
// (API_CONTRACT.md) tidak punya field description/gambar di endpoint list.
//
// Layout dipecah jadi 2 parent container terpisah (mobile carousel vs desktop grid),
// BUKAN satu <article> yang di-reflow lewat Tailwind responsive prefix — instruksi
// eksplisit user, karena struktur internal kartu (vertical stack di mobile vs horizontal
// split di desktop) beda total, bukan cuma soal ukuran.
//
// Card fill/border: spec user minta class `bg-component-card` yang TIDAK ADA sebagai
// Tailwind utility resmi (design_system_final.md/globals.css) — satu-satunya jejaknya
// komentar di §SpeakerCard/§TiltedCard yang me-resolve ke solid dark teal (#132321/
// #16302B). Ditanyakan ke user (bukan ditebak, CLAUDE.md §6): jawabannya pakai GRADIENT
// untuk border & isi kartu, asal dua gradient itu beda. Dipakai kombinasi yang SUDAH ADA
// & terdokumentasi (tidak mengarang value baru): border = default gradient
// GradientBorderBox (primary-300→secondary-600→tertiary-600, dipakai FannedCard/
// SpeakerCard/MyJourneyCard/CountdownTimer, design_system_final.md baris 898), isi =
// CTA_GRADIENT (gradient resmi Button primary/Login CTA, di-export dari Navbar.tsx).
// Kombinasi ini BELUM masuk sebagai entry resmi design_system_final.md §Komponen — dicatat
// sbg follow-up di CHANGELOG, perlu direview desainer manusia.
type CompetitionCardData = {
  competition: CompetitionSummary;
  blurb: CompetitionBlurb | undefined;
};

function mergeCompetitions(
  data: CompetitionSummary[] | undefined
): CompetitionCardData[] {
  if (!data) return [];
  return data.map((competition) => ({
    competition,
    blurb: competitionBlurbs.find((b) => b.slug === competition.slug),
  }));
}

function CompetitionCardMobile({
  competition,
  blurb,
  onSelect,
}: CompetitionCardData & { onSelect: () => void }) {
  return (
    <article className="w-70 shrink-0 snap-center">
      <GradientBorderBox
        innerBackground={CTA_GRADIENT}
        outerRadius="24px"
        innerRadius="22px"
        className="h-full w-full"
      >
        <div className="flex w-full flex-col items-center gap-5 p-6">
          <div className="flex w-full flex-col gap-1">
            <h3 className="text-h5 text-secondary-1000">{competition.name}</h3>
            {blurb && <p className="text-b3 text-neutral-700">{blurb.description}</p>}
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col justify-center px-12">
            {blurb && (
              <img src={blurb.imageUrl} alt={competition.name} className="w-full object-contain" />
            )}
          </div>

          <Button variant="primary" className="w-full" onClick={onSelect}>
            Lihat Detail
          </Button>
        </div>
      </GradientBorderBox>
    </article>
  );
}

function CompetitionCardDesktop({
  competition,
  blurb,
  onSelect,
}: CompetitionCardData & { onSelect: () => void }) {
  return (
    <article className="h-full w-full">
      <GradientBorderBox
        innerBackground={CTA_GRADIENT}
        outerRadius="24px"
        innerRadius="22px"
        className="h-full w-full"
      >
        <div className="flex w-full items-center gap-8 p-8">
          {blurb && (
            <img
              src={blurb.imageUrl}
              alt={competition.name}
              className="h-[141px] w-[160px] shrink-0 object-contain"
            />
          )}

          <div className="flex h-full flex-1 flex-col items-start justify-between gap-5">
            <div className="flex w-full flex-col gap-1">
              <h3 className="text-h5 text-secondary-1000">{competition.name}</h3>
              {blurb && <p className="text-b3 text-neutral-700">{blurb.description}</p>}
            </div>

            <Button variant="primary" className="w-full" onClick={onSelect}>
              Lihat Detail
            </Button>
          </div>
        </div>
      </GradientBorderBox>
    </article>
  );
}

export function CompetitionGrid() {
  const router = useRouter();
  const { data, isLoading, isError } = useCompetitions();
  const items = mergeCompetitions(data);

  const goToDetail = (slug: string) => router.push(`/competitions/${slug}`);

  return (
    <section id="our-competition" className="flex w-full flex-col items-center gap-2xl py-16">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Our Competition</h2>

      {isLoading && (
        <>
          <div className="mobile-wrapper flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar md:hidden" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 w-70 shrink-0 animate-pulse rounded-3xl bg-neutral-200" />
            ))}
          </div>
          <div
            className="desktop-wrapper hidden w-full max-w-[1440px] mx-auto grid-cols-1 gap-x-9 gap-y-6 px-4 md:grid md:px-8 lg:grid-cols-2 xl:px-[92px]"
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 w-full animate-pulse rounded-3xl bg-neutral-200" />
            ))}
          </div>
        </>
      )}

      {isError && (
        <p className="text-b2 text-error-700">Gagal memuat daftar kompetisi. Coba muat ulang halaman.</p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-b2 text-neutral-700">Belum ada kompetisi yang dibuka saat ini.</p>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="mobile-wrapper flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar md:hidden">
            {items.map(({ competition, blurb }) => (
              <CompetitionCardMobile
                key={competition.id}
                competition={competition}
                blurb={blurb}
                onSelect={() => goToDetail(competition.slug)}
              />
            ))}
          </div>

          <div className="desktop-wrapper hidden w-full max-w-[1440px] mx-auto grid-cols-1 gap-x-9 gap-y-6 px-4 md:grid md:px-8 lg:grid-cols-2 xl:px-[92px]">
            {items.map(({ competition, blurb }) => (
              <CompetitionCardDesktop
                key={competition.id}
                competition={competition}
                blurb={blurb}
                onSelect={() => goToDetail(competition.slug)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
