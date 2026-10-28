"use client";

import { useEffect, useState } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { DashboardMyJourney } from "@/features/dashboard/DashboardMyJourney";
import { DashboardRegisteredEvents } from '@/features/dashboard/DashboardRegisteredEvents';
import { DashboardAssignments } from "@/features/dashboard/DashboardAssignments";
import { DashboardCalendar } from "@/features/dashboard/DashboardCalendar";
import { DashboardActivityDetail } from '@/features/dashboard/DashboardActivityDetail';
import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { ProfileForm } from '@/features/profile/ProfileForm';
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { Navbar } from '@/components/ui/Navbar';
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
    <RadixTabs.Root orientation="vertical" className="flex-1 pt-14 md:pt-20" value={tab} onValueChange={(v) => { closeDetail(); setTab(v as DashboardTab); }}>
      {tab === 'home' && !slug && <div className="site-container pt-6 pb-6">
        <Link href="/" aria-label="Back to homepage" className="ui-action ui-action-secondary"><Icon icon="mdi:chevron-left" className="size-6" />Back</Link>
      </div>}
      <main id="main-content" tabIndex={-1} style={tab === 'home' && !slug ? { paddingTop: 0 } : undefined} className="site-container grid grid-cols-1 gap-6 py-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:py-12 xl:grid-cols-[14rem_minmax(0,1fr)] xl:py-16">
        <DashboardSidebar activeTab={tab} />

        <div className="min-w-0">
          <RadixTabs.Content value="home" className="flex flex-col gap-8">
            {slug ? <DashboardActivityDetail key={slug} slug={slug} /> : <>
            <h1 className="sr-only">Dashboard</h1>
            <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex min-w-0 flex-col gap-10">
                <DashboardAssignments />
                <DashboardMyJourney />
              </div>
              <aside className="min-w-0"><DashboardCalendar /></aside>
            </div>
            </>}
          </RadixTabs.Content>

          {/* Both participant tabs keep the dashboard URL. */}
          <RadixTabs.Content value="profile" className="min-w-0"><ProfileForm /></RadixTabs.Content>
          <RadixTabs.Content value="events" className="min-w-0"><DashboardRegisteredEvents /></RadixTabs.Content>
        </div>
      </main>
    </RadixTabs.Root>
    <Footer />
    </div>
  );
}
