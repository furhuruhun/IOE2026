# Error Handling — FE Convention (IOE 2027)

> Dokumen ini menentukan **cara menampilkan** tiap error code dari API_CONTRACT.md
> (§[FONDASI 4/4] Error Code Reference) di sisi FE — toast, inline error, atau redirect.
> Tanpa dokumen ini, tiap fitur berpotensi punya pola error-handling yang berbeda-beda.
>
> Status: Draft — perlu direview tim FE sebelum implementasi dimulai.

---

## Phase 3 admin gate refinement (2026-11-05)

The /admin frontend gate reuses useIsAdmin and the shared error mapping. Resolved
participants and ADMIN_ONLY failures redirect to /dashboard; a transient in-memory
notice carries the existing message across navigation and is dismissible above the
fixed navbar. Anonymous/UNAUTHORIZED recovery retains /admin as the login destination.
Pending or revalidating identity never renders the Admin placeholder. Generic
session-read errors show mapped feedback and retry, including when committee data
was previously cached. No new error codes, API operations or backend authorization
guarantees are introduced. This follows the existing Dashboard redirect convention;
a separate 403 page and Admin UI remain deferred.

## Phase 6 registration refinement (2026-11-04)

Shared ApiError preserves optional VALIDATION_ERROR fields only when they form an
object map of nonblank strings. Registration maps known request fields inline,
focuses them after submission controls unlock, and keeps mapped general feedback
for missing, unknown or malformed details. REGISTRATION_CLOSED, QUOTA_FULL and
ALREADY_REGISTERED disable submission while preserving form data.

For registration POST only, lost responses, malformed success payloads and
SERVER_ERROR have an uncertain outcome. Keep the mapped SERVER_ERROR treatment
and add persistent warning copy from REGISTRATION_RECOVERY. Block another POST in
the mounted form; offer a read-only status check and dashboard navigation instead
of an automatic or blind mutation retry. A failed cache refresh cannot reverse a
confirmed POST success. This scoped mutation rule supersedes the generic retry
guidance below. See PHASE6_REGISTRATION.md for verification and limitations.

## Prinsip Umum

1. **Satu sumber pesan error.** Jangan hardcode pesan user-facing di komponen manapun — semua pesan diambil dari mapping terpusat (`src/constants/errorMessages.ts`, lihat §Implementasi).
2. **Default fallback wajib ada.** Kalau BE mengembalikan error code yang tidak ada di mapping (belum sempat didaftarkan di FE), tampilkan pesan generik `SERVER_ERROR`, JANGAN biarkan UI blank atau crash.
3. **`error.code` adalah sumber kebenaran**, bukan HTTP status saja — dua error code berbeda bisa punya HTTP status yang sama (400) tapi butuh treatment UI berbeda.
4. **Field-level error selalu inline**, tidak pernah toast — supaya user tahu persis field mana yang salah tanpa harus scroll cari toast yang sudah hilang.
5. **Toast hanya untuk error yang tidak terikat ke satu field spesifik** (network, server, quota, dst).

---

## Kategori Treatment

| Kategori | Kapan dipakai | Perilaku |
|---|---|---|
| **Inline (field-level)** | Error terikat ke satu/lebih field form | Tampil di bawah field terkait, form tetap terisi, submit button re-enabled |
| **Inline (form-level banner)** | Error terkait keseluruhan form tapi bukan field spesifik (contoh: kuota penuh saat submit) | Banner merah di atas form, form tetap terisi |
| **Toast** | Error dari aksi singkat di luar form besar (join team, delete, toggle) | Toast merah, auto-dismiss 4 detik, tidak blocking |
| **Redirect (silent)** | Sesi habis / tidak berwenang | Redirect langsung, tanpa toast — supaya tidak terasa seperti "error", cukup dianggap alur normal |
| **Redirect + pesan** | Butuh penjelasan singkat setelah redirect | Redirect ke halaman lain + toast singkat muncul di halaman tujuan |

---

## Mapping Error Code → Treatment

