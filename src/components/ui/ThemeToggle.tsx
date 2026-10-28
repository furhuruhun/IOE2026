"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@iconify/react/offline";

const STORAGE_KEY = "ioe-theme";
const THEME_EVENT = "ioe-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function currentTheme() {
  return document.documentElement.dataset.theme === "dark";
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, currentTheme, () => false);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try { localStorage.setItem(STORAGE_KEY, nextTheme); } catch { /* Storage may be unavailable. */ }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
      onClick={toggleTheme}
      className="navbar-theme-hit flex h-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800"
    >
      <span className="navbar-theme-frame relative block h-[26px] w-[50px] rounded-full p-px md:h-[30px] md:w-[58px]">
        <span className="navbar-theme-track relative block size-full overflow-hidden rounded-full">
          <Icon icon="mdi:white-balance-sunny" aria-hidden="true" className="navbar-theme-sun absolute left-[5px] top-1/2 size-4 -translate-y-1/2" />
          <Icon icon="mdi:moon-waning-crescent" aria-hidden="true" className="navbar-theme-moon absolute right-[5px] top-1/2 size-4 -translate-y-1/2" />
          <span className={`navbar-theme-thumb absolute top-[3px] size-[18px] rounded-full transition-transform duration-300 ease-out md:top-[5px] ${isDark ? "translate-x-[25px] md:translate-x-[32px]" : "translate-x-[2px] md:translate-x-[4px]"}`} />
        </span>
      </span>
    </button>
  );
}
