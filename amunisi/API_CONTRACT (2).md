# API Contract — IOE 2027

Kontrak ini disepakati FE & BE sebelum development, supaya FE bisa mock data dan dev tanpa nunggu BE selesai. Update file ini setiap ada perubahan endpoint — FE & BE WAJIB pakai versi yang sama.

Struktur dokumen ini mengikuti 4 sub bab fondasi (wajib ada di API Contract manapun), ditandai `[FONDASI]` di tiap heading.

---

## [FONDASI 1/4] Metadata & Versi Dokumen

| Field | Value |
|---|---|
| Versi kontrak | 1.1 |
| Terakhir diupdate | [isi tanggal] |
| Disusun oleh | Farhan & Raka |
| Status | Draft — menunggu review tim BE |

### Base URL per Environment
| Environment | Base URL | Dipakai kapan |
|---|---|---|
| Local Development | `http://localhost:8000/api` | Develop di laptop sendiri |
| Staging | `⚠️ [isi]` | Testing internal & review klien sebelum go-live |
| Production | `⚠️ [isi]` | Live, dipakai peserta asli |

Env var FE: `WORKERS_API_URL` (server-only, **tanpa** prefix `NEXT_PUBLIC_`) — nilai berbeda per environment di atas, di-set lewat `.env.local` / `.env.staging` / `.env.production`. Tidak di-expose ke client bundle karena semua call ke Workers dilakukan server-side lewat Next.js Route Handler proxy — lihat `AUTH_IMPLEMENTATION.md` dan `TECHNICAL_CONSTRAINTS_FE.md` §Auth Handling.

### Changelog Kontrak
| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | [tgl] | Draft awal: Auth, Profile, Competitions, Team, Requirements, Events, Dashboard, Admin (placeholder) |
| 1.1 | [tgl] | Tambah endpoint `PATCH /competitions/:id/team/visibility` untuk toggle Private/Public; update field `role` di User model; konfirmasi format CV PDF only; resolve auto-fill event registration dari Profile |

---

## [FONDASI 2/4] Konvensi Global

- **Auth scheme:** Bearer token di header `Authorization: Bearer <token>` untuk endpoint yang butuh login
- **Format tanggal:** ISO 8601 (`2027-08-07T14:00:00+07:00`), timezone WIB
- **Format response sukses:**
```json
{ "success": true, "data": { }, "message": "string" }
```
- **Format response error:**
```json
{ "success": false, "error": { "code": "string", "message": "string" } }
```
- **HTTP Status Code standar:**

| Code | Dipakai untuk |
|---|---|
| 200 | Request sukses (GET, PUT, DELETE) |
| 201 | Resource baru berhasil dibuat (POST) |
| 400 | Validasi gagal / request tidak valid |
| 401 | Tidak ada token / token invalid (belum login) |
| 403 | Sudah login tapi tidak punya akses (misal bukan Team Leader, bukan role Panitia) |
| 404 | Resource tidak ditemukan |
| 500 | Server error |

- **File upload:** lihat detail lengkap di section **[TAMBAHAN] File Upload Convention** di bawah
- **Password:** dikirim FE sebagai plain text lewat HTTPS (transport terenkripsi); hashing dilakukan sepenuhnya di sisi BE, tidak masuk kontrak ini — lihat NFR di PRD §6.

---

## [TAMBAHAN] Data Models / Shared Schema

Objek yang dipakai berulang di banyak endpoint, didefinisikan sekali di sini. Endpoint di section [FONDASI 3/4] tinggal referensi ke model ini.

