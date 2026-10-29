import Image from "next/image";
import { EventOverviewHero } from "@/features/events/EventOverviewHero";
import { EventOverviewAbout } from "@/features/events/EventOverviewAbout";
import { EventOverviewActivities } from "@/features/events/EventOverviewActivities";
import { EventOverviewTimeline } from "@/features/events/EventOverviewTimeline";
import { EventOverviewCTA, EventOverviewContact, EventOverviewSponsors } from "@/features/events/EventOverviewStaticSections";
import artwork from "@/features/events/EventOverviewArtwork.module.css";

// F-35–F-39: enam section referensi visual + sponsor sebagai section ketujuh.
export default function EventOverviewPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
      <div className={artwork.heroAboutShell}>
        <div className={artwork.sharedHeroLayer} aria-hidden="true">
          <Image src="/images/events/desktop-hero-ioe-aquatic.svg" alt="" width={1440} height={1382} loading="eager" fetchPriority="high" draggable={false} className={artwork.heroArtwork} />
        </div>
        <EventOverviewHero />
        <EventOverviewAbout />
      </div>
      <EventOverviewActivities />
      <EventOverviewTimeline />
      <EventOverviewCTA />
      <EventOverviewContact />
      <EventOverviewSponsors />
    </main>
  );
}
