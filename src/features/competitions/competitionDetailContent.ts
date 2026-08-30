import type { FaqItem } from "./competitionsContent";

// Konten statis khusus /competitions/[slug] yang TIDAK tersedia dari API_CONTRACT.md
// (GET /competitions/:slug cuma prose-spec, lihat types/competition.ts). Sengaja di-key PER
// SLUG (bukan shared seperti testimonials/FAQ di competitionsContent.ts) karena
// PRD_IOE_2027_v4.md eksplisit menyebut halaman ini "Competition Details (per lomba)".
// SEMUA isi di bawah PLACEHOLDER — belum ada materi final dari panitia (PRD §8/§13 A6).
// Wajib diganti sebelum go-live, dicatat di CHANGELOG.md.

export interface FunFact {
  icon: string; // iconify id
  stat: string;
  label: string;
}

export interface GainItem {
  id: string;
  icon: string; // iconify id — belum ada aset foto dari klien, jadi TiltedCard pakai
  // icon+title+caption, bukan galeri foto seperti referensi Framer aslinya di
  // design_system_final.md §TiltedCard. Dicatat di CHANGELOG.md.
  title: string;
  caption: string; // muncul di glassmorphic pill saat hover/focus TiltedCard
}

interface CompetitionDetailContentEntry {
  funFacts: FunFact[];
  gains: GainItem[];
  faqs: FaqItem[];
}

const defaultGains: GainItem[] = [
  {
    id: "gain-certificate",
    icon: "mdi:certificate",
    title: "Certificate & Special Recognition",
    caption: "Sertifikat resmi IOE 2027 untuk seluruh peserta, plus penghargaan khusus bagi finalis.",
  },
  {
    id: "gain-mentorship",
    icon: "mdi:account-tie",
    title: "Expert-led Mentorship",
    caption: "Bimbingan langsung dari praktisi berpengalaman untuk finalis.",
  },
  {
    id: "gain-network",
    icon: "mdi:account-group",
    title: "Connect & Grow",
    caption: "Bangun koneksi dan berkembang bersama komunitas peserta se-Indonesia.",
  },
];

const defaultFaqs: FaqItem[] = [
  {
    value: "detail-faq-1",
    question: "Apakah kompetisi ini berbayar?",
    answer: "Placeholder — informasi biaya pendaftaran menunggu konfirmasi panitia.",
  },
  {
    value: "detail-faq-2",
    question: "Apakah kompetisi ini berbasis tim atau individu?",
    answer: "Placeholder — ketentuan format tim/individu menunggu konfirmasi panitia.",
  },
  {
    value: "detail-faq-3",
    question: "Bagaimana cara bertanya lebih lanjut?",
    answer: "Placeholder — kanal kontak resmi (Discord/Instagram/email) menunggu konfirmasi panitia.",
  },
];

export const competitionDetailContent: Record<string, CompetitionDetailContentEntry> = {
  "business-case-competition": {
    funFacts: [
      { icon: "mdi:account-group", stat: "300+", label: "Peserta Tahun Lalu" },
      { icon: "mdi:office-building", stat: "50+", label: "Universitas Berpartisipasi" },
      { icon: "mdi:briefcase-search", stat: "3", label: "Babak Penjurian" },
    ],
    gains: defaultGains,
    faqs: defaultFaqs,
  },
  "paper-poster-competition": {
    funFacts: [
      { icon: "mdi:file-document-multiple", stat: "150+", label: "Karya Masuk Tahun Lalu" },
      { icon: "mdi:school", stat: "40+", label: "Institusi Berpartisipasi" },
      { icon: "mdi:presentation", stat: "2", label: "Kategori Lomba" },
    ],
    gains: defaultGains,
    faqs: defaultFaqs,
  },
  "design-competition": {
    funFacts: [
      { icon: "mdi:palette", stat: "200+", label: "Karya Desain Tahun Lalu" },
      { icon: "mdi:account-group", stat: "45+", label: "Universitas Berpartisipasi" },
      { icon: "mdi:trophy", stat: "3", label: "Kategori Juara" },
    ],
    gains: defaultGains,
    faqs: defaultFaqs,
  },
};

// Fallback supaya slug yang belum diisi kontennya (mis. kompetisi baru ditambahkan ke
// mockCompetitionDetails tapi lupa diisi di sini) tidak bikin halaman crash.
export function getCompetitionDetailContent(slug: string): CompetitionDetailContentEntry {
  return competitionDetailContent[slug] ?? { funFacts: [], gains: defaultGains, faqs: defaultFaqs };
}

export interface ContactChannel {
  icon: string;
  label: string;
  href: string;
}

// Shared lintas semua competition detail page (kontak panitia, bukan per-kompetisi) — sama
// kategori dengan discordInviteUrl di competitionsContent.ts. Selaras dengan placeholder yang
// sudah ada di Footer.tsx (kontak@ioe2027.example, WhatsApp placeholder).
export const contactChannels: ContactChannel[] = [
  { icon: "mdi:email", label: "kontak@ioe2027.example", href: "mailto:kontak@ioe2027.example" },
  { icon: "mdi:whatsapp", label: "WhatsApp Panitia", href: "https://wa.me/62XXXXXXXXXX" },
];
