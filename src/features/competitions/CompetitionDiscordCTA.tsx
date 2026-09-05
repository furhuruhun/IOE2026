"use client";

import { Icon } from "@iconify/react/offline";
import { CTA_GRADIENT } from "@/components/ui/Navbar";
import { discordInviteUrl } from "./competitionsContent";

// Section TIDAK ada di spec F-22–F-26 — ditambahkan atas keputusan user mengikuti referensi
// layout. Copy "Join Discord" reuse pola yang sudah didokumentasikan di
// USER_FLOWS_v2.md:96 (awalnya utk hero banner per-aktivitas di Dashboard), dipindah ke
// konteks publik /competitions di sini. URL invite: PLACEHOLDER, lihat competitionsContent.ts.
//
// Redesign 2026-09-03 mengikuti spec literal "COMPFEST design system" dari user (grid 5-kolom,
// image kiri col-span-2, heading+CTA kanan col-span-3). Sama seperti CompetitionCardDesktop &
// CompetitionTimelineSection, spec-nya pakai banyak nama class yang TIDAK ADA di
// design_system_final.md/globals.css — dipetakan ke token asli yang SUDAH ADA, presedan sama
// persis kaya CTA_PILL (Navbar.tsx) & CompetitionGrid.tsx. Dikonfirmasi ke user dulu (plan mode,
// AskUserQuestion, CLAUDE.md §6):
//   - bg-theme-compe (CTA bg) → CTA_GRADIENT (style inline), SAMA seperti bg-theme-gradient di
//     tempat lain — dikonfirmasi bukan warna Discord-brand terpisah, cuma nama beda dari spec.
//   - text-lagoon-100 → text-secondary-1000, hover:after:bg-overlay-hover/active:after:bg-
//     overlay-pressed → after:bg-black/10 / after:bg-black/20, font-montserrat → font-ui,
//     font-londontwo → no-op (h2 sudah punya font-heading eksplisit dari sebelumnya).
//   - text-component-error (span "Discord Server") → text-error-300 (BUKAN text-error-700 yang
//     jadi presedan folder ini di CompetitionGrid.tsx — itu warna gelap utk pesan error di
//     background terang; section ini punya bg gradient GELAP, jadi dipilih shade LEBIH TERANG
//     dari family error yang sama biar kontras, bukan warna baru dikarang).
//   - focus-visible:ring-ring/50, aria-invalid:ring-destructive/* DIHAPUS — --color-ring &
//     warna "destructive" TIDAK ADA sama sekali di project ini (boilerplate shadcn/ui Button
//     literal, presedan sama kaya keputusan CompetitionCardDesktop), aria-invalid juga tidak
//     relevan (bukan form input, link statis tanpa validity state).
//   - disabled:after:bg-overlay-disabled DIHAPUS — tidak ada presedan overlay utk disabled state
//     di manapun, dan CTA ini tidak pernah punya state disabled/loading (link statis eksternal).
//   - Lucide door-open SVG → mdi:door-open via <Icon> (@iconify/react/offline) — lucide-react
//     eksplisit dilarang, TECHNICAL_CONSTRAINTS_FE.md baris 15.
//   - <a> membungkus <button> di spec asli DIHAPUS — nested interactive element (HTML invalid).
//     Diganti 1 elemen <a target="_blank" rel="noopener noreferrer"> polos (URL eksternal,
//     BUKAN next/link yang buat internal route), classes diadaptasi dari CTA_PILL (Navbar.tsx).
//   - LEFT COLUMN IMAGE: TIDAK ADA aset ilustrasi Discord di project ini sama sekali (dicek
//     public/ & src/, kosong) — dikonfirmasi user (AskUserQuestion): pakai fallback yang sama
//     kaya CompetitionFAQSection (tile gradient bulat + icon MDI, bukan <img> asli). Ukuran tile
//     ikut scale responsive literal dari spec (w-24…2xl:w-96 + aspect-square biar tetap bulat,
//     spec cuma kasih width bukan height). Ukuran icon MDI di dalam tile TIDAK ada di spec —
//     diinferensikan dari rasio icon:tile yang sudah ada di CompetitionFAQSection (20/48≈0.417),
//     dibulatkan ke step Tailwind terdekat per breakpoint (size-10/15/20/28/32/40).
//   - Section outer TETAP pakai background gradient gelap yang sudah ada sebelumnya (spec baru
//     tidak menyebutkan background sama sekali di level ini) — dikonfirmasi user, cuma struktur
//     konten dalam yang berubah jadi grid 5-kolom.
//   - scale-75/sm:scale-90/md:scale-100 pada CTA dipakai literal sesuai spec ("crucial for
//     mobile") meski transform:scale() TIDAK mengecilkan footprint layout aslinya (cuma visual).
// design_system_final.md TIDAK SINKRON dengan poin-poin di atas — perlu ditambahkan manual oleh
// manusia. Lihat CHANGELOG [2026-09-03] "Redesign CompetitionDiscordCTA".
export function CompetitionDiscordCTA() {
  return (
    <section
      className="w-full"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <div className="relative z-20 grid w-full grid-cols-5 items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div
          aria-hidden
          className="col-span-2 flex aspect-square w-24 shrink-0 items-center justify-center justify-self-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg sm:w-36 md:w-48 lg:w-64 xl:w-80 2xl:w-96"
        >
          <Icon
            icon="mdi:discord"
            className="size-10 text-secondary-1000 sm:size-15 md:size-20 lg:size-28 xl:size-32 2xl:size-40"
          />
        </div>

        <div className="col-span-3 flex flex-col items-start gap-3 text-center sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
          <h2 className="font-heading text-h6 leading-tight text-neutral-100 sm:text-h4 md:text-h3 lg:text-h2 xl:text-h1">
            Join The <span className="text-error-300">Discord Server</span>
          </h2>

          <a
            href={discordInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex shrink-0 scale-75 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-s6! font-ui text-secondary-1000 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 sm:scale-90 md:scale-100 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
            style={{ background: CTA_GRADIENT }}
          >
            Join Now
            <Icon icon="mdi:door-open" className="size-5 md:size-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
