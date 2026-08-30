import { CompetitionHero } from "@/features/competitions/CompetitionHero";
import { CompetitionAboutSection } from "@/features/competitions/CompetitionAboutSection";
import { CompetitionGrid } from "@/features/competitions/CompetitionGrid";
import { CompetitionTimelineSection } from "@/features/competitions/CompetitionTimelineSection";
import { CompetitionMemoriesSection } from "@/features/competitions/CompetitionMemoriesSection";
import { CompetitionTestimonialCarousel } from "@/features/competitions/CompetitionTestimonialCarousel";
import { CompetitionDiscordCTA } from "@/features/competitions/CompetitionDiscordCTA";
import { CompetitionFAQSection } from "@/features/competitions/CompetitionFAQSection";

// Route: /competitions — Competition Overview. Public. F-22–F-26 (ROUTES.md, PRD_IOE_2027_v4.md).
// Scope halaman ini DIPERLUAS di luar F-22–F-26 atas keputusan eksplisit user (Memories,
// Testimonial, Discord CTA, FAQ) — lihat amunisi/CHANGELOG.md untuk catatan lengkap
// ketidaksinkronan dengan PRD_IOE_2027_v4.md & ROUTES.md.
export default function CompetitionOverviewPage() {
  return (
    <main className="flex flex-1 flex-col">
      <CompetitionHero />
      <CompetitionAboutSection />
      <CompetitionGrid />
      <CompetitionTimelineSection />
      <CompetitionMemoriesSection />
      <CompetitionTestimonialCarousel />
      <CompetitionDiscordCTA />
      <CompetitionFAQSection />
    </main>
  );
}
