import Link from "next/link";
import { PasswordForm } from "@/features/auth/PasswordForm";
import { privateMetadata } from "@/lib/siteMetadata";

export const metadata = privateMetadata("Ubah password");

export default function ChangePasswordPage() {
  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[40rem] px-6 py-16">
    <Link href="/profile" className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> Kembali ke profil</Link>
    <h1 className="my-6 font-heading text-h3 text-secondary-1000">Keamanan akun</h1>
    <PasswordForm mode="change-password" />
  </main>;
}
