import { create } from "zustand";

interface Receipt { participantId: string; slug: string; eventName: string; registrationId: string }

// Navigation evidence only, never persisted or accepted from URL parameters.
export const useEventRegistrationStore = create<{
  receipt: Receipt | null;
  record: (receipt: Receipt) => void;
  clear: () => void;
}>(set => ({ receipt: null, record: receipt => set({ receipt }), clear: () => set({ receipt: null }) }));
