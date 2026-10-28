"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDashboardEvents } from '@/hooks/useDashboard';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { formatWibDate } from '@/utils/formatDate';

// API_CONTRACT §3.5 exposes registered membership, session type and date only.
// Do not derive approval/payment/attendance statuses from this list.
export function DashboardRegisteredEvents() {
  const { data, isLoading, isFetching, isError, error, refetch } = useDashboardEvents();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
  }, [error, handleError]);

  return (
    <section aria-labelledby="registered-events-heading" className="flex min-w-0 flex-col gap-6">
      <h1 id="registered-events-heading" className="wrap-anywhere font-heading text-h4 text-secondary-1000 md:text-h3">Registered Events</h1>
      <div aria-busy={isFetching} className="min-w-0 rounded-3xl bg-neutral-100 p-6 md:p-8">
        {isLoading ? (
          <div role="status" className="flex flex-col gap-4">
            <p className="text-b3 text-neutral-700">Loading registered events...</p>
            <div aria-hidden="true" className="h-24 animate-pulse rounded-xl bg-neutral-300 motion-reduce:animate-none" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-4">
            <p role="status" className="text-b3 text-neutral-700">Unable to load registered events.{message && <span className="mt-1 block">{message}</span>}</p>
            <Button size="sm" disabled={isFetching} onClick={() => { setMessage(null); void refetch(); }}>
              {isFetching ? 'Loading...' : 'Coba lagi'}
            </Button>
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-start gap-3"><p role="status" className="text-b3 text-neutral-800">No registered events yet.</p><Link href="/events" className="ui-action ui-action-secondary ui-action-sm">Events</Link></div>
        ) : (
          <ul className="flex min-w-0 flex-col gap-4">
            {data.map(event => (
              <li key={event.eventId} className="flex min-w-0 flex-wrap items-center gap-4 rounded-xl border border-secondary-300 p-4">
                <div className="min-w-0 flex-1 basis-32">
                  <h3 className="wrap-anywhere font-heading text-h6 text-secondary-1000">{event.name}</h3>
                  <p className="mt-2 wrap-anywhere text-b3 text-neutral-700">Session: {event.sessionType}</p>
                  <p className="mt-1 text-b3 text-neutral-700">Date: <time dateTime={event.date}>{formatWibDate(event.date)} WIB</time></p>
                </div>
                <Link href={`/events/${encodeURIComponent(event.slug)}`} aria-label={`See Details: ${event.name}`} className="ui-action ui-action-secondary ui-action-sm shrink-0">See Details</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
