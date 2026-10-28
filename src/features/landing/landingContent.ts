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
    desc: "Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation — diselenggarakan oleh KMKL ITB.",
    showCountdown: true,
    cta: { label: "Lihat Jadwal", href: "#timeline" },
  },
  {
    id: "slide-competition",
    eyebrow: "Competition",
    title: "Kompetisi Nasional",
    desc: "Business Case, Paper & Poster, Design Competition — uji ide dan kemampuanmu bersama peserta dari seluruh Indonesia.",
    cta: { label: "Lihat Kompetisi", href: "/competitions" },
  },
  {
    id: "slide-event",
    eyebrow: "Event",
    title: "Rangkaian Event",
    desc: "Talkshow, Workshop, Exhibition, Short Course — perluas wawasan maritim Indonesia lewat rangkaian acara IOE 2027.",
    cta: { label: "Lihat Event", href: "/events" },
  },
];

// F-09 — sumber: PRD_IOE_2027_v4.md §1 Overview (dikutip, bukan dikarang).
export const aboutDescription =
  'Website Indonesia Ocean Expo (IOE) 2027 dengan tema "Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation" adalah platform digital resmi event yang diselenggarakan oleh KMKL ITB. Website ini menjadi single source of truth bagi calon peserta untuk mendapatkan informasi dan mendaftar ke seluruh rangkaian kompetisi dan event.';

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

// F-10 — development placeholders. Belum ada delapan milestone dan tanggal resmi
// dari panitia; ganti data di sini ketika jadwal resmi tersedia.
export const timelineItems: TimelineItem[] = [
  { id: "milestone-01", title: "Milestone 01" },
  { id: "milestone-02", title: "Milestone 02" },
  { id: "milestone-03", title: "Milestone 03" },
  { id: "milestone-04", title: "Milestone 04" },
  { id: "milestone-05", title: "Milestone 05" },
  { id: "milestone-06", title: "Milestone 06" },
  { id: "milestone-07", title: "Milestone 07" },
  { id: "milestone-08", title: "Milestone 08" },
];

export interface MemoryItem {
  id: string;
  caption: string;
}

// F-11 — dokumentasi tahun sebelumnya: PLACEHOLDER, klien belum kirim foto/video
// (PRD §8 Assumptions & Dependencies — "dokumentasi event tahun sebelumnya").
export const memories: MemoryItem[] = [
  { id: "memory-opening", caption: "IOE 2026 — Opening Ceremony" },
  { id: "memory-competition", caption: "IOE 2026 — Business Case Competition" },
  { id: "memory-talkshow", caption: "IOE 2026 — Talkshow & Workshop" },
  { id: "memory-exhibition", caption: "IOE 2026 — Exhibition" },
];
