"use client";

import { useCurrentUser } from "@/hooks/useAuth";

// Tidak render apapun — satu-satunya tujuan trigger GET /api/auth/me saat root layout mount,
// hasilnya masuk cache TanStack Query untuk dipakai useUser() di komponen manapun.
export function SessionBootstrap() {
  useCurrentUser();
  return null;
}
