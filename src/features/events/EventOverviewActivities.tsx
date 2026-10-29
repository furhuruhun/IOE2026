"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react/offline";
import { getErrorEntry } from "@/constants/errorMessages";
import { getEventActivityContent, type EventActivityContent } from "./eventActivityContent";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEvents } from "@/hooks/useEvents";
import { ApiError } from "@/services/authService";
import type { EventSummary } from "@/types/event";
import { formatWibDate } from "@/utils/formatDate";
import styles from "./EventOverviewActivities.module.css";
import artwork from "./EventOverviewArtwork.module.css";

const palettes = {
  mint: {
    border: "from-primary-500 via-secondary-400 to-primary-800",
    illustration: "from-primary-100 via-tertiary-100 to-secondary-200",
    icon: "bg-primary-700",
  },
  cyan: {
    border: "from-secondary-300 via-secondary-600 to-secondary-900",
    illustration: "from-secondary-100 via-primary-100 to-secondary-300",
    icon: "bg-secondary-800",
  },
  sage: {
    border: "from-tertiary-600 via-primary-500 to-secondary-700",
    illustration: "from-tertiary-100 via-primary-100 to-secondary-200",
    icon: "bg-tertiary-900",
  },
} as const;

function EventIllustration({ name, content }: { name: string; content: EventActivityContent }) {
  const palette = palettes[content.palette];
  const rotation = content.rotation === "clockwise"
    ? "motion-safe:group-hover:rotate-6"
    : "motion-safe:group-hover:-rotate-6";

  return (
    <div role={content.imageSrc ? undefined : "img"} aria-label={content.imageSrc ? undefined : `Ilustrasi contoh untuk ${name}`} className={`relative flex min-h-60 w-full shrink-0 items-center justify-center overflow-hidden bg-linear-to-br ${palette.illustration} p-xl md:min-h-72 lg:min-h-80 lg:w-[43%]`}>
      {content.imageSrc ? (
        <Image src={content.imageSrc} alt={content.imageAlt ?? `Ilustrasi ${name}`} fill sizes="(max-width: 1023px) 100vw, 43vw" className={`object-contain p-xl transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 motion-reduce:transition-none ${rotation}`} />
      ) : (
        <>
          <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid slice">
            <circle cx="46" cy="48" r="104" fill="var(--color-neutral-100)" opacity=".46" />
            <circle cx="356" cy="270" r="142" fill="var(--color-secondary-400)" opacity=".2" />
            <path d="M-20 252C56 210 92 287 168 247S299 180 440 252" fill="none" stroke="var(--color-secondary-600)" strokeOpacity=".26" strokeWidth="18" />
            <path d="M-20 282C56 240 92 317 168 277S299 210 440 282" fill="none" stroke="var(--color-primary-600)" strokeOpacity=".22" strokeWidth="11" />
            <circle cx="328" cy="74" r="9" fill="var(--color-primary-600)" opacity=".55" />
            <circle cx="84" cy="242" r="6" fill="var(--color-secondary-800)" opacity=".5" />
          </svg>
          <div className={`relative z-10 flex size-44 flex-col items-center justify-center gap-md rounded-[2rem] border border-neutral-100/80 bg-neutral-100/80 shadow-xl backdrop-blur-sm transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 motion-reduce:transition-none md:size-52 ${rotation}`}>
            <div className={`grid size-24 place-items-center rounded-3xl ${palette.icon} text-neutral-100 shadow-lg md:size-28`}>
              <Icon icon={content.icon} className="size-14 md:size-16" aria-hidden="true" />
            </div>
            <span className="font-ui text-b4 font-bold tracking-widest text-secondary-1000">IOE 2027</span>
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event, index, isDemo, now }: { event: EventSummary; index: number; isDemo: boolean; now: number | null }) {
  const content = getEventActivityContent(event.slug);
  const palette = palettes[content.palette];
  const deadline = new Date(event.deadline);
  const hasDeadline = Number.isFinite(deadline.getTime());
  const isClosed = now !== null && hasDeadline && deadline.getTime() <= now;
  const imagePosition = content.imagePosition ?? (index % 2 === 0 ? "right" : "left");
  const direction = imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row";

  return (
    <div className={`${styles.cardEnter} group rounded-[30px] bg-linear-to-r ${palette.border} p-0.5 shadow-md transition-shadow hover:shadow-xl`}>
      <article className={`flex flex-col overflow-hidden rounded-[28px] bg-neutral-100 ${direction}`}>
        <EventIllustration name={event.name} content={content} />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-md p-lg text-center md:p-xl lg:items-start lg:justify-center lg:gap-lg lg:p-2xl lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-sm lg:justify-start">
            <span className="rounded-full bg-primary-100 px-md py-xs font-ui text-b4 font-bold text-secondary-1000">Event IOE</span>
            {event.isRegisteredByUser && <span className="rounded-full bg-success-100 px-md py-xs font-ui text-b4 font-bold text-success-900">Sudah terdaftar</span>}
            {isClosed && <span className="rounded-full bg-warning-100 px-md py-xs font-ui text-b4 font-bold text-warning-900">Pendaftaran ditutup</span>}
          </div>
          <h3 className={`${styles.gradientText} break-words font-heading text-h5 font-bold md:text-h4 lg:text-h3`}>{event.name}</h3>
          <p className="max-w-[36rem] font-body text-b2 leading-relaxed text-neutral-900 md:text-b1">{content.description}</p>
          <p className="font-body text-b4 text-neutral-700">Deskripsi dan ilustrasi contoh — ganti dengan materi resmi panitia.</p>
          <p className="flex flex-wrap items-center justify-center gap-sm font-ui text-b3 font-bold text-secondary-800 lg:justify-start">
            <Icon icon="mdi:calendar-clock" className="size-5" aria-hidden="true" />
            {hasDeadline ? `Batas pendaftaran: ${formatWibDate(event.deadline)}` : "Jadwal pendaftaran menyusul"}
            {isDemo && <span className="font-normal text-neutral-700">(tanggal contoh)</span>}
          </p>
          {content.detailStatus === "available" ? (
            <Link href={`/events/${encodeURIComponent(event.slug)}`} className="ui-action ui-action-primary ui-action-sm mt-sm">
              Lihat Detail <Icon icon="mdi:arrow-right" className="size-5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="mt-sm inline-flex min-h-12 items-center rounded-lg border border-secondary-300 bg-secondary-100 px-lg py-sm font-ui text-b3 font-bold text-secondary-900">
              {content.detailStatus === "coming-soon" ? "Coming Soon — detail event" : "Detail belum tersedia"}
            </span>
          )}
        </div>
      </article>
    </div>
  );
}

export function EventOverviewActivities() {
  const { data, isLoading, isError, error, refetch } = useEvents();
  const now = useCurrentTime();
  const errorMessage = getErrorEntry(error instanceof ApiError ? error.code : "SERVER_ERROR").message;

  return (
    <section id="events" className="relative isolate w-full overflow-hidden bg-neutral-100 section-space">
      <span id="whats-in" className="absolute top-0" aria-hidden="true" />
      <div className="relative z-10 site-container flex flex-col gap-3xl lg:gap-4xl">
        <div className="flex flex-col items-center gap-md text-center">
          <p className="font-ui text-b3 font-bold uppercase tracking-widest text-secondary-800">What&apos;s in IOE</p>
          <h2 className="max-w-[48rem] font-heading text-h4 text-secondary-1000 md:text-h3 lg:text-h2">
            Temukan Event untukmu <span className={styles.gradientText}>di IOE 2027</span>
          </h2>
        </div>

        <div className="flex flex-col gap-xl lg:gap-2xl">
          {isLoading && <div className="grid gap-lg" aria-label="Memuat daftar event">{[0, 1, 2].map((index) => <div key={index} className="h-72 animate-pulse rounded-[30px] bg-neutral-200 motion-reduce:animate-none" />)}</div>}
          {isError && <div className="flex flex-col items-center gap-md rounded-lg border border-error-300 bg-error-100 p-xl text-center"><p className="font-body text-b2 text-error-900">{errorMessage}</p><button type="button" onClick={() => void refetch()} className="min-h-12 rounded-lg bg-error-900 px-lg py-sm font-ui text-b3 font-bold text-[color:var(--inverse-foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-900">Coba lagi</button></div>}
          {!isLoading && !isError && data?.events.length === 0 && <p className="rounded-lg border border-secondary-200 bg-secondary-100 p-xl text-center font-body text-b2 text-secondary-1000">Belum ada event yang diumumkan. Silakan cek kembali nanti.</p>}
          {!isLoading && !isError && data && data.events.length > 0 && (
            <div className="relative isolate">
              <div className={artwork.cardsLayer} aria-hidden="true">
                <Image src="/images/events/desktop-highlight-ioe-aquatic.svg" alt="" fill sizes="100vw" draggable={false} className={artwork.highlightArtwork} />
              </div>
              <div className="relative z-10 flex flex-col gap-xl lg:gap-2xl">
                {data.events.map((event, index) => <EventCard key={event.id} event={event} index={index} isDemo={data.isDemo} now={now} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
