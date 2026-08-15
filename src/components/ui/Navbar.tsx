"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";

// Spec: design_system_final.md §Navbar — Login CTA & Profile CTA, §Navbar — Dropdown Label,
// dan background gradient cross-reference dari §Footer ("sama kayak Navbar").
// F-01–F-03 (PRD_IOE_2027_v4.md).

const NAV_LINK_STYLE =
  "flex items-center gap-1 rounded-[15px] border-[1.5px] border-white px-3 py-1.5 font-ui font-bold text-neutral-800 transition-colors hover:bg-white/40";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Logo — belum ada aset final dari klien (design_system_final.md: "Logo di Navbar
            masih 'IOE 2026' — placeholder asset, menunggu aset final dari klien") */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-full bg-secondary-1000 text-neutral-100">
            <Icon icon="mdi:waves" className="size-5" />
          </span>
          <span className="font-heading text-h6 text-secondary-1000">IOE 2027</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/competitions" className={NAV_LINK_STYLE}>
            Competition
            <Icon icon="mdi:chevron-down" className="size-4" />
          </Link>
          <Link href="/events" className={NAV_LINK_STYLE}>
            Events
            <Icon icon="mdi:chevron-down" className="size-4" />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/profile"
              className="flex h-[47px] w-[116px] items-center justify-center gap-1.5 rounded-[15px] font-ui font-bold text-secondary-1000"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)",
              }}
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar dari domain eksternal (Google), belum ada next.config remotePatterns
                <img src={user.avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <Icon icon="mdi:account-circle" className="size-6" />
              )}
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex h-[46px] w-[147px] items-center justify-center rounded-[15px] font-ui font-bold text-secondary-1000"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)",
              }}
            >
              Login
            </Link>
          )}
        </div>

        {/* F-02: hamburger di layar kecil */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          className="flex size-10 items-center justify-center rounded-full text-secondary-1000 md:hidden"
        >
          <Icon icon={mobileOpen ? "mdi:close" : "mdi:menu"} className="size-6" />
        </button>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t border-white/40 px-4 py-4 md:hidden">
          <Link href="/competitions" onClick={() => setMobileOpen(false)} className={`${NAV_LINK_STYLE} justify-center`}>
            Competition
            <Icon icon="mdi:chevron-down" className="size-4" />
          </Link>
          <Link href="/events" onClick={() => setMobileOpen(false)} className={`${NAV_LINK_STYLE} justify-center`}>
            Events
            <Icon icon="mdi:chevron-down" className="size-4" />
          </Link>

          {isLoggedIn ? (
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[15px] font-ui font-bold text-secondary-1000"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)",
              }}
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <Icon icon="mdi:account-circle" className="size-6" />
              )}
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-full items-center justify-center rounded-[15px] font-ui font-bold text-secondary-1000"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)",
              }}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
