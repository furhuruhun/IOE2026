"use client";

import { Icon } from "@iconify/react/offline";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEvents } from "@/hooks/useEvents";
import type { EventSummary } from "@/types/event";
import styles from "./EventOverviewHero.module.css";

function nearestRegistrationDeadline(events: EventSummary[], now: number): Date | null {
  const validDeadlines = events
    .map((event) => new Date(event.deadline).getTime())
    .filter((deadline) => Number.isFinite(deadline));
  const upcoming = validDeadlines.filter((deadline) => deadline > now);
  if (upcoming.length) return new Date(Math.min(...upcoming));
  // Seluruh pendaftaran telah berakhir: tampilkan target terakhir sebagai 00:00:00.
  return validDeadlines.length ? new Date(Math.max(...validDeadlines)) : null;
}

function SquarePenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 lg:size-6" aria-hidden="true">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  );
}

export function EventOverviewHero() {
  const { data, isLoading, isError } = useEvents();
  const now = useCurrentTime();
  const targetDeadline = data && (!data.isDemo || process.env.NODE_ENV === "development") && now !== null ? nearestRegistrationDeadline(data.events, now) : null;
  const allExpired = targetDeadline !== null && now !== null && targetDeadline.getTime() <= now;

  return (
    <section id="hero" data-testid="event-overview-hero" className="relative isolate flex min-h-[calc(100svh-3.5rem)] w-full items-center justify-center overflow-hidden bg-secondary-1000 text-neutral-100 md:min-h-[calc(100svh-5rem)]">
      <div className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-primary-600/30 blur-3xl motion-safe:animate-glow-dim md:size-[32rem]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-tertiary-600/20 blur-3xl motion-safe:animate-glow-dim md:size-[30rem]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden style={{ background: "radial-gradient(circle at 50% 50%, var(--color-secondary-600), transparent 55%)" }} />

      <div className="site-container relative z-10 flex flex-col items-center justify-center gap-14 py-20 md:gap-16 lg:flex-row lg:gap-8 lg:py-16 xl:gap-24 2xl:gap-32">
        <div data-testid="hero-branding" className={`${styles.brandEnter} flex w-full min-w-0 max-w-[35rem] flex-col items-center gap-lg text-center lg:w-auto lg:flex-[1_1_35rem]`}>
          <span className="rounded-full border border-primary-300/60 bg-primary-600/20 px-md py-sm font-ui text-b4 font-bold uppercase tracking-widest text-primary-100">
            Indonesia Ocean Expo 2027
          </span>
          <h1 className="font-heading text-h3 leading-tight text-neutral-100 sm:text-h2 md:text-h1">Rangkaian Event IOE 2027</h1>
          <p className="max-w-[35rem] font-body text-b2 leading-relaxed text-neutral-200 md:text-b1">
            Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation.
          </p>
        </div>

        <div data-testid="hero-information" className={`${styles.enter} flex w-full max-w-[25rem] flex-col items-center gap-5 text-center lg:w-[25rem] lg:shrink-0`}>
          <h2 className={`${styles.headingGradient} font-ui text-b2 font-bold uppercase tracking-wide md:text-b1`}>
            Pendaftaran berakhir dalam:
          </h2>
          {(isLoading || now === null) && <div className="h-32 w-full max-w-[26rem] animate-pulse rounded-lg bg-neutral-100/10 motion-reduce:animate-none" aria-label="Memuat countdown" />}
          {!isLoading && targetDeadline && <CountdownTimer key={targetDeadline.toISOString()} targetDate={targetDeadline} variant="eventOverview" />}
          {!isLoading && now !== null && !targetDeadline && (
            <p className="font-body text-b2 text-neutral-100">
              {isError ? "Jadwal pendaftaran belum dapat dimuat." : "Batas pendaftaran belum diumumkan."}
            </p>
          )}
          {allExpired && <p className="font-body text-b3 text-neutral-200">Seluruh batas pendaftaran event telah berlalu.</p>}
          <div className="flex items-center justify-center gap-sm font-ui text-b3 font-bold text-neutral-100 lg:text-b2">
            <Icon icon="mdi:map-marker-outline" className="size-6 shrink-0 text-primary-300" aria-hidden="true" />
            <span>Lokasi diumumkan panitia</span>
          </div>
          <div className="grid w-full max-w-96 grid-cols-2 gap-3 lg:gap-4">
            <a href="#whats-in" className="ui-action ui-action-primary ui-action-sm w-full">
              <SquarePenIcon />
              <span>Register Now</span>
            </a>
            <a href="#about" className="ui-action ui-action-secondary ui-action-sm w-full">
              Tentang Event
            </a>
          </div>
          {data?.isDemo && <p className="font-micro text-b4 text-neutral-300">Tanggal di halaman ini adalah data contoh untuk pengembangan.</p>}
        </div>
      </div>
    </section>
  );
}
