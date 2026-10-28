"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEvent } from "@/hooks/useEvents";
import { useProfile } from "@/hooks/useProfile";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ApiError } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { RegistrationFoundationForm } from "./RegistrationFoundationForm";

const LINK_CLASS = "ui-action ui-action-secondary ui-action-sm";

export function RegistrationFoundationPage({ slug }: { slug: string }) {
  const event = useEvent(slug);
  const profile = useProfile();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const dismiss = useCallback(() => setMessage(null), []);
  const missingEvent = event.error instanceof ApiError && event.error.code === "NOT_FOUND";
  const redirectTo = `/login?redirect=${encodeURIComponent(`/events/${slug}/register`)}`;

  useEffect(() => {
    if (event.error && !missingEvent) handleError(event.error, { onToast: setMessage, redirectTo });
  }, [event.error, missingEvent, handleError, redirectTo]);
  useEffect(() => {
    if (profile.error && !missingEvent) handleError(profile.error, { onToast: setMessage, redirectTo });
  }, [profile.error, missingEvent, handleError, redirectTo]);

  if (missingEvent) notFound();

  return (
    <main id="main-content" tabIndex={-1} className="site-container section-space flex min-w-0 flex-col gap-lg [overflow-wrap:anywhere]">
      <nav aria-label="Registration navigation" className="flex flex-wrap gap-sm">
        <Link href={`/events/${encodeURIComponent(slug)}`} className={LINK_CLASS}>Kembali ke detail event</Link>
        <Link href="/events" className={LINK_CLASS}>Daftar event</Link>
      </nav>
      <h1 className="font-heading text-h4 text-secondary-1000 md:text-h3">{event.data ? `${event.data.event.name} — Registration` : "Event Registration"}</h1>
      {event.data?.isDemo && <p role="note" className="font-body text-b3 text-neutral-700">Informasi event menggunakan data contoh pengembangan.</p>}
      {message && <Toast status="error" title={message} onDismiss={dismiss} />}

      {event.isPending && <div role="status" className="flex flex-col gap-sm">
        <p className="font-body text-b3 text-neutral-700">Memuat event...</p>
        <div aria-hidden="true" className="h-20 animate-pulse rounded-xl bg-secondary-100 motion-reduce:animate-none" />
      </div>}
      {event.isError && <section aria-label="Event error" className="flex flex-col items-start gap-sm">
        <p role="status" className="font-body text-b3 text-neutral-700">Informasi event belum dapat dimuat.</p>
        <Button disabled={event.isFetching} onClick={() => { setMessage(null); void event.refetch(); }}>{event.isFetching ? "Memuat..." : "Coba lagi"}</Button>
      </section>}
      {profile.isPending && <div role="status" className="flex flex-col gap-sm">
        <p className="font-body text-b3 text-neutral-700">Memuat profil...</p>
        <div aria-hidden="true" className="h-40 animate-pulse rounded-xl bg-secondary-100 motion-reduce:animate-none" />
      </div>}
      {profile.isError && <section aria-label="Profile error" className="flex flex-col items-start gap-sm">
        <p role="status" className="font-body text-b3 text-neutral-700">Profil belum dapat dimuat.</p>
        <Button disabled={profile.isFetching} onClick={() => { setMessage(null); void profile.refetch(); }}>{profile.isFetching ? "Memuat..." : "Coba lagi"}</Button>
      </section>}
      {/* Retain the mounted form and its edits through background query errors/retries. */}
      {event.data && profile.data && <RegistrationFoundationForm key={slug} profile={profile.data} />}
    </main>
  );
}
