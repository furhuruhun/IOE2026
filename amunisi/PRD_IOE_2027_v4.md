# Project Requirement Document — Indonesia Ocean Expo (IOE) 2027

| Field | Value |
|---|---|
| Versi | 4 (resolve kontradiksi antara PRD & USER_FLOWS: team uniqueness, rejected file, redirect event, admin panel, kalender, naming) |
| Tgl Revisi Terakhir | [isi tanggal] |
| Status | Menunggu Konfirmasi Klien |
| Disusun oleh | Farhan & Raka |

## Revisi
| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1 | 4 Jun 2026 | Draft awal (IOE 2026) | - |
| 2 | [tgl] | Update ke IOE 2027: overview, metrics, persona, scope | - |
| 3 | [tgl] | Regenerate Functional Requirements, NFR, form fields, risks | - |
| 4 | [tgl] | Fix kontradiksi: keunikan nama tim, flow rejected file, redirect event register, Admin Panel resmi in-scope, kalender gabung event+kompetisi, standarisasi "My Journey", tambah halaman My Profile | - |

## Glosarium
- **SHALL** = wajib diimplementasikan (Must Have, tidak bisa ditawar)
- **SHOULD** = sangat disarankan (Should Have, bisa ditunda ke fase berikutnya kalau resource terbatas)
- **MAY** = opsional (Nice to Have)
- **PIC** = Person in Charge
- **⚠️** = butuh konfirmasi klien sebelum development mulai

---

## 1. Overview
Website Indonesia Ocean Expo (IOE) 2027 dengan tema **"Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation"** adalah platform digital resmi event yang diselenggarakan oleh **KMKL ITB**. Website ini menjadi *single source of truth* bagi calon peserta untuk mendapatkan informasi dan mendaftar ke seluruh rangkaian kompetisi dan event, dilengkapi dashboard akun peserta untuk melacak progres pendaftaran mereka ("My Journey"), serta admin panel bagi panitia.

---

## 2. Goals & Metrics

### 2.1 Goals
1. Mempermudah peserta mendaftar secara online tanpa perlu menghubungi panitia manual
2. Menjadi single source of truth untuk semua kegiatan event
3. Meningkatkan jangkauan peserta secara nasional (terutama short course yang daring)
4. Memberikan pengalaman terpusat bagi peserta untuk melacak seluruh kompetisi/event yang mereka ikuti melalui dashboard akun
5. Memberikan panitia alat resmi untuk mengelola & memverifikasi pendaftar (Admin Panel)

### 2.2 Business Metrics
| Metric | Target | Cara Ukur |
|---|---|---|
| Jumlah pendaftar Business Case Competition | 20 tim | Jumlah submit form |
| Jumlah pendaftar Paper & Poster Competition | 15 tim | Jumlah submit form |
| Jumlah pendaftar Design Competitions | 10 tim | Jumlah submit form |
| Jumlah pendaftar Talkshow/Seminar | 100 orang | Jumlah submit form |
| Jumlah pendaftar Exhibition | 200 orang | Jumlah submit form |
| Jumlah pendaftar Short Course | 20 orang | Jumlah submit form |

### 2.3 Product Metrics
| Kategori | Metric | Target |
|---|---|---|
| Acquisition | Jumlah unique visitor | 400 orang |
| Acquisition | Sumber traffic utama | Dilacak via GA |
| Conversion | Visitor → mulai isi form | 75% |
| Conversion | Mulai isi form → submit berhasil | 95% |
| Reliability | Uptime | ≥ 99% selama periode pendaftaran |
| Reliability | Form submission error rate | < 1% |
| UX | LCP mobile | < 2.5 detik |
| UX | LCP desktop | < 2.0 detik |
| UX | Waktu user menemukan info lomba dari landing | < 2 menit |

---

## 3. Target & User Persona

