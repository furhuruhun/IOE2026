# Technical Constraints — FE Repo — Indonesia Ocean Expo (IOE) 2027

> Diturunkan dari PRD_IOE_2027 v4, DESIGN_SYSTEM, API_CONTRACT v1.1, ROUTES, USER_FLOWS v2, dan AUTH_IMPLEMENTATION.md.
> Item bertanda ✅ **sudah diputuskan/dikonfirmasi** (sumber dicantumkan).
> Item bertanda ⚠️ **masih perlu keputusan tim/klien**.

---

## Stack

- **Framework: Next.js + App Router** ✅ — dari `API_CONTRACT.md` (env var `.env.local`/`.env.staging`/`.env.production`) dan `DESIGN_SYSTEM.md` (referensi `next/font/google`). App Router dipilih karena middleware-based route guard dan Route Handlers untuk auth proxy.
- **Hosting: Cloudflare Pages** ✅ — diputuskan tim.
- **BE runtime: Cloudflare Workers** ✅ — diputuskan tim. FE tidak hit Workers langsung dari browser — semua lewat Next.js Route Handler proxy (lihat Auth Handling).
- **Styling: Tailwind CSS** ✅ — dari `DESIGN_SYSTEM.md` yang konsisten pakai utility class di seluruh spec komponen (`rounded-3xl`, `backdrop-blur-md`, `bg-clip-text`, dst) dan eksplisit menyebut spacing scale "mirip basis Tailwind". Semantic color tokens (`primary`, `secondary`, `tertiary`, `success`, `error`, `warning`, `neutral`, step 100–1000) di-setup sebagai CSS variables lalu di-extend ke `tailwind.config` — **komponen SELALU pakai token semantic, JANGAN pakai primitive palette langsung**.
- **Icon library: MDI via Iconify** ✅ — dari `DESIGN_SYSTEM.md` yang resolve ke satu standar MDI setelah sebelumnya campur 5 library. Pakai `@iconify/react` dengan prefix `mdi:`. **Jangan install `lucide-react`** meskipun sempat disebut di referensi desain — bukan keputusan final.
- **Headless component primitive: Radix UI** ✅ — minimal dipakai untuk Accordion di Registration Requirements (`DESIGN_SYSTEM.md`). Pertimbangkan standarisasi ke shadcn/ui (Radix + Tailwind) untuk komponen lain seperti Modal, Dropdown, Toast — daripada build primitive sendiri.
- **Server state (data dari API): TanStack Query** ✅ — diputuskan tim. Menangani loading/error/cache/refetch untuk semua data yang berasal dari Workers. Lihat detail setup di bagian API Integration.
- **UI state (bukan dari server): Zustand** ✅ — diputuskan tim. Dipakai untuk tiga kasus client-side state yang URL-nya sengaja tidak berubah: modal Create/Join Team di `/competitions/[slug]`, detail aktivitas di `/dashboard`, dan overlay rundown per SpeakerCard di `/events/[slug]`. Store dibuat per-feature (`useTeamModalStore`, `useDashboardDetailStore`, `useRundownStore`) — tidak satu store global.
- **Form handling: React Hook Form + Zod** ✅ — diputuskan tim. React Hook Form untuk semua form (register akun, Create/Join Team, Event Registration, Profile). Zod untuk schema validasi per field — termasuk validasi file format/ukuran sebelum upload, dan validasi shape mock data supaya konsisten dengan API_CONTRACT.md. Selain itu, consent checkbox adalah validasi client-side only — tidak ada field yang dikirim ke BE. Implementasi lewat React Hook Form: field consentPdp: boolean dengan validasi must be true di Zod schema, tombol submit disabled kalau field ini false
- **HTTP client: native `fetch`** ✅ — diputuskan tim. Dibungkus di layer `services/`, tidak ada `fetch()` langsung di komponen. Cukup untuk kebutuhan sekarang karena auth scheme sudah ditangani di Route Handler (tidak perlu interceptor global untuk attach token). Kalau nanti butuh retry logic global, evaluasi axios saat itu.

