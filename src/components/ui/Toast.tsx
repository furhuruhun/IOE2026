"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react/offline";

export type ToastStatus = "success" | "error" | "warning" | "info";

const STATUS_STYLES: Record<ToastStatus, { bg: string; icon: string }> = {
  success: { bg: "bg-success-600", icon: "mdi:check-circle" },
  error: { bg: "bg-error-600", icon: "mdi:close-circle" },
  warning: { bg: "bg-warning-500", icon: "mdi:alert" },
  info: { bg: "bg-secondary-600", icon: "mdi:information" },
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

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      className={`relative overflow-hidden rounded-[14px] px-[18px] py-4 pb-5 text-white shadow-xl backdrop-blur-md ${styles.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon icon={styles.icon} className="size-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {message && <p className="mt-0.5 text-[13px] leading-[17px] text-white/80">{message}</p>}
        </div>
        <button type="button" onClick={onDismiss} aria-label="Tutup notifikasi" className="text-white/70 hover:text-white">
          <Icon icon="mdi:close" className="size-4" />
        </button>
      </div>
    </div>
  );
}
