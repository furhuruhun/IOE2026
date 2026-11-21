export type EventSponsor = {
  id: string;
  name: string;
  logoSrc: string;
  websiteUrl?: string;
  tier?: string;
};

export const eventSponsors: EventSponsor[] = [
  { id: "antam", name: "ANTAM", logoSrc: "/images/parent/antam-logo.webp", tier: "silver" },
];
