"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { UserAvatar } from "@/components/ui/UserAvatar";

const MENU_ITEM_CLASS =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-ui text-b3 text-secondary-1000 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";

export function AccountDropdown({ name, avatarUrl, triggerClassName }: { name: string; avatarUrl?: string | null; triggerClassName: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const focusItem = (position: "first" | "last") => {
    requestAnimationFrame(() => {
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
      if (items?.length) (position === "first" ? items[0] : items[items.length - 1]).focus();
    });
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    focusItem("first");
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
      : event.key === "ArrowDown" ? (current + 1) % items.length
      : (current - 1 + items.length) % items.length;
    items[next].focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Menu akun ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) setOpen(true);
            focusItem(event.key === "ArrowDown" ? "first" : "last");
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className={`${triggerClassName} max-w-[13rem] min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 ${open ? "shadow-md" : ""}`}
      >
        <UserAvatar avatarUrl={avatarUrl} size="size-[22px]" />
        <span className="min-w-0 max-w-[110px] truncate">{name}</span>
        <Icon icon="mdi:chevron-down" aria-hidden="true" className={`size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label="Akun"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-[calc(100%+8px)] z-[10001] w-52 rounded-xl border border-neutral-300 bg-neutral-100 p-2 shadow-lg"
        >
          <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)} className={MENU_ITEM_CLASS}>
            <Icon icon="mdi:home-variant" aria-hidden="true" className="size-5 shrink-0" />
            Dashboard
          </Link>
          <div role="separator" className="my-1 h-px bg-neutral-300" />
          <LogoutButton appearance="menu" menuItem />
        </div>
      )}
    </div>
  );
}
