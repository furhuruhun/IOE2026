"use client";

import { useId, useMemo, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { Icon } from "@iconify/react/offline";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

// Spec: design_system_final.md §Komponen → Button.
const VARIANT_STYLE: Record<ButtonVariant, CSSProperties & { waterFlowDuration: string }> = {
  primary: {
    background:
      "radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)",
    color: "#154B54",
    boxShadow: "0 8px 20px rgba(20,110,95,.25)",
    waterFlowDuration: "8s",
  },
  secondary: {
    background:
      "radial-gradient(circle at 30% 30%, #B5DDE4 0%, #9CD2DB 42%, #6ABBC8 80%), linear-gradient(90deg, #10616E 0%, #B5DDE4 33%, #9CD2DB 68%, #6ABBC8 100%)",
    color: "#154B54",
    waterFlowDuration: "8.6s",
  },
  ghost: {
    background: "rgba(154,210,219,.15)",
    color: "#3E3E3E",
    border: "1.5px solid #6ABBC8",
    waterFlowDuration: "0s",
  },
  destructive: {
    background:
      "radial-gradient(circle at 30% 30%, #FEE3D4 0%, #FDC0AB 42%, #FB9580 80%), linear-gradient(90deg, #75082E 0%, #FEE3D4 33%, #FDC0AB 68%, #FB9580 100%)",
    color: "#5F0726",
    waterFlowDuration: "7.4s",
  },
};

const SIZE_STYLE: Record<ButtonSize, { padding: string; fontSize: string; fontWeight: number }> = {
  sm: { padding: "6px 12px", fontSize: "13px", fontWeight: 600 },
  md: { padding: "11px 27px", fontSize: "16px", fontWeight: 600 },
  lg: { padding: "18px 44px", fontSize: "18px", fontWeight: 700 },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

// Hash string murni (bukan Math.random — React purity rule melarang impure call saat
// render, termasuk di dalam useMemo) supaya tiap instance Button dapat organicRadius
// yang "acak-terlihat" tapi stabil & deterministik dari useId().
function pseudoRandomFromSeed(seed: string, index: number): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return 40 + (hash % 21); // 40–60
}

// Ripple-on-click dan rising bubble particles (spec §Efek Akuatik 2 & 3) SENGAJA belum
// diimplementasikan di sini — disederhanakan ke spinner biasa untuk state loading/processing.
// Follow-up saat pass animasi (emil-design-eng). Lihat CHANGELOG.
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  style,
  ...rest
}: ButtonProps) {
  // organicRadius: deterministik dari useId() (stabil seumur hidup komponen, tidak
  // pernah re-randomize tiap render) — spec §Border Radius Button minta "generate sekali
  // & lock", tapi Math.random() di render body melanggar React purity rule, jadi dipakai
  // hash pure dari id komponen sebagai gantinya.
  const seed = useId();
  const radius = useMemo(() => {
    const values = Array.from({ length: 8 }, (_, i) => `${pseudoRandomFromSeed(seed, i)}%`);
    return `${values[0]} ${values[1]} ${values[2]} ${values[3]} / ${values[4]} ${values[5]} ${values[6]} ${values[7]}`;
  }, [seed]);

  const isDisabled = Boolean(disabled) || loading;
  const variantStyle = VARIANT_STYLE[variant];
  const sizeStyle = SIZE_STYLE[size];

  if (isDisabled && !loading) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-2 font-ui ${className}`}
        style={{
          borderRadius: radius,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          fontWeight: sizeStyle.fontWeight,
          color: "rgba(62,62,62,.5)",
          background: "transparent",
          border: "1.5px solid #D6D6D5",
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden font-ui ${className}`}
      style={{
        borderRadius: radius,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: sizeStyle.fontWeight,
        color: variantStyle.color,
        background: variantStyle.background,
        backgroundSize: "220% 220%, 320% 100%",
        boxShadow: variantStyle.boxShadow,
        border: variantStyle.border,
        animation: loading ? undefined : `waterFlow ${variantStyle.waterFlowDuration} ease-in-out infinite`,
        ...style,
      }}
      {...rest}
    >
      {/* glossy water-surface sheen — spec §Efek Akuatik 1 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(120deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.4) 50%, rgba(255,255,255,0) 72%)",
        }}
      />
      {loading && <Icon icon="mdi:loading" className="relative size-4 animate-spin" />}
      <span className="relative">{children}</span>
    </button>
  );
}