| Error Code | HTTP | Endpoint | Treatment | Detail |
|---|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Semua endpoint dengan request body | **Inline (field-level)**, dengan fallback form-level banner | ✅ Resolved (API_CONTRACT.md v1.2): response error membawa `error.fields` — object `{ namaField: pesanError }`, key-nya SAMA PERSIS dengan nama field di request body (camelCase), jadi TIDAK perlu mapping field BE→FE terpisah lagi. FE tinggal render pesan dari `error.fields[namaFieldForm]` di bawah field yang sesuai. Kalau field form tertentu tidak muncul di `error.fields` (BE lupa sertakan), fallback tampilkan `error.message` sebagai form-level banner supaya user tetap tahu ada masalah. |
| `EMAIL_ALREADY_REGISTERED` | 400 | `POST /auth/register` | **Inline (field-level)** — di bawah field Email | Tambahkan link/CTA "Login di sini" di pesan yang sama |
| `INVALID_CREDENTIALS` | 401 | `POST /auth/login` | **Inline (form-level banner)** | Jangan spesifikkan apakah email atau password yang salah (security best practice) |
| `UNAUTHORIZED` | 401 | Semua endpoint protected tanpa token valid | **Redirect (silent)** ke `/login?redirect=<path saat ini>` | Tidak perlu toast — ini expected flow (token expired), bukan kesalahan user. Sekalian clear cache TanStack Query user (`queryClient.clear()`) |
| `NOT_TEAM_LEADER` | 403 | `DELETE /team/members/:userId`, `PATCH /team/visibility` | **Toast** | Tombol aksi ini seharusnya sudah disembunyikan di UI untuk non-leader — kalau toast ini muncul, kemungkinan ada state stale, ikutkan `refetch()` team data setelah toast |
| `ADMIN_ONLY` | 403 | Semua endpoint `/admin/*` | **Redirect + pesan** ke `/dashboard` | Toast singkat: "Kamu tidak punya akses ke halaman ini" muncul di `/dashboard` setelah redirect |
| `TEAM_CODE_INVALID` | 400 | `POST /team/join` | **Inline (field-level)** — di bawah input Team Code | — |
| `ALREADY_IN_TEAM` | 400 | Competition team create/join | **Inline (form-level banner)** | Already a member; retain the form and explain the conflict. |
| `ALREADY_REGISTERED` | 400 | Event registration | **Inline (form-level banner)** | Already registered; retain the form and explain the conflict. |
| `TEAM_FULL` | 400 | `POST /team/join`, `POST /team/join-public` | **Inline (form-level banner)** di modal Join Team | Modal tetap terbuka, tampilkan CTA alternatif ("cari tim lain" / "buat tim baru") |
| `TEAM_NOT_PUBLIC` | 400 | `POST /team/join-public` | **Toast** | Kemungkinan besar karena list tim public sudah stale — trigger `refetch()` list tim public setelah toast |
| `REGISTRATION_CLOSED` | 400 | `POST /events/:id/register`, `POST /competitions/:id/team` | **Inline (form-level banner)** | Sembunyikan/disable tombol submit setelah error ini muncul, supaya user tidak retry percuma |
| `REGISTRATION_NOT_OPEN` | 400 | `POST /events/:id/register`, `POST /competitions/:id/team` | **Inline (form-level banner)** | Pendaftaran belum dibuka |
| `QUOTA_FULL` | 400 | `POST /events/:id/register` | **Inline (form-level banner)** | Sama seperti `REGISTRATION_CLOSED` — disable submit setelah muncul |
| `FILE_TOO_LARGE` | 400 | Semua endpoint upload file | **Inline**, di komponen upload spesifik (bukan form-level) | Tampil tepat di area drag-and-drop, file yang gagal upload tidak masuk state, user bisa langsung coba file lain |
| `INVALID_FILE_FORMAT` | 400 | Semua endpoint upload file | **Inline**, di komponen upload spesifik | Sama seperti `FILE_TOO_LARGE`; tampilkan juga format yang diterima di pesan (ambil dari `acceptedFormats` response, lihat API_CONTRACT.md) |
| `REQUIREMENT_LOCKED` | 400 | `POST /competitions/:id/requirements/:id/upload` | **Toast** | Komponen upload seharusnya sudah disabled kalau status `accepted` — toast ini adalah safety net untuk stale state, ikutkan `refetch()` |
| `DEADLINE_PASSED` | 400 | `POST /competitions/:id/requirements/:id/upload` | **Inline**, di komponen upload spesifik | Setelah error ini muncul, disable komponen upload untuk requirement tsb (mirror behavior BE) |
| `NOT_QUALIFIED` | 403 | `POST /competitions/:id/requirements/:id/upload` | **Toast** | Tim belum dinyatakan lolos ke tahap final |
| `NOT_FOUND` | 404 | Semua endpoint dengan `:id`/`:slug` yang tidak ditemukan | **Redirect + pesan** ke halaman index terdekat (`/competitions`, `/events`, dst — tergantung konteks) atau tampilkan halaman 404 kalau route-level (bukan dari aksi form) | Bedakan: 404 dari navigasi (misal slug salah di URL) → tampilkan halaman 404 penuh. 404 dari aksi (misal submit ke resource yang baru dihapus) → toast + redirect |
| `SERVER_ERROR` | 500 | Semua endpoint | **Toast** dengan tombol "Coba lagi" | Ini juga fallback default untuk error code yang tidak dikenali FE |

