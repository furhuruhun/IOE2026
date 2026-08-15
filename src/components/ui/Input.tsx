"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon } from "@iconify/react/offline";
import { InlineFieldError } from "./InlineFieldError";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: string;
}

// Spec: design_system_final.md §Komponen → Input (base spec — LoginForm/RegisterForm
// tidak disebut eksplisit pakai varian radius pill (Event Registration) atau
// rounded-xl/2xl (ProfileForm), jadi dipakai base spec-nya langsung. Lihat CHANGELOG.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, id, className = "", disabled, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-b3 font-bold text-secondary-1000">
        {label}
      </label>
      <div
        className={`group relative overflow-hidden rounded-xl border transition-colors duration-200 md:rounded-2xl ${
          error ? "border-error-600" : "border-neutral-500 focus-within:border-neutral-1000"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {icon && (
          <Icon
            icon={icon}
            className={`pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 md:left-[52px] md:size-7 ${
              error ? "text-neutral-1000" : "text-neutral-500 group-focus-within:text-neutral-1000"
            }`}
          />
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`h-[42px] w-full bg-transparent font-body text-b3 text-secondary-1000 placeholder-neutral-500 outline-none disabled:cursor-not-allowed md:h-12 md:text-b2 ${
            icon ? "pl-10 md:pl-[52px]" : "pl-3 md:pl-4"
          } pr-3 md:pr-4 ${className}`}
          {...rest}
        />
      </div>
      {error && <InlineFieldError message={error} id={errorId} />}
    </div>
  );
});
