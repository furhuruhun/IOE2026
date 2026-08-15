export type PasswordStrength = "lemah" | "sedang" | "kuat";

// USER_FLOWS_v2.md §Flow Registrasi Akun — Edge Cases: "Password lemah → tampilkan
// indikator kekuatan password sebelum submit". Heuristik di bawah tidak dispesifikasikan
// di dokumen manapun — asumsi wajar, sama seperti aturan minimal password di schemas.ts.
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;

  if (score <= 1) return "lemah";
  if (score <= 3) return "sedang";
  return "kuat";
}

export const PASSWORD_STRENGTH_STYLE: Record<PasswordStrength, { label: string; className: string }> = {
  lemah: { label: "Lemah", className: "text-error-600" },
  sedang: { label: "Sedang", className: "text-warning-600" },
  kuat: { label: "Kuat", className: "text-success-600" },
};
