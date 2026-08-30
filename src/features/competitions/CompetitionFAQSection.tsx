import { Accordion } from "@/components/ui/Accordion";
import { competitionFaqs } from "./competitionsContent";

// Section TIDAK ada di spec F-22–F-26 (FAQ per PRD cuma di Competition Details, F-17) —
// ditambahkan atas keputusan user mengikuti referensi layout.
export function CompetitionFAQSection() {
  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Need More Help?</h2>
      <div className="w-full max-w-[48rem]">
        <Accordion items={competitionFaqs} />
      </div>
    </section>
  );
}
