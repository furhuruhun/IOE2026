"use client";

import { useEffect, useState } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { DashboardMyJourney } from "@/features/dashboard/DashboardMyJourney";
import { DashboardAssignments } from "@/features/dashboard/DashboardAssignments";
import { DashboardCalendar } from "@/features/dashboard/DashboardCalendar";
import { DashboardActivityDetail } from '@/features/dashboard/DashboardActivityDetail';
import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { ProfileForm } from '@/features/profile/ProfileForm';
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { Navbar, CTA_GRADIENT } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import type { DashboardTab } from "@/features/dashboard/dashboardTabs";

// Route: /dashboard — Protected (src/proxy.ts, F-52). Next.js 16 mendeprekasi
// `middleware.ts` → `proxy.ts`, perilaku sama — lihat catatan di file itu.
//
// Sidebar Home/My Profile/Registered Events = Radix Tabs (client-state, URL tetap
// /dashboard) — keputusan eksplisit user, BUKAN navigasi ke /profile terpisah seperti
// didokumentasikan ROUTES.md. Lihat CHANGELOG untuk catatan desync dokumen.
//
// Activity detail uses non-persisted Zustand state; URL remains /dashboard.
export default function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>("home");

  const slug = useDashboardDetailStore(state => state.slug);
  const closeDetail = useDashboardDetailStore(state => state.close);
  useEffect(() => () => closeDetail(), [closeDetail]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'radial-gradient(ellipse at 30% 25%, var(--color-primary-400), transparent 65%), radial-gradient(ellipse at 85% 75%, var(--color-secondary-200), transparent 65%), var(--color-neutral-100)' }}>
    <Navbar appearance="dashboard" />
    <RadixTabs.Root className="flex-1 pt-20 md:pt-26" value={tab} onValueChange={(v) => { closeDetail(); setTab(v as DashboardTab); }}>
      {tab === 'home' && !slug && <div className="mx-auto w-full max-w-[100rem] px-4 pt-6 pb-6 md:px-8 xl:px-16">
        <Link href="/" aria-label="Back to homepage" className="inline-flex items-center gap-4 rounded-2xl px-5 py-3 font-ui text-b2 font-bold text-secondary-1000 focus-visible:outline-2 focus-visible:outline-secondary-600" style={{ background: CTA_GRADIENT }}><Icon icon="mdi:chevron-left" className="size-6" />Back</Link>
      </div>}
      <main style={tab === 'home' && !slug ? { paddingTop: 0 } : undefined} className="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:px-8 md:py-12 xl:grid-cols-[14rem_minmax(0,1fr)] xl:px-16 xl:py-16">
        <DashboardSidebar />

        <div className="min-w-0">
          <RadixTabs.Content value="home" className="flex flex-col gap-8">
            {slug ? <DashboardActivityDetail key={slug} slug={slug} /> : <>
            <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex min-w-0 flex-col gap-10">
                <DashboardMyJourney />
                <DashboardAssignments />
              </div>
              <aside className="min-w-0"><DashboardCalendar /></aside>
            </div>
            </>}
          </RadixTabs.Content>

          {/* Profile uses the shared form; Registered Events awaits its own implementation. */}
          <RadixTabs.Content value="profile" className="min-w-0"><ProfileForm /></RadixTabs.Content>
          <RadixTabs.Content value="events" className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-b2 text-neutral-700">Registered Events — belum dibangun di tab ini.</p>
          </RadixTabs.Content>
        </div>
      </main>
    </RadixTabs.Root>
    <Footer />
    </div>
  );
}
