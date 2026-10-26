# Backend IOE 2027 (Cloudflare Workers + D1 + R2 + Hono)

Backend resmi untuk platform **Indonesia Ocean Expo 2027 (IOE 2027)**. Dibangun menggunakan serverless stack Cloudflare Workers dengan framework **Hono**, database serverless SQL **Cloudflare D1**, penyimpanan berkas **Cloudflare R2**, enkripsi password **PBKDF2-SHA256**, dan token **JWT (HS256)** via `jose`.

---

## 🚀 Fitur & Modul Backend

1. **Autentikasi & Otorisasi (`/api/auth`)**:
   - Registrasi peserta baru dengan validasi Zod dan hashing PBKDF2-SHA256 (100,000 iterasi).
   - Login kredensial (email & password) dengan timing-attack protection.
   - Login / Registrasi otomatis Google OAuth ID token (mendukung mode development `mock:google-*`).
   - Role-based authorization (`peserta` vs `panitia`).
2. **Profil Pengguna (`/api/profile`)**:
   - `GET /api/profile`: Mengambil detail profil peserta.
   - `PUT /api/profile`: Memperbarui profil (nama, instansi, no. telepon, domisili).
3. **Kompetisi (`/api/competitions`)**:
   - `GET /api/competitions`: Daftar kompetisi aktif beserta status pendaftaran user.
   - `GET /api/competitions/:slug`: Detail kompetisi lengkap dengan timeline, prize breakdown, dan link guidebook.
4. **Manajemen Tim (`/api/competitions/:id/team`)**:
   - `POST /team`: Pembentukan tim baru dengan auto-generated kode tim unik format `AAA-1111` (e.g. `ABC-X7K2`).
   - `POST /team/join`: Bergabung ke tim menggunakan kode tim (validasi kuota dan batas registrasi batch).
   - `GET /team/public`: Daftar tim publik yang mencari anggota.
   - `POST /team/join-public`: Bergabung langsung ke tim publik.
   - `PATCH /team/visibility`: Toggle visibilitas tim (hanya ketua tim).
   - `DELETE /team/members/:memberId`: Menghapus anggota tim atau keluar tim.
5. **Persyaratan Dokumen & Berkas (`/api/competitions/:id/requirements`)**:
   - `GET /requirements`: Daftar status persyaratan (grup & individu) beserta signed download URL.
   - `POST /requirements/:id/upload`: Unggah berkas dokumen (verifikasi magic bytes PDF/JPG/PNG, batas ukuran 500 KB, upload ke R2).
   - `DELETE /requirements/:id`: Hapus berkas persyaratan.
6. **Akses Berkas Aman (`/api/files/:key`)**:
   - Verifikasi URL bertanda tangan (HMAC-SHA256 signature + expiry timestamp) untuk akses berkas privat dari R2.
7. **Event & Workshop (`/api/events`)**:
   - `GET /events`: Daftar event, kuota tersisa, dan pembicara.
   - `POST /events/:id/register`: Pendaftaran event dengan proteksi kuota atomik dan bukti pembayaran.
8. **Dashboard Peserta (`/api/dashboard`)**:
   - `GET /dashboard/journey`: Status progres journey peserta.
   - `GET /dashboard/calendar`: Kalender gabungan (jadwal kompetisi & event yang diikuti).
   - `GET /dashboard/assignments`: Daftar tugas dan persyaratan yang harus diselesaikan.
9. **Admin Panel (`/api/admin`)**:
   - `GET /admin/registrations`: Monitoring seluruh tim dan peserta terdaftar.
   - `GET /admin/registrations/export`: Ekspor data registrasi dalam format CSV.
   - `PATCH /admin/submissions/:id/review`: Review persetujuan/penolakan berkas (otomatis hapus file dari R2 jika ditolak).
   - `POST /admin/announcements`: Publikasi pengumuman untuk peserta.

---

## 🛠️ Panduan Menjalankan Secara Lokal

### 1. Masuk ke direktori backend
```bash
cd backend
```

### 2. Jalankan migrasi database lokal (D1)
```bash
npm run db:migrate:local
```

### 3. Masukkan data awal (Seed D1)
```bash
npm run db:seed:local
```

### 4. Buat Akun Admin / Panitia Lokal
```bash
npm run db:admin:local
```
*Akun default*: `admin@ioe2027.itb.ac.id` / `AdminIOE2027!`

### 5. Jalankan Local Development Server (Port 8000)
```bash
npm run dev
```
Server akan aktif di `http://localhost:8000` dengan endpoint health check di `http://localhost:8000/api/health`.

---

## 🧪 Pengujian (Unit & Integration Testing)

Seluruh logika bisnis, database D1 lokal, bucket R2 lokal, serta autentikasi telah diuji secara komprehensif menggunakan **Vitest** dan **Cloudflare Workers Pool**:

```bash
# Jalankan seluruh test suite (30 skenario uji)
npm test

# Jalankan type checking TypeScript
npm run typecheck
```

---

## 🔗 Integrasi dengan Frontend (Next.js)

Frontend Next.js telah dikonfigurasikan dengan Route Handler proxy yang mengarahkan panggilan API server-side ke backend Workers:
Pastikan file `.env.local` di root proyek berisi:
```env
WORKERS_API_URL=http://localhost:8000/api
```
