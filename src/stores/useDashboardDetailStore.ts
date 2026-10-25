'use client';
import { create } from 'zustand';
interface DashboardDetailState {
  slug: string | null;
  open: (slug: string) => void;
  close: () => void;
}
// Deliberately not persisted: refresh returns to the dashboard Home view.
export const useDashboardDetailStore = create<DashboardDetailState>(set => ({
  slug: null, open: slug => set({ slug }), close: () => set({ slug: null }),
}));