---

## Loading & Retry State (pelengkap, bukan per error code)

| Situasi | Perilaku |
|---|---|
| Request sedang berjalan | Submit button disabled + spinner di dalam button (bukan overlay full-page, kecuali initial page load) |
| Network error (bukan dari BE, misal offline) | Toast: "Koneksi bermasalah, cek internet kamu" + tombol "Coba lagi" — treatment sama seperti `SERVER_ERROR` tapi pesan beda |
| Retry manual | Retry HANYA lewat tombol eksplisit di toast/banner, TIDAK auto-retry — sesuai `retry: 1` di TanStack Query default config (lihat TECHNICAL_CONSTRAINTS_FE.md), auto-retry sudah di-handle di query layer, UI tidak perlu tambahan retry loop sendiri |

---

## Implementasi

### Struktur file

```
src/
  constants/
    errorMessages.ts       # Mapping error code → { message, treatment }
  components/
    ui/
      Toast.tsx
      InlineFieldError.tsx
      FormBanner.tsx
  hooks/
    useErrorHandler.ts      # Hook terpusat: terima error, tentukan treatment, eksekusi (toast/inline/redirect)
```

### Bentuk mapping (`errorMessages.ts`)

```ts
// Shape error dari BE (API_CONTRACT.md [FONDASI 2/4], v1.2):
// { code: string; message: string; fields?: Record<string, string> }
// `fields` hanya ada untuk VALIDATION_ERROR, key = nama field request body (camelCase)

export const ERROR_MESSAGES: Record<string, {
  message: string;
  treatment: 'inline-field' | 'inline-banner' | 'toast' | 'redirect-silent' | 'redirect-message';
  redirectTo?: string;
}> = {
  VALIDATION_ERROR: { message: 'Ada isian yang belum sesuai, cek lagi ya', treatment: 'inline-field' }, // render dari error.fields per field; fallback banner pakai message di atas kalau field tidak ada di error.fields
  EMAIL_ALREADY_REGISTERED: { message: 'Email ini sudah terdaftar, coba login', treatment: 'inline-field' },
  INVALID_CREDENTIALS: { message: 'Email atau password salah', treatment: 'inline-banner' },
  UNAUTHORIZED: { message: '', treatment: 'redirect-silent', redirectTo: '/login' },
  NOT_TEAM_LEADER: { message: 'Hanya ketua tim yang bisa melakukan ini', treatment: 'toast' },
  ADMIN_ONLY: { message: 'Kamu tidak punya akses ke halaman ini', treatment: 'redirect-message', redirectTo: '/dashboard' },
  TEAM_CODE_INVALID: { message: 'Kode tim tidak ditemukan, cek lagi kodenya', treatment: 'inline-field' },
  TEAM_FULL: { message: 'Tim ini sudah penuh', treatment: 'inline-banner' },
  TEAM_NOT_PUBLIC: { message: 'Tim ini tidak lagi membuka pendaftaran publik', treatment: 'toast' },
  REGISTRATION_CLOSED: { message: 'Pendaftaran untuk batch ini sudah ditutup', treatment: 'inline-banner' },
  QUOTA_FULL: { message: 'Kuota sudah penuh', treatment: 'inline-banner' },
  FILE_TOO_LARGE: { message: 'Ukuran file melebihi 500 KB', treatment: 'inline-field' },
  INVALID_FILE_FORMAT: { message: 'Format file tidak sesuai', treatment: 'inline-field' },
  REQUIREMENT_LOCKED: { message: 'Dokumen ini sudah disetujui dan tidak bisa diubah lagi', treatment: 'toast' },
  DEADLINE_PASSED: { message: 'Batas waktu sudah berakhir. File yang sudah kamu kirim tetap tersimpan, tapi tidak bisa diunggah ulang', treatment: 'inline-field' },
  NOT_QUALIFIED: { message: 'Tim kamu belum lolos ke tahap final', treatment: 'toast' },
  NOT_FOUND: { message: 'Data tidak ditemukan', treatment: 'redirect-message' },
  SERVER_ERROR: { message: 'Terjadi kesalahan, coba lagi nanti', treatment: 'toast' },
};

export const DEFAULT_ERROR = ERROR_MESSAGES.SERVER_ERROR;
```

