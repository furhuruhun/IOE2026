"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Root-layout recovery needs a full document navigation without relying on the failed router tree. */

import { useEffect, useRef } from "react";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { RECOVERY_MESSAGES as copy } from "@/constants/recoveryMessages";
import type { RouteErrorProps } from "@/components/ui/RouteError";
import "./globals.css";

// This document must work without the root layout, providers, icons or web fonts.
export default function GlobalError({ error, retry }: RouteErrorProps) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    console.error("Root layout render failed", { error, digest: error.digest });
    main.current?.focus();
  }, [error]);

  return (
    <html lang="id" data-theme="light">
      <head>
        <title>{`${copy.title} | IOE 2027`}</title>
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
