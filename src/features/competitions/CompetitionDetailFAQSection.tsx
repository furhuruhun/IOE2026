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
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Frequently Asked Questions</h2>
      <div className="w-full max-w-[48rem]">
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
