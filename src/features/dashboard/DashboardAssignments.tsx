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
    <section aria-label="Assignments" className="flex w-full min-w-0 flex-col">
      <div className="flex h-16 items-end justify-center py-4 md:h-24">
        <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">My Preparation</h2>
      </div>

      <div aria-busy={isFetching} className="flex w-full flex-col gap-3 rounded-xl bg-neutral-100 p-6 shadow-sm">
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
              className="flex min-w-0 flex-col items-stretch gap-4 rounded-[18px] border border-secondary-300 px-4 py-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-100">
                  <Icon icon="mdi:trophy-outline" className="size-6 text-secondary-1000" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="wrap-anywhere text-b3 font-bold text-neutral-900">{item.competitionName}</span>
                  <span className="wrap-anywhere text-b4 text-neutral-700">{item.name} — due {item.dueDate?.trim() && Number.isFinite(Date.parse(item.dueDate)) ? formatWibDate(item.dueDate) : "\u2014"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => open(item.competitionSlug)}
                className="ui-action ui-action-secondary ui-action-sm w-full sm:w-auto sm:shrink-0"
              >
                See Details
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
