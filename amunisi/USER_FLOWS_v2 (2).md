# User Flows — Website IOE 2027

## Flow: Registrasi Akun (Email)
1. User buka `/register`
2. User isi form (nama, email, password)
3. Sistem validasi field real-time (format email, kekuatan password)
4. Centang consent checkbox sebelum submit (wajib dicentang, tombol submit disabled kalau belum)
5. User submit → sistem create akun → redirect ke `/dashboard`

### Edge Cases
- Email sudah terdaftar → tampilkan error spesifik, tawarkan link ke `/login`
- Password lemah → tampilkan indikator kekuatan password sebelum submit
- user coba submit tanpa centang → tombol tetap disabled atau tampilkan pesan

## Flow: Login via Google OAuth
1. User klik "Login with Google" di `/login`
2. Redirect ke Google consent screen
3. User approve → redirect balik ke app dengan token
4. Sistem ambil nama, email, foto profil dari akun Google → simpan sesi
5. Redirect ke `/dashboard`

### Edge Cases
- User cancel di consent screen → balik ke `/login`, tampilkan pesan netral (bukan error mengancam)
- Email Google sudah terdaftar manual sebelumnya → merge/link akun langsung

## Flow: Kompetisi Berbasis Tim (dari Landing → Submit)
**Asumsi:** flow ini berlaku untuk kompetisi yang mensyaratkan tim (misal Business Case Competition).

1. User di `/` klik CTA Competition → masuk `/competitions`
2. User pilih salah satu kompetisi → masuk `/competitions/[slug]`
3. User baca detail, klik "Register"
4. **Kalau belum login:** redirect ke `/login` (force auth — user tidak bisa isi form dulu baru login)
5. Setelah login sukses → redirect kembali ke `/competitions/[slug]` (endpoint yang sama, bukan endpoint baru)
6. Sistem otomatis menampilkan modal dengan 2 pilihan: **"Create Team"** atau **"Join Team"**

### Cabang A — Create Team
7. User klik "Create Team" → konten modal berganti instan → muncul field "Nama Tim"
8. User isi nama tim → klik tombol create
9. Sistem generate **Team Code** random (bisa di-copy untuk dibagikan) → redirect ke `/dashboard`. Team Code ditampilkan di detail per lomba (halaman "Melengkapi Persyaratan Lomba")
10. User melanjutkan melengkapi Registration Requirements dari dashboard

### Cabang B — Join Team via Team Code
7. User klik "Join Team" → konten modal berganti instan → muncul field "Kode Tim"
8. User masukkan kode → submit
9. Sistem menampilkan toast notifikasi (turun dari atas, tahan sebentar, naik/hilang lagi) — berhasil atau gagal join
10. Kalau berhasil → redirect ke `/dashboard`, user jadi anggota tim yang sudah ada
11. Kalau gagal (kode salah/tim penuh) → toast error, modal tetap terbuka

### Cabang C — Join Team via Public Team (✅ dikonfirmasi)
Cabang ini diakses dari dalam tab "Join Team" — bukan flow terpisah dari Cabang B.

7. Di bawah field Team Code, terdapat link teks **"atau pilih dari tim yang membuka pendaftaran"**
8. User klik link → konten modal berganti instan (bukan modal baru) menampilkan list tim Public untuk kompetisi ini — FE hit `GET /competitions/:id/team/public`
9. Kalau tidak ada tim Public sama sekali → tampilkan state kosong ("Belum ada tim yang membuka pendaftaran publik"), tetap ada tombol "Kembali"
10. User pilih satu tim dari list → FE hit `POST /competitions/:id/team/join-public` → Workers cek ke DB apakah tim masih Public dan belum penuh
11. Kalau valid → join berhasil → toast sukses → redirect ke `/dashboard`
12. Kalau tim sudah berubah ke Private → toast error "Tim ini tidak lagi membuka pendaftaran publik" (`TEAM_NOT_PUBLIC`), list tetap terbuka
13. Kalau tim sudah penuh → toast error "Tim ini sudah penuh" (`TEAM_FULL`), list tetap terbuka
14. Tombol/link "Kembali" tersedia di tampilan list — user bisa balik ke tampilan field Team Code kapan saja

