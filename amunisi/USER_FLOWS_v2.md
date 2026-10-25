# User Flows — Website IOE 2027

## Flow: Registrasi Akun (Email)
1. User buka `/register`
2. User isi form (nama, email, password)
3. Sistem validasi field real-time (format email, kekuatan password)
4. User submit → sistem create akun → redirect ke `/dashboard`

### Edge Cases
- Email sudah terdaftar → tampilkan error spesifik, tawarkan link ke `/login`
- Password lemah → tampilkan indikator kekuatan password sebelum submit

## Flow: Login via Google OAuth
1. User klik "Login with Google" di `/login`
2. Redirect ke Google consent screen
3. User approve → redirect balik ke app dengan token
4. Sistem ambil nama, email, foto profil dari akun Google → simpan sesi
5. Redirect ke `/dashboard`

### Edge Cases
- User cancel di consent screen → balik ke `/login`, tampilkan pesan netral (bukan error mengancam)
- Email Google sudah terdaftar manual sebelumnya → merge/link account langsung

## Flow: Kompetisi Berbasis Tim (dari Landing → Submit)
**⚠️ Asumsi:** flow ini berlaku untuk kompetisi yang mensyaratkan tim (misal Business Case Competition). 
1. User di / klik CTA Competition → masuk /competitions
2. User pilih salah satu kompetisi → masuk /competitions/[slug]
3. User baca detail, klik "Register"
4. Kalau belum login: redirect ke /login
5. Setelah login sukses → redirect kembali ke /competitions/[slug] (endpoint yang sama, bukan endpoint baru)
6. Sistem otomatis menampilkan modal dengan 2 pilihan: "Create Team" atau "Join Team"

## Cabang A -- Create Team
7. User klik "Create Team" → konten modal berganti secara instan (modal yang sama, isi berbeda) → muncul field "Nama Tim"
8. User isi nama tim → klik tombol create
9. Redirect ke /dashboard → kode tim ditampilkan di dashboard apabila user mengecek di details per lomba mereka
10. User melanjutkan melengkapi persyaratan lomba (upload dokumen, dst — field sesuai §7 PRD) dari dashboard

## Cabang B -- Join Team
7. User klik "Join Team" → konten modal berganti instan → muncul field "Kode Tim"
8. User masukkan kode → submit
9. Sistem menampilkan notifikasi (toast) yang turun dari atas, tahan sebentar, lalu naik/hilang lagi — menandakan berhasil atau gagal join
10. Kalau berhasil → redirect ke /dashboard, user join sebagai anggota tim yang sudah ada
11. Kalau gagal (kode salah/tim penuh/dst) → toast menampilkan pesan error, modal tetap terbuka supaya user bisa coba lagi

### Edge Cases
1. Nama tim sudah dipakai tim lain di kompetisi yang sama → Boleh sama asalkan universitasnya beda
2. Kode tim salah/tidak ditemukan → toast error, field kode di-highlight, tidak menutup modal
3. Kode tim valid tapi tim sudah penuh (kuota anggota max) → toast error spesifik "Tim sudah penuh"
4. User yang sudah jadi anggota tim di kompetisi ini coba akses modal lagi → modal skip otomatis, langsung ke dashboard
5. Upload file syarat lomba gagal (size/format salah) → error spesifik per file, tidak reset field lain
6. Melengkapi syarat setelah kuota penuh/lewat deadline → form disabled, pesan jelas kenapa
7. User close modal tanpa pilih Create/Join → diperbolehkan (bisa buka lagi nanti) 

## Flow: Lihat Rundown di Event Details (Workshop)
1. User di `/events/[slug]` lihat card speaker (data speaker default tampil)
2. User klik "Lihat Rundown"
3. Card overlay: data speaker digantikan tampilan rundown yang scrollable dan tombol Lihat Rundown berubah tulisannya menjadi "Lihat Speaker"
4. User klik kembali (tombol "Lihat Speaker") → balik ke tampilan data speaker 

## Flow: Dashboard — Tambah Kompetisi ke My Journey
1. User login, masuk `/dashboard`
2. Di section "My Journey", user klik "Add Another"
3. Redirect ke /competitions
4. Masuk ke flow "Kompetisi Berbasis Tim (dari Landing sampai Submit)"

