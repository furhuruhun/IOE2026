"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEvents } from "@/hooks/useEvents";
import { mockEvents } from "@/mocks/events";
import type { EventSummary } from "@/types/event";
import { formatWibDate } from "@/utils/formatDate";
import { shortCourseContent, type ShortCourseMilestone } from "./shortCourseContent";
import { ShortCoursePanelIllustration, ShortCourseSpeakerIllustration } from "./ShortCourseSpeakerIllustration";

const shell = "relative mx-auto w-full max-w-[1440px] px-8 md:px-20";
const heroAction = "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 font-ui text-s6 transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300/50 md:rounded-2xl md:px-5 md:py-3 md:text-s5";
const action = "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-center font-ui text-s6 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:min-h-12 md:rounded-2xl md:px-5 md:py-3 md:text-s5";

type RegistrationState = {
  available: boolean;
  label: string;
  deadline: Date | null;
};

function getRegistrationState(event: EventSummary | undefined, isDemo: boolean, now: number | null): RegistrationState {
  const unavailable = { available: false, label: "Pendaftaran menyusul", deadline: null };
  if (!event || isDemo || now === null) return unavailable;
  if (event.isRegisteredByUser) return { available: false, label: "Sudah terdaftar", deadline: null };
  const time = new Date(event.deadline).getTime();
  if (!Number.isFinite(time)) return unavailable;
  const deadline = new Date(time);
  if (time <= now) return { available: false, label: "Pendaftaran ditutup", deadline };
  const opening = shortCourseContent.registrationOpensAt;
  if (opening) {
    const openingTime = new Date(opening).getTime();
    if (Number.isFinite(openingTime) && now < openingTime) {
      return { available: false, label: "Pendaftaran belum dibuka", deadline };
    }
  }
  if (!shortCourseContent.registrationFormReady) return { available: false, label: "Pendaftaran menyusul", deadline };
  return { available: true, label: "Daftar Short Course", deadline };
}

function RegistrationAction({ state, className = "" }: { state: RegistrationState; className?: string }) {
  if (state.available) {
    return (
      <Link href={shortCourseContent.registrationHref} className={`${action} bg-primary-300 text-secondary-1000 shadow-md transition-colors hover:bg-primary-400 active:bg-primary-500 ${className}`}>
        <Icon icon="mdi:pencil" className="size-5 shrink-0" aria-hidden="true" />{state.label}
      </Link>
    );
  }
  return <button type="button" disabled className={`${action} cursor-not-allowed border border-neutral-300 bg-neutral-200 text-neutral-800 ${className}`}>{state.label}</button>;
}

function HeroRegistrationAction({ state }: { state: RegistrationState }) {
  if (state.available) {
    return (
      <Link href={shortCourseContent.registrationHref} className={`${heroAction} bg-primary-300 text-secondary-1000 hover:bg-primary-400 active:bg-primary-500`}>
        <Icon icon="mdi:door-open" className="size-5 shrink-0 md:size-6" aria-hidden="true" />Register Now
      </Link>
    );
  }
  return <button type="button" disabled aria-label={`Register Now — ${state.label}`} className={`${heroAction} cursor-not-allowed bg-neutral-200 text-neutral-800`}><Icon icon="mdi:door-open" className="size-5 shrink-0 md:size-6" aria-hidden="true" />Register Now</button>;
}

