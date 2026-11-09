import type { AccordionItemData } from "@/components/ui/Accordion";

export type SpeakerEntry = {
  role: "narrator" | "speaker";
  name: string;
  affiliation: string;
  image?: string;
};

type TalkshowContent = {
  title: string;
  subtitle: string;
  description: string;
  subThemes: { title: string; description: string }[];
  speakers: SpeakerEntry[];
  sessionDate?: string;
  sessionTime?: string;
  venue?: string;
  venueLocalName?: string;
  registrationFormReady: boolean;
  registrationHref: string;
};

// Session details supplied by the organizers; speakers are awaiting announcement.
export const talkshowContent: TalkshowContent = {
  title: "Ocean Talkshow",
  subtitle: "Tema talkshow akan diumumkan oleh panitia",
  description:
    "The IOE 2027 Seminar and Keynote Sessions convene leaders from government, state-owned enterprises, energy companies, and academic institutions to discuss the future of Indonesia's maritime ecosystem. Spanning across five pivotal sub-themes, the sessions explore:",
  subThemes: [
    { title: "Sustainable Ocean Energy", description: "Powering the energy transition through offshore wind, wave, and tidal energy." },
    { title: "Ports, Shipping & Maritime Logistics", description: "Decarbonizing supply chains and modernizing smart, green ports." },
    { title: "Coastal Protection & Resilience", description: "Engineering climate-resilient coastlines against erosion and sea-level rise." },
    { title: "Dredging & Reclamation", description: "Sustainable dredging practices and responsible coastal land development." },
    { title: "Marine Environment & Conservation", description: "Preserving marine ecosystems through eco-engineering and nature-based solutions." },
  ],
  sessionDate: "4-5 February 2027",
  sessionTime: "09.00 - 15.00 WIB",
  venue: "ITB West Hall",
  venueLocalName: "Aula Barat ITB",
  speakers: [
    { role: "narrator", name: "To Be Announced", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-01.svg" },
    { role: "speaker", name: "To Be Announced", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-02.svg" },
    { role: "speaker", name: "To Be Announced", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-03.svg" },
  ] as SpeakerEntry[],
  // The route exists, but its form is still a placeholder. Flip this only once
  // the real event registration form and submission flow have been implemented.
  registrationFormReady: false,
  registrationHref: "/events/talkshow/register",
};

// Answers are limited to behavior already documented in ROUTES.md and
// USER_FLOWS_v2 (2).md. No pricing, eligibility, or event program is inferred.
export const talkshowFaqs: AccordionItemData[] = [
  {
    value: "account",
    question: "Apakah saya perlu login untuk mendaftar?",
    answer:
      "Ya. Pendaftaran event memerlukan akun. Jika belum login, kamu akan diarahkan ke halaman login lalu kembali ke formulir pendaftaran.",
  },
  {
    value: "details",
    question: "Kapan jadwal dan lokasi Talkshow diumumkan?",
    answer:
      "Talkshow berlangsung pada 4-5 February 2027, pukul 09.00 - 15.00 WIB di ITB West Hall (Aula Barat ITB).",
  },
];
