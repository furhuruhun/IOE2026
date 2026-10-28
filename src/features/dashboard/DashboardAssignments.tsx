"use client";

import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { Icon } from "@iconify/react/offline";
import { useAssignments } from "@/hooks/useDashboard";
import { sortByDeadline } from "@/utils/sortByDeadline";
import { formatWibDate } from "@/utils/formatDate";

// F-49 — open the documented activity view within /dashboard, without routing.
export function DashboardAssignments() {
  const open = useDashboardDetailStore(state => state.open);
  const { data, isLoading, isFetching, isError, error, refetch } = useAssignments();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (error) handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' }); }, [error, handleError]);
  const items = sortByDeadline(isError ? [] : (data ?? []));

  return (
    <section aria-label="Assignments" className="flex w-full min-w-0 flex-1 basis-32 flex-col gap-4">
      <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">My Preparation</h2>

      <div aria-busy={isFetching} className="flex min-h-32 w-full flex-1 flex-col gap-4 rounded-3xl bg-neutral-100 p-6 md:p-8">
        {isLoading && <div role="status"><p className="sr-only">Loading preparation...</p><div className="h-16 w-full animate-pulse rounded-xl bg-neutral-300 motion-reduce:animate-none" aria-hidden /></div>}
        {isError && <div className="flex flex-col items-start gap-3">
          <p role="status" className="text-b3 text-neutral-800">Unable to load your preparation.{message && <span className="mt-1 block">{message}</span>}</p>
          <Button size="sm" disabled={isFetching} onClick={() => { setMessage(null); void refetch(); }}>{isFetching ? "Loading..." : "Coba lagi"}</Button>
        </div>}

        {!isLoading && !isError && items.length === 0 && (
          <p className="py-2 text-center text-b3 text-neutral-700">No assignments yet. Check your competition details for available requirements.</p>
        )}

        {!isLoading &&
          items.map((item) => (
            <div
              key={item.requirementId}
              data-requirement-id={item.requirementId}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-secondary-300 px-4 py-3"
            >
              <Icon icon="mdi:trophy-outline" className="size-6 shrink-0 text-secondary-1000" />
              <div className="flex min-w-0 flex-1 basis-32 flex-col">
                <span className="wrap-anywhere text-b3 font-bold text-neutral-900">{item.competitionName}</span>
                <span className="wrap-anywhere text-b4 text-neutral-700">{item.name} — due {item.dueDate?.trim() && Number.isFinite(Date.parse(item.dueDate)) ? formatWibDate(item.dueDate) : "\u2014"}</span>
              </div>
              <button
                type="button"
                onClick={() => open(item.competitionSlug)}
                className="ui-action ui-action-secondary ui-action-sm shrink-0"
              >
                See Details
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
