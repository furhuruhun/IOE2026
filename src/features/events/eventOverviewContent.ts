import { memories } from "@/features/landing/landingContent";

export interface EventDocumentation {
  id: string;
  caption: string;
  imageSrc?: string;
  imageAlt?: string;
}

// Foto resmi belum tersedia. Isi imageSrc dan imageAlt setelah aset disetujui panitia.
export const eventDocumentation: EventDocumentation[] = memories.map((memory) => ({
  id: memory.id,
  caption: memory.caption,
}));

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