### Edge Cases
- **Nama tim boleh sama** dengan tim lain — sistem TIDAK mewajibkan keunikan nama tim secara global. Identitas unik tim ditentukan oleh **Team Code**, bukan nama tim atau universitas. Data institusi/universitas peserta disimpan terpisah di halaman **My Profile**, tidak dikumpulkan ulang saat create team
- Kode tim salah/tidak ditemukan → toast error, field kode di-highlight, modal tidak tertutup
- Kode tim valid tapi tim sudah penuh → toast error spesifik "Tim sudah penuh"
- User yang sudah jadi anggota tim di kompetisi ini coba akses modal lagi → modal di-skip otomatis, langsung ke `/dashboard`
- Upload file syarat lomba gagal (size/format salah) → error spesifik per file, tidak reset field lain
- Melengkapi syarat setelah kuota penuh/lewat deadline → form disabled, pesan jelas kenapa
- User close modal tanpa pilih Create/Join → diperbolehkan, bisa dibuka lagi nanti

## Flow: Lihat Rundown di Event Details (Workshop)
1. User di `/events/[slug]` lihat card speaker (data speaker default tampil)
2. User klik "Lihat Rundown"
3. Card overlay dengan transisi **slide**: data speaker digantikan tampilan rundown yang scrollable, tombol berubah tulisan jadi **"Lihat Speaker"**
4. User klik "Lihat Speaker" → balik ke tampilan data speaker (slide kembali)

## Flow: Dashboard — Tambah Kompetisi ke My Journey
1. User login, berada di `/dashboard`
2. Di section **"My Journey"**, user klik tombol "Add Another"
3. Redirect ke `/competitions`
4. Lanjut mengikuti flow "Kompetisi Berbasis Tim (dari Landing → Submit)"

### Edge Cases
- User coba tambah kompetisi yang sama dua kali → dibiarkan mencoba, tapi kalau user sudah terdaftar di suatu tim pada kompetisi tersebut, langsung diarahkan ke `/dashboard` (skip modal)
- User di tengah proses create/join team (belum submit), lalu tekan tombol back browser → balik ke `/competitions`
- Kompetisi yang lewat deadline pendaftaran tapi belum diikuti user → card tetap muncul tapi tombol "Register" disabled, label "Pendaftaran Ditutup"

*(Catatan: sempat dipertimbangkan modal berisi logo bulat-bulat tiap kompetisi yang langsung membuka modal Create/Join Team saat diklik — diputuskan TIDAK dipakai, karena user perlu baca detail lomba dulu sebelum commit bikin/join tim.)*

## Flow: Melengkapi Persyaratan Lomba & Kelola Tim (Halaman Detail Aktivitas)
Referensi visual: screenshot dashboard COMPFEST.

1. User di `/dashboard`, section **"My Journey"** menampilkan grid kompetisi yang diikuti (logo tiap kompetisi) + tombol "Add another"
2. Section "Assignments" di bawahnya menampilkan card per kompetisi yang diikuti: nama kompetisi, ikon, due date, dan tombol "See Details"
3. User klik "See Details" → konten area utama dashboard berganti secara instan (client-side state, bukan navigasi/routing) — endpoint URL tetap `/dashboard`, mirip pattern overlay "Lihat Rundown"
4. Tampilan "detail aktivitas" menggantikan tampilan **"My Journey + Assignments"** di area yang sama, menampilkan (dari atas ke bawah):
   - **Hero banner**: nama kompetisi, deskripsi singkat, tombol "Lihat Guidebook" (disabled kalau belum tersedia dari klien), tombol "Join Discord", countdown real-time menuju deadline
   - **Section "Your Team"**: nama tim, badge Batch, badge status (Verified/Pending), **Team Code**, toggle visibility Private/Public (lihat detail di bawah), nama Team Leader, list Team Members (nama diambil dari My Profile), aksi khusus leader (remove member — hanya Team Leader yang bisa)
   - **Section "Registration Requirements"**: list/accordion, tiap item requirement collapsible sendiri (Payment Proof Document, Identity Card/Document, Passport Photo, Active Student Status Letter, Proof of Uploading Twibbon and Poster, dst)
   - **Section "Timeline"** (kanan): tahapan kompetisi per tanggal
   - **Widget "Announcement"** (kanan, bawah Timeline): pengumuman dari panitia, kosong kalau belum ada
   - **Section "How can we help you?"** (paling bawah): kontak panitia (email + WhatsApp)
