import { CompetitionDetailHero } from "@/features/competitions/CompetitionDetailHero";
import { CompetitionDetailAboutSection } from "@/features/competitions/CompetitionDetailAboutSection";
import { CompetitionDetailTimelineSection } from "@/features/competitions/CompetitionDetailTimelineSection";
import { CompetitionDetailFunFactSection } from "@/features/competitions/CompetitionDetailFunFactSection";
import { CompetitionDetailGainsSection } from "@/features/competitions/CompetitionDetailGainsSection";
import { CompetitionDetailPrizeSection } from "@/features/competitions/CompetitionDetailPrizeSection";
import { CompetitionDetailJoinTeamCTA } from "@/features/competitions/CompetitionDetailJoinTeamCTA";
import { CompetitionDiscordCTA } from "@/features/competitions/CompetitionDiscordCTA";
import { CompetitionDetailOtherCompetitionsCarousel } from "@/features/competitions/CompetitionDetailOtherCompetitionsCarousel";
import { CompetitionDetailFAQSection } from "@/features/competitions/CompetitionDetailFAQSection";
import { CompetitionDetailContactSection } from "@/features/competitions/CompetitionDetailContactSection";
import { TeamModal } from "@/features/competitions/TeamModal";

// Route: /competitions/[slug] — Competition Details. Public. ROUTES.md.
// 11 section: F-12 (Hero), F-13 (About+Countdown), F-14 (Timeline), Fun Fact*, F-15
// (What You'll Gain), Total Prize*, Join a Team CTA*, Discord CTA*, Other Competitions*,
// F-17 (FAQ), Contact*. Section bertanda * adalah perluasan scope di luar PRD F-12–F-21,
// mengikuti referensi layout yang diberikan user (keputusan eksplisit, sama kategori dengan
// perluasan scope /competitions overview) — lihat CHANGELOG.md untuk detail gap dokumen.
//
// Register CTA (Hero & Join a Team) pakai auth-guard client-side (useRegisterGuard.ts) yang
// membuka <TeamModal /> (F-18/F-18a/F-19/F-21) — dipasang SEKALI di sini, dikontrol via
// useTeamModalStore supaya CTA manapun di halaman bisa membukanya tanpa duplikasi instance.
// F-20 (upload file syarat lomba) SENGAJA belum dibangun — flow terpisah di /dashboard
// per USER_FLOWS_v2.md, out of scope task ini.
export default async function CompetitionDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="flex flex-1 flex-col">
      <CompetitionDetailHero slug={slug} />
      <CompetitionDetailAboutSection slug={slug} />
      <CompetitionDetailTimelineSection slug={slug} />
      <CompetitionDetailFunFactSection slug={slug} />
      <CompetitionDetailGainsSection slug={slug} />
      <CompetitionDetailPrizeSection slug={slug} />
      <CompetitionDetailJoinTeamCTA slug={slug} />
      <CompetitionDiscordCTA />
      <CompetitionDetailOtherCompetitionsCarousel slug={slug} />
      <CompetitionDetailFAQSection slug={slug} />
      <CompetitionDetailContactSection />
      <TeamModal />
    </main>
  );
}
