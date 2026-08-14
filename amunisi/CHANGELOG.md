# Changelog — IOE 2027 FE

> Audit trail per-task, bukan changelog rilis versi biasa. Setiap task yang
> dikerjakan AI agent (atau developer) WAJIB menambahkan satu entry baru di
> bagian `## Unreleased`, ditulis SEBELUM task dianggap selesai.
>
> Format & aturan penulisan entry: lihat `CHANGELOG_AGENT_PROMPT.md`.
> File ini bersifat **append-only** — jangan hapus/rewrite entry lama kecuali
> diminta eksplisit oleh manusia.

---

## Unreleased

<!--
Entry baru ditambahkan DI SINI, paling atas (di bawah baris ini),
dengan format:

### [YYYY-MM-DD HH:mm] <Judul singkat perubahan>

- **Tipe:** Feature | Fix | Refactor | Config | Docs | Aborted
- **Scope:** <folder/module utama yang diubah>
- **Ringkasan:** 1-3 kalimat apa yang berubah dan kenapa.
- **File diubah:**
  - `path/to/file.ts` — apa yang berubah di file ini
- **Terkait requirement:** F-ID / route / endpoint yang relevan (kalau ada)
- **Breaking change:** Ya/Tidak — kalau Ya, jelaskan
- **Belum selesai / follow-up:** (kalau ada — termasuk kalau ada dokumen
  lain yang jadi tidak sinkron akibat perubahan ini)
-->

### [2026-08-14 20:35] Scaffold project Next.js dari nol + auth infra + design tokens dasar

