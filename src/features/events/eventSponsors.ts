export type EventSponsor = {
  id: string;
  name: string;
  logoSrc: string;
  websiteUrl?: string;
  tier?: string;
};

// Add confirmed sponsors here after their official logo assets are available.
export const eventSponsors: EventSponsor[] = [];
