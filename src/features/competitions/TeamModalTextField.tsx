import { forwardRef, type InputHTMLAttributes } from "react";
import { InlineFieldError } from "@/components/ui/InlineFieldError";

interface TeamModalTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Spec: design_system_final.md §Modal Create/Join Team — input pill (radius full), border
// neutral/300, focus border secondary/Default (#078EA4). SENGAJA tidak reuse
// components/ui/Input.tsx: Input.tsx pakai radius xl/2xl + focus neutral-1000 (base spec
// generik "Input.tsx tidak disebut eksplisit pakai varian radius pill" per komentarnya
// sendiri) — modal ini EKSPLISIT di-spec beda (pill + focus warna berbeda), pola yang sama
// seperti alasan Input.tsx tidak dipaksakan ke form Event Registration yang juga pill.
export const TeamModalTextField = forwardRef<HTMLInputElement, TeamModalTextFieldProps>(function TeamModalTextField(
  { label, error, id, className = "", ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-b3 font-bold text-secondary-1000">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`h-11 w-full rounded-full border bg-neutral-100 px-5 font-body text-b2 text-secondary-1000 placeholder-neutral-500 outline-none transition-colors duration-200 ${
          error ? "border-error-600" : "border-neutral-300 focus:border-secondary-600"
        } ${className}`}
        {...rest}
      />
      {error && <InlineFieldError message={error} id={errorId} />}
    </div>
  );
});
