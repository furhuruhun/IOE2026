"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CTA_GRADIENT } from "@/components/ui/Navbar";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCompetitions } from "@/hooks/useCompetitions";

// F-22 — Hero + countdown keseluruhan pendaftaran seluruh kompetisi. Target countdown =
// deadline TERDEKAT di antara semua kompetisi (API_CONTRACT tidak punya field "overall
// registration deadline" terpisah, jadi dihitung dari CompetitionSummary[] yang ada).
//
// Redesign 2026-09-03 — spec literal "COMPFEST design system" yang tadinya SALAH diterapkan
// ke CompetitionDetailHero.tsx (dikira hero per-kompetisi), dikonfirmasi ulang oleh user
// ternyata dimaksudkan utk hero /competitions overview INI. CompetitionDetailHero.tsx TIDAK
// di-revert (dikonfirmasi user: kedua hero boleh sharing visual treatment yang sama) — struktur
// glow blob & class button di bawah SENGAJA disalin persis dari situ (dibangun beberapa menit
// sebelumnya, presedan sudah established), bukan didesain ulang dari nol.
//
// Spec aslinya deskripsi hero SATU kompetisi (1 logo, status "Registration closed", CTA "Join
// Competition") — TIDAK match konten halaman overview ini (agregat SEMUA kompetisi, tidak ada
// 1 kompetisi/logo/status registrasi spesifik). Dikonfirmasi user: konten ASLI halaman ini
// dipertahankan (judul "Competition Overview", CountdownTimer, 2 tombol dengan onClick
// scroll-anchor yang sama seperti sebelumnya) — HANYA container/spacing/glow dari spec yang
// diterapkan, BUKAN logo/status text/label tombol/icon literal dari spec (semua itu spesifik
// utk 1 kompetisi, tidak applicable di sini). Paragraf deskripsi ("Rangkaian kompetisi
// nasional...") DIHAPUS TOTAL — instruksi eksplisit user ("descriptionnya diapus aja"), bukan
// bagian dari spec asli.
//
// Tombol diganti dari <Button> (shared component, gradient built-in) ke <button>/<a> literal
// classes (sama seperti CompetitionDetailHero.tsx) supaya konsisten visual antar 2 hero. TIDAK
// pakai icon mdi:pencil/mdi:arrow-down dari spec Button 1/2 — icon itu spesifik utk semantik
// "Join Competition"/"Explore More" (edit & scroll-down), tidak match aksi tombol di sini
// ("lihat semua kompetisi" / "lihat timeline"), dan tombol ini sebelumnya juga tidak pernah
// pakai icon — tidak ada alasan menambah icon baru yang tidak diminta.
export function CompetitionHero() {
  const router = useRouter();
  const { data, isLoading } = useCompetitions();

  const nearestDeadline = useMemo(() => {
    if (!data || data.length === 0) return null;
    return new Date(Math.min(...data.map((c) => new Date(c.deadline).getTime())));
  }, [data]);

  return (
    <section
      className="relative w-full overflow-hidden pt-8 pb-16 md:max-lg:pb-10 md:pt-16 lg:pt-[95px]"
      style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="animate-glow-dim size-[420px] rounded-full bg-primary-600/30 blur-3xl md:size-[600px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-360 flex-col items-center justify-center gap-12 px-4 md:px-8 lg:flex-row xl:px-23">
        <div className="flex w-full flex-col items-center gap-8 text-center lg:mt-11 lg:w-133.75 lg:flex-none">
          <div className="flex flex-col items-center">
            <span className="mb-3 font-ui text-b4 uppercase tracking-widest text-primary-600 md:text-b3">
              Indonesia Ocean Expo 2027
            </span>

            <h1 className="font-heading text-h3 text-neutral-100 md:text-h1">Competition Overview</h1>
          </div>

          {isLoading || !nearestDeadline ? (
            <div className="flex items-center gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="size-[72px] animate-pulse rounded-full bg-neutral-900 md:size-[112px]" />
              ))}
            </div>
          ) : (
            <CountdownTimer targetDate={nearestDeadline} />
          )}

          <div className="mt-2 flex flex-col items-center gap-6 lg:mt-7">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <button
                type="button"
                onClick={() => router.push("#our-competition")}
                className="relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-s6! font-ui text-secondary-1000 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
                style={{ background: CTA_GRADIENT }}
              >
                Lihat Semua Kompetisi
              </button>

              <button
                type="button"
                onClick={() => router.push("#timeline")}
                className="relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white/20 px-4 py-2 text-s6! font-ui text-neutral-100 outline-none transition-all after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity hover:after:bg-black/10 hover:after:opacity-100 active:after:bg-black/20 active:after:opacity-100 md:rounded-2xl md:px-5 md:py-3 md:text-s5! md:after:rounded-2xl"
              >
                Lihat Timeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
