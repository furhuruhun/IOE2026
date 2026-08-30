import type { CSSProperties, ReactNode } from "react";

// Teknik "gradient border via padding" — design_system_final.md baris 898 minta ini
// diekstrak jadi 1 komponen reusable (dipakai berulang di FannedCard/SpeakerCard/
// MyJourneyCard/Countdown Timer). Sebelum ini teknik cuma inline di CountdownTimer.tsx —
// diambil sebagai referensi implementasi, bukan hasil refactor CountdownTimer.tsx (di luar
// scope task ini, komponen lama dibiarkan apa adanya supaya tidak ada risiko regresi).
const DEFAULT_GRADIENT =
  "linear-gradient(135deg, color-mix(in oklch, var(--color-primary-300) 55%, white) 0%, var(--color-secondary-600) 55%, var(--color-tertiary-600) 100%)";

interface GradientBorderBoxProps {
  children: ReactNode;
  gradient?: string;
  padding?: string;
  outerRadius?: string;
  innerRadius?: string;
  innerBackground?: string;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

export function GradientBorderBox({
  children,
  gradient = DEFAULT_GRADIENT,
  padding = "2px",
  outerRadius = "12px",
  innerRadius = "15px",
  innerBackground = "var(--color-neutral-100)",
  className = "",
  innerClassName = "",
  style,
}: GradientBorderBoxProps) {
  return (
    <div
      className={className}
      style={{ padding, borderRadius: outerRadius, background: gradient, ...style }}
    >
      <div
        className={`flex size-full items-center justify-center ${innerClassName}`}
        style={{ borderRadius: innerRadius, background: innerBackground }}
      >
        {children}
      </div>
    </div>
  );
}