- **Tipe:** Feature
- **Scope:** root project (seluruh `src/`, `proxy.ts`, config)
- **Ringkasan:** Inisialisasi project Next.js App Router (TypeScript, Tailwind v4, `src/` dir) sesuai stack di `TECHNICAL_CONSTRAINTS_FE.md`, lalu membangun struktur folder persis sesuai dokumen tsb, infra auth httpOnly-cookie lengkap sesuai `AUTH_IMPLEMENTATION.md`, design tokens (warna/spacing/radius/shadow/type scale) dari `design_system_final.md`, infra error handling sesuai `ERROR_HANDLING_FE.md`, dan halaman placeholder untuk seluruh route di `ROUTES.md`. Sebelumnya repo hanya berisi dokumen referensi, belum ada kode sama sekali.
- **File diubah:**
  - `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` — hasil `create-next-app` (TS, Tailwind, App Router, `src/`, import alias `@/*`), nama package diubah ke `ioe2027-fe`
  - `README.md` — diganti dari placeholder 1-baris ke deskripsi project + cara jalanin dev server
  - `src/app/globals.css` — semantic color tokens (primary/secondary/tertiary/success/error/warning/neutral, step 100–1000), spacing scale, radius scale, shadow scale, type scale (h1–h6, b1–b4) sebagai Tailwind v4 `@theme`, plus font family tokens
  - `src/app/layout.tsx` — load Inter/Montserrat/Plus Jakarta Sans via `next/font/google`, wire `QueryProvider` + `SessionBootstrap`, metadata judul/deskripsi IOE 2027
  - `src/types/auth.ts` — `User`, `ApiResponse`, request/response body types dari `API_CONTRACT.md`
  - `src/lib/api.ts` — `fetchWorkers()` server-only + cookie constants (`ioe_token`, maxAge 7 hari)
  - `src/app/api/auth/{register,login,google,logout,me}/route.ts` — Route Handler proxy ke Workers, set/clear httpOnly cookie, token tidak pernah dikirim ke client
  - `src/services/authService.ts` — layer fetch `/api/auth/*` dari client, `ApiError` dengan `.code`
  - `src/hooks/useAuth.ts` — `useCurrentUser`, `useLogin`, `useRegister`, `useGoogleLogin`, `useLogout`, `useUser`, `useIsLoggedIn`, `useIsAdmin`, redirect-back via `?redirect=`
  - `src/store/QueryProvider.tsx`, `src/store/SessionBootstrap.tsx` — TanStack Query client (staleTime 1 menit, retry 1, refetchOnWindowFocus false) + session bootstrap di root layout
  - `src/proxy.ts` — route guard (protected: `/dashboard`, `/profile`, `/admin/*`, `/events/[slug]/register`; auth routes `/login`,`/register` redirect kalau sudah login); `/competitions/[slug]` sengaja TIDAK di-guard di sini (force-auth level komponen)
  - `src/constants/errorMessages.ts` — mapping lengkap error code → treatment dari `ERROR_HANDLING_FE.md`
  - `src/hooks/useErrorHandler.ts` — hook terpusat eksekusi treatment (inline-field/inline-banner/toast/redirect-silent/redirect-message)
  - `src/components/ui/{Toast,InlineFieldError,FormBanner,PlaceholderPage}.tsx` — komponen dasar
  - `src/app/(public)/{page,competitions/page,competitions/[slug]/page,events/page,events/[slug]/page,login/page,register/page,confirmation/page}.tsx`, `src/app/(protected)/{dashboard/page,profile/page,events/[slug]/register/page}.tsx`, `src/app/admin/page.tsx` — placeholder page per route di `ROUTES.md`, konten belum dibangun
  - `src/app/(public)/confirmation/page.tsx` — guard `?from=registration` sudah aktif (server-side `redirect()`) sesuai `TECHNICAL_CONSTRAINTS_FE.md` §Guard Halaman /confirmation
  - `.env.local.example`, `.gitignore` — env var `WORKERS_API_URL` (server-only) + `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, exception `!.env.local.example` supaya file contoh tetap ter-track git
- **Terkait requirement:** F-40–F-43a (auth), F-52/F-57 (protected routes), F-53–F-54 + guard `/confirmation`, seluruh route map di `ROUTES.md`, semua error code di `API_CONTRACT.md` §Error Code Reference
- **Breaking change:** Tidak (project baru)
- **Belum selesai / follow-up:**
  1. **`middleware.ts` → `proxy.ts` — dokumen sumber jadi tidak sinkron.** `TECHNICAL_CONSTRAINTS_FE.md` §Struktur Folder dan `AUTH_IMPLEMENTATION.md` §7/§Struktur File menyebut `middleware.ts` di root. Next.js yang ter-install (16.3.1) mendeprekasi convention ini — file & function export harus `proxy.ts`/`export function proxy`, dan karena project pakai `src/` dir, filenya harus ada di **`src/proxy.ts`** (bukan root) supaya proxy benar-benar jalan (sudah diverifikasi manual: taruh di root = silent no-op, tidak redirect sama sekali, tidak ada error). Perilaku/logic guard tidak berubah, hanya lokasi+nama file+nama fungsi. **Kedua dokumen itu perlu diupdate manual oleh manusia.**
  2. **Coolvetica (font Headline H1-H6) belum di-self-host.** `design_system_final.md` bilang file `.woff2/.ttf` harus disediakan sendiri (tidak ada di Google Fonts). Sementara `--font-heading` fallback ke Montserrat Bold. Butuh file font resmi dari klien/desainer sebelum bisa diganti.
  3. **`text-h7` di spec FannedCard (`design_system_final.md`) tidak punya entry di tabel Type Scale** (yang cuma sampai h6). Token yang saya buat cuma h1–h6 dan b1–b4 (label b1-b4 juga inferensi dari "Paragraph Large/Medium/Small/Super Small", bukan penamaan eksplisit di dokumen). Perlu klarifikasi desainer sebelum FannedCard dibangun.
  4. **Type scale cuma pakai value "website/desktop"** dari tabel (karena begitu cara token dirujuk di spec komponen, misal "text-b4 (md) → text-b2 (xl)"). Value "mobile" di tabel yang sama belum di-wire ke breakpoint manapun — komponen yang butuh ukuran lebih kecil di mobile harus override manual per breakpoint saat dibangun (ada pola serupa di doc sendiri, contoh FannedCard yang campur arbitrary value + named token per breakpoint).
  5. **`src/constants/errorMessages.ts` tidak ada di struktur folder `TECHNICAL_CONSTRAINTS_FE.md`** — tapi eksplisit diminta oleh `ERROR_HANDLING_FE.md` §Implementasi di path yang sama persis. Folder `constants/` ditambahkan atas dasar itu (bukan pattern baru yang saya karang sendiri), tapi `TECHNICAL_CONSTRAINTS_FE.md` sebaiknya diupdate manual supaya kedua dokumen selaras.
  6. **Toast belum jadi global queue/provider** — `Toast.tsx` baru presentational (1 toast, terima props, auto-dismiss). Animasi penuh dari spec (glossy sheen, ripple masuk, water-flow, tide-drain progress bar) belum diimplementasikan pixel-perfect — sengaja disederhanakan dulu di tahap scaffold, follow-up saat pass desain/animasi (`emil-design-eng`). Belum ada keputusan soal toast queue manager (Zustand store baru? Context?) — **perlu ditanyakan ke user sebelum dibangun**, karena `stores/` di `TECHNICAL_CONSTRAINTS_FE.md` cuma nyebut 3 store spesifik (`useTeamModalStore`, `useDashboardDetailStore`, `useRundownStore`), tidak termasuk toast.
  7. Seluruh halaman route masih **placeholder teks**, belum ada UI/komponen visual sesuai `design_system_final.md` (HeroCarousel, TiltedCard, FannedCard, SpeakerCard, CalendarWidget, dst) — menunggu task fitur per halaman berikutnya.
  8. `WORKERS_API_URL` staging/production, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — masih placeholder kosong di `.env.local`, sesuai catatan awareness yang sudah ada di `API_CONTRACT.md`/`AUTH_IMPLEMENTATION.md` (belum diterima dari klien/tim BE).
  9. **File referensi di `amunisi/`** (`ROUTES (2).md`, `API_CONTRACT (2).md`, `USER_FLOWS_v2 (2).md`, `TECHNICAL_CONSTRAINTS_FE (1).md`) sengaja dibiarkan apa adanya sesuai keputusan user — nama file dengan suffix duplikat belum dirapikan ke `ROUTES.md`/`API_CONTRACT.md`/dst di root seperti yang diasumsikan `CLAUDE.md` §Dokumen Rujukan.

---

## Riwayat Rilis

<!--
Kalau project sudah mulai deploy ke staging/production, entry-entry di atas
"## Unreleased" bisa dipindahkan ke sini per tanggal rilis, dikelompokkan
seperti contoh di bawah. Ini opsional — dipakai kalau tim butuh pemisahan
"belum dirilis" vs "sudah live".

## [2026-09-01] Rilis Staging #1
(entry-entry yang sudah masuk staging dipindah ke sini)
-->
