import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = privateMetadata("Register");

// Route: /register. Public — redirect ke /dashboard kalau sudah ada sesi (src/proxy.ts).
// F-40, F-42.
export default function RegisterPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href="/login" className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> Kembali ke login</Link>
      <div className="text-center">
        <h1 className="text-h4 text-secondary-1000 md:text-h3">Register</h1>
        <p className="mt-2 text-b2 text-neutral-700">Buat akun untuk mendaftar kompetisi & event IOE 2027.</p>
      </div>
      {/* GoogleAuthButton di sini pakai useGoogleLogin() → useSearchParams, butuh Suspense */}
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
