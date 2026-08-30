"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";

// Spec: instruksi literal user (dimensi/breakpoint/layout navbar, 2 varian desktop≥1280px
// & mobile<1280px) — MENGGANTIKAN struktur & ukuran Navbar lama di
// design_system_final.md §Navbar (Login CTA 147×46, Profile CTA 116×47, Dropdown Label
// border putih 1.5px, tanpa breakpoint eksplisit), dikonfirmasi user saat kontradiksi
// dilaporkan. Keputusan merge: LAYOUT/DIMENSI ikut spec baru persis, tapi WARNA/GRADIENT
// tetap dari token semantic project (bukan warna baru) — lihat CHANGELOG untuk detail.
// F-01–F-03 (PRD_IOE_2027_v4.md).
//
// Toggle tema: lihat header comment di ThemeToggle.tsx — masih UI-only, belum fungsional.

const MENU_ITEMS = [
  { href: "/competitions", label: "Competition" },
  { href: "/events", label: "Events" },
];

// Exported: dipakai lagi di MobileNavDrawer.tsx buat footer Login/Profile CTA (biar
// gradient & avatar-fallback-nya tetap satu sumber, bukan duplikat).
export const CTA_GRADIENT =
  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)";

const PILL_BORDER =
  "flex items-center gap-1.5 rounded-full border border-neutral-500 px-3 py-1.5 text-sm font-medium text-neutral-800 transition-colors hover:border-secondary-1000 hover:text-secondary-1000";

export function UserAvatar({ avatarUrl, size }: { avatarUrl?: string | null; size: "size-6" | "size-[22px]" }) {
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar dari domain eksternal (Google), belum ada next.config remotePatterns
    <img src={avatarUrl} alt="" className={`${size} shrink-0 rounded-full`} referrerPolicy="no-referrer" />
  ) : (
    <Icon icon="mdi:account-circle" className={`${size} shrink-0`} />
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))" }}
    >
      <nav className="flex h-[55px] w-full flex-wrap items-center justify-between gap-3 border-b border-white/40 px-4 xl:h-[79px] xl:px-20">
        {/* Logo — belum ada aset final dari klien (design_system_final.md: "Logo di Navbar
            masih 'IOE 2026' — placeholder asset, menunggu aset final dari klien") */}
        <Link href="/" className="flex shrink-0 items-center gap-2 xl:gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-secondary-1000 text-neutral-100 xl:size-9">
            <Icon icon="mdi:waves" className="size-4 xl:size-5" />
          </span>
          <span className="font-heading text-[15px] text-secondary-1000 xl:text-[17px]">IOE 2027</span>
        </Link>

        {/* Menu group (tengah) — desktop only, ≥1280px */}
        <div className="hidden items-center gap-2 xl:flex xl:flex-wrap">
          {MENU_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={PILL_BORDER}>
              {item.label}
              <Icon icon="mdi:chevron-down" className="size-4" />
            </Link>
          ))}
        </div>

        {/* Kanan — toggle tema selalu tampil, lalu user-pill (desktop) / hamburger (mobile) */}
        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />

          {/* User / Login pill — desktop only, ≥1280px */}
          <div className="hidden xl:flex">
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-secondary-1000"
                style={{ background: CTA_GRADIENT }}
              >
                <UserAvatar avatarUrl={user?.avatarUrl} size="size-[22px]" />
                <span className="max-w-[110px] truncate">{user?.name ?? "Profile"}</span>
                <Icon icon="mdi:chevron-down" className="size-4 shrink-0" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-secondary-1000"
                style={{ background: CTA_GRADIENT }}
              >
                <Icon icon="mdi:account-circle" className="size-4 shrink-0" />
                Login
              </Link>
            )}
          </div>

          {/* F-02: hamburger — mobile only, <1280px. Nutupnya lewat tombol X di dalam
              MobileNavDrawer (Radix Dialog.Close), bukan toggle di tombol ini lagi. */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
            className="flex items-center justify-center text-secondary-1000 xl:hidden"
          >
            <Icon icon="mdi:menu" className="size-[22px]" />
          </button>
        </div>
      </nav>

      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
