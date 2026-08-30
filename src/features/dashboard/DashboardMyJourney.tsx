"use client";

import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { useJourney } from "@/hooks/useDashboard";
import { GradientBorderBox } from "@/components/ui/GradientBorderBox";

// F-47/F-47a/F-48 — section "My Journey". Spec: design_system_final.md §MyJourneyCard
// (baris 860-898). F-47a: tidak ada batas maksimal, overflow jadi scrollable horizontal.
export function DashboardMyJourney() {
  const { data, isLoading, isError } = useJourney();
  const items = isError ? [] : (data ?? []);

  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-heading text-h5 text-secondary-1000 md:text-h4">My Journey</h2>

      <div className="flex w-full flex-row gap-2 overflow-hidden rounded-xl bg-neutral-100 p-6 shadow-sm md:gap-6 md:rounded-[36px] md:p-8">
        {/* Bagian 1 — Add Another (fixed, kiri). F-48: klik → redirect /competitions
            (USER_FLOWS_v2.md "Flow: Dashboard — Tambah Kompetisi ke My Journey"). */}
        <Link href="/competitions" className="flex shrink-0 flex-col items-center gap-2">
          <span className="text-b3 font-bold text-neutral-800 md:text-b2">Add Another</span>
          <GradientBorderBox className="size-20 md:size-[100px]">
            <Icon icon="mdi:plus-circle-outline" className="size-11 text-secondary-1000" />
          </GradientBorderBox>
        </Link>

        {/* Bagian 2 — list logo kompetisi, scrollable horizontal, cursor-grab */}
        <div className="no-scrollbar flex flex-1 cursor-grab select-none flex-row gap-2 overflow-x-auto md:gap-6">
          {isLoading &&
            [0, 1].map((i) => (
              <div key={i} className="size-20 shrink-0 animate-pulse rounded-xl bg-neutral-300 md:size-25" aria-hidden />
            ))}
          {!isLoading &&
            items.map((item) => (
              <Link key={item.competitionId} href={`/competitions/${item.slug}`} className="flex shrink-0 flex-col items-center gap-2">
                <span className="max-w-20 truncate text-b3 font-bold text-neutral-800 md:max-w-[100px] md:text-b2">
                  {item.name}
                </span>
                <GradientBorderBox className="size-20 md:size-[100px]">
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
