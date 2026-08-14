import { Icon } from "@iconify/react";

type FormBannerVariant = "error" | "success" | "warning" | "info";

const VARIANT_STYLES: Record<FormBannerVariant, { bg: string; text: string; icon: string }> = {
  error: { bg: "bg-error-100", text: "text-error-1000", icon: "mdi:alert-circle" },
  success: { bg: "bg-success-100", text: "text-success-1000", icon: "mdi:check-circle" },
  warning: { bg: "bg-warning-100", text: "text-warning-1000", icon: "mdi:alert" },
  info: { bg: "bg-secondary-100", text: "text-secondary-1000", icon: "mdi:information" },
};

// Banner form-level (bukan field-level) — dipakai untuk error seperti TEAM_FULL,
// REGISTRATION_CLOSED, QUOTA_FULL. Lihat ERROR_HANDLING_FE.md §Kategori Treatment.
export function FormBanner({
  message,
  variant = "error",
}: {
  message: string;
  variant?: FormBannerVariant;
}) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`w-full rounded-lg px-3 py-2 flex items-start gap-2 ${styles.bg} ${styles.text}`} role="alert">
      <Icon icon={styles.icon} className="size-4 shrink-0 mt-0.5" />
      <p className="text-b3 font-semibold">{message}</p>
    </div>
  );
}