### 3.1 Mahasiswa (Peserta Utama)
- Usia 20-an, akses mayoritas HP
- Goals: cari lomba untuk portfolio/CV, info hadiah & jenis kompetisi, info teknis
- Pain points: syarat pendaftaran tersebar; verifikasi pembayaran lama
- Perilaku: sebelumnya biasa daftar via Google Form; daftar H-1 deadline
- Skenario: scroll IG malam hari → klik link bio → cari info lomba, tutup kalau >2 menit tidak ketemu

### 3.2 Panitia/Admin
- Goals: memantau jumlah pendaftar, export data, verifikasi pembayaran manual, menerima/menolak Registration Requirements per peserta/tim
- Perilaku: menggunakan **Admin Panel** khusus (terkonfirmasi masuk In Scope — lihat §4.1)

✅ **Resolved:** Admin Panel dipastikan masuk scope pengerjaan. Detail requirement/fitur di dalamnya **belum ditentukan** — perlu sesi requirement gathering terpisah sebelum sprint Admin Panel dimulai (lihat §12 Open Questions).

### 3.4 Sponsor/Mitra (opsional)
- Goals: exposure branding di website

---

## 4. Project Scope

### 4.1 In Scope — Ringkasan Halaman
| Halaman | Komponen Utama |
|---|---|
| Landing Page | Navbar (logo, "IOE 2027", tombol Login, CTA Competition, CTA Event), hero carousel (3 item), about section (maskot + deskripsi + list sponsor), timeline section, memories section, footer |
| Competition Details (per lomba) | Hero (CTA Register + Download Guidebook), about + countdown, timeline spesifik, "What You'll Gain" (tilted card layout), sponsor section, FAQ section |
| Competition Overview | Hero (deskripsi + countdown keseluruhan), about, CTA ke tiap competition details, timeline keseluruhan, sponsor section |
| Event Details (umum, contoh: Workshop) | Hero (CTA Register + countdown), about, "What You'll Gain" (fanned card layout), timeline spesifik, section pendaftaran dengan card speaker (data speaker + CTA Register + toggle "Lihat Rundown" yang overlay slide) |
| Event Overview | Hero (deskripsi + countdown keseluruhan), about, CTA ke tiap event details, timeline keseluruhan, sponsor section |
| Login & Register | Form standar + opsi login Google |
| My Profile | Halaman edit profil peserta: nama, email, **institusi/universitas**, dan data lain (lihat §5.j — baru) |
| Dashboard | 3 kolom: kiri (nav + profil), tengah ("My Journey" + "Assignment"), kanan (kalender gabungan event + kompetisi yang diikuti user, s.d. Mei 2027) |
| Confirmation Page | Halaman sukses pendaftaran |
| **Admin Panel** | **Baru dipastikan in-scope. Fitur detail: TBD** — kemungkinan mencakup: lihat/export data pendaftar, verifikasi/tolak Registration Requirements, kelola pengumuman |

### 4.2 Out of Scope
- Payment Gateway (dikonfirmasi: tanpa gateway, pakai manual transfer + upload bukti)
- Notifikasi/reminder (email blast)
- Deskripsi lomba & copywriting (disediakan klien)

### 4.3 Conditional — Sudah Diputuskan
| Item | Keputusan |
|---|---|
| Halaman FAQ | Ada, di bagian akhir tiap halaman competition details |
| Download brosur/flyer | Ada, disediakan klien |
| Embed Google Maps | Ada |
| Countdown timer per deadline | Ada, per kegiatan |

---

## 5. Functional Requirements

