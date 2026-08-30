import { sponsors } from "@/features/landing/landingContent";
import { aboutDescription, totalPrizePool } from "./competitionsContent";

// Gradient pattern sama seperti landing AboutSection.tsx (§Gradient border via padding).
const GRADIENT_BORDER =
  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-600) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)";
const GRADIENT_TEXT = "linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-600), var(--color-tertiary-600))";

// F-23 (About) + F-26 (Sponsor — digabung ke dalam About, pola sama dgn landing
// AboutSection.tsx yang menyatukan sponsor di dalam section About, bukan section terpisah).
// Total Prize Pool: PLACEHOLDER — CompetitionSummary tidak punya field ini, lihat
// competitionsContent.ts & CHANGELOG untuk gap API_CONTRACT.md. Tidak ada aset maskot dari
// klien (sama seperti landing, PRD §8) — section ini sengaja tanpa gambar maskot.
export function CompetitionAboutSection() {
  return (
    <section id="about" className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Tentang Competition Overview</h2>

      <div className="w-full max-w-[48rem] rounded-3xl p-0.5" style={{ background: GRADIENT_BORDER }}>
        <div className="flex flex-col gap-sm rounded-[22px] bg-neutral-100 px-8 py-5 md:px-16 md:py-10">
          <p className="text-b3 text-neutral-700 md:text-b2">{aboutDescription}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="text-h6 text-neutral-700 md:text-h5">Total Prize Pool</h3>
        <p
          className="font-heading text-h4 font-bold md:text-h2"
          style={{
            backgroundImage: GRADIENT_TEXT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {totalPrizePool}
        </p>
      </div>

      <div className="flex flex-col items-center gap-sm">
        <h4 className="text-b3 font-semibold text-neutral-700">Didukung oleh</h4>
        <div className="flex flex-wrap justify-center gap-sm">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor}
              className="flex h-12 items-center rounded-md border border-neutral-300 bg-neutral-200 px-md text-b3 font-semibold text-neutral-600"
            >
              {sponsor}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