5. Tombol "Back" mengembalikan state ke tampilan "My Journey + Assignments" semula — bukan tombol back browser, karena URL tidak berubah

### Detail: Toggle Visibility Tim (✅ dikonfirmasi)
Toggle Private/Public hanya bisa diubah oleh **Team Leader**:
- **Private** (default saat tim dibuat): tim hanya bisa di-join oleh orang lain melalui Team Code yang dibagikan manual
- **Public**: tim muncul di daftar tim yang bisa di-join langsung oleh user lain yang mendaftar kompetisi yang sama, tanpa perlu Team Code

User yang bukan Team Leader → toggle disembunyikan atau di-disable (tidak ditampilkan aksi ubah).

### Detail: Isi Tiap Item "Registration Requirements"
Tiap requirement punya badge tipe (**Group Task** atau **Individual Task**) dan badge status (**Accepted/Approved**, **Pending**, **Rejected**). Saat di-expand:
1. Banner status berwarna (misal hijau: "Your payment proof has been accepted.")
2. Info due date, label "Deadline passed" kalau sudah lewat
3. Instruksi teks spesifik per item — khusus Payment Proof: nomor rekening tujuan + kode unik yang ditambahkan ke nominal transfer, dengan contoh perhitungan
4. Area upload: drag & drop file, auto-upload begitu file di-drop (tidak ada tombol "Submit" terpisah)
5. Setelah upload: preview file, 3 ikon aksi (lihat/edit/hapus), teks konfirmasi "File telah terupload!" + nama file

**Group Task vs Individual Task:**
- **Group Task** (misal Payment Proof) → 1x per tim, diisi oleh satu orang (biasanya leader), berlaku untuk seluruh anggota
- **Individual Task** (misal KTM, Pas Foto, Surat Aktif Mahasiswa) → tiap anggota tim punya requirement list sendiri, diisi masing-masing

**Status "Verified" di Your Team** = agregat: semua Group Task + semua Individual Task tiap anggota berstatus Accepted/Approved.

**Behavior status Rejected (dikonfirmasi):** ketika sebuah item requirement di-reject oleh panitia (lewat Admin Panel), user diberi alasan penolakan, dan **file lama otomatis dihapus dari sistem** sehingga area upload untuk item tersebut kembali kosong — user langsung bisa upload file baru tanpa perlu menghapus manual dulu. Ini BUKAN status permanen/terkunci.

**Lock area upload — dua kondisi independen:**
- Status item `accepted` → field terkunci permanen, tidak bisa upload ulang. Pesan: *"Dokumen ini sudah disetujui dan tidak bisa diubah lagi"* (`REQUIREMENT_LOCKED`)
- `dueDate` item terlewati → field terkunci, **apapun status saat ini** termasuk `pending`. File lama tetap tersimpan, tapi tidak bisa diganti. Pesan harus berbeda — jelaskan soal deadline, bukan soal sudah disetujui (`DEADLINE_PASSED`)

### Catatan teknis penting
Karena URL tetap `/dashboard` (tidak pakai route/query param terpisah):
- **Refresh halaman** saat di tampilan detail → state hilang, balik ke default "My Journey". Kalau share-link/refresh-persist dibutuhkan, pertimbangkan query param seperti `/dashboard?activity=data-analytics-dash`

### Edge Cases
- Team Leader klik remove member → member yang di-remove mendapat notifikasi **"Kamu Bukan Lagi Bagian dari Grup [Nama Tim]"**, dan logo + activities kompetisi tsb otomatis terhapus dari dashboard-nya
- Guidebook belum tersedia dari klien → tombol "Lihat Guidebook" disabled
- User (bukan leader) buka halaman ini → aksi remove member dan toggle visibility disembunyikan
- Upload file gagal (size/format salah) → error spesifik pada item requirement terkait saja, tidak mempengaruhi item lain
- Requirement item berstatus **Rejected** → lihat "Behavior status Rejected" di atas
- Item berstatus **Accepted** → area upload terkunci permanen (tidak bisa re-upload, field disabled)
- Deadline item terlewati → area upload terkunci dengan pesan deadline, terlepas dari status item saat ini

## Flow: Daftar Event Non-Kompetisi (Talkshow / Short Course / Exhibition)
Berbeda dari kompetisi — event ini **individual**, tidak ada sistem create/join team.
Referensi visual: screenshot halaman registrasi COMPFEST X Celerate.

