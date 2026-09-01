import type { CSSProperties } from "react";
import { CTA_GRADIENT } from "@/components/ui/Navbar";
import { overallTimelineItems, type OverallTimelineItem } from "./competitionsContent";

// F-25 — timeline keseluruhan kompetisi. Horizontal Zig-Zag Timeline (scroll-x, node
// atas/bawah berselang-seling) dari spec literal user, BUKAN pola dot+garis vertikal lama
// (yang masih dipakai di CompetitionDetailTimelineSection.tsx — tidak disentuh, di luar
// scope task ini).
//
// Token spec yang tidak ada di design_system_final.md/globals.css — resolusi dikonfirmasi
// ke user dulu (AskUserQuestion, CLAUDE.md §Aturan Kerja #1/#6) sebelum ngoding:
//   - `border-lagoon-900` / `bg-lagoon-500` → border-secondary-900 / bg-secondary-500
//     (Cyan family, preseden sama seperti `text-lagoon-100`→`text-secondary-1000` di
//     entry Navbar CHANGELOG).
//   - `bg-theme-gradient` → reuse CTA_GRADIENT (gradient resmi Button primary/Login CTA,
//     sudah diekspor dari Navbar.tsx, preseden sama seperti entry Navbar/CompetitionGrid).
//     Dipakai lewat inline style (bukan Tailwind class) karena CTA_GRADIENT adalah nilai
//     JS, sama seperti pemakaiannya di Navbar.tsx/CompetitionGrid.tsx.
//   - `bg-sunlit-100` (glow node, light mode) → bg-primary-200. Palette project aquatic
//     (Mint/Cyan/Sage) tidak punya warna hangat/gold sama sekali, jadi dipetakan ke warna
//     sejuk existing terdekat, bukan hex baru dikarang.
//   - `dark:bg-ocean-depth-500` & semua varian `dark:` lain di spec → DIHAPUS/tidak
//     diimplementasikan. Project belum punya dark palette sama sekali (globals.css §base
//     surface eksplisit "light-only untuk sekarang", ThemeToggle sudah dikonfirmasi 3x
//     sebelumnya UI-only). User pilih skip, dicatat sbg follow-up di CHANGELOG.
//   - `font-londontwo` → tidak perlu class eksplisit, elemen <h2> otomatis dapat
//     `font-heading` (Coolvetica) dari global CSS (`globals.css` baris 221-229).
//   - `font-montserrat` (literal) → font-ui (alias semantic project utk Montserrat,
//     preseden sama seperti entry Navbar).
//   - `font-jakarta` (literal) → font-body (alias semantic project utk Plus Jakarta Sans).
//   - `text-s3` → token BARU ditambahkan ke globals.css @theme (value reuse dari b1/20px,
//     lanjutan pola s5=b3/s6=b4 yang sudah ada), preseden sama seperti penambahan s5/s6.
//   - `bg-text-1000` (divider) → bg-neutral-1000 (satu-satunya grayscale "text-dark" yang
//     ada, dipakai juga sebagai --color-foreground).
//   - Scrollbar hidden: reuse class `.no-scrollbar` (globals.css, sudah ada & dipakai
//     CompetitionGrid mobile-wrapper) alih-alih literal
//     `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]` —
//     functionally identical, DRY (bukan bikin pola baru di luar yang sudah ada).
//   - Judul section TETAP `text-secondary-1000 text-center` (warna existing dari file ini
//     sebelum task, spec tidak menyebutkan warna judul sama sekali) — judgment call, bukan
//     hasil tanya user.
//   - Isi kartu (judul event/tanggal) pakai <p>, BUKAN <h1>/<h2> literal seperti di spec —
//     preseden codebase (CompetitionDetailTimelineSection.tsx, sibling section) juga tidak
//     memakai heading tag untuk teks di dalam item timeline, dan section ini sudah punya
//     <h2> sendiri sebagai judul; multiple <h1> per halaman melanggar document outline.
//     Class Tailwind (ukuran/font) tetap diikuti persis sesuai spec.
//   - Progress bar lebar & posisi dinamis: 1 CSS custom property (`--tl-progress`, bare
//     number 0-100 dihitung dari posisi node "current"/terakhir "done") + arbitrary
//     Tailwind `left-[...]`/`w-[...]` per breakpoint yang mereferensikannya, supaya rumus
//     per-breakpoint tetap murni CSS (tidak perlu duplikasi elemen atau JS resize listener).
//
// REVISI [2026-09-02] — 2 perbaikan presisi layout dari feedback user (lihat CHANGELOG
// entry terpisah untuk detail):
//   1. Double offset horizontal: wrapper konten (`relative w-fit`, dulu ada `mx-auto`) di
//      dalam outer box yang `flex` — kombinasi itu bikin flexbox nambah auto-margin
//      centering DI ATAS padding `p-5 md:p-10` outer box tiap kali konten lebih sempit dari
//      box (kasus umum di desktop, 4 item belum overflow). `mx-auto` dihapus supaya jarak
//      tepi murni dikontrol padding, bukan padding + auto-margin.
//   2. Progress line sekarang presisi menyentuh tepi luar (bukan tengah) node target:
//      `left`/`width` dihitung dari radius node (`0.5rem` mobile / `0.9375rem` desktop)
//      per formula literal dari user, BUKAN sekadar "posisi% dikurangi inset base line"
//      seperti versi sebelumnya. `--tl-progress` berubah dari string dengan suffix `%`
//      jadi bare number (dibagi 100 di dalam formula CSS) — mengalikan dua nilai
//      berdimensi (% dan panjang) langsung di `calc()` itu invalid, formula baru butuh
//      fraksi unitless dulu sebelum dikalikan ke `(100% - Nrem)`.

