"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/offline";

export type ToastStatus = "success" | "error" | "warning" | "info";

const STATUS_STYLES: Record<ToastStatus, { bg: string; icon: string }> = {
  success: { bg: "bg-success-900", icon: "mdi:check-circle" },
  error: { bg: "bg-error-800", icon: "mdi:close-circle" },
  warning: { bg: "bg-warning-900", icon: "mdi:alert" },
  info: { bg: "bg-secondary-900", icon: "mdi:information" },
};

export interface ToastProps {
  status: ToastStatus;
  title: string;
  message?: string;
  onDismiss: () => void;
  /** ms, default 5000 — spec design_system_final.md §Toast */
  duration?: number;
}

// Versi fungsional dari spec "Glass Ripple" Toast (design_system_final.md §Toast).
// Animasi penuh (ripple, water-flow, tide-drain progress bar) sengaja belum
// diimplementasikan pixel-perfect — follow-up saat pass desain/animasi (emil-design-eng).
export function Toast({ status, title, message, onDismiss, duration = 5000 }: ToastProps) {
  const styles = STATUS_STYLES[status];
  const dismiss = useRef(onDismiss);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);

  useEffect(() => {
    // Errors remain until dismissed. Interaction gives a fresh reading interval.
    if (status === "error" || duration <= 0 || hovered || focused) return;
    const timer = setTimeout(() => dismiss.current(), duration);
    return () => clearTimeout(timer);
  }, [duration, status, title, message, hovered, focused]);

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      className={`relative overflow-hidden rounded-[14px] px-[18px] py-4 pb-5 text-white shadow-xl backdrop-blur-md ${styles.bg}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon icon={styles.icon} className="size-4" />
        </div>
        <div className="min-w-0 flex-1 wrap-anywhere">
          <p className="text-sm font-semibold">{title}</p>
          {message && <p className="mt-0.5 text-[13px] leading-[17px] text-white">{message}</p>}
        </div>
        <button type="button" onClick={onDismiss} aria-label="Tutup notifikasi" className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <Icon icon="mdi:close" className="size-4" />
        </button>
      </div>
    </div>
  );
}
