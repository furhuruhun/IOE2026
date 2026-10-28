"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEvent } from "@/hooks/useEvents";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ApiError } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Toast } from "@/components/ui/Toast";
import { formatWibDate } from "@/utils/formatDate";

const BACK_LINK = "inline-flex min-h-12 items-center rounded-lg border border-secondary-300 bg-neutral-100 px-lg py-sm font-ui text-b3 font-bold text-secondary-1000 hover:bg-secondary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800";

export function EventDetailPage({ slug }: { slug: string }) {
  const { data, isPending, isFetching, isError, error, refetch } = useEvent(slug);
  const now = useCurrentTime();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const dismiss = useCallback(() => setMessage(null), []);

  useEffect(() => {
    if (error && !(error instanceof ApiError && error.code === "NOT_FOUND")) {
      handleError(error, { onToast: setMessage, redirectTo: `/login?redirect=${encodeURIComponent(`/events/${slug}`)}` });
    }
  }, [error, handleError, slug]);

  if (error instanceof ApiError && error.code === "NOT_FOUND") notFound();

  const event = data?.event;
  const deadline = event ? new Date(event.deadline) : null;
  const hasDeadline = deadline !== null && Number.isFinite(deadline.getTime());
  // Demo fixtures never establish real membership or registration availability.
  const registered = !isError && !data?.isDemo && event?.isRegisteredByUser === true;
  const closed = !data?.isDemo && hasDeadline && now !== null && deadline!.getTime() <= now;
  const registrationLabel = registered ? "Sudah terdaftar" : closed ? "Pendaftaran ditutup" : "Register";
  const registrationMessage = registered
    ? "Kamu sudah terdaftar di event ini."
    : closed
      ? "Batas waktu pendaftaran telah berakhir."
      : "Informasi ketersediaan pendaftaran belum tersedia. Silakan cek kembali nanti.";

  return (
    <main id="main-content" tabIndex={-1} className="min-w-0 bg-neutral-100 [overflow-wrap:anywhere]">
      <div className="site-container py-lg">
        <Link href="/events" className={BACK_LINK}>Kembali ke daftar event</Link>
      </div>
      {message && <Toast status="error" title={message} onDismiss={dismiss} />}

      {isPending ? (
        <section role="status" aria-busy="true" aria-labelledby="event-loading" className="site-container section-space flex flex-col gap-lg">
          <h1 id="event-loading" className="font-heading text-h4 text-secondary-1000">Memuat detail event...</h1>
          <div aria-hidden="true" className="h-72 animate-pulse rounded-lg bg-secondary-100 motion-reduce:animate-none" />
        </section>
      ) : isError || !event ? (
        <section className="site-container section-space flex flex-col items-start gap-lg">
          <h1 className="font-heading text-h4 text-secondary-1000">Detail event belum dapat dimuat</h1>
          <p role="status" className="font-body text-b2 text-neutral-700">Silakan coba lagi untuk melihat informasi event.</p>
          <Button disabled={isFetching} onClick={() => { setMessage(null); void refetch(); }}>{isFetching ? "Memuat..." : "Coba lagi"}</Button>
        </section>
      ) : (
        <>
          <section aria-labelledby="event-title" className="section-space bg-linear-to-br from-secondary-900 via-secondary-700 to-secondary-1000 text-neutral-100">
            <div className="site-container grid min-w-0 items-center gap-2xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col items-start gap-lg">
                <p className="font-ui text-b3 font-bold text-primary-100">Event IOE 2027</p>
                <h1 id="event-title" className="max-w-full font-heading text-h3 md:text-h2 lg:text-h1">{event.name}</h1>
                {data.isDemo && <p role="note" className="rounded-lg border border-neutral-100/40 px-md py-sm font-body text-b3">Data contoh pengembangan. Nama dan batas pendaftaran belum merupakan informasi resmi.</p>}
                {registered && <p role="status" className="rounded-full bg-success-100 px-md py-sm font-ui text-b3 font-bold text-success-900">Sudah terdaftar</p>}
                <a href="#registration" className="ui-action ui-action-primary ui-action-sm">Informasi pendaftaran</a>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-lg text-center">
                <h2 className="font-heading text-h5">Batas pendaftaran{data.isDemo ? " (contoh)" : ""}</h2>
                {hasDeadline && now !== null ? <CountdownTimer key={event.deadline} targetDate={deadline!} variant="eventOverview" /> : <p className="font-body text-b3">{hasDeadline ? "Memuat countdown..." : "Batas pendaftaran belum tersedia."}</p>}
                <p className="font-body text-b3 text-neutral-200">Batas pendaftaran bukan tanggal pelaksanaan event.</p>
              </div>
            </div>
          </section>

          <div className="site-container section-space flex min-w-0 flex-col gap-2xl">
            <section aria-labelledby="event-about" className="flex flex-col gap-md">
              <h2 id="event-about" className="font-heading text-h4 text-secondary-1000 md:text-h3">Tentang event</h2>
              <p className="font-body text-b2 text-neutral-700">Deskripsi resmi event belum tersedia.</p>
            </section>

            <section aria-labelledby="event-benefits" className="rounded-lg border border-secondary-200 bg-secondary-100 p-lg md:p-xl">
              <h2 id="event-benefits" className="font-heading text-h4 text-secondary-1000 md:text-h3">What You&apos;ll Gain</h2>
              <p className="mt-md font-body text-b2 text-neutral-700">Informasi manfaat dan materi event belum tersedia.</p>
            </section>

            <section aria-labelledby="event-schedule" className="flex flex-col gap-md">
              <h2 id="event-schedule" className="font-heading text-h4 text-secondary-1000 md:text-h3">Timeline &amp; Rundown</h2>
              <p className="font-body text-b2 text-neutral-700">Jadwal pelaksanaan dan rundown event belum tersedia.</p>
            </section>

            <section aria-labelledby="event-speakers" className="flex min-w-0 flex-col gap-lg">
              <h2 id="event-speakers" className="font-heading text-h4 text-secondary-1000 md:text-h3">Speaker</h2>
              {event.speakers?.length ? (
                <ul className="grid min-w-0 gap-lg md:grid-cols-2">
                  {event.speakers.map(speaker => <li key={speaker.id} className="min-w-0 rounded-3xl border border-secondary-300 bg-secondary-100 p-lg md:p-xl">
                    <p className="font-ui text-b4 font-bold text-secondary-800">Speaker</p>
                    <h3 className="mt-sm font-heading text-h5 text-secondary-1000">{speaker.name}</h3>
                  </li>)}
                </ul>
              ) : <p className="font-body text-b2 text-neutral-700">Informasi speaker belum tersedia.</p>}
            </section>

            <section id="registration" aria-labelledby="event-registration" className="flex scroll-mt-28 flex-col items-start gap-lg rounded-lg border border-secondary-300 bg-secondary-100 p-lg md:p-xl">
              <h2 id="event-registration" className="font-heading text-h4 text-secondary-1000 md:text-h3">Pendaftaran</h2>
              {hasDeadline && <p className="font-body text-b3 text-neutral-700">Batas pendaftaran{data.isDemo ? " (contoh)" : ""}: <time dateTime={event.deadline}>{formatWibDate(event.deadline)} WIB</time></p>}
              <p id="registration-availability" role="status" className="font-body text-b2 text-neutral-800">{registrationMessage}</p>
              {/* No read contract establishes open/full availability. Keep the CTA
                  disabled until that boundary and the registration form are ready. */}
              <Button disabled aria-describedby="registration-availability">{registrationLabel}</Button>
              <Link href="/events" className={BACK_LINK}>Lihat event lainnya</Link>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
