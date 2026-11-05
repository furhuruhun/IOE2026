import { PasswordForm } from "@/features/auth/PasswordForm";
import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = { ...privateMetadata("Reset password"), referrer: "no-referrer" as const };
export default function ResetPasswordPage() {
  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[32rem] px-6 py-16">
    <Link href="/login" className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> Kembali ke login</Link>
    <h1 className="my-6 font-heading text-h3 text-secondary-1000">Pemulihan akun</h1>
    <PasswordForm mode="reset-password" />
  </main>;
}
import Link from "next/link";
