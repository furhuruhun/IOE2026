import { Icon } from "@iconify/react/offline";
import { Accordion } from "@/components/ui/Accordion";
import { competitionFaqs } from "./competitionsContent";

// Section TIDAK ada di spec F-22–F-26 (FAQ per PRD cuma di Competition Details, F-17) —
// ditambahkan atas keputusan user mengikuti referensi layout.
//
// Redesign 2026-09-02 mengikuti spec pixel-precise dari user. Illustration di kanan header
// TIDAK ada aset dari klien (PRD §8 Assumptions & Dependencies, presedan sama seperti maskot
// AboutSection.tsx) — diganti tile gradient + icon MDI, BUKAN gambar asing/hasil karang sendiri.
export function CompetitionFAQSection() {
  return (
    <section className="relative mx-auto flex w-full max-w-[1637.5px] flex-col items-center gap-8 overflow-hidden px-6 pt-16 pb-32 md:px-20">
      <div className="relative z-10 mb-12 flex w-full flex-col items-center px-4 md:mb-24 md:px-8">
        <div className="relative flex w-full items-center justify-between max-md:mb-sm max-md:flex-col max-md:items-center max-md:gap-sm">
          <div className="lg:pr-xl">
            <h2 className="text-h4 text-secondary-1000 md:text-h2">Need more help?</h2>
            <p className="font-ui text-s6 font-bold text-neutral-700 md:text-s4">
              Temukan berbagai pertanyaan yang sering ditanyakan serta jawabannya di sini!
            </p>
          </div>
          <div
            aria-hidden
            className="flex size-48 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 shadow-lg max-lg:hidden"
          >
            <Icon icon="mdi:frequently-asked-questions" className="size-20 text-secondary-1000" />
          </div>
        </div>

        <Accordion items={competitionFaqs} />
      </div>
    </section>
  );
}
