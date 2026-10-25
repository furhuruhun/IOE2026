"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Icon } from "@iconify/react/offline";
import { useCalendar } from "@/hooks/useDashboard";
import { formatWibShortDate } from "@/utils/formatDate";
import { buildMonthGrid, wibDateKey } from "@/utils/calendarGrid";
import type { CalendarItem } from "@/types/dashboard";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WIB_MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  month: "long",
  year: "numeric",
});

// F-50/F-51 — CalendarWidget. Spec: design_system_final.md §CalendarWidget (baris 761-816).
// Grid & list bawah adalah 1 sumber data (GET /dashboard/calendar) — sesuai spec "Grid &
// list adalah 1 sumber data yang sama (1:1 mapping)".
export function DashboardCalendar() {
  const { data, isLoading, isFetching, isError, error, refetch } = useCalendar();
  const handleError = useErrorHandler();
  const [message, setMessage] = useState<string | null>(null);
  const dismiss = useCallback(() => setMessage(null), []);
  useEffect(() => {
    if (error) handleError(error, { onToast: setMessage, redirectTo: '/login?redirect=%2Fdashboard' });
  }, [error, handleError]);
  const items = useMemo(() => (isError ? [] : (data ?? [])), [isError, data]);

  const now = useMemo(() => new Date(), []);
  const todayKey = wibDateKey(now);
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: todayYear, month: todayMonth });

  const itemsByDateKey = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = wibDateKey(new Date(item.date));
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = WIB_MONTH_YEAR_FORMATTER.format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));

  const goPrev = () =>
    setCursor((c) => (c.month === 1 ? { year: c.year - 1, month: 12 } : { year: c.year, month: c.month - 1 }));
  const goNext = () =>
    setCursor((c) => (c.month === 12 ? { year: c.year + 1, month: 1 } : { year: c.year, month: c.month + 1 }));

  const sortedSchedule = useMemo(() => [...items].sort((a, b) => a.date.localeCompare(b.date)), [items]);
  const nowIso = now.toISOString();

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      {message && <Toast status="error" title={message} onDismiss={dismiss} />}
      <h2 className="text-center font-heading text-h4 text-neutral-1000 md:text-h3">Calendar</h2>

      <div
        className="flex w-full xl:min-h-[35rem] flex-col gap-6 rounded-3xl bg-neutral-100 p-4 text-secondary-1000 sm:p-5"

      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:calendar-range" className="size-6 sm:size-7" />
            <p className="font-heading text-b3">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous month"
              className="grid size-7 place-items-center rounded-full hover:bg-primary-100 sm:size-8"
            >
              <Icon icon="mdi:chevron-left" className="size-5 sm:size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next month"
              className="grid size-7 place-items-center rounded-full hover:bg-primary-100 sm:size-8"
            >
              <Icon icon="mdi:chevron-right" className="size-5 sm:size-6" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-primary-200 bg-neutral-200/40 p-2">
          <div className="mb-1.5 grid grid-cols-7 sm:mb-2">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="text-center font-ui text-[10px] font-bold leading-[1.7] sm:text-b4">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {grid.map((cell) => {
              const hasSchedule = itemsByDateKey.has(cell.key);
              const isToday = cell.key === todayKey;
              return (
                <button
                  key={cell.key}
                  type="button"
                  className="h-9 w-full rounded-full text-center font-ui text-b4 font-bold transition-colors hover:bg-primary-100"
                  style={{
                    opacity: cell.inCurrentMonth ? 1 : 0.2,
                    background: hasSchedule ? "var(--calendar-accent)" : "transparent",
                    color: hasSchedule ? "var(--color-neutral-100)" : "var(--color-secondary-1000)",
                    boxShadow: isToday && !hasSchedule ? "inset 0 0 0 1.5px var(--calendar-accent)" : undefined,
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* F-51 — list jadwal (bullet list) di bawah grid. Format API_CONTRACT.md
            "[Tanggal] - [Kode] – [Nama Kegiatan]" disederhanakan jadi "[Tanggal] –
            [label]" karena GET /dashboard/calendar cuma punya field `label` gabungan,
            bukan Kode+Nama terpisah (dicatat sebagai gap dokumen di CHANGELOG). Struktur
            visual (dot+garis vertikal) diadaptasi dari idiom TimelineSection.tsx yang
            sudah ada di codebase, per-item icon pakai logoUrl (fallback icon per type)
            bukan dot generik — sesuai spec "diferensiasi lewat logo, bukan warna/shape
            generik". */}
        <div className="flex flex-col gap-3">
          {isError && <div role="status" className="flex min-w-0 flex-col items-start gap-3">
          <p className="wrap-anywhere text-b3 text-neutral-700">Unable to load your schedule.</p>
          <Button size="sm" disabled={isFetching} onClick={() => { setMessage(null); void refetch(); }}>{isFetching ? 'Loading...' : 'Coba lagi'}</Button>
        </div>}
          {isLoading && <span role="status" className="sr-only">Loading schedule...</span>}
          {isLoading && <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-200" aria-hidden />}
          {!isLoading && !isError && sortedSchedule.length === 0 && (
            <p className="py-2 text-center text-b4" style={{ color: "var(--color-neutral-700)" }}>
              Belum ada jadwal.
            </p>
          )}
          {!isLoading && !isError &&
            sortedSchedule.map((item, i) => {
              const isPast = item.date < nowIso;
              const connectorColor = isPast ? "var(--color-neutral-700)" : "var(--calendar-accent)";
              return (
                <div key={`${item.refId}-${item.date}`} className="grid w-full grid-cols-[3rem_1.25rem_minmax(0,1fr)] gap-x-1">
                  <span className="self-center text-end font-ui text-b4 leading-tight">{formatWibShortDate(item.date)}</span>
                  <div className="relative flex min-h-10 w-5 justify-center self-stretch">
                    {i > 0 && (
                      <span className="absolute top-0 bottom-1/2 w-0.5" style={{ background: connectorColor }} aria-hidden />
                    )}
                    {i < sortedSchedule.length - 1 && (
                      <span className="absolute top-1/2 bottom-0 w-0.5" style={{ background: connectorColor }} aria-hidden />
                    )}
                    <span className="relative z-10 self-center">
                      {item.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- logoUrl dari klien, belum tentu domain ter-whitelist
                        <img src={item.logoUrl} alt="" className="size-5 rounded-full object-cover" />
                      ) : (
                        <Icon
                          icon={item.type === "competition" ? "mdi:trophy-outline" : "mdi:calendar-star"}
                          className="size-5"
                          style={{ color: "var(--calendar-accent)" }}
                        />
                      )}
                    </span>
                  </div>
                  <span className="min-w-0 self-center break-words py-1.5 font-ui text-b4 font-bold leading-tight">
                    {item.label}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
