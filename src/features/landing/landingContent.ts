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

export interface TimelineItem {
  date: string;
  label: string;
}

// F-10 — tanggal PLACEHOLDER (PRD §13 Awareness A6: deadline konten dari klien belum
// ditetapkan). Urutan bulan mengacu ke F-50 (kalender dashboard s.d. Mei 2027).
export const timelineItems: TimelineItem[] = [
  { date: "Jan 2027", label: "Pendaftaran Dibuka" },
  { date: "Mar 2027", label: "Batas Akhir Pendaftaran Kompetisi" },
  { date: "Apr 2027", label: "Pengumuman Finalis" },
  { date: "Mei 2027", label: "Rangkaian Acara Utama" },
  { date: "Mei 2027", label: "Grand Final & Awarding Night" },
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
