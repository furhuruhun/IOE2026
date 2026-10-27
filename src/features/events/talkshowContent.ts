import type { AccordionItemData } from "@/components/ui/Accordion";

// The event API currently provides only a list summary. Session time, venue,
// speakers, and contact details have not been supplied by the organizers.
export const talkshowContent = {
  title: "Talkshow",
  subtitle: "Tema talkshow akan diumumkan oleh panitia",
  description:
    "Talkshow merupakan bagian dari rangkaian Indonesia Ocean Expo 2027. Tema, pembicara, dan rincian sesi akan diumumkan oleh panitia.",
  sessionDate: null as string | null,
  sessionTime: null as string | null,
  venue: null as string | null,
  speakers: [] as { id: string; name: string; role: string; portraitSrc?: string }[],
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
