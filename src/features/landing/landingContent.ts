// Konten statis/hardcoded untuk Landing Page — sengaja diizinkan (halaman ini tidak
// fetch dari BE sama sekali). Sesuai PRD_IOE_2027_v4.md §8 Assumptions & §13 Awareness A6:
// klien belum kirim copywriting/aset final, jadi konten di bawah PLACEHOLDER kecuali
// ditandai "sumber: PRD" (dikutip langsung dari dokumen, bukan dikarang).

export interface HeroSlide {
  id: string;
  /** Label kecil uppercase di atas judul — TIDAK ada teks eksplisit di spec, interpretasi saya. Lihat CHANGELOG. */
  eyebrow: string;
  title: string;
  /** Satu paragraf (bukan subtitle+description terpisah lagi — model konten baru §HeroCarousel iterasi 4). */
  desc: string;
  /** Countdown (component CountdownTimer, circle-gradient) cuma di slide yang relevan — cuma slide 1. */
  showCountdown?: boolean;
  cta: { label: string; href: string };
}

// F-07: carousel berisi 3 item — model konten disederhanakan di iterasi 4 (eyebrow+title+desc
// tunggal, ganti dari title+subtitle+description). Slide 1 SEKARANG punya CTA "Lihat Jadwal"
// (beda dari iterasi sebelumnya yang sengaja tanpa CTA) — tujuan link (`#timeline`, scroll ke
// TimelineSection di halaman yang sama) adalah interpretasi saya, spec tidak sebutkan
// destinasi eksplisit. Lihat CHANGELOG.
export const heroSlides: HeroSlide[] = [
  {
    id: "slide-overview",
    eyebrow: "Welcome to",
    title: "Indonesia Ocean Expo 2027",
    desc: "Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation     Organized by the Ocean Engineering Student Association at Institut Teknologi Bandung (KMKL-ITB)",
    showCountdown: true,
    cta: { label: "View Schedule", href: "#timeline" },
  },
  {
    id: "slide-competition",
    eyebrow: "Competition",
    title: "National Competition",
    desc: "Business Case, Paper & Poster, Design Competition:       Test your ideas and skills against participants from all over Indonesia.",
    cta: { label: "View Competitions", href: "/competitions#our-competition" },
  },
  {
    id: "slide-event",
    eyebrow: "Event",
    title: "Event Series",
    desc: "Talkshow, Exhibition, Short Course:           Expand your insights on Indonesia's maritime sector through the IOE 2027 event series.",
    cta: { label: "View Events", href: "/events#events" },
  },
];

// F-09 — sumber: PRD_IOE_2027_v4.md §1 Overview (dikutip, bukan dikarang).
export const aboutDescription =
  'Indonesia Ocean Expo (IOE) 2027 is the premier maritime gathering hosted by KMKL ITB, connecting the next generation of engineers with industry practitioners. Focusing on Energy, Economy, and Innovation, IOE 2027 empowers participants to shape the future of offshore energy, smart logistics, and coastal resilience through rigorous international challenges and collaborative summits.';

// F-09 — daftar sponsor: PLACEHOLDER, klien belum kirim daftar sponsor final
// (PRD §8 Assumptions & Dependencies).
export const sponsors: string[] = ["Sponsor A", "Sponsor B", "Sponsor C", "Sponsor D", "Sponsor E", "Sponsor F"];

export interface AboutStat {
  value: string;
  label: string;
}

// F-09 — sumber: PRD_IOE_2027_v4.md §2.2 Business Metrics (target pendaftar per kegiatan,
// dikutip langsung, bukan dikarang — event belum berlangsung jadi ini target, bukan capaian).
export const aboutStats: AboutStat[] = [
  { value: "20+", label: "Tim Business Case Competition" },
  { value: "15+", label: "Tim Paper & Poster Competition" },
  { value: "10+", label: "Tim Design Competition" },
  { value: "100+", label: "Peserta Talkshow & Seminar" },
  { value: "200+", label: "Peserta Exhibition" },
  { value: "20+", label: "Peserta Short Course" },
];

export interface TimelineItem {
  id: string;
  title: string;
  dateLabel?: string;
  dateTime?: string;
}

// F-10 — placeholder sementara. Belum ada delapan milestone dan tanggal resmi
export const timelineItems: TimelineItem[] = [
  { id: "milestone-01", title: "Competition - Early Bird Registration", dateLabel: "10 - 15 Nov 2026" },
  { id: "milestone-02", title: "Competition - Normal Registration", dateLabel: "16 - 30 Nov 2026"},
  { id: "milestone-03", title: "Competition - Late Registration", dateLabel: "1 - 12 Dec 2026" },
  { id: "milestone-04", title: "Competition - Preliminary Round", dateLabel: "10 Nov - 12 Dec 2026" },
  { id: "milestone-05", title: "Competition - Semifinal Round", dateLabel: "18 Dec - 15 Jan 2027"},
  { id: "milestone-06", title: "2-Day Professional Short Course", dateLabel: "22 - 23 Jan 2027" },
  { id: "milestone-07", title: "Competition - Final Round", dateLabel: "22 Jan - 4 Feb 2027" },
  { id: "milestone-08", title: "Grand Summit & Awarding Night", dateLabel: "5 Feb 2027" },
];