---

## Struktur Folder

```
src/
  app/                      # Next.js App Router
    (public)/               # landing, competitions, events, login, register
    (protected)/            # dashboard, profile, events/[slug]/register
    admin/                  # ⚠️ struktur sub-route TBD
    api/
      auth/
        login/route.ts      # proxy → Workers POST /auth/login
        register/route.ts   # proxy → Workers POST /auth/register
        google/route.ts     # proxy → Workers POST /auth/google
        logout/route.ts     # clear httpOnly cookie
        me/route.ts         # session bootstrap — baca cookie, validasi ke Workers
  components/               # reusable UI (Button, Card, Modal, Accordion, dst)
  features/
    auth/                   # login, register, Google OAuth
    competitions/           # overview, details, Create/Join Team modal
    events/                 # overview, details, registration form, rundown overlay
    dashboard/              # My Journey, Assignments, detail aktivitas (client-state view)
    profile/                # My Profile
    admin/                  # ⚠️ TBD
  services/                 # 1 file per resource — TIDAK ada fetch langsung di komponen
                            # authService.ts, competitionService.ts, teamService.ts,
                            # requirementService.ts, eventService.ts,
                            # profileService.ts, dashboardService.ts, adminService.ts
  mocks/                    # mock data JSON, struktur identik dengan API_CONTRACT.md
  hooks/                    # custom hooks (useAuth.ts, useCountdown.ts, dst)
  stores/                   # Zustand stores per-feature (kalau dipakai)
                            # useTeamModalStore, useDashboardDetailStore, useRundownStore
  lib/                      # server-only helpers
    api.ts                  # fetchWorkers() + cookie constants — JANGAN import dari komponen
  store/
    QueryProvider.tsx       # TanStack Query client setup, dipasang di root layout
    SessionBootstrap.tsx    # trigger useCurrentUser sekali di root, masukkan user ke cache
  types/
    auth.ts                 # shared types dari API_CONTRACT.md
  utils/                    # helper functions, formatter tanggal ISO 8601 → WIB display
  styles/                   # design tokens (CSS variables semantic), global styles
middleware.ts               # route guard — letakkan di root (satu level di atas src/)
```

---

## Naming Convention

- Komponen: PascalCase (`TiltedCard.tsx`, `FannedCard.tsx`)
- Hook: camelCase dengan prefix `use` (`useAuth.ts`, `useCountdown.ts`)
- File service: camelCase + suffix Service (`competitionService.ts`)
- Route group Next.js: `(public)` dan `(protected)` — memisahkan layout tanpa mengubah URL
- File server-only (tidak boleh di-import komponen): konvensi tambahkan komentar `// server-only` di baris pertama, atau pakai package `server-only` dari Next.js

---

## Environment Variables

| Var | Sisi | Fungsi | Contoh (dev) | Status |
|---|---|---|---|---|
| `WORKERS_API_URL` | **Server only** (tanpa `NEXT_PUBLIC_`) | Base URL Cloudflare Workers — tidak boleh bocor ke client bundle | `http://localhost:8000/api` | ✅ fix untuk dev lokal |
| `WORKERS_API_URL` | Server only | Staging | ⚠️ diisi mendekati deploy | ⚠️ |
| `WORKERS_API_URL` | Server only | Production | ⚠️ diisi mendekati deploy | ⚠️ |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google OAuth Client ID untuk tombol Google Sign-In | — | ⚠️ diisi klien/BE sebelum dev fitur login |

> **Catatan:** `NEXT_PUBLIC_API_URL` yang disebut di API_CONTRACT v1.0 digantikan oleh `WORKERS_API_URL` — env var lama itu untuk direct call dari browser, sekarang semua call ke Workers dilakukan server-side lewat Route Handler. Tidak ada lagi env var API yang di-expose ke client bundle.

---

## Auth Handling di FE

Keputusan final: **httpOnly cookie**, di-set oleh Next.js Route Handler, bukan oleh Workers langsung ke browser. Detail arsitektur dan langkah implementasi lengkap ada di `AUTH_IMPLEMENTATION.md`.

