"use client";

import { useState } from "react";
import Link from "next/link";
import * as RadixTabs from "@radix-ui/react-tabs";
import { Icon } from "@iconify/react/offline";
import { useUser } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/ui/Navbar";
import type { DashboardTab } from "./dashboardTabs";

// Sidebar nav Home/My Profile/Registered Events = Radix Tabs (client-state, /dashboard
// URL tidak berubah) — keputusan eksplisit user mengikuti referensi COMPFEST persis,
// BUKAN navigasi ke route /profile terpisah yang didokumentasikan ROUTES.md. Lihat
// CHANGELOG untuk catatan desync dokumen. "Competition" SENGAJA bukan bagian dari Tabs
// ini — link biasa ke /competitions (F-45 cuma minta "CTA Competition", dan /competitions
// sudah jadi halaman publik yang live, beda dari referensi COMPFEST yang men-disable-nya
// karena "registration belum dibuka").
const TAB_ITEMS: { value: DashboardTab; label: string; icon: string }[] = [
  { value: "home", label: "Home", icon: "mdi:home-variant" },
  { value: "profile", label: "My Profile", icon: "mdi:account" },
  { value: "events", label: "Registered Events", icon: "mdi:gift-outline" },
];

const TAB_TRIGGER_CLASS =
  "flex h-[46px] w-full items-center gap-2.5 rounded-xl px-4 font-ui text-b3 font-bold text-neutral-1000 transition-colors hover:bg-black/10 data-[state=active]:bg-secondary-1000 data-[state=active]:text-neutral-100";

export function DashboardSidebar() {
  const user = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6 md:w-[280px] md:shrink-0 md:self-start">
      {/* Profile card — F-45/F-46, avatar+nama otomatis dari akun Google */}
      <div className="flex flex-col items-center gap-3 rounded-[24px] bg-neutral-200 px-6 py-8 text-center">
        <UserAvatar avatarUrl={user?.avatarUrl} size="size-[22px]" />
        <p className="font-ui text-b2 font-bold text-neutral-1000">{user?.name ?? "—"}</p>
      </div>

      {/* Mobile — dropdown disclosure, cuma tampil <md */}
      <div className="relative w-full md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl bg-neutral-200 px-4 py-2.5"
        >
          <span className="flex items-center gap-2.5 font-ui text-b3 font-bold text-neutral-1000">
            <Icon icon={TAB_ITEMS[0].icon} className="size-5" />
            Menu
          </span>
          <Icon
            icon="mdi:chevron-down"
            className={`size-4 shrink-0 transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileMenuOpen && (
          <RadixTabs.List className="mt-2 flex flex-col gap-2 rounded-xl bg-neutral-200 p-2">
            {TAB_ITEMS.map((item) => (
              <RadixTabs.Trigger
                key={item.value}
                value={item.value}
                onClick={() => setMobileMenuOpen(false)}
                className={`${TAB_TRIGGER_CLASS} justify-start`}
              >
                <Icon icon={item.icon} className="size-5 shrink-0" />
                {item.label}
              </RadixTabs.Trigger>
            ))}
            <Link
              href="/competitions"
              className={`${TAB_TRIGGER_CLASS} justify-start bg-transparent hover:bg-black/10`}
            >
              <Icon icon="mdi:trophy-outline" className="size-5 shrink-0" />
              Competition
            </Link>
          </RadixTabs.List>
        )}
      </div>

      {/* Desktop — full nav list, sticky */}
      <RadixTabs.List className="hidden w-full flex-col gap-2 md:flex">
        {TAB_ITEMS.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} className={TAB_TRIGGER_CLASS}>
            <Icon icon={item.icon} className="size-5 shrink-0" />
            {item.label}
          </RadixTabs.Trigger>
        ))}
        <Link href="/competitions" className={`${TAB_TRIGGER_CLASS} bg-transparent hover:bg-black/10`}>
          <Icon icon="mdi:trophy-outline" className="size-5 shrink-0" />
          Competition
        </Link>
      </RadixTabs.List>
    </div>
  );
}
