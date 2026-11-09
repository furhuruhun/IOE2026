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
  { id: "IOE-line", name: "OA Line", label: "OA LINE — @637iwugv ", href: "https://line.me/ti/p/~@637iwugv" },
  { id: "IOE-email", name: "Email", label: "Email IOE2027 — info@ioe2027.com", href: "mailto:info@ioe2027.com" },
] as const;
