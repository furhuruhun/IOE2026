# Auth Implementation Guide — IOE 2027

> Dokumen ini menjelaskan arsitektur dan langkah implementasi auth FE untuk
> **mekanisme refresh/persist token saat hard refresh**, dengan stack:
> Next.js App Router + TanStack Query + Cloudflare Pages (FE) + Cloudflare Workers (BE).
> Keputusan yang diambil: token disimpan di **httpOnly cookie**, di-set oleh Next.js Route Handler (bukan Workers langsung ke browser).

---

## Arsitektur

```
Browser
  │
  │  fetch('/api/auth/*')        ← cookie ikut otomatis di setiap request
  ▼
Next.js Route Handlers           ← httpOnly cookie di-set/clear di sini
  │
  │  fetch(WORKERS_API_URL)      ← Authorization: Bearer <token>
  │  (server-to-server)
  ▼
Cloudflare Workers (BE)
```

**Kenapa pakai pola proxy Route Handler, bukan hit Workers langsung dari browser?**

| Masalah | Kalau hit Workers langsung | Dengan proxy Route Handler |
|---|---|---|
| Domain BE belum fix | httpOnly cookie tidak bisa di-set cross-domain | Tidak ada masalah — browser hanya kenal domain FE |
| CORS | Perlu konfigurasi CORS di Workers | Tidak ada CORS — request browser hanya ke Next.js |
| Token exposed ke JS | Kalau pakai localStorage → XSS risk | Token tidak pernah menyentuh JS client |
| Hard refresh | Token di memory hilang | Cookie persist di browser, token divalidasi ulang via `/api/auth/me` |

---

## Environment Variables yang dibutuhkan

| Var | Sisi | Fungsi | Contoh (dev) |
|---|---|---|---|
| `WORKERS_API_URL` | **Server only** (tanpa `NEXT_PUBLIC_`) | Base URL Cloudflare Workers — tidak boleh bocor ke client bundle | `http://localhost:8000/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google OAuth Client ID untuk tombol Google Sign-In | dari Google Console |

Tambahkan `WORKERS_API_URL` ke `.env.local` (dev) dan Cloudflare Pages environment variables (staging/production). `NEXT_PUBLIC_API_URL` yang sebelumnya disebut di API_CONTRACT v1.0 **sudah digantikan** oleh `WORKERS_API_URL` — tidak ada lagi env var API yang di-expose ke client bundle.

---

## Struktur File yang Perlu Dibuat

```
src/
  types/
    auth.ts                     # Shared types dari API_CONTRACT.md (User, request/response shapes)
  lib/
    api.ts                      # fetch helper server-only: forward request ke Workers + cookie constants
  app/
    api/auth/
      register/route.ts         # POST /api/auth/register
      login/route.ts            # POST /api/auth/login
      google/route.ts           # POST /api/auth/google
      logout/route.ts           # POST /api/auth/logout
      me/route.ts               # GET  /api/auth/me  ← kunci untuk persist session saat hard refresh
  services/
    authService.ts              # Semua fetch ke /api/auth/* — satu-satunya yang boleh dipakai komponen
  hooks/
    useAuth.ts                  # TanStack Query hooks (useCurrentUser, useLogin, useLogout, dst)
  store/
    QueryProvider.tsx           # TanStack Query client setup, dipasang di root layout
    SessionBootstrap.tsx        # Trigger useCurrentUser sekali di root, masukkan user ke cache
  middleware.ts                 # Route guard berbasis cookie (di root, satu level di atas src/)
