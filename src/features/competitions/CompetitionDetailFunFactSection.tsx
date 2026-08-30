import { Icon } from "@iconify/react/offline";
import { getCompetitionDetailContent } from "./competitionDetailContent";

interface CompetitionDetailFunFactSectionProps {
  slug: string;
}

// Section TIDAK ada di PRD F-12–F-21 — bagian dari perluasan scope mengikuti referensi
// layout (keputusan user, dicatat di CHANGELOG.md). Data placeholder per-slug, lihat
// competitionDetailContent.ts. Konten lokal murni (bukan dari API) jadi Server Component,
// tidak perlu "use client"/query.
export function CompetitionDetailFunFactSection({ slug }: CompetitionDetailFunFactSectionProps) {
  const { funFacts } = getCompetitionDetailContent(slug);

  if (funFacts.length === 0) return null;

  return (
    <section className="flex w-full flex-col items-center gap-2xl px-8 py-16 md:px-20">
      <h2 className="text-h4 text-secondary-1000 md:text-h2">Fun Fact</h2>
      <div className="grid w-full max-w-[56rem] grid-cols-1 gap-md sm:grid-cols-3">
        {funFacts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col items-center gap-sm rounded-3xl border border-neutral-300 bg-neutral-100 p-8 text-center"
          >
            <Icon icon={fact.icon} className="size-8 text-primary-600" />
            <p className="font-heading text-h4 text-secondary-1000">{fact.stat}</p>
            <p className="text-b3 text-neutral-700">{fact.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
