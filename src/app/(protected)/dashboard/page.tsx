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
import dashboardLayout from "@/features/dashboard/DashboardLayout.module.css";

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
      <main id="main-content" tabIndex={-1} className={`mx-auto grid w-full max-w-[1600px] gap-6 px-6 pt-6 pb-12 md:px-10 md:pt-0 2xl:px-20 ${dashboardLayout.pageGrid}`}>
        <div className="min-w-0 md:sticky md:top-20 md:self-start md:max-h-[calc(100dvh-5rem)] md:overflow-y-auto">
          <div className="flex h-20 items-center md:h-30">
            <Link href="/" aria-label="Back to homepage" className="ui-action ui-action-secondary"><Icon icon="mdi:chevron-left" className="size-6" />Back</Link>
          </div>
          <DashboardSidebar activeTab={tab} />
        </div>

        <div className="min-w-0">
          <RadixTabs.Content value="home" className="flex flex-col gap-8">
            {slug ? <DashboardActivityDetail key={slug} slug={slug} /> : <>
            <h1 className="sr-only">Dashboard</h1>
            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
              <div className="flex min-w-0 flex-col">
                <DashboardMyJourney />
                <DashboardAssignments />
              </div>
              <aside className="min-w-0 self-start"><DashboardCalendar /></aside>
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