const CARD_GRADIENT_TOP = "linear-gradient(to bottom, var(--color-neutral-100), var(--color-primary-100))";
const CARD_GRADIENT_BOTTOM = "linear-gradient(to top, var(--color-neutral-100), var(--color-primary-100))";

function TimelineNode({ status }: { status: OverallTimelineItem["status"] }) {
  const isFuture = status === "future";

  return (
    <div
      className="relative mx-auto size-4 flex-auto rounded-full p-0.5 transition-all md:size-7.5"
      style={{ background: isFuture ? "var(--color-neutral-500)" : CTA_GRADIENT }}
    >
      <div className={status === "current" ? "size-full rounded-full bg-white" : "size-full rounded-full"} />
      {!isFuture && (
        <div className="absolute left-1/2 top-1/2 -z-10 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-200 blur-xl md:size-18 md:blur-2xl" />
      )}
    </div>
  );
}

function TimelineCard({ item, onTop }: { item: OverallTimelineItem; onTop: boolean }) {
  return (
    <div
      className={`w-40 flex-1 rounded-md p-0.5 md:w-80 md:rounded-2xl ${onTop ? "" : "order-3"}`}
      style={{ background: CTA_GRADIENT }}
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center rounded-sm p-2.5 md:rounded-[18px] md:p-5"
        style={{ background: onTop ? CARD_GRADIENT_TOP : CARD_GRADIENT_BOTTOM }}
      >
        <p className="text-center font-ui text-s6 md:text-s3">{item.label}</p>
        <div className="mb-2 mt-2 h-px w-full bg-neutral-1000 md:mb-4" />
        <p className="text-center font-body text-b4 md:text-b2">{item.date}</p>
      </div>
    </div>
  );
}

function getProgressPercent(items: OverallTimelineItem[]) {
  const currentIndex = items.findIndex((item) => item.status === "current");
  const lastDoneIndex = items.reduce((acc, item, i) => (item.status === "done" ? i : acc), -1);
  const activeIndex = currentIndex !== -1 ? currentIndex : lastDoneIndex;

  if (activeIndex <= 0 || items.length <= 1) return 0;
  return (activeIndex / (items.length - 1)) * 100;
}

export function CompetitionTimelineSection() {
  const progressPercent = getProgressPercent(overallTimelineItems);
  // Bare number (bukan "X%") — formula lebar progress line (di bawah) bagi --tl-progress
  // dengan 100 untuk dapat fraksi unitless, supaya valid dikalikan ke nilai panjang
  // (100% - Nrem) di calc() CSS (mengalikan dua nilai berdimensi/% langsung invalid di calc()).
  const progressStyle = { "--tl-progress": `${progressPercent}` } as CSSProperties;

  return (
    <section
      id="timeline"
      className="relative z-10 mx-auto flex w-full flex-col items-center px-4 md:px-8 xl:px-[92px]"
    >
      <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Timeline Kompetisi</h2>

      <div className="mt-xl flex w-full overflow-x-auto rounded-3xl border border-secondary-900 bg-white/24 p-5 no-scrollbar hover:cursor-grab active:cursor-grabbing md:rounded-[36px] md:p-10">
        <div className="relative w-fit">
          <div className="absolute left-1/2 top-1/2 h-1 w-[calc(100%-5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-500 md:h-2 md:w-[calc(100%-10rem)]" />
          <div
            className="absolute top-1/2 left-[2rem] h-1 w-[calc(((var(--tl-progress)_/_100)_*_(100%_-_5rem))_+_0.5rem)] -translate-y-1/2 rounded-full bg-secondary-500 md:left-[4.0625rem] md:h-2 md:w-[calc(((var(--tl-progress)_/_100)_*_(100%_-_10rem))_+_0.9375rem)]"
            style={progressStyle}
          />

          <div className="relative z-10 flex gap-3 md:gap-6">
            {overallTimelineItems.map((item, i) => {
              const onTop = i % 2 === 0;
              return (
                <div key={item.label} className="grid w-fit grid-rows-[1fr_auto_1fr] gap-5 md:gap-8">
                  {onTop ? (
                    <>
                      <TimelineCard item={item} onTop />
                      <TimelineNode status={item.status} />
                      <div className="flex-1" />
                    </>
                  ) : (
                    <>
                      <div className="order-1 flex-1" />
                      <div className="order-2">
                        <TimelineNode status={item.status} />
                      </div>
                      <TimelineCard item={item} onTop={false} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-xl text-center text-b4 text-neutral-500">
        Tanggal bersifat sementara — menunggu jadwal final dari panitia.
      </p>
    </section>
  );
}