### Ringkasan arsitektur
```
Browser → fetch('/api/auth/*') → Next.js Route Handler → Cloudflare Workers
               ↑                         |
         cookie otomatis ikut      set httpOnly cookie
```
Browser tidak pernah melihat token. Workers tidak set cookie langsung — cukup kembalikan `{ token, user }` di body JSON, Next.js Route Handler yang set cookie ke browser.

### Kenapa pola ini
| Masalah | Solusi |
|---|---|
| Token hilang saat hard refresh | httpOnly cookie persist di browser |
| Token tidak boleh di localStorage (XSS risk) | httpOnly cookie tidak bisa dibaca JS |
| Domain Workers belum fix | Browser hanya kenal domain FE — tidak ada CORS issue |
| Session bootstrap saat hard refresh | `GET /api/auth/me` dipanggil `useCurrentUser` saat app mount |

### Hal penting untuk implementasi
- **`lib/api.ts` adalah server-only** — berisi `fetchWorkers()` dan cookie constants. Tidak boleh di-import dari komponen atau hooks client.
- **Token tidak pernah dikirim ke client** di response body Route Handler — hanya `user` object yang dikirim.
- **`/api/auth/me`** adalah kunci persist session: saat hard refresh, `SessionBootstrap` trigger `useCurrentUser` → hit `/api/auth/me` → Next.js baca cookie → validasi ke Workers → user masuk cache TanStack Query.
- **Redirect-back setelah login**: middleware set `?redirect=/path/tujuan` saat redirect ke `/login`. Hook `useLogin` dan `useGoogleLogin` baca query param ini di `onSuccess` dan push ke route tujuan.
- **Logout**: cukup clear cookie di `/api/auth/logout` (tidak perlu hit Workers kalau token stateless JWT). TanStack Query `queryClient.clear()` hapus semua cache di client.

### Force-auth di route Public (`/competitions/[slug]`)

`/competitions/[slug]` adalah route Public — **tidak** ada di daftar protected middleware (lihat AUTH_IMPLEMENTATION.md §7). Tapi F-43a tetap mewajibkan login sebelum modal Create/Join Team bisa dibuka.

- Guard dilakukan di **level komponen**, bukan middleware — cek `useIsLoggedIn()` saat tombol "Register" diklik
- Belum login → redirect manual ke `/login?redirect=/competitions/[slug]` (pola `?redirect=` sama dengan middleware, supaya konsisten dibaca oleh `useLogin`/`useGoogleLogin`)
- Sudah login → langsung buka modal Create/Join Team (client-state, tidak ganti route)
- Beda dengan `/events/[slug]/register` yang otomatis ter-guard middleware karena routenya sendiri protected

### Role dan admin route
- Field `role: 'peserta' | 'panitia'` ada di model `User` (API_CONTRACT v1.1) — dipakai hook `useIsAdmin()` untuk conditional rendering/redirect di komponen.
- Middleware hanya cek ada/tidaknya cookie (tidak decode role) supaya tidak ada roundtrip ke Workers di setiap request. Validasi role di level komponen dengan `useIsAdmin()`. Workers tetap return `403 ADMIN_ONLY` sebagai safety net.
- Kalau nanti ingin guard admin di middleware juga: simpan `role` sebagai JWT claim di Workers, decode di middleware dengan `jose` — tidak perlu hit Workers.

---

## API Integration (TanStack Query)

### Pola umum
- Semua fetch ke `/api/*` lewat layer `services/` — **tidak ada `fetch()` langsung di komponen**
- Service layer unwrap response dan throw error dengan `.code` dari API_CONTRACT kalau gagal
- TanStack Query hooks konsumsi service functions sebagai `queryFn` / `mutationFn`
- Query keys dikelompokkan per resource di satu objek (misal `authKeys`, `competitionKeys`) — jangan hardcode string di komponen

