"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/offline";
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
// split di desktop) beda total, bukan cuma soal ukuran. CompetitionCardMobile TIDAK
// disentuh oleh redesign di bawah — tetap GradientBorderBox+CTA_GRADIENT seperti semula.
//
// CompetitionCardDesktop — redesign 2026-09-03 mengikuti spec literal "COMPFEST design
// system" dari user (article image-left/content-right). Spec-nya pakai banyak nama class
// yang TIDAK ADA di design_system_final.md/globals.css (bg-component-card, bg-theme-gradient,
// text-lagoon-100, font-londontwo, font-jakarta, font-montserrat, after:bg-overlay-hover,
// text-text-1000, focus-visible:ring-ring/50, lucide arrow-right SVG) — pola yang sama
// persis sudah kejadian berkali-kali (Navbar.tsx CTA_PILL, CompetitionTimelineSection.tsx,
// Accordion.tsx) dan tiap kali dipetakan ke token asli yang SUDAH ADA, bukan bikin baru.
// Dikonfirmasi ke user (CLAUDE.md §6, bukan ditebak):
//   - bg-component-card → GradientBorderBox + CTA_GRADIENT fill (SAMA seperti sebelum
//     redesign & seperti CompetitionCardMobile) — dipakai lagi karena user minta card fill
//     tetap gradient. Konsekuensinya: heading TIDAK pakai gradient-clip text lagi (lihat
//     poin di bawah), karena teks gradient di atas fill gradient yang sama nyaris tak
//     kebaca — user sudah dikasih tau soal ini & memilih fill gradient + heading solid.
//   - bg-theme-gradient (CTA bg) → CTA_GRADIENT (style inline), text-lagoon-100 →
//     text-secondary-1000, after:bg-overlay-hover/pressed → after:bg-black/10 /
//     after:bg-black/20 — identik pola CTA_PILL di Navbar.tsx.
//   - Heading: BUKAN gradient text (bg-clip-text/text-transparent yang tadinya dipakai
//     sempat direvert user) — solid text-secondary-1000, sama seperti CompetitionCardMobile
//     & implementasi sebelum redesign. Ukuran heading sempat oscillate beberapa kali
//     (text-h3 40px → text-h4/h5 32px/24px) — SEKARANG text-h3/md:max-lg:text-h4
//     (40px/32px) lagi, sebagai bagian dari "upscale" 2026-09-03 10:50 di bawah.
//   - font-londontwo → no-op (h3 auto font-heading), font-jakarta → font-body,
//     font-montserrat → font-ui. text-h3/text-h4/text-b1/text-s5/text-s6 dipakai literal
//     (token asli). text-text-1000 → text-neutral-700 (keputusan user, sama kaya sebelumnya,
//     TIDAK ada family warna text-* di project ini).
//   - Upscale 2026-09-03 10:50: user minta margin desktop-wrapper 100px SAMA teknik
//     persis dengan CompetitionFAQSection (max-w-[1637.5px] mx-auto + md:px-20) — CATAT
//     ini bukan 100px flat di semua ukuran layar, cuma presisi 100px di viewport ~1837.5px
//     (matematika sama seperti FAQ, lihat CHANGELOG entry FAQ [09:20]). Karena grid jadi
//     lebih lega, kartu di-upscale ~1.2x (dikonfirmasi via AskUserQuestion, preset
//     "Modest ~20%"): gap-8→gap-10, image 160×141→192×169 (tablet 136×120→163×144,
//     rasio sama), heading text-h4→text-h3, paragraph text-b2→text-b1. Padding article
//     (p-8, 32px) SENGAJA TIDAK ikut naik ke p-10 — sempat naik lalu direvert eksplisit
//     oleh user [2026-09-03 11:00], tetap 32px meski gap/image/font lain naik.
//     CTA & drop-shadow image TIDAK diskalakan (di luar scope yang dikonfirmasi user).
//   - Struktur flex kolom kanan [2026-09-03 11:10]: h3/p/Link SEKARANG jadi direct children
//     flat dari 1 div justify-between (SAMA seperti markup asli COMPFEST) — SEBELUMNYA h3+p
//     dibungkus 1 div terpisah (gap-1) di dalam div justify-between, yang secara tidak
//     sengaja "mencuri" mereka dari distribusi ruang kosong justify-between (leftover space
//     cuma kebagi ke 1 gap, sebelum Link, bukan ke 2 gap seperti versi COMPFEST). User minta
//     ini biar heading & deskripsi ikut "bernapas" (dapat spasi ekstra) juga, bukan cuma CTA
//     yang terdorong ke bawah. h3 & p masing-masing dikasih w-full eksplisit (dulu diwarisi
//     dari wrapper div yang sekarang dihapus) supaya tetap align kiri & wrap penuh lebar.
//   - focus-visible:ring-ring/50 DIHAPUS — tidak ada token --color-ring sama sekali di
//     project, CTA_PILL (analog terdekat) juga tidak punya focus ring.
//   - Lucide arrow-right → mdi:arrow-right via <Icon> (@iconify/react/offline) — lucide-react
//     eksplisit dilarang, TECHNICAL_CONSTRAINTS_FE.md baris 15. `mdi:arrow-right` sudah
//     di-regenerate ke mdiIconBundle.generated.json via `npm run icons:bundle`.
//   - drop-shadow-[0_2.544px_2.544px_#2e0002] pada image: nilai arbitrary literal dari user,
//     TIDAK ADA presedan drop-shadow image manapun di design_system_final.md.
// design_system_final.md TIDAK SINKRON dengan poin-poin di atas — perlu ditambahkan manual
// oleh manusia. Lihat CHANGELOG [2026-09-03] "Redesign CompetitionCardDesktop".
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

function CompetitionCardDesktop({ competition, blurb }: CompetitionCardData) {
  return (
    <article className="h-full w-full md:max-lg:mx-auto md:max-lg:max-w-[620px]">
      <GradientBorderBox
        innerBackground={CTA_GRADIENT}
        outerRadius="24px"
        innerRadius="22px"
        className="h-full w-full"
      >
        <div className="flex w-full items-center gap-10 p-8">
          {blurb && (
            <img
              src={blurb.imageUrl}
              alt={competition.name}
              className="h-[169px] w-[192px] shrink-0 object-contain drop-shadow-[0_2.544px_2.544px_#2e0002] md:max-lg:h-[144px] md:max-lg:w-[163px]"
            />
          )}

          <div className="flex h-full flex-1 flex-col items-start justify-between gap-5">
            <h3 className="w-full text-h3 text-secondary-1000 md:max-lg:text-h4">{competition.name}</h3>
            {blurb && <p className="w-full font-body text-b1 text-neutral-700">{blurb.description}</p>}

            <Link
              href={`/competitions/${competition.slug}`}
              className="relative flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-s6! font-ui text-secondary-1000 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
              style={{ background: CTA_GRADIENT }}
            >
              Lihat Detail
              <Icon icon="mdi:arrow-right" className="size-5 md:size-6" />
            </Link>
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
            className="desktop-wrapper hidden w-full max-w-[1637.5px] mx-auto grid-cols-1 gap-x-9 gap-y-6 px-4 md:grid md:px-20 lg:grid-cols-2"
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

          <div className="desktop-wrapper hidden w-full max-w-[1637.5px] mx-auto grid-cols-1 gap-x-9 gap-y-6 px-4 md:grid md:px-20 lg:grid-cols-2">
            {items.map(({ competition, blurb }) => (
              <CompetitionCardDesktop key={competition.id} competition={competition} blurb={blurb} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
