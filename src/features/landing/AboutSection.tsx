import { Icon } from "@iconify/react/offline";
import { aboutDescription, aboutStats, sponsors } from "./landingContent";

// Gradient border teknik "via padding" — pola yang sama dipakai FannedCard/SpeakerCard
// (design_system_final.md), 3 warna semantic project: primary → secondary → tertiary.
const GRADIENT_BORDER =
  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-600) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)";
const GRADIENT_TEXT = "linear-gradient(90deg, var(--color-primary-600), var(--color-secondary-600), var(--color-tertiary-600))";

// F-09: about section berisi maskot IOE 2027, deskripsi event, dan list sponsor.
// Layout 2-kolom (maskot + 2 card: deskripsi, statistik target peserta infinite-scroll) —
// redesign dari versi single-card sebelumnya, lihat CHANGELOG untuk detail keputusan token.
// Tidak ada aset maskot/logo sponsor dari klien (PRD §8 Assumptions & Dependencies) —
// dipakai placeholder ikon + tile netral, BUKAN gambar asing/hasil karang sendiri.
export function AboutSection() {
  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <div className="flex items-center gap-2 md:gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-1000 text-neutral-100 md:size-12">
          <Icon icon="mdi:waves" className="size-4 md:size-6" />
        </span>
        <h2 className="text-h4 text-secondary-1000 md:text-h2">Apa itu IOE 2027?</h2>
      </div>

      <div className="flex w-full">
        <div className="mt-auto hidden w-1/3 shrink-0 lg:flex lg:justify-center">
          <div
            aria-hidden
            className="flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg xl:size-56"
          >
            <Icon icon="mdi:fish" className="size-20 text-secondary-1000 xl:size-28" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-md lg:w-2/3">
          {/* Card 1 — deskripsi + sponsor */}
          <div className="rounded-3xl p-0.5" style={{ background: GRADIENT_BORDER }}>
            <div className="flex flex-col gap-sm rounded-[22px] bg-neutral-100 px-8 py-5 md:px-16 md:py-10">
              <h3 className="text-h5 text-neutral-900 md:text-h4">
                Menuju Ekosistem Maritim{" "}
                <span className="text-h5 text-secondary-1000 md:text-h3">Cerdas dan Berkelanjutan</span>
              </h3>
              <p className="text-b3 text-neutral-700 md:text-b2">{aboutDescription}</p>

              <div className="mt-sm">
                <h4 className="text-b3 font-semibold text-neutral-700">Didukung oleh</h4>
                <div className="mt-sm flex flex-wrap gap-sm">
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
            </div>
          </div>

          {/* Card 2 — statistik target peserta (PRD §2.2 Business Metrics), infinite horizontal auto-scroll */}
          <div className="rounded-3xl p-0.5" style={{ background: GRADIENT_BORDER }}>
            <div className="overflow-x-clip rounded-[22px] bg-neutral-100 px-16 py-10">
              <div className="about-stats-track flex w-max gap-xl">
                {[...aboutStats, ...aboutStats].map((stat, i) => (
                  <div key={`${stat.label}-${i}`} className="flex shrink-0 flex-col items-center gap-sm text-center">
                    <p
                      className="font-heading text-h5 font-bold md:text-h3"
                      style={{
                        backgroundImage: GRADIENT_TEXT,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p className="w-32 text-b3 font-semibold text-neutral-800 md:w-40 md:text-b1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
