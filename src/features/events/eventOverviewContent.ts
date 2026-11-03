export interface EventContact {
  id: string;
  name: string;
  platform: "WhatsApp" | "LINE" | "Email";
  contactLabel: string;
  url: string;
  icon: string;
}

// Hanya tambahkan kontak yang telah dikonfirmasi panitia dengan URL valid.
export const eventContacts: EventContact[] = [];

// LINE IDs supplied for the Events contact card.
export const eventOverviewContactActions = [
  { id: "farhan-line", name: "Farhan", label: "Farhan — mufarhans", href: "https://line.me/ti/p/~mufarhans" },
  { id: "hakim-line", name: "Hakim", label: "Hakim — CintaAmbaruwo", href: "https://line.me/ti/p/~CintaAmbaruwo" },
] as const;
