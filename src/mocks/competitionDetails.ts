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
      "The Business Case Competition challenges undergraduate participants to solve real-world industry problems across port operations, maritime supply chain efficiency, digital transformation, and green logistics. Working in teams, participants develop strategic business proposals and pitch deck solutions aimed at accelerating smart, safe, and sustainable maritime management before an expert jury panel.",
    timeline: [
      { date: "10 Nov 2026", label: "Pendaftaran Dibuka" },
      { date: "12 Dec 2026", label: "Batas Akhir Pendaftaran" },
      { date: "22 Mar 2027", label: "Studi Kasus Dirilis" },
      { date: "5 Apr 2027", label: "Batas Pengumpulan Jawaban" },
      { date: "20 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 15.000.000++",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 7.000.000" },
      { label: "Juara 2", amount: "Rp 5.000.000" },
      { label: "Juara 3", amount: "Rp 3.000.000" },
    ],
    guidebookUrl: null,
  },
  {
    ...findSummary("paper-poster-competition"),
    description:
      "The Paper & Poster Competition provides a platform for undergraduate students to present innovative scientific papers and visual posters addressing critical marine challenges. Focusing on coastal resilience, sedimentary management, circular economy, and eco-friendly dredging, participants present their research and solutions before an expert jury panel and visitors at the Grand Summit exhibition ",
    timeline: [
      { date: "10 Nov 2026", label: "Pendaftaran Dibuka" },
      { date: "12 Dec 2026", label: "Batas Akhir Pendaftaran" },
      { date: "24 Mar 2027", label: "Batas Pengumpulan Karya" },
      { date: "15 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 15.000.000++",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 7.000.000" },
      { label: "Juara 2", amount: "Rp 5.000.000" },
      { label: "Juara 3", amount: "Rp 3.000.000" },
    ],
    guidebookUrl: null,
  },
  {
    ...findSummary("design-competition"),
    description:
      "The Floating Offshore Wind Turbine (FOWT) Competition challenges undergraduate students to engineer innovative and structurally safe FOWT designs tailored to Indonesia's offshore wind potential. Participants perform rotor turbine calculations, platform selection, semi-submersible sizing based on DNV standards, and 3D modeling, culminating in prototype development for the final stage.",
    timeline: [
      { date: "17 Jan 2027", label: "Pendaftaran Dibuka" },
      { date: "12 Dec 2026", label: "Batas Akhir Pendaftaran" },
      { date: "3 Apr 2027", label: "Batas Pengumpulan Karya" },
      { date: "25 Apr 2027", label: "Pengumuman Finalis" },
      { date: "10 Mei 2027", label: "Grand Final & Awarding Night" },
    ],
    totalPrizePool: "Rp 18.000.000++",
    prizeBreakdown: [
      { label: "Juara 1", amount: "Rp 10.000.000" },
      { label: "Juara 2", amount: "Rp 5.000.000" },
      { label: "Juara 3", amount: "Rp 3.000.000" },
    ],
    guidebookUrl: null,
  },
];
