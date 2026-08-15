import Link from "next/link";
import { Icon } from "@iconify/react/offline";

interface InlineFieldErrorProps {
  message: string;
  id?: string;
  action?: { label: string; href: string };
}

// Spec: design_system_final.md §Input — State Error.
// `action` dipakai untuk kasus seperti EMAIL_ALREADY_REGISTERED (ERROR_HANDLING_FE.md:
// "Tambahkan link/CTA 'Login di sini' di pesan yang sama").
export function InlineFieldError({ message, id, action }: InlineFieldErrorProps) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-b3 text-error-600 md:text-b2" role="alert">
      <Icon icon="mdi:alert" className="size-6 shrink-0 text-error-600" />
      <span>
        {message}
        {action && (
          <>
            {" "}
            <Link href={action.href} className="font-semibold underline underline-offset-2">
              {action.label}
            </Link>
          </>
        )}
      </span>
    </p>
  );
}
