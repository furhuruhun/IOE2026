"use client";

import { Fragment, useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";

interface CountdownTimerProps {
  targetDate: Date;
  /** Opt-in visual details for the Event Overview hero; other uses keep their current styling. */
  variant?: "default" | "eventOverview" | "shortCourse";
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const diffMs = Math.max(0, targetDate.getTime() - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
  hour12: false,
});

function formatTargetLabel(targetDate: Date): string {
  const parts = DATE_LABEL_FORMATTER.formatToParts(targetDate);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} WIB`;
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

// Spec: design_system_final.md §Countdown Timer — ITERASI KE-3, nilai final hasil ekstraksi
// LITERAL dari kode referensi (bukan lagi placeholder [token terang]/[token gelap]/
// drop-shadow-light dari iterasi sebelumnya). Lihat CHANGELOG untuk riwayat iterasi 1 & 2.
//
// ⚠️ Kontradiksi internal di dalam section spec yang sama, dilaporkan (bukan ditebak diam-
// diam): "Icon label tanggal target" bilang final = `mdi:timer` ("✅ final ... BUKAN
// mdi:timer-outline seperti versi draft sebelumnya"), TAPI paragraf "Label tanggal target"
// beberapa baris di bawahnya masih menyebut `mdi:timer-outline` + contoh tanggal lama
// "17 Jun 2026" (tidak match EVENT_DATE 5 Feb 2027 yang sudah dikonfirmasi final) — sepertinya
// sisa teks draft lama yang belum terhapus saat revisi. Dipakai `mdi:timer` sesuai instruksi
// eksplisit yang lebih detail & lebih baru.
export function CountdownTimer({ targetDate, variant = "default" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));
  const isEventOverview = variant === "eventOverview";
  const isShortCourse = variant === "shortCourse";
  const hourDigits = String(timeLeft.hours).length;
  const overviewHoursSize = hourDigits >= 5
    ? "text-b2 md:text-h5"
    : hourDigits >= 4 ? "text-h6 md:text-h4" : "text-h4 md:text-h3";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
      if (isShortCourse && Date.now() >= targetDate.getTime()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, isShortCourse]);

  if (isShortCourse) {
    return (
      <div className="flex flex-col items-center gap-8 mb-8">
        <span className="flex gap-2 items-center font-ui font-bold text-neutral-100 md:text-s5">
          <Icon icon="mdi:timer" className="size-5 shrink-0" aria-hidden="true" />
          {formatTargetLabel(targetDate)}
        </span>
        <div className="flex items-center gap-3">
          {UNITS.map((unit, i) => (
            <Fragment key={unit.key}>
              {i > 0 && (
                <div className="flex flex-col gap-5" aria-hidden="true">
                  <span className="size-2 rounded-full bg-neutral-100" />
                  <span className="size-2 rounded-full bg-neutral-100" />
                </div>
              )}
              <div className="size-18 md:size-28 p-0.5 rounded-full bg-linear-to-br from-primary-300 via-secondary-600 to-tertiary-600 shadow-md">
                <div className="size-17 md:size-27 rounded-full flex flex-col items-center justify-center bg-linear-to-b from-primary-500 to-primary-1000 text-neutral-100 md:gap-0.5">
                  <span className="font-ui text-s6 md:text-s5">{unit.label}</span>
                  <div className="h-px w-10 md:w-17.5 bg-neutral-100/70" aria-hidden="true" />
                  <span className="font-heading text-h4 md:text-h3 tabular-nums" suppressHydrationWarning>{pad2(timeLeft[unit.key])}</span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-sm">
      <p className="flex items-center gap-1.5 font-ui text-b4 font-bold text-neutral-100 md:text-b3">
        <Icon icon="mdi:timer" className="size-4 md:size-5" />
        {formatTargetLabel(targetDate)}
      </p>

      <div className="flex items-center">
        {UNITS.map((unit, i) => (
          <div key={unit.key} className="flex items-center">
            {/* Outer ring — gradient border via padding, box-shadow: var(--shadow-md) (final,
                bukan lagi "drop-shadow-light" placeholder) */}
            <div
              className={`flex items-center justify-center rounded-full p-0.5 shadow-md ${isShortCourse ? "size-[60px] min-[380px]:size-[72px] lg:size-[112px]" : "size-[72px] md:size-[112px]"}`}
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-300) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)",
              }}
            >
              {/* Inner circle — final: primary-500 (terang) -> primary-1000 (gelap) */}
              <div
                className="flex size-full flex-col items-center justify-center gap-0.5 rounded-full"
                style={{ background: "linear-gradient(to bottom, var(--color-primary-500), var(--color-primary-1000))" }}
              >
                <span className="font-ui text-b4 text-neutral-100">{unit.label}</span>
                <span className={`h-px bg-neutral-100/40 ${isEventOverview ? "w-10 md:w-[70px]" : "w-4"}`} aria-hidden />
                {/* suppressHydrationWarning: nilai ini SAH beda antara SSR-render dan client
                    hydrate (live clock) — pola resmi React untuk timestamp/clock. */}
                <span className={`font-heading text-neutral-100 ${isEventOverview ? `tabular-nums ${unit.key === "hours" ? overviewHoursSize : "text-h4 md:text-h3"}` : isShortCourse ? "text-h6 lg:text-h3" : "text-h6 md:text-h3"}`} suppressHydrationWarning>
                  {pad2(timeLeft[unit.key])}
                </span>
              </div>
            </div>

            {i < UNITS.length - 1 && (
              <div className={`flex flex-col ${isShortCourse ? "mx-0.5 min-[380px]:mx-1 lg:mx-3" : "mx-2 md:mx-3"} ${isEventOverview ? "gap-5" : "gap-1"}`} aria-hidden>
                <span className="size-2 rounded-full bg-neutral-100/70" />
                <span className="size-2 rounded-full bg-neutral-100/70" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
