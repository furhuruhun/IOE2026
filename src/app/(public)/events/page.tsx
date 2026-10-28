import { EventOverviewHero } from "@/features/events/EventOverviewHero";
import { EventOverviewAbout } from "@/features/events/EventOverviewAbout";
import { EventOverviewActivities } from "@/features/events/EventOverviewActivities";
import { EventOverviewTimeline } from "@/features/events/EventOverviewTimeline";
import { EventOverviewCTA, EventOverviewContact, EventOverviewSponsors } from "@/features/events/EventOverviewStaticSections";

// F-35–F-39: enam section referensi visual + sponsor sebagai section ketujuh.
export default function EventOverviewPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
      <EventOverviewHero />
      <EventOverviewAbout />
      <EventOverviewActivities />
      <EventOverviewTimeline />
      <EventOverviewCTA />
      <EventOverviewContact />
      <EventOverviewSponsors />
    </main>
  );
}
