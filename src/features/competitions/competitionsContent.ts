// Konten statis untuk /competitions (Competition Overview) yang TIDAK tersedia dari
// CompetitionSummary (API_CONTRACT.md §CompetitionSummary — cuma {id, slug, name, deadline,
// isRegisteredByUser}). Sama seperti landingContent.ts, PLACEHOLDER kecuali ditandai
// "sumber: PRD" — klien belum kirim copywriting final (PRD §8/§13 A6).
//
// Scope halaman ini SUDAH DIPERLUAS di luar F-22–F-26 (PRD cuma minta Hero+Countdown, About,
// CTA List, Timeline, Sponsor) atas keputusan eksplisit user — section Memories, Testimonial,
// Discord CTA, FAQ ditambahkan mengikuti referensi layout yang diberikan. Dicatat di
// CHANGELOG.md bahwa PRD_IOE_2027_v4.md & ROUTES.md perlu direview manusia untuk sinkronisasi.

export const aboutDescription =
  "Competition Overview adalah rangkaian kompetisi nasional Indonesia Ocean Expo 2027 — ruang bagi mahasiswa/pelajar se-Indonesia untuk mengasah kemampuan analisis bisnis, riset ilmiah, dan desain kreatif seputar isu maritim, energi, dan inovasi digital.";

// PLACEHOLDER — CompetitionSummary tidak punya field prizePool (gap API_CONTRACT.md,
// dicatat di CHANGELOG). Angka di bawah murni dummy sampai ada konfirmasi klien/BE.
export const totalPrizePool = "Rp 50.000.000";

export interface CompetitionBlurb {
  slug: string;
  description: string;
  // PLACEHOLDER — CompetitionSummary (API_CONTRACT.md) tidak punya field gambar sama
  // sekali, dan file asset-nya SENGAJA belum ada di /public/competitions/ (menunggu drop
  // dari klien/panitia). <img> akan tampil broken sampai file asli diisi. Dicatat sbg gap
  // API_CONTRACT.md di CHANGELOG — perlu direview manusia apakah field ini harusnya
  // datang dari BE.
  imageUrl: string;
}

// Deskripsi singkat per kompetisi utk CompetitionGrid — bukan dari API (list endpoint tidak
// punya field description), copy lokal berdasar nama kompetisi yang sudah disebut PRD.
export const competitionBlurbs: CompetitionBlurb[] = [
  {
    slug: "business-case-competition",
    description:
      "Uji kemampuan analisis bisnis dan strategi digitalmu dengan menyelesaikan studi kasus nyata seputar ekonomi dan industri maritim.",
    imageUrl: "/competitions/business-case-competition.png",
  },
  {
    slug: "paper-poster-competition",
    description:
      "Tuangkan gagasan ilmiahmu dalam bentuk karya tulis atau poster inovatif seputar keberlanjutan ekosistem maritim Indonesia.",
    imageUrl: "/competitions/paper-poster-competition.png",
  },
  {
    slug: "design-competition",
    description:
      "Rancang solusi visual/desain kreatif yang menjawab tantangan energi, ekonomi, dan inovasi digital di sektor kelautan.",
    imageUrl: "/competitions/design-competition.png",
  },
];

export interface OverallTimelineItem {
  date: string;
  label: string;
  // "done" | "current" | "future" — dipakai node/progress-bar Horizontal Zig-Zag Timeline
  // (CompetitionTimelineSection.tsx). PLACEHOLDER demonstrasi 3 varian visual node, TIDAK
  // dihitung dari deadline asli (semua tanggal di bawah masih di masa depan dari currentDate,
  // jadi status "done"/"current" di sini murni contoh, bukan derivasi tanggal real). Wajib
  // diganti jadi field asli (atau logika derivasi dari deadline) sebelum go-live — lihat
  // CHANGELOG.
  status: "done" | "current" | "future";
}

// F-25 — timeline keseluruhan kompetisi (beda dari landingContent.timelineItems yang scope-nya
// seluruh event IOE 2027, ini spesifik ke rangkaian kompetisi saja). Tanggal PLACEHOLDER.
export const overallTimelineItems: OverallTimelineItem[] = [
  { date: "Jan 2027", label: "Pendaftaran Dibuka", status: "done" },
  { date: "10–20 Mar 2027", label: "Batas Akhir Pendaftaran per Kompetisi", status: "current" },
  { date: "Apr 2027", label: "Penjurian & Pengumuman Finalis", status: "future" },
  { date: "Mei 2027", label: "Grand Final & Awarding Night", status: "future" },
  // 2 item tambahan — QA overflow-x horizontal scroll Horizontal Zig-Zag Timeline
  // (CompetitionTimelineSection.tsx), diminta user langsung utk verifikasi scroll,
  // BUKAN item resmi dari PRD/panitia. Hapus lagi (kembalikan ke 4 item) kalau QA sudah
  // selesai dan tidak dipakai sbg konten permanen.
  { date: "Jun 2027", label: "Workshop Persiapan Grand Final", status: "future" },
  { date: "Jul 2027", label: "Closing Ceremony & Awarding", status: "future" },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

// Dummy — belum ada testimoni real (dokumentasi "IOE 2026" di landingContent.memories
// mengindikasikan sudah ada edisi sebelumnya, tapi belum ada kutipan asli dari klien).
// WAJIB diganti sebelum go-live, lihat CHANGELOG.
export const testimonials: Testimonial[] = [
  {
    id: "testi-1",
    name: "Nama Peserta",
    role: "Finalis Business Case Competition, IOE 2026",
    quote:
      "Placeholder testimoni — belum ada kutipan asli dari peserta. Menunggu materi dari panitia sebelum go-live.",
  },
  {
    id: "testi-2",
    name: "Nama Peserta",
    role: "Juara Paper & Poster Competition, IOE 2026",
    quote:
      "Placeholder testimoni — belum ada kutipan asli dari peserta. Menunggu materi dari panitia sebelum go-live.",
  },
  {
    id: "testi-3",
    name: "Nama Peserta",
    role: "Peserta Design Competition, IOE 2026",
    quote:
      "Placeholder testimoni — belum ada kutipan asli dari peserta. Menunggu materi dari panitia sebelum go-live.",
  },
];

export interface FaqItem {
  value: string;
  question: string;
  answer: string;
}

// Dummy FAQ — belum ada daftar pertanyaan resmi dari panitia.
export const competitionFaqs: FaqItem[] = [
  {
    value: "faq-1",
    question: "Apakah kompetisi IOE 2027 berbayar?",
    answer: "Placeholder — informasi biaya pendaftaran menunggu konfirmasi panitia.",
  },
  {
    value: "faq-2",
    question: "Apakah kompetisi ini hanya untuk mahasiswa?",
    answer: "Placeholder — ketentuan peserta per kompetisi menunggu konfirmasi panitia.",
  },
  {
    value: "faq-3",
    question: "Apakah semua kompetisi berbasis tim?",
    answer: "Placeholder — ketentuan format tim/individu per kompetisi menunggu konfirmasi panitia.",
  },
  {
    value: "faq-4",
    question: "Bagaimana cara bertanya lebih lanjut?",
    answer: "Placeholder — kanal kontak resmi (Discord/Instagram/email) menunggu konfirmasi panitia.",
  },
];

// Placeholder — belum ada link invite Discord resmi dari panitia, mirip pola
// NEXT_PUBLIC_GOOGLE_CLIENT_ID yang masih kosong (AUTH_IMPLEMENTATION.md A2).
export const discordInviteUrl = "https://discord.gg/PLACEHOLDER";
