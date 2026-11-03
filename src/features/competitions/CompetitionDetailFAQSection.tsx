import Image from "next/image";
import { Accordion } from "@/components/ui/Accordion";
import { getCompetitionDetailContent } from "./competitionDetailContent";

interface CompetitionDetailFAQSectionProps {
  slug: string;
}

// F-17 — FAQ section di bagian akhir halaman. Konten per-slug (bukan shared seperti
// competitionFaqs di overview page), lihat competitionDetailContent.ts.
export function CompetitionDetailFAQSection({ slug }: CompetitionDetailFAQSectionProps) {
  const { faqs } = getCompetitionDetailContent(slug);

  if (faqs.length === 0) return null;

  return (
    <section className="relative mx-auto flex w-full max-w-[1637.5px] flex-col items-center gap-8 overflow-hidden bg-neutral-100 px-6 pt-16 md:px-20">
      <div className="relative z-10 flex w-full flex-col items-center px-4 md:px-8">
        <div className="relative flex w-full items-center justify-between max-md:mb-sm max-md:flex-col max-md:items-center max-md:gap-sm">
          <div className="lg:pr-xl">
            <h2 className="text-h4 text-secondary-1000 md:text-h2">Frequently Asked Questions</h2>
            <p className="font-ui text-s6 font-bold text-neutral-700 md:text-s4">
              Temukan berbagai pertanyaan yang sering ditanyakan serta jawabannya di sini!
            </p>
          </div>
          <Image
            src="/images/competitions/Bubblechat-Faq.png"
            alt=""
            aria-hidden="true"
            width={224}
            height={224}
            className="size-56 shrink-0 object-contain max-lg:hidden"
          />
        </div>

        <Accordion items={faqs} />
      </div>
    </section>
  );
}