```

---

## Langkah Implementasi

### 1. Buat `src/types/auth.ts`

Definisikan semua types yang diturunkan dari API_CONTRACT.md — `User`, `UserRole`, shape request body (register, login, google), dan shape response dari BE. File ini tidak punya logic apapun, murni type definitions.

Yang penting ada di sini:
- `User` object sesuai model di API_CONTRACT — **pastikan field `role: 'peserta' | 'panitia'` ada**, ini yang dipakai middleware dan komponen untuk guard admin route
- `ApiSuccessResponse<T>` dan `ApiErrorResponse` sesuai format response global di API_CONTRACT
- Request body types untuk tiap endpoint auth

---

### 2. Buat `src/lib/api.ts`

File ini **server-only** — tidak boleh di-import dari komponen atau hooks client.

Yang perlu ada:
- Fungsi `fetchWorkers(path, options)` — forward request ke `WORKERS_API_URL` dengan header `Authorization: Bearer <token>` kalau token tersedia
- Konstanta nama cookie: `COOKIE_NAME = 'ioe_token'`
- Konstanta opsi cookie:
  - `httpOnly: true`
  - `secure: true` hanya di production (`process.env.NODE_ENV === 'production'`)
  - `sameSite: 'lax'`
  - `path: '/'`
  - `maxAge: 60 * 60 * 24 * 7` (7 hari — **sesuaikan dengan expiry JWT di Workers**)
- Konstanta opsi cookie untuk clear (logout): sama seperti di atas tapi `maxAge: 0`

---

### 3. Buat Route Handlers di `src/app/api/auth/`

Buat satu file `route.ts` per endpoint. Polanya sama untuk semua:

**`register/route.ts` dan `login/route.ts`:**
1. Baca request body dari `req.json()`
2. Forward ke Workers lewat `fetchWorkers`
3. Kalau response error dari Workers → kembalikan error ke client apa adanya (jangan ubah error code)
4. Kalau sukses → set cookie dengan token, kembalikan `{ user }` ke client — **token tidak dikirim ke client**

**`google/route.ts`:**
- Sama dengan login, tambahkan field `isNewUser` di response

**`logout/route.ts`:**
- Tidak perlu hit Workers (token stateless JWT)
- Cukup clear cookie dengan `maxAge: 0`
- Kalau BE nanti implementasi token blocklist/revocation, baru tambahkan call ke Workers di sini

**`me/route.ts` — ini yang paling penting untuk persist session saat hard refresh:**
1. Baca cookie dari `req.cookies.get(COOKIE_NAME)`
2. Kalau tidak ada cookie → return `{ data: null }` (belum login, bukan error)
3. Kalau ada cookie → forward ke Workers `GET /profile` dengan token
4. Kalau Workers return error (token expired/invalid) → clear cookie, return `{ data: null }`
5. Kalau sukses → return data user ke client

Endpoint ini yang dipanggil `useCurrentUser` saat app pertama mount dan saat hard refresh — inilah yang menggantikan kebutuhan refresh token endpoint.

---

### 4. Buat `src/services/authService.ts`

Layer antara hooks dan Route Handlers. Komponen dan hooks **tidak boleh** `fetch('/api/auth/*')` langsung — selalu lewat service ini.

Fungsi yang perlu ada:
- `registerUser(body)` → POST `/api/auth/register`
- `loginUser(body)` → POST `/api/auth/login`
- `loginWithGoogle(body)` → POST `/api/auth/google`
- `logoutUser()` → POST `/api/auth/logout`
- `fetchCurrentUser()` → GET `/api/auth/me`, kembalikan `User | null`

Buat helper internal untuk unwrap response dan throw error dengan `.code` dari API_CONTRACT kalau response tidak sukses — supaya hooks bisa baca `error.code` untuk tampilkan pesan yang benar ke user.

---

### 5. Buat `src/hooks/useAuth.ts`

TanStack Query hooks. Kelompokkan query keys di satu objek (`authKeys`) supaya invalidasi cache konsisten — jangan hardcode string di komponen.

Hooks yang perlu ada:

**`useCurrentUser()`**
- `queryFn: fetchCurrentUser`
- `staleTime: 5 menit` — tidak perlu refetch terlalu sering
- `retry: false` — kalau gagal, tidak perlu retry (bukan network error, tapi memang belum login)
- Ini yang dipanggil `SessionBootstrap` di root layout

**`useLogin()`**
- `mutationFn: loginUser`
- `onSuccess`: set cache user dengan `queryClient.setQueryData`, lalu redirect
- Redirect-back: baca query param `?redirect=` dari URL, kalau ada redirect ke sana, kalau tidak ke `/dashboard`

**`useRegister()`**
- `mutationFn: registerUser`
- `onSuccess`: set cache user, redirect ke `/dashboard`

**`useGoogleLogin()`**
- `mutationFn: loginWithGoogle`
- `onSuccess`: sama dengan useLogin — set cache, redirect-back via query param

**`useLogout()`**
- `mutationFn: logoutUser`
- `onSuccess`: `queryClient.clear()` (hapus semua cache), redirect ke `/login`

**Helper hooks turunan untuk dipakai di komponen:**
- `useUser()` → `User | null`
- `useIsLoggedIn()` → `boolean`
- `useIsAdmin()` → `boolean` (cek `user.role === 'panitia'`)

---

### 6. Buat `src/store/QueryProvider.tsx` dan `SessionBootstrap.tsx`

**`QueryProvider.tsx`** — wrapper TanStack Query untuk root layout:
- Buat `QueryClient` di dalam `useState` supaya tiap SSR request dapat instance baru (tidak shared antar user di server)
- Default options yang disarankan:
  - `staleTime: 1 menit` secara global
  - `retry: 1` (bukan 3x default)
  - `refetchOnWindowFocus: false` — override per-query kalau dibutuhkan
- Pasang `ReactQueryDevtools` hanya di development

**`SessionBootstrap.tsx`** — komponen client yang cuma panggil `useCurrentUser()`:
- Tidak render apapun (return null)
- Satu-satunya tujuan: trigger fetch `/api/auth/me` saat root layout pertama mount
- Hasilnya masuk cache TanStack Query — komponen lain yang pakai `useUser()` dapat data dari cache tanpa fetch ulang

Pasang keduanya di `app/layout.tsx`:
```
<QueryProvider>
  <SessionBootstrap />
  {children}
