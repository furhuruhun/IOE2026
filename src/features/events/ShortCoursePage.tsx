"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { eventSponsors } from "@/features/events/eventSponsors";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEvents } from "@/hooks/useEvents";
import type { EventSummary } from "@/types/event";
import { formatWibDate } from "@/utils/formatDate";
import { shortCourseContent, type ShortCourseMilestone } from "./shortCourseContent";

const shell = "relative mx-auto w-full max-w-[1440px] px-8 md:px-20";
const action = "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-ui text-b3 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:text-b2";

type RegistrationState = {
  available: boolean;
  label: string;
  note: string;
  deadline: Date | null;
};

function getRegistrationState(event: EventSummary | undefined, isDemo: boolean, now: number | null): RegistrationState {
  const unavailable = { available: false, label: "Pendaftaran menyusul", note: "Status pendaftaran resmi belum tersedia.", deadline: null };
  if (!event || isDemo || now === null) return unavailable;
  if (event.isRegisteredByUser) return { available: false, label: "Sudah terdaftar", note: "Kamu sudah terdaftar di Short Course ini.", deadline: null };
  const time = new Date(event.deadline).getTime();
  if (!Number.isFinite(time)) return unavailable;
  const deadline = new Date(time);
  if (time <= now) return { available: false, label: "Pendaftaran ditutup", note: "Batas pendaftaran Short Course telah berlalu.", deadline };
  const opening = shortCourseContent.registrationOpensAt;
  if (opening) {
    const openingTime = new Date(opening).getTime();
    if (Number.isFinite(openingTime) && now < openingTime) {
      return { available: false, label: "Pendaftaran belum dibuka", note: `Pendaftaran dibuka ${formatWibDate(opening)}.`, deadline };
    }
  }
  if (!shortCourseContent.registrationFormReady) return { available: false, label: "Pendaftaran menyusul", note: "Formulir pendaftaran sedang disiapkan.", deadline };
  return { available: true, label: "Daftar Short Course", note: "", deadline };
}

function RegistrationAction({ state, className = "" }: { state: RegistrationState; className?: string }) {
  if (state.available) {
    return (
      <Link href={shortCourseContent.registrationHref} className={`${action} bg-primary-300 text-secondary-1000 shadow-md transition-colors hover:bg-primary-400 active:bg-primary-500 ${className}`}>
        <Icon icon="mdi:arrow-right" className="size-5 shrink-0" aria-hidden="true" />{state.label}
      </Link>
    );
  }
  return <button type="button" disabled className={`${action} cursor-not-allowed border border-neutral-300 bg-neutral-200 text-neutral-800 ${className}`}>{state.label}</button>;
}

function CourseArtwork() {
  return (
    <div aria-hidden="true" className="relative isolate mx-auto flex aspect-square w-[80%] max-w-[440px] items-center justify-center rounded-full border border-primary-300/70 bg-linear-to-br from-primary-200 via-secondary-200 to-tertiary-300 shadow-xl max-md:w-[85%]">
      <div className="absolute inset-[10%] rounded-full border border-neutral-100/70" />
      <div className="absolute inset-[23%] rounded-full border border-secondary-700/25" />
      <div className="absolute left-0 top-[15%] size-7 rounded-full border border-primary-300 bg-neutral-100/80 md:size-12" />
      <div className="absolute -bottom-2 right-[16%] size-5 rounded-full bg-neutral-100/80 md:size-9" />
      <Icon icon="mdi:school-outline" className="relative z-10 size-20 text-secondary-1000 md:size-32" />
    </div>
  );
}

