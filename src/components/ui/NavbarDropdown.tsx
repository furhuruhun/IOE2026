"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/offline";
import type { NavigationCategory } from "./navbarNavigation";
import styles from "./NavbarDropdown.module.css";

type Props = {
  category: NavigationCategory;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  triggerClassName: string;
};

export function NavbarDropdown({ category, open, onToggle, onClose, triggerClassName }: Props) {
  const linkClass = "flex min-h-12 min-w-0 items-center rounded-md px-3 font-ui text-b3 text-neutral-800 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";

  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-controls={`${category.id}-dropdown`} onClick={onToggle} className={`${triggerClassName} ${open ? "bg-neutral-200" : ""} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800`}>
        {category.label}
        <Icon icon="mdi:chevron-down" aria-hidden="true" className={`size-6 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={`${category.id}-dropdown`} className={`${styles.panel} z-[10001] rounded-xl border border-neutral-300 bg-neutral-100 p-2 shadow-lg`}>
          <Link href={category.href} onClick={onClose} className={`${linkClass} font-semibold text-secondary-1000`}>{category.parentLabel}</Link>
          <div className="ml-3">
            {category.children.map((child, index) => (
              <div key={child.id} className="relative pl-6">
                <span aria-hidden="true" className={`absolute left-2 top-0 w-px bg-neutral-300 ${index === category.children.length - 1 ? "h-1/2" : "h-full"}`} />
                <span aria-hidden="true" className="absolute left-2 top-1/2 h-px w-4 bg-neutral-300" />
                <Link href={child.href} onClick={onClose} className={`${linkClass} gap-2`}>
                  {child.imageSrc && <Image src={child.imageSrc} alt="" width={32} height={32} sizes="32px" className="size-8 shrink-0 object-contain" />}
                  <span className="min-w-0">{child.label}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
