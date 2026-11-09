"use client";

import { useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { useJourney } from "@/hooks/useDashboard";
import { GradientBorderBox } from "@/components/ui/GradientBorderBox";

// F-47/F-47a/F-48 — section "My Journey". Spec: design_system_final.md §MyJourneyCard
// (baris 860-898). F-47a: tidak ada batas maksimal, overflow jadi scrollable horizontal.
export function DashboardMyJourney() {
  const { data, isLoading, isFetching, isError, error, refetch } = useJourney();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (error) handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
  }, [error, handleError]);
  const items = isError ? [] : (data ?? []);

  return (
    <section className="flex w-full min-w-0 flex-col">
      <div className="flex h-20 items-end justify-center py-4 md:h-30">
        <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">My Journey</h2>
      </div>

      {isError && <div role="status" className="flex min-w-0 flex-col items-start gap-3">
          <p className="wrap-anywhere text-b3 text-neutral-700">Unable to load your competitions.{message && <span className="mt-1 block">{message}</span>}</p>
          <Button size="sm" disabled={isFetching} onClick={() => { setMessage(null); void refetch(); }}>{isFetching ? 'Loading...' : 'Coba lagi'}</Button>
        </div>}
      <div aria-busy={isFetching} className="flex w-full flex-row items-start gap-2 overflow-hidden rounded-xl bg-neutral-100 p-6 shadow-sm md:gap-6">
        {/* Bagian 1 — Add Another (fixed, kiri). F-48: klik → redirect /competitions
            (USER_FLOWS_v2.md "Flow: Dashboard — Tambah Kompetisi ke My Journey"). */}
        <Link href="/competitions" className="flex w-20 shrink-0 flex-col items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:w-25">
          <span className="block w-full truncate text-center text-b3 font-bold text-neutral-800 md:text-b2" title="Add Another">Add Another</span>
          <GradientBorderBox className="size-20 md:size-25">
            <Icon icon="mdi:plus-circle-outline" className="size-11 text-secondary-1000" />
          </GradientBorderBox>
        </Link>

        {/* Bagian 2 — list logo kompetisi, scrollable horizontal, cursor-grab */}
        <div role="region" aria-label="Your competitions" tabIndex={0} className="flex min-w-0 flex-1 flex-row items-start gap-2 overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-secondary-800 md:gap-6">
          {isLoading && <span role="status" className="sr-only">Loading competitions...</span>}
          {isLoading &&
            [0, 1].map((i) => (
              <div key={i} className="size-20 shrink-0 animate-pulse motion-reduce:animate-none rounded-xl bg-neutral-300 md:size-25" aria-hidden />
            ))}
          {!isLoading && !isError && items.length === 0 && <p role="status" className="text-b3 text-neutral-800">No competitions yet. Choose a competition to get started.</p>}
          {!isLoading && !isError &&
            items.map((item) => (
              <Link key={item.competitionId} href={`/competitions/${item.slug}`} aria-label={item.name} className="flex w-20 shrink-0 flex-col items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:w-25">
                <span className="block w-full truncate text-center text-b3 font-bold text-neutral-800 md:text-b2" title={item.name}>
                  {item.name}
                </span>
                <GradientBorderBox className="size-20 md:size-25">
                  {item.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- logoUrl dari klien, belum tentu domain ter-whitelist
                    <img src={item.logoUrl} alt="" className="size-full rounded-[15px] object-cover" />
                  ) : (
                    <Icon icon="mdi:trophy-outline" className="size-9 text-secondary-1000" />
                  )}
                </GradientBorderBox>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