### 5.a Global / Semua Halaman
| ID | Requirement | Prioritas |
|---|---|---|
| F-01 | Sistem SHALL menampilkan navbar berisi logo IOE 2027, teks "IOE 2027", tombol Login, CTA Competition, dan CTA Event pada setiap halaman publik | Must Have |
| F-02 | Sistem SHALL mengubah navbar menjadi hamburger menu pada layar kecil | Must Have |
| F-03 | Sistem SHALL menampilkan foto profil/avatar pada navbar menggantikan tombol Login apabila user sudah login | Must Have |
| F-04 | Sistem SHALL menampilkan footer berisi kontak panitia, tautan media sosial, dan copyright pada setiap halaman publik | Must Have |
| F-05 | Sistem SHOULD menyediakan tombol share ke WhatsApp/Instagram/LinkedIn pada halaman competition details dan event details | Should Have |
| F-06 | Sistem SHOULD menampilkan Open Graph thumbnail dan judul sesuai saat halaman dibagikan | Should Have |

### 5.b Landing Page
| ID | Requirement | Prioritas |
|---|---|---|
| F-07 | Sistem SHALL menampilkan hero section berupa carousel berisi 3 item | Must Have |
| F-08 | Sistem SHOULD mendukung navigasi carousel manual (klik/swipe) dan auto-rotate | Should Have |
| F-09 | Sistem SHALL menampilkan about section berisi maskot IOE 2027, deskripsi event, dan list sponsor | Must Have |
| F-10 | Sistem SHALL menampilkan timeline section rangkaian kegiatan keseluruhan event | Must Have |
| F-11 | Sistem SHALL menampilkan memories section berisi dokumentasi event tahun-tahun sebelumnya | Must Have |

### 5.c Halaman Competition Details (per lomba)
| ID | Requirement | Prioritas |
|---|---|---|
| F-12 | Sistem SHALL menampilkan hero section dengan CTA "Register" dan CTA "Download Guidebook" | Must Have |
| F-13 | Sistem SHALL menampilkan about section penjelasan detail kompetisi disertai countdown menuju deadline pendaftaran | Must Have |
| F-14 | Sistem SHALL menampilkan timeline spesifik kompetisi (tanggal buka, batas daftar, pengumuman, dst) | Must Have |
| F-15 | Sistem SHALL menampilkan section "What You'll Gain" bergaya **tilted card layout** berisi perks/benefit peserta | Must Have |
| F-16 | Sistem SHALL menampilkan sponsor section | Must Have |
| F-17 | Sistem SHALL menampilkan FAQ section di bagian akhir halaman | Must Have |
| F-18 | Sistem SHALL menyediakan modal Create Team / Join Team saat "Register" diklik (field: lihat §7) | Must Have |
| F-18a | Sistem TIDAK mewajibkan nama tim unik secara global — tim lain boleh memakai nama yang sama. Identitas unik tim ditentukan oleh **Team Code**, bukan nama tim | Must Have |
| F-19 | Sistem SHALL memvalidasi seluruh field wajib dan menampilkan pesan error spesifik per field apabila validasi gagal | Must Have |
| F-20 | Sistem SHALL menerima upload file (proposal, KTM, foto tim) format PDF/JPG/PNG dengan batas maksimal **500 KB** per file (dikonfirmasi, tidak diubah) | Must Have |

> ⚠️ **Klarifikasi F-20 — format per jenis file berbeda, lihat API_CONTRACT.md §File Upload Convention:** F-20 menyebut PDF/JPG/PNG secara umum, namun API_CONTRACT v1.1 sudah mengklasifikasikan lebih spesifik berdasarkan konfirmasi: (1) **5 item Registration Requirements standar** (Payment Proof, Identity Card, Passport Photo, Active Student Status Letter, Twibbon/Poster Proof) → **JPG/PNG saja**, bukan PDF, karena seluruhnya berbentuk file gambar fisik; (2) **Proposal/karya kompetisi** → PDF/JPG/PNG; (3) **CV di form Event Registration** → PDF only. F-20 tidak salah secara spirit, tapi implementasi harus mengacu ke klasifikasi per-konteks di API_CONTRACT, bukan generalisasi PDF/JPG/PNG untuk semua jenis upload.
| F-21 | Sistem SHALL menampilkan konfirmasi sukses setelah form berhasil disubmit | Must Have |