</QueryProvider>
```

---

### 7. Buat `src/middleware.ts`

Letakkan di root project (satu level di atas `src/`), bukan di dalam `src/`.

Yang perlu di-handle:

**Protected routes** — redirect ke `/login?redirect=/path/tujuan` kalau tidak ada cookie:
- `/dashboard`
- `/profile`
- `/events/[slug]/register` — tapi bukan `/events` dan `/events/[slug]` yang public

**Catatan penting: `/competitions/[slug]` TIDAK masuk middleware**

`/competitions/[slug]` tetap Public (lihat ROUTES.md) — tidak ada di daftar protected route di atas. Tapi PRD F-43a tetap mewajibkan force-auth saat user klik tombol "Register" di halaman itu (modal Create/Join Team hanya boleh muncul untuk user yang sudah login).

Karena flow "Register" di sini adalah client-state (modal overlay, bukan navigasi ke route baru — lihat ROUTES.md §Pola Navigasi), guard-nya **tidak bisa lewat middleware**. Implementasinya di level komponen:

1. Tombol "Register" di `/competitions/[slug]` cek `useIsLoggedIn()` sebelum membuka modal
2. Kalau belum login → `router.push('/login?redirect=/competitions/[slug]')` (pola query param sama dengan yang di-set middleware, supaya `useLogin`/`useGoogleLogin` bisa baca dengan cara yang sama)
3. Kalau sudah login → buka modal Create/Join Team seperti biasa

Ini berbeda dari `/events/[slug]/register`, yang guard-nya otomatis lewat middleware karena routenya sendiri protected.

Cara paling bersih: definisikan array route prefix yang protected, tambahkan whitelist regex untuk `/events` dan `/events/[slug]` yang public.

**Auth routes** — redirect ke `/dashboard` kalau sudah ada cookie:
- `/login`
- `/register`

**Catatan penting soal admin route:**
Middleware hanya cek ada/tidaknya cookie (bukan decode role dari JWT) supaya tidak ada roundtrip ke Workers di middleware yang akan memperlambat semua request. Validasi role dilakukan di level komponen dengan `useIsAdmin()`. BE tetap return `403 ADMIN_ONLY` sebagai safety net kalau user biasa coba akses endpoint `/admin/*`.

Kalau nanti ingin block admin route di middleware juga tanpa roundtrip, simpan `role` sebagai JWT claim di Workers dan decode di middleware dengan library seperti `jose` — tidak perlu hit Workers, cukup verify signature lokal.

**Matcher config** — exclude `_next/static`, `_next/image`, `favicon.ico`, dan semua file dengan ekstensi (gambar, font, dst).

---

## Cara Pakai di Komponen

### Baca user (di komponen manapun)
```
const user = useUser()           // User | null
const isLoggedIn = useIsLoggedIn()
const isAdmin = useIsAdmin()     // true kalau role === 'panitia'
```

### Login
```
const login = useLogin()
login.mutate({ email, password })

// Loading state
login.isPending

// Error — ambil code untuk tampilkan pesan yang tepat
const errorCode = login.error?.code  // 'INVALID_CREDENTIALS', dst
```

### Logout
```
const logout = useLogout()
logout.mutate()
```

### Tampilkan error yang benar per error code
Buat mapping dari error code (API_CONTRACT.md Error Code Reference) ke pesan user-facing:
```
INVALID_CREDENTIALS       → "Email atau password salah"
EMAIL_ALREADY_REGISTERED  → "Email ini sudah terdaftar, coba login"
VALIDATION_ERROR          → "Ada isian yang belum sesuai, cek lagi ya"
```
Mapping ini ditaruh di komponen form atau di file constants terpisah.

---

## Redirect-Back Setelah Login

Flow lengkapnya:
```
User akses /events/ioe-talkshow/register (belum login)
  → middleware: tidak ada cookie
  → redirect ke /login?redirect=/events/ioe-talkshow/register
  → user login
  → useLogin onSuccess: baca ?redirect= dari URL
  → router.push('/events/ioe-talkshow/register')
```

Query param `?redirect=` di-set oleh middleware saat redirect ke `/login`. Hook `useLogin` dan `useGoogleLogin` membacanya dari `window.location.search` di `onSuccess`.

---

## Yang Perlu Dikonfirmasi ke Tim BE (Workers)

1. **Durasi expiry JWT** — cookie di-set `maxAge: 7 hari`. Sesuaikan dengan nilai ini di Workers supaya cookie dan token tidak out of sync (cookie masih ada tapi token sudah expired di Workers).

2. **Workers tidak perlu set `Set-Cookie` sendiri** — karena yang set cookie adalah Next.js Route Handler. Pastikan response dari Workers tidak ada header `Set-Cookie` untuk auth, cukup kembalikan `{ token, user }` di body JSON saja.

3. **Field `role` di JWT/response** — pastikan field `role: "peserta" | "panitia"` ada di response `/auth/login`, `/auth/register`, `/auth/google`, dan `/profile`. Ini sudah dicantumkan di API_CONTRACT v1.1 tapi perlu dikonfirmasi BE sudah implement.

---

## Awareness — Item Belum Terselesaikan

| # | Item | Lokasi | Perlu dari siapa |
|---|---|---|---|
| A1 | **Durasi expiry JWT di Workers** — cookie di-set `maxAge: 7 hari` di `lib/api.ts`. Nilai ini harus sama dengan expiry token di Workers — kalau beda, cookie masih ada tapi token sudah expired, user dapat error 401 tanpa bisa login ulang otomatis | §Langkah 2, §Yang Perlu Dikonfirmasi ke Tim BE | Tim BE | -> lihat AUTH_IMPLEMENTATION.md, bagian langkah 3, me/route.ts
| A2 | **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`** — belum diterima dari klien. Blocker untuk langkah implementasi Google OAuth button di komponen | §Environment Variables | Klien + BE | -> nanti akan diberitahu lagi link nya
| A3 | **Token blocklist/revocation di Workers** — `logout/route.ts` saat ini hanya clear cookie tanpa hit Workers (asumsi JWT stateless). Kalau BE nanti implementasi revocation/blocklist, langkah logout perlu diupdate dengan call ke Workers sebelum clear cookie | §Langkah 3 (`logout/route.ts`) | Tim BE (konfirmasi apakah JWT stateless atau ada revocation) | -> stateless JWT saja sudah cukup
