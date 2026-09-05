"use client";

import { useEffect } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import { CTA_GRADIENT } from "@/components/ui/Navbar";
import { useCompetition } from "@/hooks/useCompetitions";
import { useIsLoggedIn } from "@/hooks/useAuth";
import { ApiError } from "@/services/authService";
import { useTeamModalStore } from "@/stores/useTeamModalStore";
import { useRegisterGuard } from "./useRegisterGuard";

interface CompetitionDetailHeroProps {
  slug: string;
}

// F-12 — Hero dengan CTA Register (auth-guard, lihat useRegisterGuard.ts). useCompetition(slug)
// di sini juga yang memicu notFound() untuk slug tidak valid — dipanggil dari client component
// (bukan page.tsx server component) supaya konsisten dengan pola "tiap section fetch sendiri"
// yang sudah dipakai di /competitions overview. Dicatat sebagai keputusan yang perlu smoke-test
// manual di CHANGELOG.md.
//
// Redesign 2026-09-03 mengikuti spec literal "COMPFEST design system" dari user. Sama seperti
// CompetitionCardDesktop/CompetitionTimelineSection/CompetitionDiscordCTA, spec-nya pakai banyak
// nama class yang TIDAK ADA di design_system_final.md/globals.css — dipetakan ke token asli yang
// SUDAH ADA, presedan sama persis kaya CTA_PILL (Navbar.tsx). Kontradiksi & keputusan baru
// dilaporkan ke user dulu (plan mode + AskUserQuestion, CLAUDE.md §1/§2/§6) sebelum ngoding:
//   - bg-theme-compe → CTA_GRADIENT, text-lagoon-100 → text-secondary-1000, font-montserrat →
//     font-ui, hover:after:bg-overlay-hover/active:after:bg-overlay-pressed → after:bg-black/10
//     / after:bg-black/20, focus-visible:ring-ring/50 & aria-invalid:* DIHAPUS (--color-ring &
//     "destructive" tidak ada di project) — presedan identik CompetitionDiscordCTA.tsx.
//   - BUTTON 2 (Explore More) warna: spec asli `bg-black/8 dark:bg-white/20` (dark:-nya DIHAPUS
//     sesuai poin di bawah) — TAPI diambil apa adanya bakal jadi bg-black/8 di atas background
//     section yang SUDAH gelap (gradient neutral-1000→secondary-1000), nyaris tak kelihatan.
//     Section ini SELALU gelap (bukan toggle light/dark beneran), jadi treatment yang dipakai
//     yang cocok utk background gelap: `bg-white/20` + overlay hover/active (`dark:after:bg-
//     overlay-hover`/`dark:active:after:opacity-100` di spec asli), BUKAN direct bg-black/8 +
//     hover:bg-black/12/active:bg-black/16 (itu treatment utk di atas background TERANG).
//     Bukan tebakan — konsekuensi langsung dari section ini yang always-dark, judgment call
//     sama kategori dengan text-error-300 vs text-error-700 di CompetitionDiscordCTA.
//   - SEMUA varian dark: di spec (2 bg image, 2 typography image, dark:bg-white/20,
//     dark:disabled:opacity-50, dark:after:bg-overlay-hover) DIHAPUS — project ini belum punya
//     dark mode sama sekali (ThemeToggle.tsx: "UI-only, belum fungsional", dikonfirmasi 3x
//     sebelumnya). Presedan sama kaya CompetitionTimelineSection.tsx.
//   - disabled:after:bg-overlay-disabled (Button Register) → BUKAN didrop kaya di
//     CompetitionDiscordCTA (di situ CTA-nya statis, tidak pernah disabled beneran) — Register
//     di sini PUNYA state disabled asli (isLoading). Tidak ada presedan warna overlay disabled
//     di manapun, jadi dipetakan ke `disabled:opacity-50 disabled:pointer-events-none` (treatment
//     generik tanpa token baru), bukan warna dikarang.
//   - Lucide pencil/arrow-down → mdi:pencil/mdi:arrow-down via <Icon> (lucide-react dilarang,
//     TECHNICAL_CONSTRAINTS_FE.md baris 15). Spec asli minta child-svg-not-size arbitrary
//     selector — diganti size-5 md:size-6 langsung di <Icon> (presedan project, bukan bikin
//     pola baru).
//   - w-360/max-w-360, lg:w-133.75, xl:px-23, md:max-lg:w-22 dipakai literal — valid dynamic
//     spacing utility Tailwind v4 (N × 0.25rem), BUKAN min-w-4xl/max-w-4xl dkk yang justru
//     collide sama custom named spacing token project ini (globals.css §spacing scale gotcha,
//     sudah kejadian 4x sebelumnya) — spec asli pakai min-w-4xl utk background image, tapi
//     background image-nya sendiri diganti total (lihat poin di bawah), jadi kelas itu moot.
//   - LOGO & TYPOGRAPHY IMAGE: CompetitionDetail (types/competition.ts) TIDAK PUNYA field
//     gambar/logo sama sekali, dan tidak ada aset apapun di project ini utk ini. Dikonfirmasi
//     user (AskUserQuestion): logo slot → tile gradient bulat + icon mdi:trophy (presedan sama
//     kaya CompetitionFAQSection/CompetitionDiscordCTA), typography-image slot → tetap
//     <h1>{competition.name}</h1> asli (nama kompetisi HARUS tetap dinamis per-kompetisi, tidak
//     ada wordmark aset utk menggantikannya). Ukuran text-h3/md:text-h1 TIDAK diganti ke ukuran
//     width dari spec (w-72/md:w-[535px]) — itu ukuran utk <img>, tidak applicable ke teks.
//   - BACKGROUND GLOW: 2 <img> (light/dark) + animate-glow-dim di spec asli TIDAK ADA aset
//     gambar maupun animasinya di project ini. Dikonfirmasi user: BUKAN didrop — dibikin
//     substitute asli (blob radial-gradient blur + animasi `animate-glow-dim` yang SEKARANG
//     jadi utility Tailwind beneran, didaftarkan di globals.css @theme, bukan cuma dipetakan ke
//     animasi lain yang sudah ada — lihat komentar di globals.css).
//   - STATUS TEXT ("Registration closed", <p> terpisah di spec) DIHAPUS — Register button di
//     bawah TETAP fungsional (bukan permanent-disabled, lihat poin berikutnya), jadi label
//     statis "Registration closed" di sebelahnya bakal menyesatkan (teks bilang tutup, tombol
//     bisa diklik). CompetitionDetail juga tidak punya field status pendaftaran generik (cuma
//     `deadline`/`isRegisteredByUser`) buat bikin ini dinamis — TIDAK dibikinkan logic baru
//     berbasis deadline krn tidak diminta eksplisit, dicatat sbg follow-up di CHANGELOG kalau
//     user memang mau status text dinamis nanti.
//   - REGISTER BUTTON: spec asli minta hardcoded `disabled=""` + teks statis "Registration
//     closed" — TIDAK diterapkan literal (dikonfirmasi user via AskUserQuestion). Itu state
//     mockup, bukan state app sungguhan — kalau diterapkan literal bakal mematikan flow
//     registrasi asli yang sudah jalan (handleRegisterClick, auth-guard, team modal trigger,
//     F-12/F-18–F-21). Yang diambil dari spec CUMA styling/layout-nya; onClick/disabled/label
//     "Register" tetap sama seperti sebelumnya.
//   - DOWNLOAD GUIDEBOOK CTA (button ke-3 sebelumnya, di luar spec yang cuma 2 tombol) DIHAPUS
//     total — dikonfirmasi user pilih match spec persis (2 tombol saja) ketimbang
//     dipertahankan sebagai tombol ke-3. `guidebookUrl` dari CompetitionDetail SEKARANG TIDAK
//     DIPAKAI SAMA SEKALI di komponen ini.
// design_system_final.md TIDAK SINKRON dengan poin-poin di atas — perlu ditambahkan manual oleh
// manusia. Lihat CHANGELOG [2026-09-03] "Redesign CompetitionDetailHero".
export function CompetitionDetailHero({ slug }: CompetitionDetailHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useIsLoggedIn();
  const openModal = useTeamModalStore((s) => s.open);
  const { data: competition, isLoading, isError, error } = useCompetition(slug);
  const handleRegisterClick = useRegisterGuard({
    competitionId: competition?.id,
    slug,
    competitionName: competition?.name,
  });

  // USER_FLOWS_v2.md langkah 5-6: setelah redirect-back dari /login, modal Create/Join
  // Team "otomatis" muncul (bukan user klik Register lagi). Marker `?openTeamModal=1` di-set
  // oleh useRegisterGuard.ts saat redirect ke /login — dibaca & dibersihkan di sini
  // (router.replace) supaya tidak re-trigger saat refresh/back (ROUTES.md §Catatan
  // Trade-off: client-state modal memang tidak persist lintas refresh).
  useEffect(() => {
    if (searchParams.get("openTeamModal") === "1" && isLoggedIn && competition) {
      openModal({ competitionId: competition.id, slug, competitionName: competition.name });
      router.replace(`/competitions/${slug}`);
    }
  }, [searchParams, isLoggedIn, competition, slug, openModal, router]);

  if (isError) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <section className="flex w-full flex-col items-center gap-md px-8 py-3xl text-center">
        <p className="text-b2 text-error-700">Gagal memuat detail kompetisi. Coba muat ulang halaman.</p>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden pt-8 pb-16 md:max-lg:pb-10 md:pt-16 lg:pt-[95px]"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="animate-glow-dim size-[420px] rounded-full bg-primary-600/30 blur-3xl md:size-[600px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-360 flex-col items-center justify-center gap-12 px-4 md:px-8 lg:flex-row xl:px-23">
        <div className="flex w-full flex-col items-center gap-8 lg:mt-11 lg:w-133.75 lg:flex-none">
          <div className="flex flex-col items-center">
            <span className="mb-3 font-ui text-b4 uppercase tracking-widest text-primary-600 md:text-b3">
              Indonesia Ocean Expo 2027
            </span>

            <div
              aria-hidden
              className="mb-3 flex w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg md:max-lg:w-22 md:w-26 aspect-square"
            >
              <Icon icon="mdi:trophy" className="size-8 text-secondary-1000 md:max-lg:size-9 md:size-11" />
            </div>

            {isLoading || !competition ? (
              <div className="h-12 w-64 animate-pulse rounded-lg bg-neutral-900 md:h-16 md:w-96" aria-hidden />
            ) : (
              <h1 className="text-center font-heading text-h3 text-neutral-100 md:text-h1">{competition.name}</h1>
            )}
          </div>

          <div className="mt-2 flex flex-col items-center gap-6 lg:mt-7">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <button
                type="button"
                onClick={handleRegisterClick}
                disabled={isLoading}
                className="relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-s6! font-ui text-secondary-1000 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 disabled:pointer-events-none disabled:opacity-50 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
                style={{ background: CTA_GRADIENT }}
              >
                Register
                <Icon icon="mdi:pencil" className="size-5 md:size-6" />
              </button>

              <a
                href="#about"
                className="relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white/20 px-4 py-2 text-s6! font-ui text-neutral-100 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
              >
                Explore More
                <Icon icon="mdi:arrow-down" className="size-5 md:size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
