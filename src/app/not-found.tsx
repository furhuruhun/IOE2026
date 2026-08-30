"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import { Button } from "@/components/ui/Button";

// Halaman 404 global — Next.js App Router convention (menangkap route yang tidak match
// DAN semua panggilan notFound() manual, misal src/features/competitions/CompetitionDetailHero.tsx).
// ERROR_HANDLING_FE.md §NOT_FOUND: "404 dari navigasi (slug salah di URL) → tampilkan halaman 404 penuh."
//
// Layout ini di-adaptasi dari referensi visual yang user kasih (lihat diskusi task) — TAPI
// referensi itu dari produk lain (font/warna/scale beda total dari design_system_final.md,
// belum ada spec 404 resmi di situ — dicatat sebagai gap terbuka di ERROR_HANDLING_FE.md §A2).
// Atas keputusan user: cuma font & warna yang disesuaikan ke token resmi project, struktur/
// layout/proporsi lainnya ikut referensi persis. Background art & ilustrasi mascot di referensi
// tidak ada asetnya di project ini (bukan aset IOE 2027) — diganti placeholder gradient tile +
// icon, pola yang sama dipakai landing AboutSection/MemoriesSection untuk aset yang belum ada
// dari klien (BUKAN gambar asing/hasil karang sendiri).
const GRADIENT_TEXT = "linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-600), var(--color-tertiary-600))";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-6 py-3xl text-center md:px-20">
      {/* Background — placeholder pengganti art referensi (/ds/404-bg-*.webp), belum ada aset dari klien */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--color-primary-600) 35%, transparent) 0%, transparent 55%), radial-gradient(circle at 85% 75%, color-mix(in oklch, var(--color-secondary-600) 35%, transparent) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 flex max-w-[64rem] flex-col items-center gap-lg md:flex-row md:items-center md:justify-center md:gap-2xl">
        {/* Mascot — placeholder pengganti /vim/vim-404.webp, belum ada maskot IOE 2027 untuk 404 dari klien */}
        <div
          aria-hidden
          className="flex size-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg md:size-48"
        >
          <Icon icon="mdi:compass-off" className="size-16 text-secondary-1000 md:size-24" />
        </div>

        <div className="flex flex-col items-center gap-sm md:items-start md:text-left">
          <p className="font-heading text-h6 text-neutral-400 md:text-h4">Error</p>
          <h1
            className="font-heading text-h1 md:text-[180px] md:leading-none"
            style={{
              backgroundImage: GRADIENT_TEXT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            404
          </h1>
          <h2 className="font-heading text-h5 text-neutral-100 md:text-h3">Oops! Something went wrong</h2>
          <p className="max-w-[28rem] text-b3 text-neutral-400 md:text-b2">
            Seems like the page you&apos;re trying to open is not ready.
          </p>

          <Button variant="primary" size="lg" className="mt-sm" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
