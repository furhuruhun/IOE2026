"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";
import { UserAvatar, CTA_GRADIENT } from "@/components/ui/Navbar";

// Off-canvas mobile nav (F-02), dibangun di atas Radix Dialog (role="dialog", aria-modal,
// focus trap, Esc-to-close semua didapat gratis dari primitive-nya) + Radix Accordion
// (kategori Competition/Events, expand satu per satu — "expandedCategory" via
// type="single" collapsible).
//
// ⚠️ Sub-item (children) di NAV_CONFIG di bawah ini DUMMY/PLACEHOLDER, bukan dari
// ROUTES.md/API — ROUTES.md cuma punya /competitions & /events (flat, tanpa sub-menu),
// F-01 di PRD juga cuma nyebut "CTA Competition"/"CTA Event" tanpa konsep dropdown.
// Diminta eksplisit oleh user buat tetap bangun mekanisme accordion-nya (infrastruktur
// config-driven, biar gampang diisi beneran nanti) dan diisi 3 dummy children per
// kategori dulu. Nama kategori dummy dipilih dari istilah yang MEMANG ada di
// PRD_IOE_2027_v4.md (Business Case/Paper & Poster/Design Competition, Talkshow/
// Exhibition/Short Course) supaya nggak asal ngarang, tapi slug/href-nya tetap
// placeholder — ganti begitu ada data kompetisi/event individual yang real. Lihat
// CHANGELOG follow-up.
type NavChild = {
  label: string;
  href: string;
};

type NavCategory = {
  label: string;
  href: string;
  icon: string;
  children: NavChild[];
};

const NAV_CONFIG: NavCategory[] = [
  {
    label: "Competition",
    href: "/competitions",
    icon: "mdi:trophy-outline",
    children: [
      { label: "Business Case Competition", href: "/competitions/business-case-competition" },
      { label: "Paper & Poster Competition", href: "/competitions/paper-poster-competition" },
      { label: "Design Competition", href: "/competitions/design-competition" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    icon: "mdi:calendar-star",
    children: [
      { label: "Talkshow & Seminar", href: "/events/talkshow-seminar" },
      { label: "Exhibition", href: "/events/exhibition" },
      { label: "Short Course", href: "/events/short-course" },
    ],
  },
];

function TreeConnector({ isLast }: { isLast: boolean }) {
  return (
    <>
      <span aria-hidden className={`absolute left-0 top-0 w-px bg-neutral-300 ${isLast ? "h-1/2" : "h-full"}`} />
      <span aria-hidden className="absolute left-0 top-1/2 h-px w-3 bg-neutral-300" />
    </>
  );
}

export function MobileNavDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="nav-drawer-overlay fixed inset-0 z-[10001] xl:hidden"
          style={{ background: "rgba(15,30,32,.55)", backdropFilter: "blur(3px)" }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="nav-drawer-content fixed inset-y-0 right-0 z-[10002] flex h-screen w-80 max-w-[calc(100vw-3rem)] flex-col bg-neutral-100 xl:hidden"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
            <Dialog.Title className="text-base font-semibold text-neutral-1000">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Tutup menu"
              className="flex size-8 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-200"
            >
              <Icon icon="mdi:close" className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            <Accordion.Root type="single" collapsible className="flex flex-col">
              {NAV_CONFIG.map((category) => (
                <Accordion.Item
                  key={category.href}
                  value={category.href}
                  className="border-b border-neutral-200 py-1 last:border-b-0"
                >
                  <Accordion.Header className="flex items-center justify-between gap-2">
                    <Link
                      href={category.href}
                      onClick={close}
                      className="flex flex-1 items-center gap-2 py-2 text-[15px] font-semibold text-neutral-1000"
                    >
                      <Icon icon={category.icon} className="size-5 shrink-0 text-secondary-1000" />
                      {category.label}
                    </Link>
                    <Accordion.Trigger className="group flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-200">
                      <Icon
                        icon="mdi:chevron-down"
                        className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="accordion-content">
                    <ul className="ml-2.5 flex flex-col pb-2 pt-1">
                      {category.children.map((child, index) => (
                        <li key={child.href} className="relative pl-4">
                          <TreeConnector isLast={index === category.children.length - 1} />
                          <Link
                            href={child.href}
                            onClick={close}
                            className="block py-2 text-sm text-neutral-800 transition-colors hover:text-secondary-1000"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>

          <div className="shrink-0 border-t border-neutral-200 p-4">
            {isLoggedIn ? (
              <Link
                href="/profile"
                onClick={close}
                className="flex items-center gap-2 text-[15px] font-medium text-secondary-1000"
              >
                <UserAvatar avatarUrl={user?.avatarUrl} size="size-6" />
                <span className="truncate">{user?.name ?? "Profile"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={close}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-secondary-1000 transition-opacity hover:opacity-90 active:opacity-80"
                style={{ background: CTA_GRADIENT }}
              >
                <Icon icon="mdi:account-circle" className="size-5 shrink-0" />
                Login
              </Link>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
