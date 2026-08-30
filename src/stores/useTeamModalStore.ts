import { create } from "zustand";

export type TeamModalTab = "create" | "join";

interface TeamModalContext {
  competitionId: string;
  slug: string;
  competitionName: string;
}

interface TeamModalState extends Partial<TeamModalContext> {
  isOpen: boolean;
  activeTab: TeamModalTab;
  open: (ctx: TeamModalContext) => void;
  close: () => void;
  setActiveTab: (tab: TeamModalTab) => void;
}

// Modal Create/Join Team (F-18) — client-side state murni, TIDAK ganti route/URL
// (ROUTES.md §Pola Navigasi: "tetap di /competitions/[slug], modal muncul sebagai
// overlay"). Konsekuensinya (didokumentasikan di ROUTES.md §Catatan Trade-off): refresh
// halaman saat modal terbuka akan reset ke state default — SENGAJA tidak di-persist.
//
// Zustand store pertama di project ini (folder stores/ sebelumnya kosong) — namanya
// mengikuti konvensi yang sudah disebut TECHNICAL_CONSTRAINTS_FE.md §folder stores/.
export const useTeamModalStore = create<TeamModalState>((set) => ({
  isOpen: false,
  activeTab: "create",
  competitionId: undefined,
  slug: undefined,
  competitionName: undefined,
  open: (ctx) => set({ isOpen: true, activeTab: "create", ...ctx }),
  close: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
