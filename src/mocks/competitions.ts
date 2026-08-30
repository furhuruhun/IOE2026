import type { CompetitionSummary } from "@/types/competition";

// Mock GET /competitions selama WORKERS_API_URL belum ready (TECHNICAL_CONSTRAINTS_FE.md
// §Data Fetching: "struktur identik dengan API_CONTRACT.md"). Nama & slug 3 kompetisi ini
// SUDAH dipakai konsisten di MobileNavDrawer.tsx dan disebut PRD_IOE_2027_v4.md — bukan
// nama karangan baru. Tanggal deadline PLACEHOLDER, selaras dengan landingContent.ts
// timelineItems ("Mar 2027 — Batas Akhir Pendaftaran Kompetisi"), menunggu tanggal final klien.
export const mockCompetitions: CompetitionSummary[] = [
  {
    id: "comp-business-case",
    slug: "business-case-competition",
    name: "Business Case Competition",
    deadline: "2027-03-15T23:59:00+07:00",
    isRegisteredByUser: false,
  },
  {
    id: "comp-paper-poster",
    slug: "paper-poster-competition",
    name: "Paper & Poster Competition",
    deadline: "2027-03-10T23:59:00+07:00",
    isRegisteredByUser: false,
  },
  {
    id: "comp-design",
    slug: "design-competition",
    name: "Design Competition",
    deadline: "2027-03-20T23:59:00+07:00",
    isRegisteredByUser: false,
  },
];