### Edge Cases
- User coba tambah kompetisi yang sama dua kali → Biarkan, tapi jika sudah terdaftar di suatu tim pada kompetisi tertentu, user akan langsung diarahkan ke /dashboard
- User di tengah proses create/join team (belum submit), lalu tekan tombol back browser → balik ke /competitions
- Kompetisi yang statusnya sudah lewat deadline pendaftaran tapi belum diikuti user → card tetap muncul di /competitions tapi tombol "Register" disabled dengan label "Pendaftaran Ditutup"

## Flow: Flow: Melengkapi Persyaratan Lomba & Kelola Tim (Halaman Detail Aktivitas)
1. User di /dashboard, section "My Activities" menampilkan grid kompetisi yang diikuti (logo tiap kompetisi) + tombol "Add another" (ikon plus, sesuai flow "Tambah Kompetisi ke My Journey" yang sudah didefinisikan)
2. Section "Assignments" di bawahnya menampilkan card per kompetisi yang diikuti: nama kompetisi, ikon, due date, dan tombol "See Details"
3. User klik "See Details" → konten area utama dashboard berganti secara instan (client-side state, bukan navigasi/routing) — endpoint URL tetap /dashboard, mirip pattern overlay "Lihat Rundown" yang sudah kita definisikan sebelumnya
4. Tampilan "detail aktivitas" menggantikan tampilan "My Activities + Assignments" di area yang sama, menampilkan (dari atas ke bawah):
  - **Hero banner:** nama kompetisi, deskripsi singkat, tombol "Lihat Guidebook" (link ke PDF), tombol "Join Discord", countdown real-time menuju deadline
  - **Section "Your Team":** nama tim, badge Batch, badge status (Verified/Pending), Team Code, toggle visibility Private/Public, nama Team Leader, list Team Members (nama yang didapatkan dari "my profile"), dengan aksi khusus leader (assign, remove member)
  - **Section "Timeline" (kanan):** tahapan kompetisi per tanggal (Open Registration, Query Practices, Technical Meeting, Penyisihan, Pengumuman Finalis, dst)
  - **Section "Registration Requirements":** list/accordion, bukan 1 form panjang — tiap item requirement adalah section collapsible sendiri. Contoh item: Payment Proof Document, Identity Card/Document, Passport Photo (Pas Foto), Active Student Status Letter, Proof of Uploading Twibbon and Poster
  - **Widget "Announcement" (kanan, bawah Timeline):** pengumuman dari panitia terkait kompetisi ini, kosong kalau belum ada ("No announcement for now")
  - **Section "How can we help you?" (paling bawah):** kontak panitia (email + WhatsApp)
5. Tombol "Back" mengembalikan state ke tampilan "My Activities + Assignments" semula — bukan tombol back browser, karena URL tidak berubah

### Detail: Isi Tiap Item "Registration Requirements"
Tiap requirement punya badge tipe (**Group Task** atau **Individual Task**) dan badge status (**Accepted/Approved**, kemungkinan juga Pending & Rejected). Saat item di-expand, isinya:
1. Banner status berwarna (misal hijau: "Your payment proof has been accepted.")
2. Info due date, dengan label "Deadline passed" kalau sudah lewat
3. Instruksi teks spesifik per item — khusus Payment Proof: nomor rekening tujuan transfer + kode unik yang wajib ditambahkan ke nominal transfer, disertai contoh perhitungan
4. Area upload: drag & drop file, **auto-upload begitu file di-drop** (tidak ada tombol "Submit" terpisah)
5. Setelah upload: preview file, 3 ikon aksi (lihat/eye, edit/pensil, hapus/trash), teks konfirmasi "File telah terupload!" + nama file

**Perbedaan Group Task vs Individual Task:**
- **Group Task** (misal Payment Proof) → 1x per tim, biasanya diisi oleh seorang saja, berlaku untuk seluruh anggota
- **Individual Task** (misal KTM, Pas Foto, Surat Aktif Mahasiswa) → tiap anggota tim punya requirement list sendiri-sendiri, harus diisi masing-masing