### 5.d Halaman Competition Overview
| ID | Requirement | Prioritas |
|---|---|---|
| F-22 | Sistem SHALL menampilkan hero section berisi deskripsi dan countdown keseluruhan pendaftaran seluruh kompetisi | Must Have |
| F-23 | Sistem SHALL menampilkan about section penjelasan cakupan competition overview | Must Have |
| F-24 | Sistem SHALL menyediakan CTA menuju masing-masing halaman competition details | Must Have |
| F-25 | Sistem SHALL menampilkan timeline keseluruhan kompetisi | Must Have |
| F-26 | Sistem SHALL menampilkan sponsor section | Must Have |

### 5.e Halaman Event Details (umum)
| ID | Requirement | Prioritas |
|---|---|---|
| F-27 | Sistem SHALL menampilkan hero section dengan CTA Register dan countdown event | Must Have |
| F-28 | Sistem SHALL menampilkan about section penjelasan detail event | Must Have |
| F-29 | Sistem SHALL menampilkan section "What You'll Gain" bergaya **fanned card layout (FannedCard)** berisi perks/benefit peserta | Must Have |
| F-29a | FannedCard SHOULD auto-geser (loop bolak-balik) di antara kartu-kartu yang ada — pola serupa dengan auto-rotate Hero Carousel (F-08) | Should Have |
| F-30 | Sistem SHALL menampilkan timeline spesifik event | Must Have |
| F-31 | Sistem SHALL menyediakan CTA "Register" yang menavigasikan ke halaman terpisah `/events/[slug]/register` | Must Have |

**Turunan Workshop (contoh event details):**
| ID | Requirement | Prioritas |
|---|---|---|
| F-32 | Sistem SHALL menampilkan card untuk masing-masing speaker berisi data speaker: nama, tempat, waktu, judul workshop, dsb | Must Have |
| F-33 | Sistem SHALL menyediakan CTA "Register" dan opsi "Lihat Rundown" pada bagian bawah tiap card speaker | Must Have |
| F-34 | Ketika opsi "Lihat Rundown" diklik, sistem SHALL menampilkan rundown yang scrollable dengan transisi **slide**, menimpa (overlay) bagian "data speaker" pada card yang sama; tombol berubah menjadi "Lihat Speaker" untuk kembali | Must Have |
| F-34a | Form registrasi Workshop SHALL menjadi **1 endpoint tunggal** untuk seluruh speaker, dengan **radio button** untuk memilih speaker/sesi yang ingin diikuti | Must Have |

### 5.f Halaman Event Overview
| ID | Requirement | Prioritas |
|---|---|---|
| F-35 | Sistem SHALL menampilkan hero section berisi deskripsi dan countdown keseluruhan pendaftaran seluruh event | Must Have |
| F-36 | Sistem SHALL menampilkan about section penjelasan cakupan event overview | Must Have |
| F-37 | Sistem SHALL menyediakan CTA menuju masing-masing halaman event details | Must Have |
| F-38 | Sistem SHALL menampilkan timeline keseluruhan event | Must Have |
| F-39 | Sistem SHALL menampilkan sponsor section | Must Have |

### 5.g Halaman Login & Register
| ID | Requirement | Prioritas |
|---|---|---|
| F-40 | Sistem SHALL menyediakan halaman/form Login dan Register | Must Have |
| F-41 | Sistem SHALL menyediakan opsi login menggunakan akun Google (OAuth) | Must Have |
| F-42 | Sistem SHALL memvalidasi input register (format email, kekuatan password, dsb) | Must Have |
| F-43 | Sistem SHALL menampilkan pesan error yang jelas untuk kredensial salah atau akun duplikat | Must Have |
| F-43a | Sistem SHALL mewajibkan login (**force auth**) sebelum user dapat mengakses form pendaftaran competition/event manapun — bukan isi form dulu baru login | Must Have |

