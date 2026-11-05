"use client";

import { Suspense, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { create } from "zustand";
import { useCurrentUser, useIsAdmin } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { getErrorEntry } from "@/constants/errorMessages";
import { AdminPanel } from "@/features/admin/AdminPanel";
import { FormBanner } from "@/components/ui/FormBanner";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { CommitteeNotice } from "./RoleJourney";

// Transient redirect feedback only; no URL-controlled message or persisted role.
const useAdminNotice = create<{ message: string | null; set: (message: string | null) => void }>(set => ({
  message: null, set: message => set({ message }),
}));

export function AdminAccessNotice() {
  const pathname = usePathname();
  const message = useAdminNotice(state => state.message);
  const set = useAdminNotice(state => state.set);
  const dismiss = useCallback(() => set(null), [set]);
  useEffect(() => { if (pathname !== "/admin" && pathname !== "/dashboard") set(null); }, [pathname, set]);
  return pathname === "/dashboard" && message ? <div className="fixed inset-x-4 bottom-4 z-[10001] md:left-auto md:w-96">
    <Toast status="error" title={message} onDismiss={dismiss} />
  </div> : null;
}

export function AdminGate() {
  const identity = useCurrentUser();
  const isAdmin = useIsAdmin();
  const handleError = useErrorHandler();
  const setNotice = useAdminNotice(state => state.set);
  const waiting = identity.isPending || identity.isFetching;
  const code = (identity.error as { code?: string } | null)?.code;

  useEffect(() => {
    if (waiting) return;
    if (identity.isError && code !== "UNAUTHORIZED" && code !== "ADMIN_ONLY") return;
    if (identity.isError || !identity.data || !isAdmin) {
      handleError({ code: identity.isError ? code : !identity.data ? "UNAUTHORIZED" : "ADMIN_ONLY" }, {
        redirectTo: "/login?redirect=%2Fadmin", onToast: setNotice,
      });
    }
  }, [waiting, identity.isError, identity.data, code, isAdmin, handleError, setNotice]);

  if (waiting) return <main id="main-content" tabIndex={-1} className="site-container section-space"><p role="status">Memuat sesi...</p></main>;
  if (identity.isError) return <main id="main-content" tabIndex={-1} className="site-container section-space flex flex-col items-start gap-sm">
    <FormBanner message={getErrorEntry(code).message || getErrorEntry("SERVER_ERROR").message} />
    <Button onClick={() => void identity.refetch()}>Coba lagi</Button>
    <Link href="/" className="ui-action ui-action-secondary">Beranda</Link>
  </main>;
  if (!identity.data || !isAdmin) return <main id="main-content" tabIndex={-1} className="site-container section-space"><p role="status">Mengalihkan halaman...</p></main>;

  return <><Suspense fallback={null}><CommitteeNotice /></Suspense><AdminPanel /></>;
}
