"use client";

import { useDashboardDetailStore } from '@/stores/useDashboardDetailStore';
import { useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Icon } from "@iconify/react/offline";
import { useAssignments } from "@/hooks/useDashboard";
import { formatWibDate } from "@/utils/formatDate";

// F-49 — open the documented activity view within /dashboard, without routing.
export function DashboardAssignments() {
  const open = useDashboardDetailStore(state => state.open);
  const { data, isLoading, isError, error, refetch } = useAssignments();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (error) handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' }); }, [error, handleError]);
  const items = isError ? [] : (data ?? []);

  return (
    <section aria-label="Assignments" className="flex w-full min-w-0 flex-1 basis-32 flex-col gap-4">
      {message && <Toast status="error" title={message} onDismiss={() => setMessage(null)} />}
      {isError && <Button onClick={() => { void refetch(); }}>Coba lagi</Button>}
      <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">My Preparation</h2>

      <div className="flex min-h-80 w-full flex-1 flex-col gap-4 rounded-3xl bg-neutral-100 p-6 md:p-8">
        {isLoading && <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-300" aria-hidden />}

        {!isLoading && !isError && items.length === 0 && (
          <p className="py-2 text-center text-b3 text-neutral-600">No assignments yet.</p>
        )}

        {!isLoading &&
          items.map((item) => (
            <div
              key={item.requirementId}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-secondary-300 px-4 py-3"
            >
              <Icon icon="mdi:trophy-outline" className="size-6 shrink-0 text-secondary-1000" />
              <div className="flex min-w-0 flex-1 basis-32 flex-col">
                <span className="truncate text-b3 font-bold text-neutral-900">{item.competitionName}</span>
                <span className="wrap-anywhere text-b4 text-neutral-600">{item.name} — due {formatWibDate(item.dueDate)}</span>
              </div>
              <button
                type="button"
                onClick={() => open(item.competitionSlug)}
                className="shrink-0 rounded-full bg-neutral-300 px-5 py-3 font-ui text-b4 font-bold text-secondary-1000 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-secondary-600"
              >
                See Details
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}