### 5.h Halaman Dashboard
| ID | Requirement | Prioritas |
|---|---|---|
| F-44 | Dashboard SHALL dibagi menjadi 3 bagian horizontal: sidebar kiri, konten tengah, sidebar kanan | Must Have |
| F-45 | Sidebar kiri SHALL menampilkan CTA Home, CTA Profile, CTA Event, CTA Competition, dan foto profil peserta yang login | Must Have |
| F-46 | Sistem SHALL mengambil foto profil dan nama secara otomatis dari akun Google apabila user login via akun Google | Must Have |
| F-47 | Bagian tengah SHALL menampilkan section **"My Journey"** berisi placeholder/kontainer kompetisi yang diikuti, dilengkapi tombol "Add Another" | Must Have |
| F-47a | Kontainer "My Journey" TIDAK memiliki batas maksimal jumlah kompetisi — apabila melebihi lebar kontainer, SHALL menjadi **scrollable horizontal** | Must Have |
| F-48 | Ketika peserta menambahkan kompetisi melalui "Add Another", sistem SHALL menyimpan dan menampilkan logo kompetisi tersebut di placeholder "My Journey" sebagai penanda pendaftaran sedang berlangsung | Must Have |
| F-49 | Bagian tengah SHALL menampilkan section "Assignment" berisi to-do untuk mendaftar/melengkapi persyaratan tiap kompetisi, agar keikutsertaan dapat diverifikasi. Detail spesifikasi item Assignment: **TBD** | Must Have |
| F-50 | Bagian kanan SHALL menampilkan kalender fisik (calendar view) yang mencakup periode hingga Mei 2027 | Must Have |
| F-51 | Sistem SHALL menampilkan bullet list di bawah kalender yang menghighlight tanggal-tanggal terdekat dari **seluruh kompetisi DAN event** yang telah terdaftar resmi oleh user (bukan hanya kompetisi) | Must Have |
| F-52 | Sistem SHALL membatasi akses halaman Dashboard hanya untuk user yang sudah login | Must Have |

### 5.i Halaman Konfirmasi
| ID | Requirement | Prioritas |
|---|---|---|
| F-53 | Sistem SHALL menampilkan halaman konfirmasi sukses setelah pendaftaran berhasil disubmit | Must Have |
| F-54 | Sistem SHOULD mengirimkan email konfirmasi otomatis ke pendaftar setelah submit berhasil | Should Have |

### 5.j Halaman My Profile
| ID | Requirement | Prioritas |
|---|---|---|
| F-55 | Sistem SHALL menyediakan halaman My Profile berisi field: **Nama, Email (read-only, tidak bisa diedit), Institusi/Universitas, No. WhatsApp, Domisili** | Must Have |
| F-56 | Data Institusi/No.WhatsApp/Domisili dari My Profile SHALL dipakai untuk auto-fill (editable) form registrasi Event, tanpa perlu diinput ulang manual — lihat detail di API_CONTRACT.md `POST /events/:id/register` | Must Have |

✅ **Resolved — field final Profile:** Nama, Email, Institusi, No. WhatsApp, Domisili. **Tidak** menambahkan Year of Birth, Last Education, Job (terpisah dari Institusi), maupun fitur Referral Code (semua di luar scope IOE 2027, dikonfirmasi). **Line ID** tetap hanya ada di form registrasi Event (§7), tidak dipindahkan ke Profile.

✅ **Email bersifat read-only** di My Profile — mengikuti pola umum (identitas akun terikat ke email yang dipakai saat register/login, tidak bisa diubah sendiri oleh user tanpa proses verifikasi ulang).

### 5.k Halaman Admin Panel (baru, scope pasti — fitur TBD)
| ID | Requirement | Prioritas |
|---|---|---|
| F-57 | Sistem SHALL menyediakan Admin Panel yang hanya dapat diakses oleh role Panitia | Must Have |
| F-58 | ⚠️ Fitur detail (lihat data pendaftar, export .xlsx/.csv, approve/reject Registration Requirements, kelola pengumuman, dsb) — **belum ditentukan, perlu sesi requirement gathering terpisah** | TBD |

