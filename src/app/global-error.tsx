"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Root-layout recovery needs a full document navigation without relying on the failed router tree. */

import { useEffect, useLayoutEffect, useRef } from "react";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { RECOVERY_MESSAGES as copy } from "@/constants/recoveryMessages";
import type { RouteErrorProps } from "@/components/ui/RouteError";
import "./globals.css";

// This document must work without the root layout, providers, icons or web fonts.
export default function GlobalError({ error, retry }: RouteErrorProps) {
  const main = useRef<HTMLElement>(null);
  // React can install this fallback without executing its inline script.
  useLayoutEffect(() => {
    let theme = "light";
    try {
      const saved = localStorage.getItem("ioe-theme");
      theme = saved === "light" || saved === "dark" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch { /* Storage may be unavailable; use the same fallback as the layout. */ }
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, []);
  useEffect(() => {
    console.error("Root layout render failed", { error, digest: error.digest });
    main.current?.focus();
  }, [error]);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>{`${copy.title} | IOE 2027`}</title>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('ioe-theme');var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){document.documentElement.dataset.theme='light'}})();` }} />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main ref={main} id="main-content" tabIndex={-1} aria-labelledby="global-recovery-title" className="site-container section-space flex min-w-0 flex-col items-start gap-lg text-secondary-1000 [overflow-wrap:anywhere]">
          <h1 id="global-recovery-title" className="text-h4 font-bold md:text-h3">{copy.title}</h1>
          <p role="alert" className="text-b3 text-neutral-700">{ERROR_MESSAGES.SERVER_ERROR.message}</p>
          <div className="flex flex-wrap gap-sm">
            <button type="button" onClick={retry} className="ui-action ui-action-primary ui-action-md">{copy.retry}</button>
            <a href="/" className="ui-action ui-action-secondary ui-action-md">{copy.home}</a>
          </div>
        </main>
      </body>
    </html>
  );
}
