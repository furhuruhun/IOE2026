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
      { id: "case-analysis", icon: "mdi:chart-box-outline", title: "Case Analysis", caption: "Practice analyzing business challenges using data and maritime industry contexts." },
      { id: "business-strategy", icon: "mdi:lightbulb-on-outline", title: "Business Strategy", caption: "Formulate recommendations that take into account market needs and implementation feasibility." },
      { id: "team-pitch", icon: "mdi:presentation", title: "Team Pitch", caption: "Build strong arguments with your team to present your solution before the judges." },
    ],
    faqs: [
      { value: "business-case-focus", question: "What do participants work on in the Business Case Competition?", answer: "Participants analyze and solve real-world business challenges within the maritime industry, such as maritime operations, supply chain efficiency, and green port management by developing innovative, actionable, and sustainable strategic solutions." },
      { value: "business-case-team", question: "Is the Business Case Competition worked in teams?", answer: "Yes, this is a team-based competition with a maximum of 3 members per team." },
      { value: "business-case-timeline", question: "When are the case study and solutions submitted?", answer: "The case study will be distributed after your team completes registration through the website (ioe2027.com). Preliminary round submissions are open until 12 December 2026." },
    ],
  },
  "paper-poster-competition": {
    funFacts: [
      { id: "paper-poster-1", text: "Gagasan tentang laut bisa berawal dari persoalan kecil di sekitar pesisir, lalu berkembang menjadi pertanyaan riset yang lebih luas." },
      { id: "paper-poster-2", text: "Poster ilmiah yang jelas membantu pembaca menangkap masalah, metode, dan temuan utama dalam sekali lihat." },
      { id: "paper-poster-3", text: "Karya tulis yang meyakinkan menghubungkan data, analisis, dan kesimpulan tanpa membuat pembaca menebak alurnya." },
    ],
    gains: [
      { id: "research-writing", icon: "mdi:file-document-edit-outline", title: "Research Writing", caption: "Develop ideas on maritime ecosystem sustainability into a well-structured scientific paper." },
      { id: "visual-communication", icon: "mdi:palette-outline", title: "Visual Communication", caption: "Communicate core problems and key findings through an easily understandable poster." },
      { id: "work-presentation", icon: "mdi:presentation", title: "Present Your Work", caption: "Practice presenting your process and final deliverables before the jury panel in the final round." },
    ],
    faqs: [
      { value: "paper-poster-format", question: "What kind of works are created in the Paper & Poster Competition?", answer: "Participants submit an original scientific research paper along with a visual infographic poster that summarizes their findings, methodology, and innovative solutions for the maritime sector." },
      { value: "paper-poster-theme", question: "What is the theme focus of the competition?", answer: "The competition centers on the main theme 'Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation', with specific sub-themes focusing on dredging, reclamation, and coastal protection." },
      { value: "paper-poster-final", question: "Will the works be presented in the final round?", answer: "Yes, shortlisted finalists will present their research papers and showcase their posters in front of a panel of academic and industry judges during the final round at Institut Teknologi Bandung." },
    ],
  },
  "design-competition": {
    funFacts: [
      { id: "design-1", text: "Desain untuk isu kelautan perlu mempertimbangkan siapa yang memakai solusi dan seperti apa kondisi tempat solusi itu digunakan." },
      { id: "design-2", text: "Visual yang baik tidak hanya menarik perhatian, tetapi juga membantu orang memahami pesan dan langkah yang perlu diambil." },
      { id: "design-3", text: "Sebuah ide desain bisa berubah setelah diuji dengan pengguna dan dibandingkan dengan kebutuhan nyata di lapangan." },
    ],
    gains: [
      { id: "design-research", icon: "mdi:magnify", title: "Design Research", caption: "Analyze key challenges across energy, economy, or digital innovation within the ocean sector." },
      { id: "creative-exploration", icon: "mdi:palette-outline", title: "Creative Exploration", caption: "Develop original visual concepts that are directly relevant to the selected problem statement." },
      { id: "solution-storytelling", icon: "mdi:lightbulb-on-outline", title: "Solution Storytelling", caption: "Articulate how your design addresses real-world needs and operates effectively within a maritime context." },
    ],
    faqs: [
      { value: "design-focus", question: "What is the focus of the FOWT Design Competition?", answer: "The competition focuses on engineering innovative, structurally safe, and feasible Floating Offshore Wind Turbine (FOWT) concepts tailored to harness Indonesia’s offshore renewable energy potential." },
      { value: "design-idea", question: "What needs to be explained in the design submission?", answer: "Participants must cover rotor turbine calculations, platform sizing based on DNV standards, 3D modeling, and prototype development. More detailed requirements and formatting guidelines can be found in the official guidebook." },
      { value: "design-theme", question: "Must the design be related to maritime issues?", answer: "More information regarding the design scope and parameters is available in the official guidebook." },
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
// kontak panitia; ganti ID_OA dengan ID resmi LINE OA (tanpa @).
export const contactChannels: ContactChannel[] = [
  { icon: "mdi:email", label: "info@ioe2027.com", href: "mailto:info@ioe2027.com" },
  { icon: "mdi:chat", label: "OA LINE", href: "https://line.me/R/ti/p/@637iwugv" },
];
