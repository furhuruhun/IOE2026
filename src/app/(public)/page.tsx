import { HeroCarousel } from "@/features/landing/HeroCarousel";
import { AboutSection } from "@/features/landing/AboutSection";
import { TimelineSection } from "@/features/landing/TimelineSection";
import { MemoriesSection } from "@/features/landing/MemoriesSection";
import { LocationSection } from "@/features/landing/LocationSection";

// Route: / — Landing Page. Public. F-07–F-11 (ROUTES.md, PRD_IOE_2027_v4.md).
export default function LandingPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
      <HeroCarousel />
      <AboutSection />
      <TimelineSection />
      <MemoriesSection />
      <LocationSection />
    </main>
  );
}
