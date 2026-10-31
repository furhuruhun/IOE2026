import type { AccordionItemData } from "@/components/ui/Accordion";

export type SpeakerEntry = {
  role: "narrator" | "speaker";
  name: string;
  affiliation: string;
  image?: string;
};

// The event API currently provides only a list summary. Session time, venue,
// speakers, and contact details have not been supplied by the organizers.
export const talkshowContent = {
  title: "Talkshow",
  subtitle: "Tema talkshow akan diumumkan oleh panitia",
  description:
    "This talk explores how data science and AI support decision-making in business and everyday life, while highlighting the role of human judgment. It also introduces a general roadmap and essential skills for getting started in data science and AI, including for participants from non-IT backgrounds. Through industry case studies, the session shows how data and AI are applied in real-world decisions and discusses related career opportunities and challenges.",
  sessionDate: null as string | null,
  sessionTime: null as string | null,
  venue: null as string | null,
  speakers: [
    { role: "narrator", name: "Narator akan diumumkan", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-01.svg" },
    { role: "speaker", name: "Pembicara akan diumumkan", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-02.svg" },
    { role: "speaker", name: "Pembicara akan diumumkan", affiliation: "Informasi menyusul", image: "/images/events/ioe-speaker-03.svg" },
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
      "Jadwal sesi dan lokasi resmi belum tersedia di halaman ini. Informasinya akan ditampilkan setelah diumumkan oleh panitia.",
  },
];