function ShortCourseHero({ state, title, now, demoDeadline }: { state: RegistrationState; title: string; now: number | null; demoDeadline: Date | null }) {
  const countdownDeadline = state.deadline ?? demoDeadline;
  const futureDeadline = countdownDeadline && now !== null && countdownDeadline.getTime() > now ? countdownDeadline : null;

  return (
    <section aria-labelledby="short-course-title" className="w-full">
      <div className="px-8 md:px-20 py-10 relative z-10">
        <div className="rounded-xl p-0.5 grid grid-cols-[1.3fr_0.8fr] max-md:grid-cols-1 gap-4 max-md:gap-8 w-full border-2 border-primary-500 bg-secondary-1000 px-12 max-md:px-8 py-10 max-md:py-6 text-neutral-100">
          <div className="flex flex-col h-full justify-center">
            <div className="w-[60%] self-center h-auto relative items-center py-6 md:py-8">
              <h1 id="short-course-title" className="text-center font-heading text-h3 leading-tight text-primary-100 md:text-h2">{title}</h1>
            </div>
            <p className="font-heading text-h5 max-md:text-h6 text-center mb-2">{state.label}</p>
            {futureDeadline ? (
              <CountdownTimer targetDate={futureDeadline} variant="shortCourse" />
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              <HeroRegistrationAction state={state} />
              <a href="#about-short-course" className={`${heroAction} bg-neutral-100/10 text-neutral-100 hover:bg-neutral-100/20 active:bg-neutral-100/30`}><Icon icon="mdi:door-open" className="size-5 shrink-0 md:size-6" aria-hidden="true" />More Details</a>
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="w-[80%] max-md:w-[85%] h-auto relative">
              <Image src="/short-course/hero-placeholder.svg" alt="Ilustrasi abstrak Short Course IOE" width={800} height={800} className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutShortCourse() {
  return (
    <section id="about-short-course" aria-labelledby="short-course-about-title" className="w-full scroll-mt-24 px-8 md:scroll-mt-28 md:px-20">
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
  const cardGradients = [
    "from-primary-700 to-secondary-800",
    "from-secondary-700 to-secondary-900",
    "from-secondary-800 to-primary-1000",
    "from-primary-1000 to-secondary-1000",
  ];
  return (
    <section aria-labelledby="short-course-benefits-title" className="w-full px-8 md:px-20">
      <h2 id="short-course-benefits-title" className="mb-6 text-center font-heading text-h3 text-secondary-1000 md:text-h2">What Will You Gain?</h2>
      {benefits.length > 0 ? (
        <div className="grid w-full grid-cols-2 gap-4 md:flex md:justify-center md:gap-0">
          {benefits.map((benefit, index) => (
            <article key={benefit.id} className={`relative flex min-w-0 w-full shrink-0 flex-col items-center gap-4 rounded-2xl bg-linear-to-b ${cardGradients[index % cardGradients.length]} px-4 py-5 text-center text-neutral-100 md:w-[25%] md:px-8 md:py-10 ${index > 0 ? "md:-ml-[2.3%]" : ""}`} style={{ zIndex: benefits.length - index }}>
              <div className="relative flex h-70 w-full items-center justify-center">
                {benefit.illustrationSrc ? <Image src={benefit.illustrationSrc} alt={benefit.illustrationAlt ?? ""} fill sizes="(max-width: 768px) 40vw, 22vw" className="object-contain" /> : <Icon icon="mdi:school-outline" className="size-24 text-neutral-100" aria-hidden="true" />}
              </div>
              <h3 className="break-words font-heading text-h6 md:text-h5">{benefit.title}</h3>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ShortCourseTimeline({ milestones, now }: { milestones: ShortCourseMilestone[]; now: number | null }) {
  const scroller = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ pointerId: number; startX: number; startScrollLeft: number } | null>(null);
  const isPreview = milestones.length === 0;
  const items = isPreview ? shortCourseContent.previewMilestones : milestones;
  const completedIndex = now === null ? -1 : items.reduce((last, item, index) => new Date(item.date).getTime() <= now ? index : last, -1);
  const activeIndex = isPreview ? items.length - 1 : Math.max(0, completedIndex);
  const progress = items.length > 1 ? (activeIndex / (items.length - 1)) * 100 : 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const item = scroller.current?.querySelector<HTMLElement>("[data-short-course-milestone]");
    const step = (item?.offsetWidth ?? 160) + (window.innerWidth >= 768 ? 24 : 12);
    scroller.current?.scrollBy({ left: event.key === "ArrowRight" ? step : -step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startScrollLeft: event.currentTarget.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <section aria-labelledby="short-course-timeline-title" className="w-full px-8 md:px-20">
      <h2 id="short-course-timeline-title" className="mb-6 text-center font-heading text-h3 text-secondary-1000 md:text-h2">Our Timeline</h2>
      <div
        ref={scroller}
        role="region"
        aria-label="Timeline Short Course, geser atau gunakan tombol panah untuk melihat item lain"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
        onLostPointerCapture={finishPointerDrag}
        className="no-scrollbar flex w-full cursor-grab overflow-x-auto overscroll-x-contain rounded-3xl border border-secondary-900 bg-secondary-100/20 p-5 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:rounded-[36px] md:p-10"
      >
        <div className="relative w-fit">
          <div aria-hidden="true" className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-neutral-500 md:h-2" />
          <div aria-hidden="true" className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-secondary-500 md:h-2" style={{ width: `${progress}%` }} />
          <div className="relative z-10 flex gap-3 md:gap-6">
            {items.map((milestone, index) => {
              const onTop = index % 2 === 0;
              const status = index < activeIndex ? "done" : index === activeIndex ? "current" : "future";
              return (
                <div key={milestone.id} data-short-course-milestone className="grid w-fit grid-rows-[1fr_auto_1fr] gap-5 md:gap-8">
                  {onTop ? <MilestoneCard milestone={milestone} onTop /> : <div className="order-1 flex-1" />}
                  <div className={`relative order-2 mx-auto size-4 flex-auto rounded-full p-0.5 md:size-7.5 ${status === "future" ? "bg-neutral-500" : "bg-linear-to-r from-primary-600 via-secondary-600 to-secondary-900"}`}>
                    <div className={`size-full rounded-full ${status === "current" ? "bg-neutral-100" : ""}`} />
                    {status !== "future" && <div className="absolute left-1/2 top-1/2 -z-10 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-200 blur-xl md:size-18 md:blur-2xl" />}
                  </div>
                  {!onTop ? <MilestoneCard milestone={milestone} onTop={false} /> : <div className="order-3 flex-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MilestoneCard({ milestone, onTop }: { milestone: ShortCourseMilestone; onTop: boolean }) {
  return (
    <article className={`w-40 flex-1 rounded-md bg-linear-to-r from-primary-600 via-secondary-600 to-secondary-900 p-0.5 md:w-80 md:rounded-2xl ${onTop ? "" : "order-3"}`}>
      <div className={`flex h-full w-full flex-col items-center justify-center rounded-sm from-neutral-100 to-primary-100 p-2.5 text-secondary-1000 md:rounded-[18px] md:p-5 ${onTop ? "bg-linear-to-b" : "bg-linear-to-t"}`}>
        <p className="text-center font-ui text-s6 md:text-s3">{milestone.title}</p>
        <div className="my-2 h-px w-full bg-neutral-1000 md:mb-4" aria-hidden="true" />
        <time dateTime={milestone.date} className="text-center font-body text-b4 md:text-b2">{milestone.displayDate ?? formatWibDate(milestone.date)}</time>
      </div>
    </article>
  );
}

function ShortCourseSessionCard({ session, state }: { session: (typeof shortCourseContent.sessions)[number]; state: RegistrationState }) {
  const [showAgenda, setShowAgenda] = useState(false);
  const agenda = session.agenda ?? [];
  const isAgendaOpen = showAgenda && agenda.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-center font-heading text-h5 text-secondary-1000 md:text-h4">{session.title}</h3>
      <article className="relative z-10 w-full rounded-3xl bg-linear-to-r from-primary-500 via-secondary-500 to-tertiary-600 p-0.5">
        <div className="grid w-full overflow-hidden rounded-[22px] bg-neutral-100 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col items-center justify-center gap-4 bg-linear-to-b from-neutral-100 to-secondary-100/40 p-3 text-center md:p-6">
            <span className="rounded-full border border-secondary-300 bg-neutral-100/80 px-3 py-1 font-ui text-s5 text-secondary-1000 md:text-s4">Speaker</span>
            {session.portraitSrc ? (
              <Image src={session.portraitSrc} alt={session.moderator ? `Foto ${session.instructorName} dan ${session.moderator.name}` : `Potret ${session.instructorName}`} width={440} height={360} className="h-auto w-full object-contain" />
            ) : session.moderator ? (
              <ShortCoursePanelIllustration />
            ) : (
              <ShortCourseSpeakerIllustration />
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center gap-3 p-3 md:gap-5 md:p-6">
            {isAgendaOpen ? (
              <div role="region" aria-label={`Rundown ${session.title}`} tabIndex={0} className="max-h-80 overflow-y-auto pr-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800">
                {agenda.map((item, index) => (
                  <div key={item.id} className="flex gap-4 text-left">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <div className="size-6 shrink-0 rounded-full bg-secondary-900" />
                      {index < agenda.length - 1 && <div className="w-2 flex-1 bg-secondary-900" />}
                    </div>
                    <div className="pb-6">
                      <p className="bg-linear-to-r from-primary-900 to-secondary-900 bg-clip-text font-heading text-s6 text-transparent md:text-s5">{item.label}</p>
                      <p className="font-heading text-b3 text-secondary-1000 md:text-b2">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 text-center md:text-left">
                  <div>
                    <h4 className="break-words font-heading text-h4 text-secondary-1000 md:text-h3">{session.instructorName}</h4>
                    <p className="font-body text-b3 text-neutral-800 md:text-b2">{session.instructorRole}</p>
                    {session.affiliation && <p className="font-body text-b4 text-neutral-800 md:text-b3">{session.affiliation}</p>}
                  </div>
                  {session.moderator && (
                    <div>
                      <h4 className="break-words font-heading text-h4 text-secondary-1000 md:text-h3">{session.moderator.name}</h4>
                      <p className="font-body text-b3 text-neutral-800 md:text-b2">{session.moderator.role}</p>
                      {session.moderator.affiliation && <p className="font-body text-b4 text-neutral-800 md:text-b3">{session.moderator.affiliation}</p>}
                    </div>
                  )}
                </div>
                <hr className="border-secondary-200" />
                <p className="bg-linear-to-r from-primary-900 to-secondary-900 bg-clip-text text-center font-body text-b3 text-transparent md:text-left md:text-b2">{session.topic ?? session.title}</p>
                <div className="flex flex-col gap-2 font-ui text-s6 text-neutral-800 max-md:flex-row max-md:flex-wrap max-md:justify-center md:text-s5">
                  <p className="flex items-center gap-2"><Icon icon="mdi:calendar-clock" className="size-6 shrink-0 text-secondary-800 md:size-7" aria-hidden="true" />{session.date}</p>
                  <p className="flex items-center gap-2"><Icon icon="mdi:map-marker-outline" className="size-6 shrink-0 text-secondary-800 md:size-7" aria-hidden="true" />{session.location}</p>
                  <p className="flex items-center gap-2"><Icon icon="mdi:timer" className="size-6 shrink-0 text-secondary-800 md:size-7" aria-hidden="true" />{session.time}</p>
                </div>
                {session.curriculumUrl && <a href={session.curriculumUrl} target="_blank" rel="noopener noreferrer" className="w-fit font-ui text-s5 text-secondary-800 underline underline-offset-4 hover:text-secondary-1000">Lihat Kurikulum</a>}
              </>
            )}
            <div className="flex gap-3 max-md:justify-center">
              <RegistrationAction state={state} className="flex-1" />
              {agenda.length > 0 && (
                <button type="button" aria-pressed={isAgendaOpen} onClick={() => setShowAgenda((current) => !current)} className={`${action} flex-1 bg-secondary-100 text-secondary-1000 transition-colors hover:bg-secondary-200 active:bg-secondary-300`}>
                  <Icon icon={isAgendaOpen ? "mdi:arrow-right" : "mdi:calendar-clock"} className="size-5 shrink-0" aria-hidden="true" />
                  {isAgendaOpen ? "Detail" : "Rundown"}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function ShortCourseSessions({ state }: { state: RegistrationState }) {
  const isPreview = shortCourseContent.sessions.length === 0;
  const sessions = isPreview ? shortCourseContent.previewSessions : shortCourseContent.sessions;

  return (
    <section aria-labelledby="short-course-sessions-title" className="w-full px-8 md:px-20">
      <h2 id="short-course-sessions-title" className="text-center font-heading text-h3 text-secondary-1000 md:text-h2">Course Sessions</h2>
      <div className="mt-12 flex flex-col gap-12">
        {sessions.map((session) => <ShortCourseSessionCard key={session.id} session={session} state={state} />)}
      </div>
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
    <section aria-labelledby="short-course-documentation-title" className={shell}>
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
  const { data, isError } = useEvents();
  const now = useCurrentTime();
  const event = data?.events.find((item) => item.slug === "short-course");
  const state = getRegistrationState(event, data?.isDemo ?? true, now);
  // A sample timer is useful in development; it never changes registration state.
  const demoEvent = data?.isDemo ? event : isError && process.env.NODE_ENV === "development" ? mockEvents.find((item) => item.slug === "short-course") : null;
  const demoDeadline = demoEvent && Number.isFinite(new Date(demoEvent.deadline).getTime()) ? new Date(demoEvent.deadline) : null;
  const officialDeadline = event && !data?.isDemo && Number.isFinite(new Date(event.deadline).getTime()) ? event.deadline : null;
  const milestones = [...shortCourseContent.milestones];
  if (officialDeadline && !milestones.some((item) => item.id === "registration-close")) {
    milestones.push({ id: "registration-close", title: "Batas Pendaftaran", date: officialDeadline });
  }
  milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center gap-20 overflow-x-clip bg-neutral-100 pb-20 text-neutral-900 md:gap-40 md:pb-32">
      <ShortCourseHero state={state} title={!data?.isDemo && event ? event.name : shortCourseContent.title} now={now} demoDeadline={demoDeadline} />
      <AboutShortCourse />
      <ShortCourseBenefits />
      <ShortCourseTimeline milestones={milestones} now={now} />
      <ShortCourseSessions state={state} />
      <ShortCourseDocumentation />
    </main>
  );
}
