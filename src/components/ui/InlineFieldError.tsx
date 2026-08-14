import { Icon } from "@iconify/react";

// Spec: design_system_final.md §Input — State Error.
export function InlineFieldError({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-b3 md:text-b2 text-error-600" role="alert">
      <Icon icon="mdi:alert" className="size-6 shrink-0 text-error-600" />
      {message}
    </p>
  );
}
