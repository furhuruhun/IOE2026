"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@iconify/react/offline";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "text";
export type ButtonSize = "sm" | "md" | "lg";

// Navigation links share the visual hierarchy and retain native link behavior.
export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `ui-action ui-action-${variant} ui-action-${size}`;
}
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}
export function Button({ variant = "primary", size = "md", loading = false,
  disabled, className = "", children, type = "button", ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={`${buttonStyles(variant, size)} ${className}`}>
      {loading && <Icon icon="mdi:loading" className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {children}
    </button>
  );
}
