import Image from "next/image";
import { getCompetitionDetailContent } from "./competitionDetailContent";

interface CompetitionDetailFunFactSectionProps {
  slug: string;
}

// X coordinates of the three upper connector tips in the 1920px-wide SVG.
const connectorPositions = [275 / 1920, 960 / 1920, 1645 / 1920];
const connectorTop = (169 / 1240) * 100;

// Section TIDAK ada di PRD F-12–F-21 — bagian dari perluasan scope mengikuti referensi
// layout (keputusan user, dicatat di CHANGELOG.md). Data placeholder per-slug, lihat
// competitionDetailContent.ts. Konten lokal murni (bukan dari API) jadi Server Component,
// tidak perlu "use client"/query.
export function CompetitionDetailFunFactSection({ slug }: CompetitionDetailFunFactSectionProps) {
  if (process.env.NODE_ENV !== "development") return null;
  const { funFacts } = getCompetitionDetailContent(slug);

  if (funFacts.length === 0) return null;

  return (
    <section className="w-full py-16">
      <h2 className="text-center text-h4 text-secondary-1000 md:text-h2">
        Did You <span className="bg-linear-to-b from-secondary-200 via-secondary-600 to-secondary-1000 bg-clip-text text-transparent">Sea</span> That?
      </h2>
      <div className="w-full overflow-x-auto" role="region" aria-label="Fun facts kompetisi" tabIndex={0}>
        <div className="relative mx-auto mt-56 w-full min-w-[960px] max-w-[1920px] md:mt-64 xl:mt-56">
          <Image
            src="/images/competitions/ioe-sonar-top-connectors.svg"
            alt=""
            width={1920}
            height={1240}
            unoptimized
            className="pointer-events-none block h-auto w-full select-none"
          />
          {funFacts.slice(0, connectorPositions.length).map((fact, index) => (
            <div
              key={fact.id}
              className="absolute z-10 -mt-8 w-[23%] -translate-x-1/2 -translate-y-full rounded-[18px] bg-linear-to-r from-secondary-700 via-primary-500 to-tertiary-400 p-[2px] shadow-lg sm:rounded-3xl xl:rounded-[44px]"
              style={{ left: `${connectorPositions[index] * 100}%`, top: `${connectorTop}%` }}
            >
              <div className="flex min-h-32 items-center justify-center rounded-[16px] bg-secondary-100 px-3 py-5 text-center text-secondary-1000 sm:rounded-[22px] md:px-5 md:py-7 xl:rounded-[42px] xl:px-8 xl:py-9">
                <p className="text-b3 leading-relaxed sm:text-b2 xl:text-h6">{fact.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
