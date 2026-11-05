"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { COMMITTEE_DESTINATION, COMMITTEE_NOTICE, isParticipantPath } from "@/utils/roleJourney";

// UI journey only. Roles come from /api/auth/me, never from URL/cookie decoding.
export function RoleJourney({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const identity = useCurrentUser();
  const router = useRouter();
  const restricted = isParticipantPath(pathname);
  const committee = identity.data?.role === "panitia";
  useEffect(() => {
    if (!restricted || identity.isPending) return;
    if (committee) router.replace(COMMITTEE_DESTINATION);
    else if (identity.isSuccess && !identity.data) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [restricted, committee, identity.isPending, identity.isSuccess, identity.data, pathname, router]);

  if (!restricted || identity.data?.role === "peserta") return children;
  if (identity.isError && !committee) return <main id="main-content" tabIndex={-1} className="site-container section-space flex flex-col items-start gap-4">
    <FormBanner message="Sesi belum dapat diverifikasi. Coba lagi." />
    <Button onClick={() => void identity.refetch()}>Coba lagi</Button>
    <Link href="/">Beranda</Link>
  </main>;
  return <main id="main-content" tabIndex={-1} className="site-container section-space"><p role="status">{committee ? "Mengalihkan ke Admin Panel..." : "Memuat sesi..."}</p></main>;
}

export function ParticipantAction({ children }: { children: ReactNode }) {
  const identity = useCurrentUser();
  if (!identity.isSuccess) return null;
  if (identity.data?.role === "panitia") return <CommitteeLink />;
  return children;
}

export function CommitteeLink() {
  const identity = useCurrentUser();
  return identity.data?.role === "panitia" ? <Link href="/admin" className="ui-action ui-action-secondary ui-action-sm">Admin Panel</Link> : null;
}

export function WorkspaceLink() {
  const identity = useCurrentUser();
  if (!identity.data) return null;
  const committee = identity.data.role === "panitia";
  return <Link href={committee ? "/admin" : "/dashboard"} className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> {committee ? "Kembali ke Admin Panel" : "Kembali ke dashboard"}</Link>;
}

export function CommitteeNotice() {
  const searchParams = useSearchParams();
  return searchParams.get("notice") === "participant-only" ? <FormBanner variant="info" message={COMMITTEE_NOTICE} /> : null;
}
