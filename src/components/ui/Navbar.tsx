"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";

// Spec: dimensi/layout Navbar diambil literal dari spec Compfest baru (container
// fixed/480/h-14-h-20/dst, menu pill text-s6/s5, Login CTA text-s6!/s5!+after-overlay,
// theme switcher resize). Beberapa nama token di spec itu (bg-component-card,
// border-component-border, bg-component-card-hover, bg-theme-gradient, text-lagoon-100,
// after:bg-overlay-hover/pressed) TIDAK ADA di design_system_final.md/globals.css —
// dikonfirmasi ke user (bukan ditebak): token warna WAJIB dipetakan ke semantic yang
// sudah ada (neutral-100/300/200, CTA_GRADIENT, secondary-1000, black/10, black/20),
// token non-warna (text-s5/s6, semua sizing arbitrary w-12.5/h-6.5/dst) diimplementasikan
// literal (s5/s6 ditambahkan ke globals.css, value di-reuse dari b3/b4 yang sudah ada).
// `lucide-text-align-justify` dari spec diganti `mdi:menu` — TECHNICAL_CONSTRAINTS_FE.md
// eksplisit larang install lucide-react. `fixed inset-0` di spec asli over-constrained
// (bentrok sama height eksplisit + max-w/mx-auto) — diperbaiki jadi `fixed top-0 inset-x-0`
// (dikonfirmasi user). Konsekuensi: nav keluar dari flow, (public)/layout.tsx sekarang
// kasih padding-top kompensasi. `max-w-[480px] mx-auto` dari spec literal SEMPAT
// diimplementasikan lalu di-screenshot ke user — hasilnya nav jadi pill kecil
// mengambang di tengah layar desktop (bukan bar penuh), dikonfirmasi user itu bug,
// dihapus (nav sekarang full-width). ThemeToggle-nya sendiri CUMA di-resize (bukan direstyle
// warna/logic) — instruksi eksplisit user. Detail lengkap semua keputusan ini ada di
// CHANGELOG entry "[Navbar — spec Compfest]" & plan file sesi ini.
//
// Toggle tema: lihat header comment di ThemeToggle.tsx — masih UI-only, belum fungsional.

const MENU_ITEMS = [
  { href: "/competitions", label: "Competitions" },
  { href: "/events", label: "Events" },
];

// Exported: dipakai lagi di MobileNavDrawer.tsx buat footer Login/Profile CTA (biar
// gradient & avatar-fallback-nya tetap satu sumber, bukan duplikat). Ini juga yang
// dipetakan dari token `bg-theme-gradient` di spec Compfest baru (lihat header comment).
export const CTA_GRADIENT =
  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)";

const MENU_PILL =
  "border border-neutral-300 text-s6 2xl:text-s5 font-ui flex items-center gap-2 py-1 px-3 rounded-full transition cursor-pointer hover:bg-neutral-200";

// `text-lagoon-100` (spec) → text-secondary-1000, `bg-theme-gradient` → CTA_GRADIENT (style),
// `after:bg-overlay-hover/pressed` → after:bg-black/10 / after:bg-black/20 (persis rgba(0,0,0,.1)/.2
// dari design_system_final.md §Button States).
const CTA_PILL =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer outline-none font-ui shrink-0 rounded-xl md:rounded-2xl px-4 md:px-5 py-2 md:py-3 text-s6! md:text-s5! relative text-secondary-1000 h-11.5 hover:after:bg-black/10 active:after:bg-black/20 hover:after:opacity-100 active:after:opacity-100 after:opacity-0 after:absolute after:inset-0 after:rounded-xl md:after:rounded-2xl after:transition-opacity";

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
    <header>
      <nav className="fixed top-0 inset-x-0 w-full h-14 md:h-20 bg-neutral-100 border-b border-neutral-300 px-6 md:px-20 grid grid-cols-[1fr_auto_1fr] items-center z-[10000]">
        {/* Logo — belum ada aset final dari klien (design_system_final.md: "Logo di Navbar
            masih 'IOE 2026' — placeholder asset, menunggu aset final dari klien") */}
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <span className="flex size-7 items-center justify-center rounded-md bg-secondary-1000 text-neutral-100 md:size-9">
            <Icon icon="mdi:waves" className="size-4 md:size-5" />
          </span>
          <span className="font-heading text-[15px] text-secondary-1000 md:text-[17px]">IOE 2027</span>
        </Link>

        {/* Menu group — tepat di tengah-tengah navbar (grid col tengah, bukan flex
            justify-between yang cuma nge-equal-in gap, bukan true-center kalau lebar
            grup kiri/kanan beda — logo vs theme+CTA di sini beda lebar). Desktop only,
            ≥1280px. */}
        <div className="flex items-center gap-4 justify-self-center max-xl:hidden">
          {MENU_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={MENU_PILL}>
              {item.label}
              <Icon icon="mdi:chevron-down" className="size-4" />
            </Link>
          ))}
        </div>

        {/* Kanan — toggle tema selalu tampil (1 instance shared, BUKAN diduplikasi per
            breakpoint seperti literal spec §4/§5 — 2 instance ThemeToggle independen akan
            desync state isDark/isHover antar breakpoint, lihat CHANGELOG), lalu user-pill
            (desktop) / hamburger (mobile) */}
        <div className="flex items-center gap-4 justify-self-end">
          <ThemeToggle />

          {/* User / Login pill — desktop only, ≥1280px */}
          <div className="hidden xl:flex">
            {isLoggedIn ? (
              <Link href="/profile" className={CTA_PILL} style={{ background: CTA_GRADIENT }}>
                <UserAvatar avatarUrl={user?.avatarUrl} size="size-[22px]" />
                <span className="max-w-[110px] truncate">{user?.name ?? "Profile"}</span>
                <Icon icon="mdi:chevron-down" className="size-4 shrink-0" />
              </Link>
            ) : (
              <Link href="/login" className={CTA_PILL} style={{ background: CTA_GRADIENT }}>
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
            <Icon icon="mdi:menu" className="size-5" />
          </button>
        </div>
      </nav>

      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