---

## 6. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | LCP < 2.5s (mobile), < 2.0s (desktop) sesuai target §2.3 |
| Security | HTTPS wajib; password di-hash (bukan plaintext); token OAuth Google ditangani sesuai best practice (tidak disimpan di client-side storage yang exposed) |
| Security | Route Dashboard & Admin Panel SHALL terproteksi — redirect ke Login apabila diakses tanpa sesi aktif/role yang sesuai |
| Data Privacy | Patuh UU PDP — consent checkbox di form registrasi; scope data yang diminta dari akun Google dibatasi minimal (nama, email, foto profil saja) |
| Accessibility | Kontras warna WCAG AA minimum; form & dashboard bisa dinavigasi via keyboard |
| Browser Support | 2 versi terbaru Chrome, Safari, Firefox, Edge; Safari iOS untuk mobile |
| Scalability | Sanggup menahan traffic spike H-1 deadline pendaftaran |
| Data Accuracy | Kalender pada dashboard SHALL menggunakan timezone WIB dan tetap akurat hingga Mei 2027 |

✅ **Dikonfirmasi:** Proyek ini menggunakan backend + database (bukan static site) — mencakup user accounts, competition/event tracking, task/assignment data, dan Admin Panel.

---

## 7. Form Fields

**Form Register Akun (Login & Register):**
- Nama lengkap, email, password, konfirmasi password (atau login via Google), Consent UU PDP (checkbox wajib dicentang, validasi client-side only, tidak dikirim ke BE)

**Form Create Team (Competition):**
- Nama Tim (tidak perlu unik secara global — lihat F-18a)
- Setelah tim terbentuk: sistem generate **kode tim random** yang bisa di-copy untuk dibagikan ke calon anggota (dipakai di flow Join Team)
- Detail persyaratan lomba (KTM, proposal, foto tim, bukti pembayaran, dst) **TIDAK** diisi di form ini — diisi belakangan lewat halaman "Registration Requirements" di Dashboard (per item, per Group/Individual Task)

**Form Pendaftaran Event (Talkshow/Workshop/Exhibition/Short Course):**
- Radio "Which session do you want to attend?" (Seminar/Workshop, atau pilihan speaker spesifik untuk Workshop — lihat F-34a)
- Phone Number (WhatsApp)* — wajib
- Line ID (Optional)
- Job/Institution* — wajib
- Domicile* — wajib
- Upload CV (Optional)
- Upload bukti transfer (kalau event berbayar) — field tambahan di form yang sama

✅ **Resolved:** field Institution/Phone/Domicile di form Event ini **auto-fill dari My Profile** (editable), sesuai keputusan §5.j dan detail teknis di API_CONTRACT.md `POST /events/:id/register`.

---

## 8. Assumptions & Dependencies
- Klien (KMKL ITB) menyediakan seluruh copywriting, guidebook PDF, brosur/flyer, dan daftar sponsor sebelum development halaman terkait dimulai
- Klien menyediakan data & foto seluruh speaker/tutor beserta rundown masing-masing workshop
- Klien menyediakan aset visual: logo IOE 2027, maskot, dokumentasi event tahun sebelumnya (untuk memories section)
- Google OAuth Client ID/Secret disiapkan sebelum development fitur login dimulai
- Metode pembayaran: manual transfer + upload bukti (dikonfirmasi, tanpa payment gateway)
- Ukuran maksimal upload 500 KB per file dikonfirmasi final, tidak perlu diubah

