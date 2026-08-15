import { Suspense } from "react";
import { LoginForm } from "@/features/auth/LoginForm";

// Route: /login. Public — redirect ke /dashboard kalau sudah ada sesi (src/proxy.ts).
// F-40, F-41.
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-h4 text-secondary-1000 md:text-h3">Login</h1>
        <p className="mt-2 text-b2 text-neutral-700">Masuk untuk melanjutkan pendaftaran IOE 2027.</p>
      </div>
      {/* useSearchParams (redirect-back, AUTH_IMPLEMENTATION.md) butuh Suspense boundary di App Router */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
