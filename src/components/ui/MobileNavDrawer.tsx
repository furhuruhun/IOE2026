"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { Icon } from "@iconify/react/offline";
import { useIsLoggedIn, useUser } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/ui/Navbar";
import { navigationCategories } from "@/components/ui/navbarNavigation";

// Off-canvas mobile nav (F-02), dibangun di atas Radix Dialog (role="dialog", aria-modal,
// focus trap, Esc-to-close semua didapat gratis dari primitive-nya) + Radix Accordion
// (kategori Competition/Events, expand satu per satu — "expandedCategory" via
// type="single" collapsible).
//
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
  const opener = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="nav-drawer-overlay fixed inset-0 z-[10001] xl:hidden"
          style={{ background: "rgba(15,30,32,.55)", backdropFilter: "blur(3px)" }}
        />
        <Dialog.Content
          onOpenAutoFocus={() => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
          onCloseAutoFocus={event => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); }}
          aria-describedby={undefined}
          className="nav-drawer-content fixed inset-y-0 right-0 z-[10002] flex h-screen w-80 max-w-[calc(100vw-3rem)] flex-col bg-neutral-100 xl:hidden"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
            <Dialog.Title className="text-base font-semibold text-neutral-1000">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Tutup menu"
              className="flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-secondary-800 text-neutral-800 transition-colors hover:bg-neutral-200"
            >
              <Icon icon="mdi:close" className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            <Accordion.Root type="single" collapsible className="flex flex-col">
              {navigationCategories.map((category) => (
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
                    <Accordion.Trigger aria-label={`Tampilkan submenu ${category.label}`} className="group flex size-11 shrink-0 items-center justify-center rounded-full text-neutral-800 transition-colors hover:bg-neutral-200">
                      <Icon
                        icon="mdi:chevron-down"
                        className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="accordion-content">
                    <ul className="ml-2.5 flex flex-col pb-2 pt-1">
                      <li>
                        <Link href={category.href} onClick={close} className="flex min-h-12 items-center rounded-md px-3 font-ui text-sm font-semibold text-secondary-1000 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800">
                          {category.parentLabel}
                        </Link>
                      </li>
                      {category.children.map((child, index) => (
                        <li key={child.id} className="relative pl-4">
                          <TreeConnector isLast={index === category.children.length - 1} />
                          <Link
                            href={child.href}
                            onClick={close}
                            className="flex min-h-11 items-center gap-2 py-2 text-sm text-neutral-800 transition-colors hover:text-secondary-1000"
                          >
                            {child.imageSrc && <Image src={child.imageSrc} alt="" width={28} height={28} sizes="28px" className="size-7 shrink-0 object-contain" />}
                            <span className="min-w-0">{child.label}</span>
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
                className="ui-action ui-action-primary ui-action-sm w-full"
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
