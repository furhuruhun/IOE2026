import { mockCompetitions } from "@/mocks/competitions";
import type { CompetitionDetail } from "@/types/competition";

// Mock GET /competitions/:slug selama WORKERS_API_URL belum ready (sama alasan dengan
// mocks/competitions.ts). Field bersama (id/slug/name/deadline/isRegisteredByUser) di-spread
// dari mockCompetitions supaya kedua mock tidak drift satu sama lain — mockCompetitions tetap
// jadi single source of truth untuk field yang overlap dengan CompetitionSummary.
//
// description/timeline/totalPrizePool/prizeBreakdown/guidebookUrl SEMUA placeholder — belum
// ada copy/angka final dari panitia (PRD §8/§13 A6, sama kategori gap dengan
// competitionsContent.ts). guidebookUrl null di semua entry karena belum ada link guidebook
// resmi per kompetisi — tombol Download Guidebook akan disabled. Dicatat di CHANGELOG.md.
function findSummary(slug: string) {
  const summary = mockCompetitions.find((c) => c.slug === slug);
  if (!summary) throw new Error(`mockCompetitions tidak punya entry untuk slug "${slug}"`);
  return summary;
}

export const mockCompetitionDetails: CompetitionDetail[] = [
  {
    ...findSummary("business-case-competition"),
    description:
      "Business Case Competition menantang peserta untuk menganalisis studi kasus nyata seputar ekonomi dan industri maritim, lalu merumuskan strategi bisnis yang aplikatif dan berdampak. Peserta berkompetisi secara tim untuk menyusun analisis paling tajam dan solusi paling realistis di hadapan dewan juri.",
    timeline: [
      { date: "17 Jan 2027", label: "Pendaftaran Dibuka" },
      { date: "15 Mar 2027", label: "Batas Akhir Pendaftaran" },
      { date: "22 Mar 2027", label: "Studi Kasus Dirilis" },
      { date: "5 Apr 2027", label: "Batas Pengumpulan Jawaban" },
      { date: "20 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 20.000.000",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 10.000.000" },
      { label: "Juara 2", amount: "Rp 6.000.000" },
      { label: "Juara 3", amount: "Rp 4.000.000" },
    ],
    guidebookUrl: null,
  },
  {
    ...findSummary("paper-poster-competition"),
    description:
      "Paper & Poster Competition adalah ruang bagi peserta untuk menuangkan gagasan ilmiah tertulis maupun visual seputar keberlanjutan ekosistem maritim Indonesia. Karya terbaik akan dipresentasikan langsung di hadapan juri pada babak final.",
    timeline: [
      { date: "17 Jan 2027", label: "Pendaftaran Dibuka" },
      { date: "10 Mar 2027", label: "Batas Akhir Pendaftaran" },
      { date: "24 Mar 2027", label: "Batas Pengumpulan Karya" },
      { date: "15 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 15.000.000",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 8.000.000" },
      { label: "Juara 2", amount: "Rp 5.000.000" },
      { label: "Juara 3", amount: "Rp 2.000.000" },
    ],
    guidebookUrl: null,
  },
  {
    ...findSummary("design-competition"),
    description:
      "Design Competition mengajak peserta merancang solusi visual/desain kreatif yang menjawab tantangan energi, ekonomi, dan inovasi digital di sektor kelautan. Fokus penilaian ada pada orisinalitas ide, kekuatan visual, dan relevansi solusi terhadap isu maritim.",
    timeline: [
      { date: "17 Jan 2027", label: "Pendaftaran Dibuka" },
      { date: "20 Mar 2027", label: "Batas Akhir Pendaftaran" },
      { date: "3 Apr 2027", label: "Batas Pengumpulan Karya" },
      { date: "25 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 15.000.000",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 8.000.000" },
      { label: "Juara 2", amount: "Rp 5.000.000" },
      { label: "Juara 3", amount: "Rp 2.000.000" },
    ],
    guidebookUrl: null,
  },
];
