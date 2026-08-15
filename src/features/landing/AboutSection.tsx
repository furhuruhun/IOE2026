import { Icon } from "@iconify/react/offline";
import { aboutDescription, sponsors } from "./landingContent";

// F-09: about section berisi maskot IOE 2027, deskripsi event, dan list sponsor.
// Tidak ada aset maskot/logo sponsor dari klien (PRD §8 Assumptions & Dependencies) —
// dipakai placeholder ikon + tile netral, BUKAN gambar asing/hasil karang sendiri.
export function AboutSection() {
  return (
    <section className="px-6 py-3xl md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2xl md:flex-row md:gap-4xl">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            aria-hidden
            className="flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg md:size-56"
          >
            <Icon icon="mdi:fish" className="size-20 text-secondary-1000 md:size-28" />
          </div>
          <p className="text-b4 text-neutral-500">Maskot IOE 2027 — placeholder, menunggu aset resmi dari klien</p>
        </div>

        <div className="flex flex-col gap-md text-center md:text-left">
          <h2 className="text-h4 text-secondary-1000 md:text-h2">Tentang IOE 2027</h2>
          <p className="text-b2 text-neutral-800">{aboutDescription}</p>

          <div className="mt-lg">
            <h3 className="text-b3 font-semibold text-neutral-700">Didukung oleh</h3>
            <div className="mt-sm flex flex-wrap justify-center gap-sm md:justify-start">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor}
                  className="flex h-12 items-center rounded-md border border-neutral-300 bg-neutral-100 px-md text-b3 font-semibold text-neutral-600"
                >
                  {sponsor}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
