"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Icon } from "@iconify/react/offline";
import { InlineFieldError } from "./InlineFieldError";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: string;
  // Opt-in show/hide toggle untuk type="password" — tidak ada di spec design_system_final.md
  // §Input, ditambahkan sebagai UX yang wajar & rendah risiko (bukan token desain baru).
  // Lihat CHANGELOG untuk catatan follow-up.
  revealable?: boolean;
}

// Spec: design_system_final.md §Komponen → Input (base spec — LoginForm/RegisterForm
// tidak disebut eksplisit pakai varian radius pill (Event Registration) atau
// rounded-xl/2xl (ProfileForm), jadi dipakai base spec-nya langsung. Lihat CHANGELOG.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, revealable, id, className = "", disabled, type, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  const errorId = error ? `${inputId}-error` : undefined;
  const [visible, setVisible] = useState(false);
  const showToggle = revealable && type === "password";
  const resolvedType = showToggle ? (visible ? "text" : "password") : type;

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
          type={resolvedType}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`h-[42px] w-full bg-transparent font-body text-b3 text-secondary-1000 placeholder-neutral-500 outline-none disabled:cursor-not-allowed md:h-12 md:text-b2 ${
            icon ? "pl-10 md:pl-[52px]" : "pl-3 md:pl-4"
          } ${showToggle ? "pr-10 md:pr-13" : "pr-3 md:pr-4"} ${className}`}
          {...rest}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
            className={`absolute top-1/2 right-3 -translate-y-1/2 md:right-4 [&_svg]:size-5 md:[&_svg]:size-7 ${
              error ? "text-neutral-1000" : "text-neutral-500 group-focus-within:text-neutral-1000"
            }`}
          >
            <Icon icon={visible ? "mdi:eye-off-outline" : "mdi:eye-outline"} />
          </button>
        )}
      </div>
      {error && <InlineFieldError message={error} id={errorId} />}
    </div>
  );
});