function ShortCourseHero({ state, title, now }: { state: RegistrationState; title: string; now: number | null }) {
  const futureDeadline = state.deadline && now !== null && state.deadline.getTime() > now ? state.deadline : null;
  const remainingDays = futureDeadline && now !== null ? Math.ceil((futureDeadline.getTime() - now) / 86_400_000) : 0;

  return (
    <section aria-labelledby="short-course-title" className={`${shell} pt-10`}>
      <div className="relative isolate rounded-3xl bg-linear-to-r from-primary-500 via-secondary-500 to-tertiary-600 p-0.5 shadow-xl">
        <div className="relative overflow-hidden rounded-[22px] bg-secondary-1000 px-4 py-8 text-neutral-100 md:px-8 md:py-10 lg:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-primary-600/25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 size-72 rounded-full bg-secondary-600/30 blur-3xl" />
          <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-24 w-full text-primary-300/10" viewBox="0 0 1440 120" preserveAspectRatio="none"><path fill="currentColor" d="M0 60C220 0 470 115 720 55S1180 5 1440 70V120H0Z" /></svg>
          <div className="relative grid min-w-0 grid-cols-1 items-center gap-8 md:grid-cols-[1.3fr_0.8fr] md:gap-4">
            <div className="flex min-w-0 flex-col items-center text-center">
              <span className="rounded-full border border-primary-300/60 bg-primary-600/20 px-4 py-2 font-ui text-b4 font-bold uppercase tracking-widest text-primary-100">Event IOE 2027</span>
              <h1 id="short-course-title" className="mt-5 max-w-full break-words font-heading text-h3 leading-tight md:text-h2 lg:text-h1">{title}</h1>
              <p className="mt-3 font-ui text-b2 font-semibold text-primary-100 md:text-b1">{state.label}</p>
              <p className="mt-2 font-body text-b3 text-neutral-200 md:text-b2">{futureDeadline ? `Batas pendaftaran: ${formatWibDate(futureDeadline.toISOString())}` : state.note}</p>
              <div className="mt-6 max-w-full">
                {futureDeadline ? <CountdownTimer targetDate={futureDeadline} variant="shortCourse" /> : <p className="rounded-2xl border border-neutral-100/30 bg-neutral-100/10 px-5 py-4 font-body text-b3 text-neutral-100">{state.deadline ? "Batas pendaftaran telah berlalu." : "Countdown tersedia setelah tenggat resmi diumumkan."}</p>}
              </div>
              {remainingDays > 1 && <p className="mt-2 font-body text-b4 text-neutral-200">Sekitar {remainingDays} hari hingga batas pendaftaran.</p>}
              <div className="mt-7 flex w-full max-w-[24rem] flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <RegistrationAction state={state} className="w-full flex-1" />
                <a href="#about-short-course" className={`${action} w-full flex-1 border border-neutral-100/60 bg-neutral-100/10 text-neutral-100 transition-colors hover:bg-neutral-100/20 active:bg-neutral-100/30 focus-visible:outline-neutral-100`}>Pelajari Program</a>
              </div>
            </div>
            <CourseArtwork />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShortCourseSponsors() {
  return (
    <section aria-labelledby="short-course-sponsors-title" className={shell}>
      <div className="mx-auto flex w-full max-w-[1024px] flex-col items-center gap-8 text-center">
        <h2 id="short-course-sponsors-title" className="font-heading text-h4 text-secondary-1000 md:text-h2">Sponsored by</h2>
        {eventSponsors.length > 0 ? (
          <div className="grid w-full grid-cols-1 items-center gap-6 sm:grid-cols-3">
            {eventSponsors.map((sponsor) => (
              <div key={sponsor.id} className="relative flex h-28 items-center justify-center rounded-2xl border border-secondary-200 bg-neutral-100 p-6">
                <Image src={sponsor.logoSrc} alt={sponsor.name} width={240} height={100} className="max-h-full w-auto max-w-full object-contain" />
              </div>
            ))}
          </div>
        ) : <p className="w-full rounded-2xl border border-secondary-200 bg-secondary-100/50 px-6 py-8 font-body text-b2 text-neutral-800">Sponsor atau mitra resmi Short Course belum diumumkan.</p>}
      </div>
    </section>
  );
}

function AboutShortCourse() {
  return (
    <section id="about-short-course" aria-labelledby="short-course-about-title" className={`${shell} scroll-mt-24 md:scroll-mt-28`}>
      <div className="flex flex-col gap-8">
        <div className="text-center md:text-left">
          <p className="font-ui text-b2 font-bold uppercase tracking-wide text-secondary-700">What is</p>
          <h2 id="short-course-about-title" className="font-heading text-h3 text-secondary-1000 md:text-h1">Short Course?</h2>
        </div>
        <div className="rounded-3xl bg-linear-to-r from-primary-500 via-secondary-500 to-tertiary-600 p-0.5">
          <div className="rounded-[22px] bg-neutral-100 px-6 py-8 text-center md:px-8 md:py-10">
            <p className="mx-auto max-w-[56rem] font-body text-b2 leading-relaxed text-neutral-900 md:text-b1">{shortCourseContent.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShortCourseBenefits() {
  const benefits = shortCourseContent.benefits;
  return (
    <section aria-labelledby="short-course-benefits-title" className={`${shell} isolate`}>
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-0 -z-10 size-72 rounded-full bg-primary-200/50 blur-3xl" />
      <div className="flex flex-col items-center gap-8">
        <h2 id="short-course-benefits-title" className="text-center font-heading text-h3 text-secondary-1000 md:text-h2">What Will You Gain?</h2>
        {benefits.length > 0 ? (
          <div className="grid w-full grid-cols-2 gap-4 md:flex md:items-stretch md:gap-0">
            {benefits.map((benefit, index) => (
              <article key={benefit.id} className={`relative flex min-w-0 flex-col items-center gap-6 rounded-2xl border border-secondary-300 bg-neutral-100 px-3 py-6 text-center shadow-md md:flex-1 md:px-6 md:py-8 ${index > 0 ? "md:-ml-[2.3%]" : ""}`} style={{ zIndex: benefits.length - index }}>
                <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl bg-linear-to-br from-primary-100 to-secondary-100">
                  {benefit.illustrationSrc ? <Image src={benefit.illustrationSrc} alt={benefit.illustrationAlt ?? benefit.title} fill sizes="(max-width: 768px) 40vw, 20vw" className="object-contain p-5" /> : <Icon icon="mdi:school-outline" className="size-16 text-secondary-800 md:size-24" aria-hidden="true" />}
                </div>
                <h3 className="break-words font-heading text-b2 text-secondary-1000 md:text-h5">{benefit.title}</h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-secondary-300 bg-secondary-100/50 px-6 py-8 text-center">
            <Icon icon="mdi:school-outline" className="size-14 text-secondary-800" aria-hidden="true" />
            <p className="font-body text-b2 text-neutral-800">Manfaat dan hasil belajar akan ditampilkan setelah kurikulum resmi tersedia.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ShortCourseTimeline({ milestones }: { milestones: ShortCourseMilestone[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const item = scroller.current?.querySelector<HTMLElement>("[data-short-course-milestone]");
    const step = (item?.offsetWidth ?? 160) + (window.innerWidth >= 768 ? 24 : 12);
    scroller.current?.scrollBy({ left: event.key === "ArrowRight" ? step : -step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <section aria-labelledby="short-course-timeline-title" className="relative isolate w-full overflow-hidden bg-secondary-1000 py-16 text-neutral-100 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 size-80 rounded-full bg-primary-600/25 blur-3xl" />
      <div className={`${shell} relative z-10`}>
        <h2 id="short-course-timeline-title" className="text-center font-heading text-h3 md:text-h2">Timeline</h2>
        <p className="mt-3 text-center font-body text-b2 text-neutral-200">Jadwal resmi Short Course.</p>
        {milestones.length > 0 ? (
          <div ref={scroller} role="region" aria-label="Timeline Short Course, gunakan tombol panah untuk menggeser" tabIndex={0} onKeyDown={handleKeyDown} className="mt-8 w-full overflow-x-auto overscroll-x-contain pb-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300">
            <div className="relative flex w-max min-w-full gap-3 md:gap-6">
              <div aria-hidden="true" className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-primary-300" />
              {milestones.map((milestone, index) => (
                <div key={milestone.id} data-short-course-milestone className="relative z-10 grid h-[260px] w-40 shrink-0 grid-rows-[1fr_auto_1fr] justify-items-center gap-3 md:h-[320px] md:w-80">
                  {index % 2 === 0 ? <MilestoneCard milestone={milestone} /> : <span />}
                  <span aria-hidden="true" className="size-5 rounded-full border-4 border-secondary-1000 bg-primary-300 shadow-lg md:size-7" />
                  {index % 2 === 1 ? <MilestoneCard milestone={milestone} /> : <span />}
                </div>
              ))}
            </div>
          </div>
        ) : <p className="mt-8 rounded-2xl border border-neutral-100/30 bg-neutral-100/10 px-6 py-8 text-center font-body text-b2">Milestone dan tanggal resmi belum tersedia.</p>}
      </div>
    </section>
  );
}

function MilestoneCard({ milestone }: { milestone: ShortCourseMilestone }) {
  return (
    <article className="flex w-full flex-col justify-center rounded-2xl bg-linear-to-r from-primary-500 via-secondary-500 to-tertiary-600 p-0.5">
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[14px] bg-neutral-100 px-3 py-4 text-center text-secondary-1000 md:px-6">
        <h3 className="break-words font-heading text-b2 md:text-h5">{milestone.title}</h3>
        <span aria-hidden="true" className="h-px w-12 bg-secondary-300" />
        <time dateTime={milestone.date} className="font-body text-b4 md:text-b2">{formatWibDate(milestone.date)}</time>
      </div>
    </article>
  );
}

function ShortCourseSessions({ state }: { state: RegistrationState }) {
  const sessions = shortCourseContent.sessions;
  return (
    <section aria-labelledby="short-course-sessions-title" className={`${shell} isolate`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 -z-10 size-72 rounded-full bg-tertiary-200/60 blur-3xl" />
      <h2 id="short-course-sessions-title" className="text-center font-heading text-h3 text-secondary-1000 md:text-h2">Course Sessions</h2>
      {sessions.length > 0 ? (
        <div className="mt-8 flex flex-col gap-8">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-3xl bg-linear-to-br from-primary-500 via-secondary-500 to-tertiary-600 p-0.5">
              <div className="grid overflow-hidden rounded-[22px] bg-neutral-100 md:grid-cols-[1fr_2fr]">
                <div className="flex flex-col items-center justify-center gap-5 bg-secondary-100/70 p-6 text-center md:p-10">
                  <span className="rounded-full bg-primary-200 px-4 py-2 font-ui text-b4 font-bold text-secondary-1000">Pengajar</span>
                  {session.portraitSrc ? <Image src={session.portraitSrc} alt={`Potret ${session.instructorName}`} width={240} height={240} className="h-auto w-full max-w-[240px] object-contain" /> : <div aria-hidden="true" className="flex size-40 items-center justify-center rounded-full bg-primary-200"><Icon icon="mdi:school-outline" className="size-20 text-secondary-1000" /></div>}
                </div>
                <div className="flex min-w-0 flex-col gap-5 p-6 md:p-10">
                  <div><h3 className="break-words font-heading text-h5 text-secondary-1000 md:text-h4">{session.instructorName}</h3><p className="font-body text-b2 text-neutral-800">{session.instructorRole}{session.affiliation ? ` · ${session.affiliation}` : ""}</p></div>
                  <div className="h-px bg-secondary-200" aria-hidden="true" />
                  <h4 className="break-words font-heading text-h5 text-secondary-1000">{session.title}</h4>
                  <div className="flex flex-col gap-2 font-body text-b2 text-neutral-800">
                    <p><Icon icon="mdi:calendar-clock" className="mr-2 inline size-5 text-secondary-800" aria-hidden="true" />{session.date}</p>
                    <p><Icon icon="mdi:map-marker-outline" className="mr-2 inline size-5 text-secondary-800" aria-hidden="true" />{session.location}</p>
                    <p><Icon icon="mdi:timer" className="mr-2 inline size-5 text-secondary-800" aria-hidden="true" />{session.time}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <RegistrationAction state={state} className="flex-1" />
                    {session.curriculumUrl && <a href={session.curriculumUrl} target="_blank" rel="noopener noreferrer" className={`${action} flex-1 border border-secondary-700 text-secondary-1000 transition-colors hover:bg-secondary-100 active:bg-secondary-200`}>Lihat Kurikulum</a>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="mt-8 rounded-3xl border border-secondary-300 bg-secondary-100/50 px-6 py-12 text-center font-body text-b2 text-neutral-800">Rincian sesi dan pengajar resmi belum tersedia.</p>}
    </section>
  );
}

function ShortCourseDocumentation() {
  const photos = shortCourseContent.photos;
  const [active, setActive] = useState(0);
  if (photos.length === 0) return null;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    setActive((current) => (current + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length);
  };
  return (
    <section aria-labelledby="short-course-documentation-title" className={`${shell} pb-20`}>
      <h2 id="short-course-documentation-title" className="text-center font-heading text-h3 text-secondary-1000 md:text-h2">Dokumentasi Short Course</h2>
      <div className="relative mx-auto mt-8 aspect-video w-full max-w-[960px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800" role="region" aria-roledescription="carousel" aria-label="Dokumentasi Short Course" tabIndex={0} onKeyDown={handleKeyDown}>
        {photos.map((photo, index) => {
          const distance = (index - active + photos.length) % photos.length;
          const offset = distance === 0 ? 0 : distance <= photos.length / 2 ? 1 : -1;
          return (
            <figure key={photo.id} aria-hidden={index !== active} className={`absolute inset-0 overflow-hidden rounded-3xl border border-secondary-200 bg-secondary-100 shadow-xl transition-all duration-500 ease-out motion-reduce:transition-none ${index === active ? "z-20 opacity-100" : "z-10 opacity-60"}`} style={{ transform: `translateX(${offset * 8}%) scale(${index === active ? 1 : 0.9})` }}>
              <Image src={photo.src} alt={index === active ? photo.alt : ""} fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-secondary-1000/90 to-transparent px-6 pb-6 pt-16 font-body text-b2 text-neutral-100">{photo.caption}</figcaption>
            </figure>
          );
        })}
      </div>
      {photos.length > 1 && <div className="mt-8 flex justify-center gap-3">{photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setActive(index)} aria-label={`Tampilkan foto ${index + 1}`} aria-pressed={index === active} className={`size-11 rounded-full border-2 border-secondary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 ${index === active ? "bg-secondary-800" : "bg-neutral-100 hover:bg-secondary-100"}`} />)}</div>}
    </section>
  );
}

export function ShortCoursePage() {
  const { data } = useEvents();
  const now = useCurrentTime();
  const event = data?.events.find((item) => item.slug === "short-course");
  const state = getRegistrationState(event, data?.isDemo ?? true, now);
  const officialDeadline = event && !data?.isDemo && Number.isFinite(new Date(event.deadline).getTime()) ? event.deadline : null;
  const milestones = [...shortCourseContent.milestones];
  if (officialDeadline && !milestones.some((item) => item.id === "registration-close")) {
    milestones.push({ id: "registration-close", title: "Batas Pendaftaran", date: officialDeadline });
  }
  milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-20 overflow-x-clip bg-neutral-100 text-neutral-900 md:gap-40">
      <ShortCourseHero state={state} title={!data?.isDemo && event ? event.name : shortCourseContent.title} now={now} />
      <ShortCourseSponsors />
      <AboutShortCourse />
      <ShortCourseBenefits />
      <ShortCourseTimeline milestones={milestones} />
      <ShortCourseSessions state={state} />
      <ShortCourseDocumentation />
    </main>
  );
}
