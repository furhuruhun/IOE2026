import Image from "next/image";
import { aboutDescription, totalPrizePool } from "./competitionsContent";
import { CompetitionSponsorMarquee } from "./CompetitionSponsorMarquee";

const GRADIENT_TEXT = "linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-600), var(--color-tertiary-600))";

// F-23 (About) + F-26 (Sponsor — digabung ke dalam About, pola sama dgn landing
// AboutSection.tsx yang menyatukan sponsor di dalam section About, bukan section terpisah).
// Total Prize Pool: PLACEHOLDER — CompetitionSummary tidak punya field ini, lihat
// competitionsContent.ts & CHANGELOG untuk gap API_CONTRACT.md. Tidak ada aset maskot dari
// klien (sama seperti landing, PRD §8) — section ini sengaja tanpa gambar maskot.
export function CompetitionAboutSection() {
  return (
    <section id="about" className="relative isolate w-full overflow-hidden py-16">
      <Image
        src="/images/competitions/ellipse_our_aquatic_ioe.svg"
        alt=""
        aria-hidden="true"
        width={1440}
        height={737}
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-full max-w-none"
      />
      <Image
        src="/images/competitions/decoration_aquatic_ioe.svg"
        alt=""
        aria-hidden="true"
        width={1440}
        height={1033}
        className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-full max-w-none opacity-60 md:-top-16 md:max-lg:top-12"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 md:px-8 xl:px-[92px]">
        <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">Tentang Competition Overview</h2>

        <p className="mt-4 w-full max-w-[1200px] text-center font-body text-[18px] leading-[1.5] font-semibold text-neutral-700 md:max-lg:max-w-[740px] md:text-b1 lg:text-h5 lg:leading-[1.5]">
          {aboutDescription}
        </p>

        {process.env.NODE_ENV === "development" && <>
          <div className="mt-32 flex w-full flex-col items-center gap-4 text-center md:mt-48 md:max-lg:mt-28">
            <p className="font-micro text-b3 text-neutral-800">Preview - data contoh, belum dikonfirmasi panitia.</p>
            <h3 className="font-heading text-h4 text-secondary-1000 md:text-h2">Total Prize Pool</h3>
            <p
              className="w-full max-w-full text-center font-heading text-[clamp(2rem,9vw,2.5rem)] font-bold md:text-h2 lg:text-h1 [[data-theme=dark]_&]:drop-shadow-[0_1px_1px_var(--color-secondary-100)]"
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

          <div className="mt-16 flex w-full min-w-0 flex-col items-center gap-4 md:gap-6 md:max-lg:mt-10">
            <p className="font-micro text-b3 text-neutral-800">Preview - data contoh, belum dikonfirmasi panitia.</p>
            <h4 className="text-b3 font-semibold text-secondary-1000">Didukung oleh</h4>
            <CompetitionSponsorMarquee />
          </div>
        </>}
      </div>
    </section>
  );
}
