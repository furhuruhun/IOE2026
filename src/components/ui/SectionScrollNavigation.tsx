"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type PendingScroll = { pathname: string; hash: string; search: string };

function scrollToSection(hash: string) {
  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);
  if (!target) return false;

  const headerHeight = document.querySelector("header nav")?.getBoundingClientRect().height ?? 0;
  const scrollMargin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  window.scrollTo({
    top: window.scrollY + target.getBoundingClientRect().top - Math.max(headerHeight + 16, scrollMargin),
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
  return true;
}

export function SectionScrollNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<PendingScroll | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.classList.contains("skip-link") || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || !destination.hash || destination.hash === "#") return;

      event.preventDefault();
      if (destination.pathname === window.location.pathname) {
        window.history.pushState(null, "", destination.pathname + destination.search + destination.hash);
        scrollToSection(destination.hash);
        return;
      }

      pending.current = { pathname: destination.pathname, search: destination.search, hash: destination.hash };
      router.push(destination.pathname + destination.search, { scroll: false });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router]);

  useEffect(() => {
    const currentDestination = pending.current;
    if (!currentDestination || currentDestination.pathname !== pathname) return;
    const destination: PendingScroll = currentDestination;

    window.scrollTo({ top: 0, behavior: "instant" });
    let frame = 0;
    const start = performance.now();
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;

    function finish() {
      if (performance.now() - start < delay) {
        frame = requestAnimationFrame(finish);
        return;
      }
      if (scrollToSection(destination.hash)) {
        window.history.replaceState(null, "", destination.pathname + destination.search + destination.hash);
        pending.current = null;
      } else if (performance.now() - start < 3000) {
        frame = requestAnimationFrame(finish);
      } else {
        pending.current = null;
      }
    }

    frame = requestAnimationFrame(finish);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