## 9. Risks
| Risk | Dampak | Mitigasi |
|---|---|---|
| Scope bergeser dari static site ke aplikasi full-stack (akun, dashboard, admin panel, tracking) | Timeline & effort dev meningkat signifikan dari estimasi awal | Komunikasikan ulang timeline & resource ke klien secepatnya |
| Data speaker/rundown/konten kompetisi telat dari klien | Development halaman competition/event details tertunda | Set deadline konten eksplisit per halaman |
| Requirement Admin Panel belum didetailkan (baru dipastikan masuk scope, isi belum ditentukan) | Sprint Admin Panel tidak bisa dimulai tanpa spec jelas | Jadwalkan sesi requirement gathering khusus Admin Panel sebelum sprint terkait dimulai |
| Interaksi kompleks (Registration Requirements accordion, kalender gabungan event+kompetisi) tanpa wireframe | Kesalahan asumsi UX saat development | Buat wireframe/prototype Figma sebelum dev mulai |

## 10. Stakeholders & Approval
| Role | Nama | Tanggung Jawab |
|---|---|---|
| Klien/PIC KMKL ITB | Thomas | Approve scope, konten, jadwal |
| PM/Tim Dev | Farhan & Raka | Eksekusi & timeline |
| Designer | Farhan | UI/UX (Figma: sudah ada, link internal) |

## 11. Timeline ⚠️
*(isi milestone: kickoff, wireframe/design approval, dev sprint per modul (public pages → auth → dashboard → admin panel), UAT, launch)*

## 12. Open Questions (rekap)
1. Detail fitur Admin Panel (F-58) — perlu sesi requirement gathering terpisah
2. ~~Field My Profile final, dan apakah form Event auto-fill dari Profile atau input manual terpisah~~ → ✅ Resolved di §5.j dan API_CONTRACT v1.1
3. Butuh email konfirmasi otomatis (F-54) — pakai domain/service apa? Belum ditentukan
4. Deadline klien kirim konten (copywriting, guidebook, data speaker, sponsor, dokumentasi memories) — belum ditetapkan eksplisit

---

## 13. Awareness — Item Belum Terselesaikan

> Section ini merangkum hal-hal yang masih terbuka atau belum dikonfirmasi di dokumen ini. Update saat item resolved.

| # | Item | Lokasi di PRD | Perlu dari siapa |
|---|---|---|---|
| A1 | **Milestone & timeline development** belum diisi sama sekali | §11 | PM (Farhan & Raka) | -> tidak esensial buat implementasi sekarang jadi biarkan saja
| A2 | **Tanggal revisi** di header dan tabel Revisi masih `[isi tanggal]`/`[tgl]` | Header, §Revisi | PM | -> tidak esensial buat implementasi sekarang jadi biarkan saja
| A3 | **Email konfirmasi otomatis (F-54)** — SHOULD Have, tapi domain/service email belum ditentukan. Kalau tidak diputuskan sebelum sprint konfirmasi, fitur ini tidak bisa diimplementasikan | §5.i | Tim dev + klien | -> akan dikerjakan nanti dan dipending saja dulu
| A4 | **Consent checkbox UU PDP** disebut di NFR §6 tapi tidak muncul di §7 Form Fields manapun dan tidak ada di USER_FLOWS — perlu ditambahkan ke field form registrasi akun dan/atau event | §6 NFR Data Privacy | Tim dev + klien (konfirmasi scope checkbox) | -> sudah di update
| A5 | **Detail fitur Admin Panel (F-58)** — scope dipastikan masuk tapi isi fitur belum ditentukan | §5.k | Requirement gathering terpisah | -> akan dikerjakan nanti dan dipending saja dulu
| A6 | **Deadline konten dari klien** (copywriting, guidebook, data speaker, foto, sponsor, dokumentasi memories) belum ditetapkan. Ini hard dependency — halaman tidak bisa dev tanpa konten | §8 | Klien (Thomas/KMKL ITB) | ->  Tidak esensial buat implementasi sekarang jadi biarkan saja pakai "lorem ipsum" etc untuk text dan sebagainya
| A7 | **F-20 format file** — sudah diklarifikasi di catatan F-20 di atas, tapi perlu dikonfirmasi klien bahwa KTM/foto tim memang hanya boleh JPG/PNG (bukan PDF) | §5.c F-20 | Klien |