### Catatan per Form — konsistensi nama field

> **Update (API_CONTRACT.md v1.2):** mapping field BE → field FE manual di
> bawah ini **tidak lagi diperlukan** untuk fungsi utamanya, karena
> `error.fields` sekarang keyed langsung dengan nama field request body
> (camelCase) — asalkan nama `name`/`id` input di form React Hook Form
> SAMA PERSIS dengan nama field di request body endpoint terkait
> (lihat `API_CONTRACT.md` per endpoint), render error otomatis nyambung
> tanpa mapping tambahan.
>
> Tabel di bawah tetap dipertahankan sebagai **referensi cepat** field apa
> saja yang perlu match persis — berguna untuk review cepat / debugging kalau
> ada input yang salah nama, tapi bukan lagi mapping yang wajib diisi manual.

| Form | Field request body (= field FE, harus sama persis) | Status |
|---|---|---|
| Register | `email`, `password`, `name` | ✅ Dikonfirmasi cocok (implementasi selesai) |
| Login | `email`, `password` | ✅ Dikonfirmasi cocok (implementasi selesai) |
| Create Team | `teamName` | *(isi saat form dibuat)* |
| Event Registration | `institution`, `phone`, `domicile`, `lineId`, `cvFile`, dst | *(isi saat form dibuat)* |

---

## Awareness — Item Belum Diputuskan

| # | Item | Perlu dari siapa |
|---|---|---|
| A1 | Durasi toast auto-dismiss (draft: 4 detik) — belum dikonfirmasi desain final | Tim desain |
| A2 | Redirect target untuk `NOT_FOUND` yang sifatnya route-level (404 penuh) — belum ada desain halaman 404 kustom | Tim desain + PRD |
| A3 | `ADMIN_ONLY` redirect ke `/dashboard` vs halaman 403 tersendiri — masih ambigu juga di ROUTES.md dan API_CONTRACT.md, keputusan final belum ada | Tim dev + PRD |

## Track A dashboard read feedback - 2026-10-28

For Journey, Preparation, Calendar and Registered Events read queries, display persistent mapped error text next to the affected content with a local retry button. The existing useErrorHandler mapping still supplies the message and auth redirects; these components render their message callback locally rather than creating parallel global toasts. Retry is disabled during its active request. Loading has an accessible status and busy indication; empty state is distinct from an error.

Shared action-error toasts use role=alert and remain until explicitly dismissed. Other toast statuses use role=status; their existing timed dismissal is suspended while hovered or focused, followed by a fresh reading interval. This supersedes earlier automatic dismissal guidance for error toasts only. No API codes or contracts change.


## Route-level crashes and event registration feedback (Phase 2)

- `src/app/(public)/error.tsx` catches page render crashes while its parent public
  layout retains Navbar/Footer. Root `error.tsx` catches other descendant crashes,
  including auth pages and failures in child layouts. `(protected)/error.tsx`
  offers retry, Dashboard and Home; page-owned dashboard chrome is not retained.
- Boundaries use the installed Next.js `retry()` API to re-fetch/re-render. `reset()`
  also exists, but does not re-fetch. A failed retry keeps the fallback actionable.
- `global-error.tsx` replaces a failed root layout with its own HTML document,
  theme initialization (including before-paint initialization when React installs
  the document without executing inline scripts), global CSS, native controls and
  system-font fallback. Its
  Home link intentionally performs full navigation outside the failed router tree.
- Route fallback content receives focus and announces a generic message. Technical
  errors/digests are logged to the console, never displayed. No reporting service
  is configured. Inline event feedback never steals keyboard focus.
- These boundaries handle render/server-component crashes, not event-handler or
  arbitrary asynchronous exceptions. API/query/mutation errors retain their
  existing shared handling; TanStack Query errors are not thrown into boundaries.
- Talkshow/Short Course distinguish initial loading, API failure, successful
  missing-event responses and cached-data refresh failure. Failed reads use the
  existing informational FormBanner and retry; retry is disabled during fetching.
  Existing content remains visible, and registration readiness/demo/deadline guards
  remain unchanged. Recovery UI copy lives in `src/constants/recoveryMessages.ts`;
  it does not introduce API error codes.
- Dynamic public competition/event detail routes have a segment loading fallback
  for navigation. Their client queries retain their own loading states; static
  pages and the client-fetching dashboard receive no extra loading boundary.

Open design item: there is no approved crash-page artwork/layout. Recovery screens
use the existing tokens and simple heading/message/actions pattern. A later visual
specification can replace their presentation without changing error semantics.
