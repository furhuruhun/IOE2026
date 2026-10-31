"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { buttonStyles } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { eventContacts } from "@/features/events/eventOverviewContent";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEvents } from "@/hooks/useEvents";
import type { EventSummary } from "@/types/event";
import { talkshowContent, talkshowFaqs } from "./talkshowContent";
import styles from "./TalkshowDetails.module.css";

const shell = "site-container relative z-10";
const action = buttonStyles("secondary");
const primaryAction = buttonStyles("primary");
const disabledAction = buttonStyles("primary");

type RegistrationState = {
  available: boolean;
  label: string;
  note: string;
};

function registrationState(event: EventSummary | undefined, isDemo: boolean, now: number | null): RegistrationState {
  if (event?.isRegisteredByUser && !isDemo) {
    return { available: false, label: "Sudah terdaftar", note: "Kamu sudah terdaftar di Talkshow ini." };
  }
  const deadline = event && !isDemo ? new Date(event.deadline).getTime() : NaN;
  if (Number.isFinite(deadline) && now !== null && deadline <= now) {
    return { available: false, label: "Pendaftaran ditutup", note: "Batas pendaftaran Talkshow telah berlalu." };
  }
  if (!talkshowContent.registrationFormReady) {
    return { available: false, label: "Pendaftaran menyusul", note: "Formulir pendaftaran sedang disiapkan." };
  }
  if (!event || isDemo || now === null) {
    return { available: false, label: "Pendaftaran menyusul", note: "Status pendaftaran resmi belum tersedia." };
  }
  if (!Number.isFinite(deadline)) {
    return { available: false, label: "Pendaftaran menyusul", note: "Batas pendaftaran resmi belum tersedia." };
  }
  return { available: true, label: "Register Now", note: "" };
}

function RegistrationAction({ state, className = "" }: { state: RegistrationState; className?: string }) {
  if (state.available) {
    return (
      <Link href={talkshowContent.registrationHref} className={`${primaryAction} ${className}`}>
        <Icon icon="mdi:arrow-right" className="size-5 shrink-0" aria-hidden="true" />
        <span>{state.label}</span>
      </Link>
    );
  }
  return (
    <button type="button" disabled className={`${disabledAction} ${className}`} title={state.note}>
      {state.label}
    </button>
  );
}

function OceanVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate flex shrink-0 items-center justify-center rounded-full border border-primary-300/70 bg-linear-to-br from-primary-100 via-secondary-200 to-tertiary-300 shadow-xl ${compact ? "size-48 md:size-64 lg:aspect-square lg:h-auto lg:w-full lg:max-w-[320px]" : "size-50 lg:aspect-square lg:h-auto lg:w-full lg:max-w-[512px]"}`}
    >
      <div className="absolute inset-[8%] rounded-full border border-neutral-100/70" />
      <div className="absolute inset-[18%] rounded-full border border-secondary-700/20" />
      <div className="absolute -bottom-3 left-[12%] size-8 rounded-full border border-secondary-300 bg-neutral-100/80 md:size-12" />
      <div className="absolute right-[10%] top-[11%] size-5 rounded-full bg-neutral-100/80 md:size-8" />
      <Icon icon="mdi:forum-outline" className={`${compact ? "size-20 md:size-28" : "size-24 md:size-40"} relative z-10 text-secondary-1000`} />
    </div>
  );
}

function MetadataLine({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex min-w-0 items-center justify-center gap-4 font-body text-b3 text-neutral-800 md:text-b2 lg:justify-start">
      <Icon icon={icon} className="size-5 shrink-0 text-secondary-800 md:size-7" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}

function TalkshowHero({ state }: { state: RegistrationState }) {
  return (
    <section aria-labelledby="talkshow-title" className={`${shell} flex flex-col items-center gap-8 pt-10 lg:flex-row lg:justify-between`}>
      <div className="flex min-w-0 flex-1 flex-col items-center text-center lg:max-w-[560px] lg:items-start lg:text-left">
        <span className="rounded-full border border-primary-600 bg-primary-100 px-4 py-2 font-ui text-b4 font-bold uppercase tracking-widest text-secondary-1000">
          Event IOE 2027
        </span>
        <div className="mt-6 min-w-0">
          <h1 id="talkshow-title" className="font-heading text-h3 leading-tight text-secondary-1000 md:text-h1">{talkshowContent.title}</h1>
          <p className="mt-2 font-ui text-b1 font-semibold leading-snug text-secondary-800 md:text-h5">{talkshowContent.subtitle}</p>
        </div>
        <p className="mt-4 max-w-[38rem] font-body text-b3 leading-relaxed text-neutral-800 md:text-b2">{talkshowContent.description}</p>
        <div className="mt-7 flex flex-col gap-3">
          <MetadataLine icon="mdi:calendar-clock">{talkshowContent.sessionDate && talkshowContent.sessionTime ? `${talkshowContent.sessionDate} · ${talkshowContent.sessionTime}` : "Tanggal dan waktu acara menyusul"}</MetadataLine>
          <MetadataLine icon="mdi:map-marker-outline">{talkshowContent.venue ?? "Lokasi acara menyusul"}</MetadataLine>
        </div>
        <div className="mt-8 grid w-full max-w-[29rem] grid-cols-1 gap-3 min-[380px]:grid-cols-[3fr_2fr] md:gap-6">
          <RegistrationAction state={state} className="w-full" />
          <a href="#talkshow-details" className={`${action} w-full`}>
            More Details
          </a>
        </div>
        {!state.available && <p className="mt-3 font-body text-b4 text-neutral-700" role="status">{state.note}</p>}
      </div>
      <div className="flex min-w-0 flex-1 justify-center lg:justify-end">
        <OceanVisual />
      </div>
    </section>
  );
}

function ScheduleItem({ icon, label, value, className = "" }: { icon: string; label: string; value: string; className?: string }) {
  return (
    <div className={`flex min-w-0 items-center justify-center gap-3 text-b3 md:text-b2 lg:justify-start ${className}`}>
      <Icon icon={icon} className="size-5 shrink-0 text-secondary-800" aria-hidden="true" />
      <span className="min-w-0 break-words text-neutral-900"><span className="sr-only">{label}: </span>{value}</span>
    </div>
  );
}

const detailsActionClass = `${styles.registrationAction} relative inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-0 px-4 py-2 font-ui text-s6 transition-all md:rounded-2xl md:px-5 md:py-3 md:text-s5`;

function DetailsRegistrationAction({ state }: { state: RegistrationState }) {
  const content = <><Icon icon="mdi:door-open" className="size-6 shrink-0" aria-hidden="true" /><span>{state.label}</span></>;
  if (state.available) {
    return <Link href={talkshowContent.registrationHref} className={detailsActionClass}>{content}</Link>;
  }
  return <button type="button" disabled title={state.note} className={detailsActionClass}>{content}</button>;
}

function TalkshowDetails({ state }: { state: RegistrationState }) {
  return (
    <section id="talkshow-details" aria-labelledby="talkshow-details-title" className="relative z-10 flex w-full scroll-mt-24 flex-col items-center justify-between gap-8 px-5 md:scroll-mt-28 md:px-20 lg:flex-row">
      <div className="flex w-full min-w-0 shrink-0 flex-col justify-center gap-10 lg:w-1/3">
        <h2 id="talkshow-details-title" className={`${styles.heading} text-center font-heading text-h3 text-secondary-1000 md:text-h1 lg:text-start`}>Our Talks</h2>
      </div>
      <div className="w-full min-w-0 lg:w-2/3">
        <div className="flex w-full flex-col gap-6 lg:ml-auto lg:max-w-189">
          <h3 className={`${styles.scheduleHeading} text-center text-s4 text-secondary-1000 md:text-h5 lg:text-start lg:text-h4`}>Our Venue and Schedule</h3>
          <div className={`${styles.scheduleSurface} relative block w-full cursor-pointer rounded-2xl p-px font-ui text-s6 md:text-s5`}>
            <div className="relative z-10 grid w-full grid-cols-2 items-center gap-2 rounded-full bg-transparent px-6 py-4 transition-colors lg:flex lg:justify-between lg:gap-4 lg:px-12">
              <ScheduleItem icon="mdi:calendar-range" label="Tanggal" value={talkshowContent.sessionDate ?? "Menyusul"} />
              <ScheduleItem icon="mdi:timer-outline" label="Waktu" value={talkshowContent.sessionTime ?? "Menyusul"} />
              <ScheduleItem icon="mdi:map-marker" label="Lokasi" value={talkshowContent.venue ?? "Menyusul"} className="col-span-2 lg:col-span-1" />
            </div>
          </div>
          <p className="text-center font-body text-b3 text-neutral-800 md:text-b2 lg:text-start lg:text-b1">{talkshowContent.description}</p>
          <div className="relative"><DetailsRegistrationAction state={state} /></div>
        </div>
      </div>
    </section>
  );
}

function TalkshowSpeakers() {
  return (
    <section aria-labelledby="talkshow-speakers-title" className="relative z-50 flex w-full items-center justify-between px-5 md:px-20 xl:px-20">
      <div className="relative z-50 flex w-full flex-col justify-center gap-8">
        <h2 id="talkshow-speakers-title" className="text-center font-heading text-h3 text-secondary-1000 md:text-left md:text-h1">Our Speakers</h2>
        <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-8">
          {talkshowContent.speakers.map((person, index) => (
            <article key={`${person.role}-${index}`} className="min-w-0 flex-1 rounded-[24px] border border-secondary-300 bg-transparent px-6 py-8 md:rounded-[36px] lg:px-8 xl:px-11 xl:py-11">
              <div className="flex flex-col gap-6 md:gap-8">
                <div>
                  <Image src={person.image ?? "/images/events/speaker-placeholder.svg"} alt={person.image ? person.name : `Foto ${person.role === "narrator" ? "narator" : "pembicara"} belum tersedia`} width={200} height={200} className="mx-auto h-auto w-full max-w-[200px] object-contain" />
                </div>
                <div className="text-center">
                  <h3 className="font-heading text-h5 text-secondary-1000 md:text-h4">{person.name}</h3>
                  <span className="font-body text-s5 text-neutral-800 md:text-s4">{person.affiliation}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TalkshowRegistrationRecall({ state }: { state: RegistrationState }) {
  return (
    <section aria-labelledby="talkshow-recall-title" className="relative z-10 w-full px-5 md:px-8 xl:px-20">
      <div className={`${styles.recallBanner} relative isolate mx-auto w-full max-w-[1440px] overflow-hidden rounded-[36px] bg-secondary-100 text-secondary-1000`}>
        <Image src="/images/events/ioe-talk-recall-bg-aquatic.svg" alt="" aria-hidden="true" width={1280} height={535} className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[60%_center] md:object-center" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 px-4 py-8 text-center sm:flex-row sm:text-left md:gap-12 md:px-10 md:py-16 lg:px-14 xl:px-20">
          <div className="flex w-full min-w-0 flex-col items-center gap-4 sm:max-w-[464px] sm:flex-1 sm:items-start">
            <h2 id="talkshow-recall-title" className="font-heading text-h4 md:text-h3 lg:text-h2">{state.available ? "Sudah siap mengikuti Talkshow IOE 2027?" : "Sampai jumpa di Talkshow IOE 2027"}</h2>
            <p className="font-body text-b2">{state.available ? "Daftarkan dirimu melalui formulir resmi Talkshow." : state.note}</p>
            <RegistrationAction state={state} className="w-full max-w-[20rem] rounded-xl px-4 py-2 md:rounded-2xl md:px-5 md:py-3" />
          </div>
          <OceanVisual compact />
        </div>
      </div>
    </section>
  );
}

function TalkshowFaq() {
  return (
    <section aria-labelledby="talkshow-faq-title" className={shell}>
      <div className="relative flex w-full items-center justify-between gap-8">
        <div className="w-full text-center lg:text-left">
          <h2 id="talkshow-faq-title" className="font-heading text-h3 text-secondary-1000 md:text-h2">Need more help?</h2>
          <p className="mt-2 font-body text-b2 text-neutral-800">Informasi yang sudah tersedia tentang pendaftaran Talkshow.</p>
        </div>
        <div aria-hidden="true" className="hidden size-48 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-300 via-secondary-300 to-tertiary-300 lg:flex">
          <Icon icon="mdi:frequently-asked-questions" className="size-20 text-secondary-1000" />
        </div>
      </div>
      {talkshowFaqs.length > 0 ? <Accordion items={talkshowFaqs} /> : <p className="mt-8 text-center font-body text-b2 text-neutral-800">FAQ resmi menyusul.</p>}
    </section>
  );
}

function TalkshowContact() {
  return (
    <section aria-labelledby="talkshow-contact-title" className={`${shell} pb-20 md:pb-[120px]`}>
      <div className="relative isolate flex min-h-[340px] w-full items-center justify-center overflow-hidden rounded-[36px] bg-linear-to-br from-primary-100 via-neutral-100 to-secondary-100 md:rounded-[40px]">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full border-[24px] border-primary-300/50 md:size-80" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-[20px] border-secondary-300/50 md:size-72" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-10 right-[12%] size-5 rounded-full bg-secondary-300 md:size-9" />
        <div className="relative z-10 mx-auto flex w-full max-w-[768px] flex-col items-center p-7 text-center">
          <div className="flex w-full flex-col items-center gap-1">
            <h2 id="talkshow-contact-title" className="font-heading text-h3 text-secondary-1000 md:text-h2">Contact Person</h2>
            <p className="font-body text-b2 text-neutral-800">Ada pertanyaan tentang Talkshow? Hubungi panitia melalui kanal resmi.</p>
          </div>
          <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 md:flex-row md:flex-wrap md:gap-6">
            {eventContacts.length > 0 ? eventContacts.map((contact) => (
              <a key={contact.id} href={contact.url} target="_blank" rel="noopener noreferrer" aria-label={`Hubungi ${contact.name} melalui ${contact.platform}`} className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-secondary-700 px-4 py-2 font-ui text-b3 font-bold text-secondary-1000 transition-colors hover:bg-secondary-100 active:bg-secondary-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 md:w-auto md:flex-1">
                <Icon icon={contact.icon} className="size-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{contact.contactLabel}</span>
              </a>
            )) : <span className="rounded-full bg-secondary-100 px-6 py-3 font-ui text-b3 font-bold text-secondary-1000">Kontak resmi menyusul</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TalkshowPage() {
  const { data } = useEvents();
  const now = useCurrentTime();
  const event = data?.events.find((item) => item.slug === "talkshow");
  const state = registrationState(event, data?.isDemo ?? true, now);

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate flex min-h-screen w-full flex-col items-center gap-16 overflow-x-clip bg-neutral-100 text-neutral-900 md:gap-24">
      <Image src="/images/events/ioe-talk-background-flow-aquatic.svg" alt="" aria-hidden="true" width={1440} height={1251} className="pointer-events-none absolute left-1/2 top-[8%] z-0 h-auto w-[180%] max-w-none -translate-x-1/2 object-contain md:top-0 md:w-full" />
      <Image src="/images/events/ioe-talk-photograph-aquatic.svg" alt="" aria-hidden="true" width={1440} height={1952} className="pointer-events-none absolute left-1/2 top-[15%] z-0 h-auto w-[180%] max-w-none -translate-x-1/2 object-contain md:w-full" />
      <TalkshowHero state={state} />
      <TalkshowDetails state={state} />
      <TalkshowSpeakers />
      <TalkshowRegistrationRecall state={state} />
      <TalkshowFaq />
      <TalkshowContact />
    </main>
  );
}