**Status keseluruhan tim ("Verified" di section Your Team)** merupakan hasil agregat: semua Group Task + semua Individual Task tiap anggota berstatus Accepted/Approved.

### Catatan teknis penting
Karena URL tetap `/dashboard` (tidak pakai route/query param terpisah), ada trade-off yang perlu disadari:
- **Refresh halaman** saat sedang di tampilan detail → state hilang, balik ke tampilan default "My Activities". Kalau ini masalah (misal user mau share link langsung ke detail kompetisi tertentu, atau nggak sengaja refresh), pertimbangkan pakai query param seperti `/dashboard?activity=data-analytics-dash` — tetap "satu halaman" secara UX, tapi state persist saat refresh dan bisa di-share

### Edge Cases
- Toggle **Private/Public** tim → perbedaan: Public = tim bisa ditemukan & di-join tanpa kode, Private = wajib pakai kode. Jika ingin mengimplementasikan ini silahkan tanyakan terlebih dahulu saat implementasi
- Team Leader klik remove member (hanya team leader yang bisa remove member) → Member yang di-remove dapat notifikasi "kamu Bukan Lagi Bagian dari Grup [Nama Tim]" dan logo serta activities dari kompetisi tsb dihapus dari dashboard
- Guidebook belum tersedia dari klien → tombol "Lihat Guidebook" disabled
- User (bukan leader) buka halaman ini → aksi assign/remove member disembunyikan
- Upload file gagal (size/format salah) → error spesifik pada item requirement terkait, tidak mempengaruhi item lain
- Requirement item berstatus **Rejected** oleh panitia → user akan diberikan alasan spesifik melalui admin panel dan file tersebut tidak dapat diupload lagi dan otomatis dihapus dari sisi si pendaftar
- User re-upload file yang sudah Approved → status tetap Approved?

## Flow: Daftar Event Non-Kompetisi (Talkshow / Short Course / Exhibition)
Berbeda dari kompetisi — event ini **individual**, tidak ada sistem create/join team.

1. User di `/` klik CTA Event → masuk `/events`
2. User pilih salah satu event → masuk `/events/[slug]`
3. User baca detail (about, "What You'll Gain", timeline, biaya & kapasitas)
4. User klik "Register" (di section pendaftaran, F-31) → navigasi ke halaman terpisah /events/[slug]/register (bukan form inline, bukan client-state swap — beda dari pattern kompetisi)
5. **Kalau belum login:** redirect ke `/login` → setelah sukses, redirect kembali ke `/events/[slug]`
6. Halaman registrasi menampilkan:
    - Judul "[Nama Batch] Registration" (misal "Batch 1 Registration"), deskripsi singkat, dan tenggat pendaftaran
    - Banner status kalau registrasi batch tersebut sudah ditutup (misal teks merah "Registration for Batch 1 has closed") — form tetap tampil tapi disabled    
    - Field "Which session do you want to attend?" (radio: Seminar / Workshop) — pemilihan tipe sesi terjadi di sini, bukan per card speaker
    - Field: Phone Number (WhatsApp), Line ID (Optional), Job/Institution, Domicile*, Upload CV (Optional)
7. Kalau event berbayar (misal Short Course): upload bukti transfer jadi field di form yang sama
8. Submit → validasi → redirect ke `/confirmation`
9. Event yang berhasil didaftar muncul di "Event" di dashboard (ada CTA nya). Meskipun begitu, jadwal event yang sudah ter register tersebut nanti akan masuk ke kalendar di home (ada CTA nya) di dashboard

### Edge Cases
- Kuota event penuh / deadline lewat → tombol "Register" disabled dengan pesan jelas (F-38 sudah cover behavior serupa untuk talkshow)
- **Khusus Workshop:** karena pendaftaran terjadi per card speaker (F-32–34, bukan section pendaftaran umum), Form regist nya untuk seluruh speaker akan jadi 1 endpoint tapi akan ada radio button untuk pilih mana yang mau diikuti
- User yang sudah terdaftar event ini coba akses `/events/[slug]` lagi → tombol Register berubah jadi "Sudah Terdaftar" 

## Flow: [Tambahkan flow lain sesuai kebutuhan]
