"use client";

import Image from "next/image";
import { useId, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useEvents } from "@/hooks/useEvents";
import type { EventSummary } from "@/types/event";
import { formatWibDate } from "@/utils/formatDate";
import styles from "./EventOverviewTimeline.module.css";

const WIB_TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

type RundownEvent = Pick<EventSummary, "id" | "name" | "deadline"> & { isPlaceholder?: boolean };

// TODO: Ganti dengan jadwal resmi panitia dan sumber data rundown saat tersedia.
// Item ini hanya untuk Rundown, bukan event yang bisa didaftarkan lewat GET /events.
const AWARDING_CEREMONY_PLACEHOLDER: RundownEvent = {
  id: "rundown-awarding-ceremony-placeholder",
  name: "Awarding Ceremony",
  deadline: "2027-04-02T23:59:00+07:00",
  isPlaceholder: true,
};

const START_TITLE_PATH = "M8 2H328C350 2 366 17 366 36S350 70 328 70H30C13 70 2 57 2 40V12C2 6 4 2 8 2Z";
const DEFAULT_TITLE_PATH = "M36 2H332C351 2 366 17 366 36S351 70 332 70H36C17 70 2 55 2 36S17 2 36 2Z";

function RundownBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src="/images/events/desktop-rundown-ioe-aquatic.svg"
        alt=""
        fill
        sizes="100vw"
        draggable={false}
        className={styles.backgroundImage}
      />
    </div>
  );
}

function RundownTitleShape({ variant }: { variant: "start" | "default" | "end" }) {
  const gradientId = useId();

  return (
    <svg className="absolute inset-0 h-full w-full drop-shadow-md" viewBox="0 0 368 72" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary-600)" />
          <stop offset="52%" stopColor="var(--color-secondary-600)" />
          <stop offset="100%" stopColor="var(--color-secondary-900)" />
        </linearGradient>
      </defs>
      <path
        d={variant === "default" ? DEFAULT_TITLE_PATH : START_TITLE_PATH}
        transform={variant === "end" ? "translate(368 0) scale(-1 1)" : undefined}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

function RundownItem({ event, variant }: { event: RundownEvent; variant: "start" | "default" | "end" }) {
  const parts = WIB_TIME_FORMATTER.formatToParts(new Date(event.deadline));
  const time = `${parts.find((part) => part.type === "hour")?.value ?? "00"}:${parts.find((part) => part.type === "minute")?.value ?? "00"}`;

  return (
    <article data-rundown-item className="flex w-[184px] shrink-0 snap-start flex-col items-center gap-sm text-center lg:w-[368px] lg:gap-md">
      <div className="relative flex h-9 w-full items-center justify-center px-sm lg:h-18 lg:px-xl">
        <RundownTitleShape variant={variant} />
        <h3 className="relative z-10 break-words font-heading text-b3 font-bold leading-tight text-neutral-100 lg:text-h6">{event.name}</h3>
      </div>
      <p className="font-body text-b4 text-secondary-1000 lg:text-b3">Batas pendaftaran · {formatWibDate(event.deadline)}{event.isPlaceholder && <span className="sr-only"> (tanggal contoh)</span>}</p>
      <div className="max-w-full rounded-full bg-linear-to-r from-tertiary-500 via-primary-400 to-secondary-500 p-0.5 shadow-md">
        <div className="rounded-full bg-neutral-100 px-lg py-xs font-ui text-b3 font-bold whitespace-nowrap text-secondary-1000 lg:px-2xl lg:py-sm lg:text-h6">
          <time dateTime={event.deadline}>{time} WIB</time>
        </div>
      </div>
    </article>
  );
}

export function EventOverviewTimeline() {
  const { data, isLoading, isError } = useEvents();
  const scroller = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null);
  const events = (data?.isDemo && process.env.NODE_ENV !== "development" ? [] : data?.events ?? [])
    .filter((event) => Number.isFinite(new Date(event.deadline).getTime()))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const awardingFromApi = events.find((event) => event.slug === "awarding-ceremony" || event.name.trim().toLowerCase() === "awarding ceremony");
  const rundownEvents: RundownEvent[] = [
    ...events.filter((event) => event !== awardingFromApi),
    ...(awardingFromApi ? [awardingFromApi] : process.env.NODE_ENV === "development" ? [AWARDING_CEREMONY_PLACEHOLDER] : []),
  ];

  const scroll = (direction: -1 | 1) => {
    const container = scroller.current;
    if (!container) return;
    const itemWidth = container.querySelector<HTMLElement>("[data-rundown-item]")?.offsetWidth ?? 184;
    const track = container.firstElementChild;
    if (!track) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 8;
    container.scrollBy({
      left: direction * (itemWidth + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); scroll(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); scroll(1); }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const container = event.currentTarget;
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: container.scrollLeft };
    container.setPointerCapture(event.pointerId);
    container.style.scrollSnapType = "none";
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft = drag.startScrollLeft + drag.startX - event.clientX;
    event.preventDefault();
  };

  const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    event.currentTarget.style.scrollSnapType = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section id="rundown" className="relative isolate flex w-full flex-col items-center overflow-hidden bg-neutral-100 section-space text-secondary-1000">
      <RundownBackground />
      <div className="relative z-10 w-full">
        <div className={`${styles.fadeIn} site-container flex flex-col items-center gap-md text-center`}>
          <h2 className="font-heading text-h4 font-bold text-secondary-1000 md:text-h2 lg:text-h1">RUNDOWN</h2>
        </div>

        {isLoading && <div className="mx-auto mt-2xl h-36 w-[min(90%,80rem)] animate-pulse rounded-lg bg-neutral-200 motion-reduce:animate-none" aria-label="Memuat timeline" />}
        {!isLoading && (isError || events.length === 0) && <p className="mx-auto mt-2xl max-w-[42rem] rounded-lg border border-secondary-300 p-xl text-center font-body text-b2">{isError ? "Timeline belum dapat dimuat." : "Jadwal event akan diumumkan segera."}</p>}

        {!isLoading && !isError && events.length > 0 && (
          <div ref={scroller} role="region" aria-label="Timeline batas pendaftaran event, geser untuk melihat item lainnya" tabIndex={0} onKeyDown={handleKeyDown} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishPointerDrag} onPointerCancel={finishPointerDrag} onLostPointerCapture={finishPointerDrag} className={`${styles.slideUp} ${styles.scrollRegion} relative mt-3xl w-full cursor-grab snap-x snap-proximity scroll-px-4 overflow-x-auto px-4 pb-lg active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 lg:scroll-px-8 lg:px-8`}>
            <div className="flex w-max min-w-full items-stretch justify-center gap-sm">
              {rundownEvents.map((event, index) => <RundownItem key={event.id} event={event} variant={index === rundownEvents.length - 1 ? "end" : index === 0 ? "start" : "default"} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
