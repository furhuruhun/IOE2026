// Shape: API_CONTRACT.md §CompetitionSummary (baris 131-140), dipakai GET /competitions.
// PERHATIAN: shape ini TIDAK punya field `prizePool`/`description` — About & Grid section
// di /competitions perlu data itu, jadi ditambal via copy lokal (competitionsContent.ts),
// BUKAN dari API. Dicatat sebagai gap dokumen di CHANGELOG.md.
export interface CompetitionSummary {
  id: string;
  slug: string;
  name: string;
  deadline: string; // ISO8601
  isRegisteredByUser: boolean;
}

export interface CompetitionDetailTimelineItem {
  date: string;
  label: string;
}

export interface CompetitionDetailPrize {
  label: string; // "Juara 1", "Juara 2", dst — berurutan, index 0 = champion
  amount: string; // formatted currency string, konvensi sama dengan totalPrizePool
}

// Shape: API_CONTRACT.md §"GET /competitions/:slug" (baris 267-269) — spec-nya PROSE-ONLY
// ("Response 200: detail kompetisi (deskripsi, timeline, prizes, requirements schema)"),
// TIDAK ada JSON field list eksplisit seperti CompetitionSummary. Field-field di bawah ini
// DI-AUTHOR sekarang berdasar kebutuhan PRD_IOE_2027_v4.md F-12–F-17, BUKAN turunan langsung
// dari dokumen — dicatat sebagai gap di CHANGELOG.md, API_CONTRACT.md perlu disinkronkan manual.
//
// `requirements schema` yang disebut di kalimat prose yang sama SENGAJA TIDAK dimasukkan ke
// sini — itu scope F-18–F-21 (modal Create/Join Team, out of scope task ini) dan datang dari
// endpoint terpisah (GET /competitions/:id/requirements).
export interface CompetitionDetail {
  id: string; // dipakai nanti oleh POST /competitions/:id/team dkk (endpoint pakai id, bukan slug)
  slug: string;
  name: string;
  deadline: string; // ISO8601 — feed CountdownTimer (F-13)
  isRegisteredByUser: boolean;
  description: string; // About section (F-13)
  timeline: CompetitionDetailTimelineItem[]; // F-14, spesifik per kompetisi
  totalPrizePool: string;
  prizeBreakdown: CompetitionDetailPrize[];
  guidebookUrl: string | null; // F-12 Download Guidebook CTA; null = tombol disabled
}
