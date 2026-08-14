# Error Handling — FE Convention (IOE 2027)

> Dokumen ini menentukan **cara menampilkan** tiap error code dari API_CONTRACT.md
> (§[FONDASI 4/4] Error Code Reference) di sisi FE — toast, inline error, atau redirect.
> Tanpa dokumen ini, tiap fitur berpotensi punya pola error-handling yang berbeda-beda.
>
> Status: Draft — perlu direview tim FE sebelum implementasi dimulai.

---

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
| `VALIDATION_ERROR` | 400 | Semua endpoint dengan request body | **Inline (field-level)** | BE mengirim detail per field — mapping field BE → field FE harus didefinisikan per form (lihat §Catatan per Form). Kalau field dari BE tidak match field manapun di form, fallback ke form-level banner. |
| `EMAIL_ALREADY_REGISTERED` | 400 | `POST /auth/register` | **Inline (field-level)** — di bawah field Email | Tambahkan link/CTA "Login di sini" di pesan yang sama |
| `INVALID_CREDENTIALS` | 401 | `POST /auth/login` | **Inline (form-level banner)** | Jangan spesifikkan apakah email atau password yang salah (security best practice) |
| `UNAUTHORIZED` | 401 | Semua endpoint protected tanpa token valid | **Redirect (silent)** ke `/login?redirect=<path saat ini>` | Tidak perlu toast — ini expected flow (token expired), bukan kesalahan user. Sekalian clear cache TanStack Query user (`queryClient.clear()`) |
| `NOT_TEAM_LEADER` | 403 | `DELETE /team/members/:userId`, `PATCH /team/visibility` | **Toast** | Tombol aksi ini seharusnya sudah disembunyikan di UI untuk non-leader — kalau toast ini muncul, kemungkinan ada state stale, ikutkan `refetch()` team data setelah toast |
| `ADMIN_ONLY` | 403 | Semua endpoint `/admin/*` | **Redirect + pesan** ke `/dashboard` | Toast singkat: "Kamu tidak punya akses ke halaman ini" muncul di `/dashboard` setelah redirect |
| `TEAM_CODE_INVALID` | 400 | `POST /team/join` | **Inline (field-level)** — di bawah input Team Code | — |
| `TEAM_FULL` | 400 | `POST /team/join`, `POST /team/join-public` | **Inline (form-level banner)** di modal Join Team | Modal tetap terbuka, tampilkan CTA alternatif ("cari tim lain" / "buat tim baru") |
| `TEAM_NOT_PUBLIC` | 400 | `POST /team/join-public` | **Toast** | Kemungkinan besar karena list tim public sudah stale — trigger `refetch()` list tim public setelah toast |
| `REGISTRATION_CLOSED` | 400 | `POST /events/:id/register`, `POST /competitions/:id/team` | **Inline (form-level banner)** | Sembunyikan/disable tombol submit setelah error ini muncul, supaya user tidak retry percuma |
| `QUOTA_FULL` | 400 | `POST /events/:id/register` | **Inline (form-level banner)** | Sama seperti `REGISTRATION_CLOSED` — disable submit setelah muncul |
| `FILE_TOO_LARGE` | 400 | Semua endpoint upload file | **Inline**, di komponen upload spesifik (bukan form-level) | Tampil tepat di area drag-and-drop, file yang gagal upload tidak masuk state, user bisa langsung coba file lain |
| `INVALID_FILE_FORMAT` | 400 | Semua endpoint upload file | **Inline**, di komponen upload spesifik | Sama seperti `FILE_TOO_LARGE`; tampilkan juga format yang diterima di pesan (ambil dari `acceptedFormats` response, lihat API_CONTRACT.md) |
| `REQUIREMENT_LOCKED` | 400 | `POST /competitions/:id/requirements/:id/upload` | **Toast** | Komponen upload seharusnya sudah disabled kalau status `accepted` — toast ini adalah safety net untuk stale state, ikutkan `refetch()` |
| `DEADLINE_PASSED` | 400 | `POST /competitions/:id/requirements/:id/upload` | **Inline**, di komponen upload spesifik | Setelah error ini muncul, disable komponen upload untuk requirement tsb (mirror behavior BE) |
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
export const ERROR_MESSAGES: Record<string, {
  message: string;
  treatment: 'inline-field' | 'inline-banner' | 'toast' | 'redirect-silent' | 'redirect-message';
  redirectTo?: string;
}> = {
  VALIDATION_ERROR: { message: 'Ada isian yang belum sesuai, cek lagi ya', treatment: 'inline-field' },
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
  NOT_FOUND: { message: 'Data tidak ditemukan', treatment: 'redirect-message' },
  SERVER_ERROR: { message: 'Terjadi kesalahan, coba lagi nanti', treatment: 'toast' },
};

export const DEFAULT_ERROR = ERROR_MESSAGES.SERVER_ERROR;
```

### Catatan per Form (isi manual seiring form dibuat)

Setiap kali form baru dibuat, tambahkan baris di sini untuk mapping field BE → field FE (dibutuhkan untuk `VALIDATION_ERROR`):

| Form | Field BE | Field FE (nama input) |
|---|---|---|
| Register | `email`, `password`, `name` | *(isi saat form dibuat)* |
| Login | `email`, `password` | *(isi saat form dibuat)* |
| Create Team | `teamName` | *(isi saat form dibuat)* |
| Event Registration | `institution`, `phone`, `domicile`, `lineId`, `cvFile`, dst | *(isi saat form dibuat)* |

---

## Awareness — Item Belum Diputuskan

| # | Item | Perlu dari siapa |
|---|---|---|
| A1 | Durasi toast auto-dismiss (draft: 4 detik) — belum dikonfirmasi desain final | Tim desain |
| A2 | Redirect target untuk `NOT_FOUND` yang sifatnya route-level (404 penuh) — belum ada desain halaman 404 kustom | Tim desain + PRD |
| A3 | `ADMIN_ONLY` redirect ke `/dashboard` vs halaman 403 tersendiri — masih ambigu juga di ROUTES.md dan API_CONTRACT.md, keputusan final belum ada | Tim dev + PRD |