1. User di `/` klik CTA Event → masuk `/events`
2. User pilih salah satu event → masuk `/events/[slug]`
3. User baca detail (about, "What You'll Gain", timeline, biaya & kapasitas)
4. User klik "Register" → navigasi ke halaman terpisah `/events/[slug]/register` (bukan form inline, bukan client-state swap — beda pattern dari kompetisi)
5. **Kalau belum login:** redirect ke `/login` (force auth) → setelah sukses, redirect **kembali ke `/events/[slug]/register`** (bukan ke halaman detail — supaya user tidak perlu klik Register dua kali)
6. Halaman registrasi menampilkan:
   - Judul "[Nama Batch] Registration", deskripsi singkat, dan tenggat pendaftaran
   - Banner status kalau registrasi batch sudah ditutup (misal teks merah "Registration for Batch 1 has closed") — form tetap tampil tapi disabled
   - Field "Which session do you want to attend?" (radio: Seminar / Workshop) — untuk Workshop, radio button memilih speaker/sesi spesifik (F-34a), tetap 1 endpoint form untuk semua speaker
   - Field: Phone Number (WhatsApp)*, Line ID (Optional), Job/Institution*, Domicile*, Upload CV (Optional, format PDF)
   - Field Phone/Institution/Domicile **auto-fill dari My Profile** (editable, tidak menulis balik ke Profile)
7. Kalau event berbayar (misal Short Course): upload bukti transfer jadi field tambahan di form yang sama
8. Submit → validasi → redirect ke `/confirmation?from=registration` (Sistem kirim email notifikasi ke user setelah redirect. Bukan langkah terpisah, hanya catatan di langkah yang sama)
9. Event yang berhasil didaftar muncul di section **"Event"** di dashboard (dengan CTA-nya sendiri, terpisah dari "My Journey" yang khusus kompetisi). Jadwalnya juga otomatis masuk ke **kalender di Home dashboard**, digabung dengan jadwal kompetisi (lihat F-51)

### Edge Cases
- Kuota event penuh / deadline lewat → tombol "Register" di `/events/[slug]` disabled dengan pesan jelas sebelum masuk ke halaman form
- **Khusus Workshop:** form registrasi 1 endpoint untuk seluruh speaker, dengan radio button pilih speaker/sesi yang mau diikuti — bukan form terpisah per card speaker
- User yang sudah terdaftar event ini coba akses `/events/[slug]` lagi → tombol Register berubah jadi "Sudah Terdaftar"
- email gagal terkirim → pendaftaran tetap dianggap berhasil, tidak rollback. User tetap masuk dashboard

## Flow: [Tambahkan flow lain sesuai kebutuhan — kandidat berikutnya: Admin Panel (scope pasti, detail fitur masih TBD, lihat PRD §5.k)]

---

## Awareness — Item Belum Terselesaikan

> Item di bawah ini masih terbuka atau perlu dikonfirmasi sebelum implementasi flow terkait.

| # | Item | Flow terkait | Perlu dari siapa |
|---|---|---|---|
| A1 | **Flow Admin Panel** belum ada sama sekali — kandidat flow berikutnya tapi scope fitur belum ditentukan | — | Requirement gathering terpisah | -> akan ditentukan nanti, pending saja dulu
| A2 | **Cabang C (Join Public Team)** — flow sudah ditambahkan, tapi belum ada edge case untuk kondisi tim yang berubah dari Public ke Private di tengah jalan saat user sedang di halaman modal (selain error `TEAM_NOT_PUBLIC` dari BE) | Flow Kompetisi Berbasis Tim Cabang C | Tim dev | -> sudah di-resolve
| A3 | **Behavior Countdown Timer saat waktu habis** — belum ditentukan apakah timer menampilkan 00:00:00 atau berubah jadi teks "Pendaftaran Ditutup". Relevan untuk semua flow yang menyebut countdown (kompetisi & event) | Semua flow dengan deadline | Tim dev + desainer | -> tampilkan 00:00:00
| A4 | **Service/domain email konfirmasi (F-54)** — flow sudah dicatat (notifikasi server-side, fire-and-forget), tapi service email belum ditentukan. Blocker untuk implementasi di BE | Flow Daftar Event (post-submit) | Tim dev + klien |