### Format response BE (API_CONTRACT.md)
- Sukses: `{ success: true, data: {...}, message: "string" }`
- Error: `{ success: false, error: { code: "string", message: "string" } }` — mapping `error.code` ke pesan user-facing via Error Code Reference di API_CONTRACT.md

### Mock data
- Selama Workers belum ready: gunakan data dari `mocks/`, struktur identik dengan API_CONTRACT.md
- Setelah Workers ready: ganti base URL di env var, tidak perlu ubah struktur kode

### Format tanggal
ISO 8601 dengan offset WIB (`2027-08-07T14:00:00+07:00`) dari Workers — buat satu util formatter yang konsisten dipakai di countdown dan kalender dashboard (F-50/F-51, kalender s.d. Mei 2027).

### Default TanStack Query config (QueryProvider)
- `staleTime: 1 menit` secara global — override per-query kalau dibutuhkan
- `retry: 1` — bukan 3x default
- `refetchOnWindowFocus: false` — override per-query kalau dibutuhkan (misal kalender yang perlu data fresh)

---

## File Upload — Aturan Global ✅ (dari API_CONTRACT.md)

| Aturan | Value |
|---|---|
| Metode | `multipart/form-data` |
| Field name default | `file` (kecuali: `cvFile`, `paymentProof` di `POST /events/:id/register`) |
| Batas ukuran | **500 KB** per file (final) |
| Trigger upload | **Auto-upload** begitu file di-drop/dipilih — tidak ada tombol Submit terpisah |
| Format — 5 item Registration Requirements standar | **JPG, PNG saja** (bukan PDF) |
| Format — Upload proposal/karya kompetisi | PDF, JPG, PNG |
| Format — CV di form Event Registration | **PDF only** ✅ dikonfirmasi |

**Lock area upload — dua kondisi independen, keduanya harus di-handle di FE:**

1. `status: accepted` → dropzone disabled permanen (`REQUIREMENT_LOCKED`). Pesan: *"Dokumen ini sudah disetujui dan tidak bisa diubah lagi"*
2. `dueDate` terlewati → dropzone disabled (`DEADLINE_PASSED`), **apapun status saat ini**. File lama tetap tersimpan. Pesan harus berbeda dari kondisi 1 — jelaskan soal deadline. Styling: `cursor: default`, bukan `pointer`.

FE SHOULD disable dropzone untuk kedua kondisi di atas secara proaktif (tidak mengandalkan error dari Workers saja).

---

## Toggle Visibility Tim ✅ (dikonfirmasi)

- **Private** (default saat tim dibuat): hanya bisa di-join lewat Team Code yang dibagikan manual
- **Public**: tim muncul di daftar dan bisa di-join langsung oleh user lain yang mendaftar kompetisi yang sama, tanpa perlu Team Code
- Toggle hanya bisa diubah oleh **Team Leader** dari halaman detail aktivitas di `/dashboard`
- User yang bukan Team Leader: toggle disembunyikan atau di-disable
- Endpoint: `PATCH /competitions/:id/team/visibility` — sudah ada di API_CONTRACT v1.1

---

## Client-side State vs Routing ✅ (dari ROUTES.md)

Tiga pattern berikut **sengaja tidak mengubah URL** — state hilang saat refresh, browser back keluar halaman, butuh tombol "Back" custom di UI:

1. Modal Create/Join Team di `/competitions/[slug]`
2. Detail aktivitas ("See Details") di `/dashboard`
3. Overlay "Lihat Rundown" per SpeakerCard di `/events/[slug]`

Sebaliknya, registrasi Event (`/events/[slug]/register`) adalah **navigasi route sungguhan** — jangan disamakan treatment-nya.

Kalau kebutuhan share-link/refresh-persist muncul nanti, migrasi ke query param (`/dashboard?activity=[slug]`) sudah diantisipasi di ROUTES.md. Desain state management dashboard sebaiknya mempertimbangkan migrasi ini dari awal supaya tidak perlu refactor besar.

---
---
## Guard Halaman `/confirmation` ✅ (dari ROUTES.md)

Route `/confirmation` bersifat Public, tapi **hanya boleh diakses sebagai hasil submit event registration** — bukan diakses langsung oleh user.