### `User`
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "peserta | panitia",
  "avatarUrl": "string | null",
  "institution": "string | null",
  "phone": "string | null",
  "domicile": "string | null"
}
```
✅ **Field `role` ditambahkan** — dibutuhkan FE untuk proactive guard route `/admin/*` (conditional rendering/redirect sebelum request ke BE, tanpa harus tunggu error 403). Nilai `"panitia"` → FE tampilkan akses Admin Panel; nilai `"peserta"` → sembunyikan.
`email` bersifat **read-only** dari sisi client. `lineId` TIDAK masuk model User — field itu cuma ada di request `POST /events/:id/register`. `avatarUrl` cuma terisi kalau user login via Google; `institution`/`phone`/`domicile` cuma terisi kalau user sudah pernah isi `/profile`.
Dipakai di: response `/auth/register`, `/auth/login`, `/auth/google`, `/profile`.

### `Team`
```json
{
  "teamId": "string",
  "teamName": "string",
  "teamCode": "string",
  "batch": "string",
  "status": "verified | pending",
  "visibility": "private | public",
  "isLeader": "boolean",
  "leader": { "id": "string", "name": "string" },
  "members": [
    { "id": "string", "name": "string", "studentId": "string" }
  ]
}
```
Field `isLeader` relatif terhadap user yang sedang request (bukan properti tim itu sendiri).

**Behavior `visibility`:**
- `"private"` (default saat dibuat): tim hanya bisa di-join lewat Team Code yang dibagikan manual
- `"public"`: tim muncul di daftar tim yang bisa di-join langsung oleh user lain yang mendaftar kompetisi yang sama, tanpa perlu Team Code

Dipakai di: response `POST /competitions/:id/team`, `POST /competitions/:id/team/join`, `GET /competitions/:id/team`, `PATCH /competitions/:id/team/visibility`.

### `RequirementItem`
```json
{
  "requirementId": "string",
  "name": "string",
  "type": "group | individual",
  "status": "pending | accepted | rejected",
  "dueDate": "ISO8601",
  "instructions": "string",
  "rejectionReason": "string | null",
  "acceptedFormats": ["jpg", "png"],
  "file": { "url": "string", "fileName": "string" }
}
```
`file` bernilai `null` kalau belum ada yang diupload. `rejectionReason` hanya terisi kalau `status: "rejected"`. `acceptedFormats` default `["jpg", "png"]` untuk kelima item requirement standar — item lain (misal proposal) bisa punya `acceptedFormats` berbeda termasuk `"pdf"`.

**Item bisa terkunci karena 2 alasan independen (keduanya di-handle FE dan BE):**
1. `status: "accepted"` → terkunci permanen (`REQUIREMENT_LOCKED`)
2. `dueDate` sudah terlewati → terkunci apapun status saat ini (`DEADLINE_PASSED`) — file lama tetap tersimpan, tidak dihapus

Dipakai di: `GET /competitions/:id/requirements`, `POST .../upload`, `GET /dashboard/assignments`.

### `CompetitionSummary`
```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "deadline": "ISO8601",
  "isRegisteredByUser": "boolean"
}
```
Dipakai di: `GET /competitions` (list), `GET /dashboard/journey` (bentuk lebih ringkas dengan tambahan `logoUrl` dan `status`).

### `EventSummary`
```json
{
  "id": "string",
  "slug": "string",
  "name": "string",
  "deadline": "ISO8601",
  "isRegisteredByUser": "boolean",
  "speakers": [
    { "id": "string", "name": "string" }
  ]
}
```
Dipakai di: `GET /events` (list), `GET /events/:slug` (detail, `speakers[]` relevan untuk Workshop — F-34a).

⚠️ Model ini masih draft — kemungkinan bertambah field begitu development jalan. Setiap penambahan field baru WAJIB dicatat di Changelog.

---

## [TAMBAHAN] Glossary / Istilah Domain

| Istilah | Arti |
|---|---|
| **Batch** | Gelombang pendaftaran (misal "Batch 1", "Batch 2") — tiap batch punya deadline sendiri, dipakai di kompetisi maupun event |
| **Team Code** | Kode unik random yang di-generate saat tim dibuat, dipakai anggota lain untuk join tim yang sama via Cabang B. Ini identitas unik tim — bukan nama tim (nama tim boleh sama antar tim) |
| **Visibility Private** | Mode default tim saat dibuat — tim hanya bisa di-join lewat Team Code yang dibagikan manual |
| **Visibility Public** | Mode opsional yang bisa diaktifkan Team Leader — tim muncul di daftar dan bisa di-join langsung oleh user lain yang mendaftar kompetisi yang sama, tanpa perlu Team Code |
| **Group Task** | Jenis requirement yang cukup diisi 1x per tim (misal Payment Proof), biasanya oleh Team Leader, berlaku untuk seluruh anggota |
| **Individual Task** | Jenis requirement yang harus diisi masing-masing anggota tim sendiri-sendiri (misal KTM, Pas Foto) |
| **My Journey** | Section di Dashboard yang menampilkan seluruh kompetisi yang diikuti user (logo tiap kompetisi) |
| **Assignment** | View agregat to-do dari seluruh `RequirementItem` berstatus `pending` lintas kompetisi yang diikuti user — bukan entity terpisah, lihat `GET /dashboard/assignments` |
| **Verified (status tim)** | Status agregat tim: seluruh Group Task + Individual Task tiap anggota berstatus `accepted` |
| **Force Auth** | Kebijakan: user WAJIB login dulu sebelum bisa mengakses form pendaftaran kompetisi/event apapun — tidak boleh isi form dulu baru diminta login |

---

## [TAMBAHAN] File Upload Convention

Aturan berlaku untuk **semua** endpoint yang menerima file — didefinisikan sekali di sini.

### Aturan Umum
| Aturan | Value |
|---|---|
| Metode | `multipart/form-data` |
| Field name default | `file` (kecuali disebutkan lain, misal `cvFile`, `paymentProof` di `POST /events/:id/register`) |
| Batas ukuran | **500 KB** per file (dikonfirmasi final) |
| Format default diterima | PDF, JPG, PNG |
| Upload trigger | **Auto-upload** begitu file di-drop/dipilih — tidak ada tombol "Submit" terpisah untuk endpoint requirement |

### Pengecualian Format per Konteks
| Konteks | Format diterima | Status |
|---|---|---|
| 5 item Registration Requirements standar (Payment Proof, Identity Card, Passport Photo, Active Student Status Letter, Twibbon/Poster Proof) | **JPG, PNG saja** (tidak PDF) | ✅ dikonfirmasi |
| Upload proposal/karya kompetisi | PDF, JPG, PNG | ✅ dikonfirmasi |
| CV di form Event Registration | **PDF only** | ✅ dikonfirmasi |

### Endpoint yang Menerima Upload
- `POST /competitions/:id/requirements/:requirementId/upload`
- `POST /events/:id/register` (field `cvFile`, `paymentProof`)

### Error Handling
Semua endpoint upload menggunakan error code dari Error Code Reference: `FILE_TOO_LARGE`, `INVALID_FILE_FORMAT`, `REQUIREMENT_LOCKED`, `DEADLINE_PASSED`.

---

## [FONDASI 3/4] Endpoint per Resource

### 3.1 Auth & Profile

#### POST /auth/register
| Field | Value |
|---|---|
| Auth required | Tidak |
| Terkait PRD | F-40, F-42 |

**Request:** `{ "name": "string", "email": "string", "password": "string" }`
**Response 201:** `{ "success": true, "data": { "token": "string", "user": { "id", "name", "email", "role": "peserta" } } }`
**Response 400:** error code `EMAIL_ALREADY_REGISTERED`

#### POST /auth/login
| Field | Value |
|---|---|
| Auth required | Tidak |
| Terkait PRD | F-40, F-43 |

**Request:** `{ "email": "string", "password": "string" }`
**Response 200:** `{ "success": true, "data": { "token": "string", "user": { ...User } } }`
**Response 401:** error code `INVALID_CREDENTIALS`

#### POST /auth/google
| Field | Value |
|---|---|
| Auth required | Tidak |
| Terkait PRD | F-41, F-46 |

**Request:** `{ "idToken": "string" }`
**Response 200:** `{ "success": true, "data": { "token": "string", "user": { ...User, "avatarUrl": "string" }, "isNewUser": true } }`

#### GET /profile
| Field | Value |
|---|---|
| Auth required | Ya |
| Terkait PRD | F-55 |

**Response 200:** `{ "success": true, "data": { "id", "name", "email", "role", "institution", "phone", "domicile" } }`

#### PUT /profile
| Field | Value |
|---|---|
| Auth required | Ya |
| Terkait PRD | F-55, F-56 |

**Request:** `{ "name": "string", "institution": "string", "phone": "string", "domicile": "string" }` — `email` sengaja TIDAK ada di request body (read-only)
**Response 200:** data profil terbaru

✅ Field `institution`/`phone`/`domicile` dipakai untuk auto-fill (editable) form Event Registration — lihat detail di `POST /events/:id/register`.

### 3.2 Competitions & Team

#### GET /competitions
**Auth required:** Tidak (kalau ada token, sertakan status per user)
**Terkait PRD:** F-22–F-26
**Response 200:** `{ "success": true, "data": [{ "id", "slug", "name", "deadline", "isRegisteredByUser": false }] }`

#### GET /competitions/:slug
**Auth required:** Tidak · **Terkait PRD:** F-12–F-17
**Response 200:** detail kompetisi (deskripsi, timeline, prizes, requirements schema)

#### POST /competitions/:id/team
**Auth required:** Ya · **Terkait PRD:** F-18, F-18a
**Request:** `{ "teamName": "string" }` — **tidak divalidasi unik secara global**
**Response 201:** `{ "success": true, "data": { "teamId", "teamName", "teamCode", "visibility": "private", "isLeader": true } }`

Tim baru selalu dibuat dengan `visibility: "private"` — Team Leader bisa mengubah ke `"public"` lewat endpoint PATCH di bawah.

#### POST /competitions/:id/team/join
**Auth required:** Ya · **Terkait PRD:** F-18
**Request:** `{ "teamCode": "string" }` — join via Team Code (Cabang B)
**Response 200:** data tim (`isLeader: false`)
**Response 400:** error code `TEAM_CODE_INVALID` atau `TEAM_FULL`

#### GET /competitions/:id/team/public
**Auth required:** Ya
**Deskripsi:** List tim dengan `visibility: "public"` untuk kompetisi ini — ditampilkan di modal Join Team sebagai opsi Cabang C (join langsung tanpa Team Code). Endpoint ini dipanggil saat modal Join Team dibuka.
**Response 200:** `{ "success": true, "data": [{ "teamId", "teamName", "memberCount", "maxMember" }] }`
**Response 200 (kosong):** `{ "success": true, "data": [] }` — tidak ada tim public saat ini

#### POST /competitions/:id/team/join-public
**Auth required:** Ya
**Deskripsi:** Join tim public langsung tanpa Team Code (Cabang C)
**Request:** `{ "teamId": "string" }`
**Response 200:** data tim (`isLeader: false`)
**Response 400:** error code `TEAM_FULL`
**Response 400:** error code `TEAM_NOT_PUBLIC` — kalau tim sudah di-set kembali ke private sebelum request masuk

#### GET /competitions/:id/team
Cek status tim user — dipakai FE untuk skip/tampilkan modal Create/Join.
**Auth required:** Ya
**Response 200 (punya tim):** `{ "success": true, "data": { ...Team } }`
**Response 404 (belum punya tim):** trigger FE tampilkan modal Create/Join

#### PATCH /competitions/:id/team/visibility
**Auth required:** Ya (role: leader tim tersebut) · **Terkait PRD:** USER_FLOWS §"Toggle Visibility Tim"
**Request:** `{ "visibility": "private | public" }`
**Response 200:** `{ "success": true, "data": { "visibility": "private | public" } }`
**Response 403:** error code `NOT_TEAM_LEADER`

#### DELETE /competitions/:id/team/members/:userId
**Auth required:** Ya (role: leader tim tersebut)
**Response 200:** `{ "success": true, "message": "Member berhasil dihapus" }`
**Response 403:** error code `NOT_TEAM_LEADER`

### 3.3 Registration Requirements

#### GET /competitions/:id/requirements
**Auth required:** Ya
**Response 200:**
```json
{ "success": true, "data": [
  { "requirementId", "name", "type": "group|individual", "status": "pending|accepted|rejected",
    "dueDate", "instructions", "rejectionReason": "string|null",
    "acceptedFormats": ["jpg", "png"],
    "file": { "url", "fileName" } }
] }
```

#### POST /competitions/:id/requirements/:requirementId/upload
Auto-upload saat file di-drop.
**Auth required:** Ya
**Request:** multipart/form-data, field `file`
**Response 200:** requirement item terbaru, status otomatis `"pending"`

**Behavior penting:**
- Requirement berstatus `rejected` → file lama sudah otomatis terhapus sistem, endpoint ini langsung terima upload baru
- Requirement berstatus `accepted` → **field terkunci, tidak bisa diubah/upload ulang.** Endpoint SHALL menolak request dengan `REQUIREMENT_LOCKED`. FE SHOULD disable area upload di UI untuk item berstatus `accepted`
- `dueDate` terlewati → endpoint SHALL menolak upload dengan `DEADLINE_PASSED`, **apapun status item saat ini**. File yang sudah pernah diupload TETAP TERSIMPAN (tidak dihapus). Pesan ke user harus beda dari `REQUIREMENT_LOCKED` — jelasin alasannya deadline. FE SHOULD disable dropzone (termasuk `cursor: default`) begitu `dueDate` terlewati, terlepas dari status

#### DELETE /competitions/:id/requirements/:requirementId
**Auth required:** Ya
**Response 200:** requirement kembali ke state kosong

### 3.4 Events

#### GET /events
**Response 200:** `{ "success": true, "data": [{ "id", "slug", "name", "deadline", "isRegisteredByUser" }] }`

#### GET /events/:slug
**Response 200:** detail event (deskripsi, timeline, `speakers[]` untuk workshop)

#### POST /events/:id/register
**Auth required:** Ya (force auth) · **Terkait PRD:** F-31, F-34a, §7
**Request:**
```json
{ "sessionType": "seminar|workshop", "speakerId": "string|null",
  "phone": "string", "lineId": "string|null", "institution": "string",
  "domicile": "string", "cvFile": "file|null", "paymentProof": "file|null" }
```
`speakerId` wajib kalau `sessionType: "workshop"` dan event punya multiple speaker.
`cvFile` format: **PDF only** (dikonfirmasi).

**Auto-fill dari Profile (dikonfirmasi ✅):** saat halaman `/events/[slug]/register` dimuat, FE SHALL memanggil `GET /profile` satu kali untuk mengisi default value field `institution`, `phone`, `domicile`. Field tetap **editable** — user bisa mengubah nilai tanpa mempengaruhi data di `/profile` miliknya (submission event ini independen, tidak menulis balik ke Profile).

**Response 201:** `{ "success": true, "data": { "registrationId": "string" } }`
> Setelah response 201 dikirim, Workers trigger pengiriman email notifikasi ke user secara server-side (fire-and-forget — tidak blocking response). FE tidak perlu tahu hasilnya: cukup redirect ke `/confirmation?from=registration` saat terima 201. Kalau email gagal terkirim, pendaftaran tetap dianggap berhasil dan tidak di-rollback.
**Response 400:** error code `REGISTRATION_CLOSED` atau `QUOTA_FULL`

### 3.5 Dashboard

#### GET /dashboard/journey
**Response 200:** `{ "success": true, "data": [{ "competitionId", "slug", "name", "logoUrl", "status": "in_progress|complete", "dueDate" }] }`

#### GET /dashboard/events
**Response 200:** `{ "success": true, "data": [{ "eventId", "slug", "name", "sessionType", "date" }] }`

#### GET /dashboard/calendar
Kalender gabungan kompetisi + event (F-51).
**Response 200:** `{ "success": true, "data": [{ "date", "label", "type": "competition|event", "refId", "logoUrl" }] }`

`logoUrl` bisa `null` sementara sebagai fallback ke icon generik selama logo belum tersedia dari klien.

#### GET /dashboard/assignments
✅ "Assignment" **bukan entity terpisah** — view agregat dari `RequirementItem` di seluruh kompetisi yang diikuti user, digabung jadi satu list to-do.

**Response 200:**
```json
{ "success": true, "data": [
  { "requirementId": "string", "competitionSlug": "string", "competitionName": "string",
    "name": "string", "type": "group|individual", "status": "pending|accepted|rejected",
    "dueDate": "ISO8601", "acceptedFormats": ["jpg", "png"] }
] }
```
Default di-filter ke `status: "pending"` untuk ditampilkan sebagai to-do di section "Assignment".

### 3.6 Admin Panel (placeholder — TBD, sedang dalam proses)
🔄 **Status: sedang disusun terpisah** — requirement gathering sudah berjalan (PRD §5.k, F-58). Kandidat endpoint awal:
- `GET /admin/registrations` — list semua pendaftar
- `GET /admin/registrations/export` — export .xlsx/.csv
- `PATCH /admin/requirements/:requirementId` — approve/reject, `{ "status": "accepted|rejected", "reason": "string" }` — trigger auto-delete file & notifikasi user kalau rejected
- `POST /admin/announcements` — kelola widget Announcement

---

## [FONDASI 4/4] Error Code Reference

Semua kemungkinan error code di seluruh API, satu tempat rujukan.

| Error Code | HTTP Status | Muncul di Endpoint | Pesan User-Facing (ID) |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Semua endpoint dengan request body | "Ada isian yang belum sesuai, cek lagi ya" (+ detail per field) |
| `EMAIL_ALREADY_REGISTERED` | 400 | POST /auth/register | "Email ini sudah terdaftar, coba login" |
| `INVALID_CREDENTIALS` | 401 | POST /auth/login | "Email atau password salah" |
| `UNAUTHORIZED` | 401 | Semua endpoint protected tanpa token valid | Redirect ke `/login`, tidak perlu pesan visual |
| `NOT_TEAM_LEADER` | 403 | DELETE /team/members/:userId, PATCH /team/visibility | "Hanya ketua tim yang bisa melakukan ini" |
| `ADMIN_ONLY` | 403 | Semua endpoint `/admin/*` | Redirect ke `/dashboard` atau halaman 403 |
| `TEAM_CODE_INVALID` | 400 | POST /team/join | "Kode tim tidak ditemukan, cek lagi kodenya" |
| `TEAM_FULL` | 400 | POST /team/join, POST /team/join-public | "Tim ini sudah penuh" |
| `TEAM_NOT_PUBLIC` | 400 | POST /team/join-public | "Tim ini tidak lagi membuka pendaftaran publik" |
| `REGISTRATION_CLOSED` | 400 | POST /events/:id/register, POST /competitions/:id/team | "Pendaftaran untuk batch ini sudah ditutup" |
| `QUOTA_FULL` | 400 | POST /events/:id/register | "Kuota sudah penuh" |
| `FILE_TOO_LARGE` | 400 | Semua endpoint upload file | "Ukuran file melebihi 500 KB" |
| `INVALID_FILE_FORMAT` | 400 | Semua endpoint upload file | "Format file tidak sesuai" |
| `REQUIREMENT_LOCKED` | 400 | POST /competitions/:id/requirements/:id/upload | "Dokumen ini sudah disetujui dan tidak bisa diubah lagi" |
| `DEADLINE_PASSED` | 400 | POST /competitions/:id/requirements/:id/upload | "Batas waktu sudah berakhir. File yang sudah kamu kirim tetap tersimpan, tapi tidak bisa diunggah ulang" |
| `NOT_FOUND` | 404 | Semua endpoint dengan `:id`/`:slug` yang tidak ditemukan | "Data tidak ditemukan" |
| `SERVER_ERROR` | 500 | Semua endpoint | "Terjadi kesalahan, coba lagi nanti" |

⚠️ Tabel ini perlu direview bareng tim BE — kemungkinan ada error code tambahan yang muncul begitu development jalan. Update tabel ini setiap ada error code baru.

---

## Mock Data
Simpan contoh response JSON tiap endpoint di `/mocks/[nama-endpoint].json` di repo FE, dipakai selama BE belum ready. Struktur field harus identik dengan kontrak di atas.

---

## Awareness — Item Belum Terselesaikan

> Item di bawah ini masih terbuka atau perlu konfirmasi sebelum/selama development. Update saat resolved.

| # | Item | Lokasi | Perlu dari siapa |
|---|---|---|---|
| A1 | **Tanggal di Changelog** masih `[tgl]` untuk v1.0 dan v1.1, dan `[isi tanggal]` di header | §Metadata | Tim dev (isi saat commit perubahan) |
| A2 | **Staging & Production Base URL** masih placeholder `⚠️ [isi]` | §Base URL | Tim BE + Cloudflare setup |
| A3 | **Model masih draft** — semua Data Model di §[TAMBAHAN] berpotensi bertambah field saat development jalan. Setiap penambahan WAJIB masuk Changelog | §Data Models | Tim BE + FE (ongoing) | -> jangan lupa ditambahkan
| A4 | **Admin Panel endpoints (§3.6)** masih placeholder — belum ada spec endpoint yang fix. Blocker untuk sprint Admin Panel | §3.6 | Requirement gathering terpisah | -> akan dilakukan nanti
| A5 | **Error code review bersama BE** — tabel Error Code Reference perlu direview bersama tim BE, kemungkinan ada error code tambahan yang belum ter-capture | §[FONDASI 4/4] | Tim BE | -> sudah
| A6 | **Consent checkbox UU PDP** tidak ada di request body endpoint manapun (register, event registration) — perlu diputuskan apakah field `consentPdp: boolean` perlu masuk ke request body, atau cukup validasi di FE saja | §3.1, §3.4 | Tim dev + klien |-> validasi di FE saja, tidak perlu sampai kirim ke BE atau DB
| A7 | **Field `studentId` di model `Team.members`** — belum ada endpoint untuk mengisi/update `studentId`, dan tidak disebut di form fields PRD §7 maupun USER_FLOWS. Perlu dikonfirmasi dari mana data ini berasal (auto dari profil? input manual?) | §Data Models (Team) | Tim BE | -> ini jangan dihapus -> karena itu buat nandain ke user ID yang lain kalau sudah join
