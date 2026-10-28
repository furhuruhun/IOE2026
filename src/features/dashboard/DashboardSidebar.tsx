"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as RadixTabs from "@radix-ui/react-tabs";
import { Icon } from "@iconify/react/offline";
import { useUser } from "@/hooks/useAuth";

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
  "flex h-[46px] w-full items-center gap-2.5 rounded-xl px-4 font-ui text-b3 font-bold text-neutral-1000 transition-colors hover:bg-black/10 data-[state=active]:bg-primary-100 data-[state=active]:text-neutral-1000";

export function DashboardSidebar({ activeTab }: { activeTab: DashboardTab }) {
  const user = useUser();
  const mobileMenuId = useId();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const selected = TAB_ITEMS.find(item => item.value === activeTab)!;
  const closeMenu = () => { setMobileMenuOpen(false); menuButton.current?.focus(); };

  return (
    <div onKeyDown={event => { if (event.key === "Escape" && mobileMenuOpen) { event.preventDefault(); closeMenu(); } }} className="flex w-full min-w-0 flex-col gap-4 rounded-3xl bg-neutral-100 p-4 md:gap-6 md:p-6 md:self-start xl:mt-16 xl:min-h-[35rem]">
      {/* Profile card — F-45/F-46, avatar+nama otomatis dari akun Google */}
      <div className="flex items-center gap-4 text-left md:flex-col md:gap-5 md:py-4 md:pb-8 md:text-center">
        <p className="min-w-0 flex-1 wrap-anywhere font-heading text-h6 text-neutral-1000">{user?.name ?? '—'}</p>
        {user?.avatarUrl ? <Image src={user.avatarUrl} alt="" width={128} height={128} unoptimized referrerPolicy="no-referrer" className="size-10 shrink-0 rounded-full object-cover md:size-28" /> : <Icon icon="mdi:account-circle" className="size-10 shrink-0 text-neutral-1000 md:size-28" />}
      </div>

      {/* Mobile — dropdown disclosure, cuma tampil <md */}
      <div className="relative w-full md:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls={mobileMenuOpen ? mobileMenuId : undefined}
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl bg-neutral-200 px-4 py-2.5"
        >
          <span className="flex items-center gap-2.5 font-ui text-b3 font-bold text-neutral-1000">
            <Icon icon={selected.icon} className="size-5" />
            {selected.label}
          </span>
          <Icon
            icon="mdi:chevron-down"
            className={`size-4 shrink-0 transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Desktop — full nav list, sticky */}
      <RadixTabs.List id={mobileMenuId} aria-label="Dashboard sections" className={`${mobileMenuOpen ? "flex" : "hidden"} w-full flex-col gap-2 md:flex`}>
        {TAB_ITEMS.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} onClick={() => { if (menuButton.current?.getClientRects().length) closeMenu(); }} className={TAB_TRIGGER_CLASS}>
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
