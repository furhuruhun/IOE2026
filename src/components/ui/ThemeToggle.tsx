"use client";

import { useSyncExternalStore } from "react";

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
        <span className={`navbar-theme-track relative block size-full overflow-hidden rounded-full ${isDark ? "is-dark" : "is-light"}`}>
          <span className="navbar-theme-glow absolute inset-0" aria-hidden="true" />

          <svg className="navbar-theme-night absolute inset-0 size-full" viewBox="0 0 48 24" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="5,15 9,13 13,7 18,11 16,17 9,13" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth=".5" />
            <circle cx="5" cy="15" r=".65" fill="currentColor" />
            <circle cx="9" cy="13" r=".65" fill="currentColor" />
            <path d="M13 5.5L13.5 7L15 7.5L13.5 8L13 9.5L12.5 8L11 7.5L12.5 7Z" fill="currentColor" />
            <circle cx="18" cy="11" r=".75" fill="currentColor" />
            <circle cx="16" cy="17" r=".6" fill="currentColor" />
            <path className="navbar-theme-sparkle" d="M23 4L23.7 6.3L26 7L23.7 7.7L23 10L22.3 7.7L20 7L22.3 6.3Z" fill="currentColor" />
            <path d="M27 16L27.4 17.1L28.5 17.5L27.4 17.9L27 19L26.6 17.9L25.5 17.5L26.6 17.1Z" fill="currentColor" />
          </svg>

          <svg className="navbar-theme-day absolute inset-0 size-full" viewBox="0 0 48 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M19 19c2-3 4-4 7-3 2-3 6-3 8 0 3-1 6 1 7 3" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
            <path d="M13 8c2-2 5-2 7 0 2-1 4 0 5 1" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <span className={`navbar-theme-thumb absolute top-[3px] size-[18px] rounded-full transition-transform duration-300 ease-out md:top-[5px] ${isDark ? "translate-x-[25px] md:translate-x-[32px]" : "translate-x-[2px] md:translate-x-[4px]"}`} aria-hidden="true">
            <span className="navbar-theme-sun-disc absolute inset-0 rounded-full">
              <span className="navbar-theme-sun-ring absolute inset-[3px] rounded-full border" />
            </span>
            <span className="navbar-theme-moon-disc absolute inset-0 rounded-full">
              <span className="navbar-theme-crater absolute left-[4px] top-[4px] size-[5px] rounded-full" />
              <span className="navbar-theme-crater absolute right-[3px] top-[6px] size-[3px] rounded-full" />
              <span className="navbar-theme-crater absolute bottom-[3px] left-[8px] size-[4px] rounded-full" />
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
