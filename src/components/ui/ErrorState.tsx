"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button, buttonStyles } from "./Button";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { RECOVERY_MESSAGES as copy } from "@/constants/recoveryMessages";

export function ErrorState({ title = copy.title, description = ERROR_MESSAGES.SERVER_ERROR.message, onRetry, homeHref = "/" }: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  homeHref?: "/" | "/dashboard";
}) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => { main.current?.focus(); }, []);

  return (
    <main ref={main} id="main-content" tabIndex={-1} aria-labelledby="recovery-title" className="site-container section-space flex min-w-0 flex-col items-start gap-lg text-secondary-1000 [overflow-wrap:anywhere]">
      <h1 id="recovery-title" className="font-heading text-h4 md:text-h3">{title}</h1>
      <p role="alert" className="font-body text-b3 text-neutral-700">{description}</p>
      <div className="flex flex-wrap gap-sm">
        {onRetry && <Button onClick={onRetry}>{copy.retry}</Button>}
        <Link href={homeHref} className={buttonStyles("secondary")}>{homeHref === "/dashboard" ? copy.dashboard : copy.home}</Link>
        {homeHref !== "/" && <Link href="/" className={buttonStyles("text")}>{copy.home}</Link>}
      </div>
    </main>
  );
}
