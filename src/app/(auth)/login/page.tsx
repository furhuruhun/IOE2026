import { Suspense } from "react";
import { Icon } from "@iconify/react/offline";
import { LoginForm } from "@/features/auth/LoginForm";

// Route: /login. Public — redirect ke /dashboard kalau sudah ada sesi (src/proxy.ts).
// F-40, F-41.
//
// Layout dua kolom (form + panel dekoratif) di-adaptasi dari referensi visual yang user kasih
// (lihat diskusi task) — TAPI referensi itu halaman produksi asli COMPFEST 18 (SSO login page),
// termasuk aset gambar (glow/mascot) yang di-hotlink dari S3 bucket mereka sendiri. Ikut pola
// yang sama seperti src/app/not-found.tsx: proporsi/struktur layout diambil, TAPI font/warna
// disesuaikan penuh ke token design_system_final.md, dan aset gambar yang tidak dimiliki project
// ini diganti gradient + icon placeholder (bukan gambar asing/hasil karang sendiri). Lihat
// CHANGELOG untuk keputusan detail (reset-password link sengaja tidak dibuat — tidak ada di
// ROUTES/PRD/USER_FLOWS/API_CONTRACT).
export default function LoginPage() {
  return (
    <main className="relative flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col justify-center gap-8 px-6 py-16 md:w-1/2 md:flex-none md:px-16 lg:px-24">
        {/* max-w-[24rem] (bukan max-w-sm) — --spacing-sm kustom membayangi container scale
            bawaan Tailwind untuk key "sm", lihat CHANGELOG. */}
        <div className="w-full max-w-[24rem]">
          <h1 className="font-heading text-h4 text-secondary-1000 md:text-h2">Welcome!</h1>
          <p className="mt-2 text-b3 text-neutral-700 md:text-b2">
            Masuk untuk melanjutkan pendaftaran IOE 2027.
          </p>
        </div>
        {/* useSearchParams (redirect-back, AUTH_IMPLEMENTATION.md) butuh Suspense boundary di App Router */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Panel dekoratif — desktop only, sama pola dengan not-found.tsx: gradient akuatik dari
          token project (bukan gambar), plus satu icon motif ocean/journey sebagai centerpiece
          (mdi:sail-boat, sengaja beda dari mdi:compass-off di not-found.tsx). */}
      <div
        aria-hidden
        className="relative hidden flex-1 items-center justify-center overflow-hidden md:flex"
        style={{ background: "linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 25% 25%, color-mix(in oklch, var(--color-primary-600) 40%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in oklch, var(--color-tertiary-600) 35%, transparent) 0%, transparent 55%)",
          }}
        />
        <div className="relative flex size-64 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 via-secondary-300 to-tertiary-300 opacity-90 shadow-2xl lg:size-80">
          <Icon icon="mdi:sail-boat" className="size-28 text-secondary-1000 lg:size-36" />
        </div>
      </div>
    </main>
  );
}
