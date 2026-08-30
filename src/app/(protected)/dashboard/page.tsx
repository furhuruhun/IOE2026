"use client";

import { useState } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { DashboardMyJourney } from "@/features/dashboard/DashboardMyJourney";
import { DashboardAssignments } from "@/features/dashboard/DashboardAssignments";
import { DashboardCalendar } from "@/features/dashboard/DashboardCalendar";
import type { DashboardTab } from "@/features/dashboard/dashboardTabs";

// Route: /dashboard — Protected (src/proxy.ts, F-52). Next.js 16 mendeprekasi
// `middleware.ts` → `proxy.ts`, perilaku sama — lihat catatan di file itu.
//
// Sidebar Home/My Profile/Registered Events = Radix Tabs (client-state, URL tetap
// /dashboard) — keputusan eksplisit user, BUKAN navigasi ke /profile terpisah seperti
// didokumentasikan ROUTES.md. Lihat CHANGELOG untuk catatan desync dokumen.
//
// Detail aktivitas ("See Details") pakai client-state juga (Zustand useDashboardDetailStore
// per TECHNICAL_CONSTRAINTS_FE.md) — TAPI itu di luar scope task ini (cuma shell + Home
// view), jadi store itu SENGAJA belum dibuat di sini.
export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("home");

  return (
    <RadixTabs.Root value={tab} onValueChange={(v) => setTab(v as DashboardTab)}>
      <main className="mx-auto flex w-full max-w-[80rem] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:gap-10 md:px-12 md:py-16">
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <RadixTabs.Content value="home" className="flex flex-col gap-8">
            <DashboardMyJourney />
            <DashboardAssignments />
            <DashboardCalendar />
          </RadixTabs.Content>

          {/* Konten tab ini sengaja placeholder — di luar scope task ini (lihat CHANGELOG). */}
          <RadixTabs.Content value="profile" className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-b2 text-neutral-700">My Profile — belum dibangun di tab ini.</p>
          </RadixTabs.Content>
          <RadixTabs.Content value="events" className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-b2 text-neutral-700">Registered Events — belum dibangun di tab ini.</p>
          </RadixTabs.Content>
        </div>
      </main>
    </RadixTabs.Root>
  );
}
