"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuth";
import { useEventRegistrationStore } from "@/stores/useEventRegistrationStore";
import { buttonStyles } from "@/components/ui/Button";
import { isHiddenEvent } from "@/lib/eventVisibility";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";

export function RegistrationConfirmation() {
  const receipt = useEventRegistrationStore(state => state.receipt);
  const { data: user } = useCurrentUser();
  const confirmed = receipt && user?.id === receipt.participantId;
  const main = useRef<HTMLElement>(null);
  useEffect(() => { main.current?.focus(); }, []);

  return (
    <main ref={main} id="main-content" tabIndex={-1} aria-labelledby="confirmation-title" className="site-container section-space flex min-w-0 flex-col items-start gap-lg text-secondary-1000 [overflow-wrap:anywhere]">
      <section className="flex w-full flex-col gap-lg rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl">
        <h1 id="confirmation-title" className="font-heading text-h4 md:text-h3">{confirmed ? "Pendaftaran berhasil" : "Periksa status pendaftaran"}</h1>
        <p role="status" className="font-body text-b2 text-neutral-800">{confirmed
          ? `Pendaftaran ${receipt.eventName} berhasil diterima. Lihat event yang kamu ikuti di dashboard.`
          : "Halaman ini tidak dapat memastikan hasil pendaftaran setelah dimuat ulang atau dibuka langsung. Periksa dashboard sebelum mengirim pendaftaran kembali."}</p>
        <div className="flex flex-wrap gap-sm">
          <Link href="/dashboard" className={buttonStyles("primary")}>Lihat Dashboard</Link>
          {EVENTS_ENABLED && confirmed && !isHiddenEvent(receipt.slug) && <Link href={`/events/${encodeURIComponent(receipt.slug)}`} className={buttonStyles("secondary")}>Lihat detail event</Link>}
          {EVENTS_ENABLED && <Link href="/events" className={buttonStyles("secondary")}>Jelajahi event</Link>}
        </div>
      </section>
    </main>
  );
}
