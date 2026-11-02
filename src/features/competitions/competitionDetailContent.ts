import type { FaqItem } from "./competitionsContent";

// Konten statis khusus /competitions/[slug] yang TIDAK tersedia dari API_CONTRACT.md
// (GET /competitions/:slug cuma prose-spec, lihat types/competition.ts). Sengaja di-key PER
// SLUG (bukan shared seperti testimonials/FAQ di competitionsContent.ts) karena
// PRD_IOE_2027_v4.md eksplisit menyebut halaman ini "Competition Details (per lomba)".
// SEMUA isi di bawah PLACEHOLDER — belum ada materi final dari panitia (PRD §8/§13 A6).
// Wajib diganti sebelum go-live, dicatat di CHANGELOG.md.

export interface FunFact {
  id: string;
  text: string;
}

export interface GainItem {
  id: string;
  icon: string; // iconify id — belum ada aset foto dari klien, jadi TiltedCard pakai
  // icon+title+caption, bukan galeri foto seperti referensi Framer aslinya di
  // design_system_final.md §TiltedCard. Dicatat di CHANGELOG.md.
  title: string;
  caption: string; // visible body description in the benefit-card layout
}

interface CompetitionDetailContentEntry {
  funFacts: FunFact[];
  gains: GainItem[];
  faqs: FaqItem[];
}

export const competitionDetailContent: Record<string, CompetitionDetailContentEntry> = {
  "business-case-competition": {
    funFacts: [
      { id: "business-case-1", text: "Dalam kasus bisnis maritim, keputusan sering dipengaruhi biaya logistik, kebutuhan pasar, dan kondisi di lapangan." },
      { id: "business-case-2", text: "Data yang sama bisa menghasilkan strategi berbeda saat tim memilih prioritas antara efisiensi, keberlanjutan, dan pengalaman pengguna." },
      { id: "business-case-3", text: "Solusi bisnis yang kuat menjelaskan masalah, alasan di balik strategi, serta cara mengukur dampaknya saat diterapkan." },
    ],
    gains: [
      { id: "case-analysis", icon: "mdi:chart-box-outline", title: "Case Analysis", caption: "Latih cara membaca persoalan bisnis dari data dan konteks industri maritim." },
      { id: "business-strategy", icon: "mdi:lightbulb-on-outline", title: "Business Strategy", caption: "Susun rekomendasi yang mempertimbangkan kebutuhan pasar dan kelayakan penerapan." },
      { id: "team-pitch", icon: "mdi:presentation", title: "Team Pitch", caption: "Bangun argumen bersama tim untuk menjelaskan solusi di hadapan juri." },
    ],
    faqs: [
      { value: "business-case-focus", question: "Apa yang dikerjakan dalam Business Case Competition?", answer: "Peserta menganalisis studi kasus tentang ekonomi dan industri maritim, lalu merumuskan strategi bisnis yang aplikatif." },
      { value: "business-case-team", question: "Apakah Business Case Competition dikerjakan secara tim?", answer: "Ya. Deskripsi kompetisi menyebut peserta menyusun analisis dan solusi secara tim." },
      { value: "business-case-timeline", question: "Kapan studi kasus dan jawaban dikumpulkan?", answer: "Lihat jadwal rilis studi kasus dan batas pengumpulan jawaban pada Timeline Kompetisi di atas. Tanggal yang ditampilkan masih menunggu konfirmasi final panitia." },
    ],
  },
  "paper-poster-competition": {
    funFacts: [
      { id: "paper-poster-1", text: "Gagasan tentang laut bisa berawal dari persoalan kecil di sekitar pesisir, lalu berkembang menjadi pertanyaan riset yang lebih luas." },
      { id: "paper-poster-2", text: "Poster ilmiah yang jelas membantu pembaca menangkap masalah, metode, dan temuan utama dalam sekali lihat." },
      { id: "paper-poster-3", text: "Karya tulis yang meyakinkan menghubungkan data, analisis, dan kesimpulan tanpa membuat pembaca menebak alurnya." },
    ],
    gains: [
      { id: "research-writing", icon: "mdi:file-document-edit-outline", title: "Research Writing", caption: "Kembangkan gagasan tentang keberlanjutan ekosistem maritim menjadi tulisan yang runtut." },
      { id: "visual-communication", icon: "mdi:palette-outline", title: "Visual Communication", caption: "Sampaikan persoalan dan temuan utama lewat poster yang mudah dipahami." },
      { id: "work-presentation", icon: "mdi:presentation", title: "Present Your Work", caption: "Latih cara menjelaskan proses dan hasil karya di hadapan juri pada babak final." },
    ],
    faqs: [
      { value: "paper-poster-format", question: "Karya seperti apa yang dibuat dalam Paper & Poster Competition?", answer: "Peserta menuangkan gagasan ilmiah dalam bentuk tulisan atau poster visual tentang ekosistem maritim Indonesia." },
      { value: "paper-poster-theme", question: "Apa fokus tema kompetisinya?", answer: "Deskripsi kompetisi berfokus pada keberlanjutan ekosistem maritim Indonesia." },
      { value: "paper-poster-final", question: "Apakah karya dipresentasikan pada babak final?", answer: "Ya. Deskripsi kompetisi menyebut karya terbaik akan dipresentasikan di hadapan juri pada babak final." },
    ],
  },
  "design-competition": {
    funFacts: [
      { id: "design-1", text: "Desain untuk isu kelautan perlu mempertimbangkan siapa yang memakai solusi dan seperti apa kondisi tempat solusi itu digunakan." },
      { id: "design-2", text: "Visual yang baik tidak hanya menarik perhatian, tetapi juga membantu orang memahami pesan dan langkah yang perlu diambil." },
      { id: "design-3", text: "Sebuah ide desain bisa berubah setelah diuji dengan pengguna dan dibandingkan dengan kebutuhan nyata di lapangan." },
    ],
    gains: [
      { id: "design-research", icon: "mdi:magnify", title: "Design Research", caption: "Pahami tantangan energi, ekonomi, atau inovasi digital di sektor kelautan." },
      { id: "creative-exploration", icon: "mdi:palette-outline", title: "Creative Exploration", caption: "Kembangkan gagasan visual yang orisinal dan relevan dengan masalah yang dipilih." },
      { id: "solution-storytelling", icon: "mdi:lightbulb-on-outline", title: "Solution Storytelling", caption: "Jelaskan bagaimana rancanganmu menjawab kebutuhan dan bekerja dalam konteks maritim." },
    ],
    faqs: [
      { value: "design-focus", question: "Apa fokus Design Competition?", answer: "Peserta merancang solusi visual atau desain kreatif untuk tantangan energi, ekonomi, dan inovasi digital di sektor kelautan." },
      { value: "design-idea", question: "Apa yang perlu dijelaskan dalam karya desain?", answer: "Tunjukkan masalah yang dipilih, alasan di balik keputusan desain, dan hubungan rancangan dengan solusi yang ditawarkan." },
      { value: "design-theme", question: "Apakah desain harus berkaitan dengan isu maritim?", answer: "Ya. Deskripsi kompetisi menempatkan isu maritim sebagai konteks dari solusi desain yang dibuat." },
    ],
  },
};

// Fallback supaya slug yang belum diisi kontennya (mis. kompetisi baru ditambahkan ke
// mockCompetitionDetails tapi lupa diisi di sini) tidak bikin halaman crash.
export function getCompetitionDetailContent(slug: string): CompetitionDetailContentEntry {
  return competitionDetailContent[slug] ?? { funFacts: [], gains: [], faqs: [] };
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