- **Trigger:** hanya dari flow Event Registration (`POST /events/:id/register` → response 201). Flow kompetisi (Create Team / Join Team / Join Public Team) tidak pernah redirect ke `/confirmation` — ketiganya redirect ke `/dashboard` (lihat USER_FLOWS_v2.md).
- **Mekanisme guard:** redirect ke `/confirmation` SHALL menyertakan query param `?from=registration`, contoh: `/confirmation?from=registration`.
- **Server-side check di halaman `/confirmation`:**
  - Kalau `searchParams.from === 'registration'` → tampilkan halaman seperti biasa
  - Kalau param tidak ada / tidak sesuai → `redirect('/')` (pakai `redirect()` dari `next/navigation`, dieksekusi di Server Component halaman)
- Tidak perlu guard tambahan di middleware — `/confirmation` tetap Public, cukup di-handle di level halaman.

---
---

## Browser & Device Support

- 2 versi terbaru Chrome, Safari, Firefox, Edge; mobile-first (Safari iOS) — sesuai NFR PRD §6
- Performance target (PRD §2.3): **LCP < 2.5s mobile, < 2.0s desktop**
- Accessibility (PRD §6): kontras warna WCAG AA minimum, form & dashboard navigable via keyboard — pastikan focus trap & aria attributes untuk Modal Create/Join Team dan Accordion Registration Requirements (Radix handle sebagian, perlu dicek manual)

---

## Ringkasan Open Items ⚠️

| # | Item | Blocker untuk apa |
|---|---|---|
| 1 | Struktur sub-route `/admin/*` — menunggu requirement gathering terpisah (PRD §12 #1) | Sprint Admin Panel |

> Open items sebelumnya yang sudah resolved:
> - ~~UI state library~~ → Zustand, diputuskan tim.
> - ~~Form handling library~~ → React Hook Form + Zod, diputuskan tim.
> - ~~HTTP client~~ → native `fetch`, diputuskan tim.
> - ~~Refresh/persist token~~ → httpOnly cookie + `/api/auth/me` Route Handler. Lihat `AUTH_IMPLEMENTATION.md`.
> - ~~Field `role` di response Auth/Profile~~ → ditambahkan di API_CONTRACT v1.1.
> - ~~Endpoint PATCH visibility tim~~ → ditambahkan di API_CONTRACT v1.1.
> - ~~Format CV~~ → PDF only, dikonfirmasi.
> - ~~Base URL staging/production~~ → tidak blocking, diisi mendekati deploy.

---

## Awareness — Item Belum Terselesaikan

| # | Item | Lokasi | Perlu dari siapa |
|---|---|---|---|
| A1 | **Struktur sub-route `/admin/*`** — satu-satunya open item teknis yang masih pending. Folder `features/admin/` dan `app/admin/` sudah di-placeholder di struktur folder, tapi isinya belum bisa didefinisikan | §Struktur Folder, §Open Items | Requirement gathering terpisah | -> pending saja dulu ini fitur dan halaman
| A2 | **Staging & Production `WORKERS_API_URL`** — belum ada. Tidak blocking dev lokal, tapi harus diisi sebelum deploy ke staging | §Environment Variables | Tim BE + Cloudflare setup | -> akan terisi saat BE deploy ke Cloudflare
| A3 | **Consent checkbox UU PDP** — PRD NFR §6 menyebut ini wajib di form registrasi, tapi belum ada di form fields §7 PRD, tidak ada di USER_FLOWS, dan tidak ada di API_CONTRACT request body. Perlu diputuskan scope-nya sebelum dev form registrasi akun dan event dimulai | §API Integration | Tim dev + klien | -> sudah selesai diputuskan
| A4 | **Durasi expiry JWT di Workers** — cookie FE di-set `maxAge: 7 hari`. Harus diselaraskan dengan nilai expiry JWT di BE Workers sebelum implementasi auth dimulai | §Auth Handling | Tim BE | -> sudah diputuskan dan sudah clear

