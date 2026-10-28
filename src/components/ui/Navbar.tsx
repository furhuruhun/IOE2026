"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";
import { buttonStyles } from "@/components/ui/Button";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";
import { NavbarDropdown } from "@/components/ui/NavbarDropdown";
import { navigationCategories } from "@/components/ui/navbarNavigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Shared gradient reference for existing IOE action components.
export const CTA_GRADIENT =
  "var(--navbar-cta-gradient)";

const MENU_PILL =
  "border border-neutral-300 text-b4 2xl:text-b3 font-ui flex items-center gap-2 py-1 px-3 rounded-full transition cursor-pointer hover:bg-neutral-200 text-secondary-1000";

const CTA_PILL = `${buttonStyles("primary", "sm")} navbar-cta h-[46px] w-auto whitespace-nowrap px-4 py-2 md:px-5 md:rounded-2xl`;

export function UserAvatar({ avatarUrl, size }: { avatarUrl?: string | null; size: "size-6" | "size-[22px]" }) {
  return avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar dari domain eksternal (Google), belum ada next.config remotePatterns
    <img src={avatarUrl} alt="" className={`${size} shrink-0 rounded-full`} referrerPolicy="no-referrer" />
  ) : (
    <Icon icon="mdi:account-circle" className={`${size} shrink-0`} />
  );
}

export function Navbar({ appearance = "default" }: { appearance?: "default" | "dashboard" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<{ id: string; pathname: string } | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!desktopMenuRef.current?.contains(event.target as Node)) setOpenDropdown(null);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        desktopMenuRef.current?.querySelector<HTMLButtonElement>('[aria-expanded="true"]')?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header>
      <nav className={`fixed inset-x-0 top-0 z-[10000] mx-auto flex h-14 w-full max-w-[1920px] items-center justify-between border-b px-6 md:h-20 md:px-20 ${appearance === 'dashboard' ? 'border-primary-200' : 'border-neutral-300 bg-neutral-100'}`}
        style={appearance === 'dashboard' ? { background: 'linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))' } : undefined}>
        {/* Logo — belum ada aset final dari klien (design_system_final.md: "Logo di Navbar
            masih 'IOE 2026' — placeholder asset, menunggu aset final dari klien") */}
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <span className={'flex items-center justify-center rounded-md bg-secondary-1000 text-neutral-100 ' + (appearance === 'dashboard' ? 'size-10 md:size-16' : 'size-7 md:size-9')}>
            <Icon icon="mdi:waves" className={appearance === 'dashboard' ? 'size-6 md:size-10' : 'size-4 md:size-5'} />
          </span>
          <span className={'whitespace-nowrap font-heading text-secondary-1000 ' + (appearance === 'dashboard' ? 'text-h6 md:text-h4' : 'text-[15px] md:text-[17px]')}>IOE 2027</span>
        </Link>

        <div ref={desktopMenuRef} className="hidden items-center gap-4 xl:flex">
          {navigationCategories.map((category) => (
            <NavbarDropdown key={category.id} category={category} open={openDropdown?.id === category.id && openDropdown.pathname === pathname} onToggle={() => setOpenDropdown(current => current?.id === category.id && current.pathname === pathname ? null : { id: category.id, pathname })} onClose={() => setOpenDropdown(null)} triggerClassName={MENU_PILL} />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* User / Login pill — desktop only, ≥1280px */}
          <div className="hidden xl:flex">
            {isLoggedIn ? (
              <Link href="/profile" className={CTA_PILL}>
                <UserAvatar avatarUrl={user?.avatarUrl} size="size-[22px]" />
                <span className="max-w-[110px] truncate">{user?.name ?? "Profile"}</span>
                <Icon icon="mdi:chevron-down" className="size-4 shrink-0" />
              </Link>
            ) : (
              <Link href="/login" className={CTA_PILL}>
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
            className="flex size-11 items-center justify-center rounded-lg text-secondary-1000 focus-visible:outline-2 focus-visible:outline-secondary-800 xl:hidden"
          >
            <Icon icon="mdi:menu" className="size-5" />
          </button>
        </div>
      </nav>

      <MobileNavDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}
