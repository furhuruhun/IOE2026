import { HeroCarousel } from "@/features/landing/HeroCarousel";
import { AboutSection } from "@/features/landing/AboutSection";
import { TimelineSection } from "@/features/landing/TimelineSection";
import { MemoriesSection } from "@/features/landing/MemoriesSection";

// Route: / — Landing Page. Public. F-07–F-11 (ROUTES.md, PRD_IOE_2027_v4.md).
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroCarousel />
      <AboutSection />
      <TimelineSection />
      <MemoriesSection />
    </main>
  );
}
