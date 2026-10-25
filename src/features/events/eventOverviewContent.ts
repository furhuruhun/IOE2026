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
