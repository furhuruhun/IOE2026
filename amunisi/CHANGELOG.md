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

### [2026-08-18 01:48] HeroCarousel — section full-viewport (100dvh), kartu height jadi vh-based (bukan aspect-ratio lagi), jarak dots dibesarkan

- **Tipe:** Fix (eksperimental, atas instruksi CSS eksplisit dari user, "coba kamu terapkan begini coba")
- **Scope:** `src/features/landing/HeroCarousel.tsx`
- **Ringkasan:** 3 perubahan CSS diminta user, diadaptasi ke pola inline-style komponen ini (bukan file CSS terpisah, karena komponen ini murni pakai `style={{}}` inline + Tailwind utility, tidak ada CSS module/global class khusus untuk hero):
  1. **Section full-viewport:** `<section>` (`.carousel-section` di spec) sekarang `minHeight: "100dvh"` + `flex flex-col items-center justify-center` (sebelumnya cuma `relative mx-auto max-w-[1100px] py-3xl`, height mengikuti konten). Dikonfirmasi via `getBoundingClientRect()`: section height match persis viewport height (100dvh).
  2. **Kartu height jadi vh-based, aspect-ratio dilepas:** kartu (dan viewport pembungkusnya) sebelumnya height-nya turunan dari `aspect-ratio:3/2` terhadap width. Sekarang width & height independen: `width: min(880px, 85vw)` (gabungan dari 2 style properti sebelumnya, `width:880px`+`maxWidth:88vw`, jadi satu shorthand `min()` sesuai request), `height: clamp(560px, 62vh, 700px)`, `aspectRatio: "auto"`. Viewport pembungkus (`.carousel-viewport`) height-nya disamakan jadi `clamp(560px, 62vh, 700px)` juga (sebelumnya `clamp(300px, 44vw, 600px)` dari entry sebelumnya) supaya tidak meng-crop kartu yang sekarang independen dari width.
  3. **Jarak dots:** `mt-md` (16px) → `mt-2xl` (48px, token resmi dari `globals.css --spacing-2xl`) antara viewport carousel dan baris dots+counter.
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — lihat 3 poin di atas.
- **Terkait requirement:** F-07 (Landing Hero), `design_system_final.md` §HeroCarousel
- **⚠️ Deviasi lanjutan dari `design_system_final.md` §HeroCarousel (akumulasi dari 3 entry hari ini — rotateY, width fixed 880px, sekarang height vh-based tanpa aspect-ratio):** dokumen itu mendokumentasikan height kartu murni dari `aspect-ratio:3/2` (bukan `clamp(vh)` independen), dan section tidak didokumentasikan sebagai full-viewport (`.carousel-section` cuma `max-width:1100px; margin:0 auto; position:relative`, tanpa `min-height:100dvh`). Belum di-update manual oleh manusia — lihat catatan kumulatif di entry-entry sebelumnya.
- **Breaking change:** Tidak (visual only), TAPI section sekarang selalu setinggi 1 layar penuh (100dvh) — kalau ada section lain tepat di bawah Hero yang sebelumnya kelihatan sebagian di viewport awal (above the fold), sekarang users harus scroll penuh dulu buat lihatnya. Belum dicek dampaknya ke section "Tentang IOE 2027" di bawahnya.
- **Verifikasi:** `tsc --noEmit` bersih. Dicek via `getBoundingClientRect()` + `getComputedStyle()` di browser (viewport 1524×1149): `sectionHeight` 1148.75px ≈ match `window.innerHeight` 1149 (100dvh benar), kartu aktif `880×700` (width dari `min(880,85vw=1295.4)=880`, height dari `clamp(560,62vh=712.4,700)=700`, dua-duanya sesuai formula), `dotsMarginTop` computed `48px` (match `mt-2xl`).
- **Belum selesai / follow-up:**
  1. `design_system_final.md` §HeroCarousel makin tidak sinkron (sekarang 3 deviasi terakumulasi: rotateY, width fixed+min(), height vh-based+full-viewport section) — perlu direview & diputuskan manusia apakah mau dijadikan spec resmi baru atau di-revert.
  2. **Belum dicek dampak visual ke section-section lain di bawah Hero** akibat section sekarang selalu 100dvh (minimal 1 layar penuh) — berpotensi mengubah "rasa" scroll pertama kali halaman dibuka (section "Tentang IOE 2027" dst jadi lebih jauh ke bawah). User perlu scroll-check sendiri atau saya perlu diminta eksplisit untuk cek ini di sesi berikutnya.
  3. Dua clamp (`min(880px,85vw)` untuk width kartu, `clamp(560px,62vh,700px)` untuk height kartu+viewport) belum ditest kombinasinya di viewport SANGAT pendek (misal browser landscape mobile, height <560/0.62≈903px) — di situ `62vh` bisa turun di bawah minimum 560px clamp, tapi minimum clamp tetap menjamin ≥560px, jadi secara teori aman, cuma belum divisualkan langsung.

### [2026-08-18 01:45] HeroCarousel — tambah `max-width: 88vw` supaya kartu ikut menyusut di viewport sempit, sama seperti referensi standalone

- **Tipe:** Fix
- **Scope:** `src/features/landing/HeroCarousel.tsx`
- **Ringkasan:** Follow-up dari entry `[2026-08-18 01:06]` (width fixed 880px). Waktu user coba ukur kartu di referensi HTML standalone lewat DevTools Computed panel, hasilnya nyusut jadi ~856px lebar (bukan tetap 880px) di viewport yang lebih sempit — ternyata kode referensi punya `max-width:88vw` yang aku belum ikutin. Ditambahkan `maxWidth: "88vw"` ke style kartu supaya perilakunya sama: di viewport lebar (88vw > 880px, kira-kira viewport >1000px) kartu tetap 880px seperti biasa: dikonfirmasi di 1470px viewport width kartu aktif tetap `880×586.664` persis. Di viewport sempit kartu akan ikut menyusut proporsional (`88vw`) alih-alih tetap kaku 880px dan overflow/ke-crop seperti sebelumnya — ini juga sekaligus mengurangi risiko yang dicatat di follow-up entry sebelumnya soal potensi crop parah di mobile.
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — tambah `maxWidth: "88vw"` di style kartu (setelah `width: "880px"`)
- **Terkait requirement:** F-07 (Landing Hero), `design_system_final.md` §HeroCarousel (masih belum sinkron dari entry-entry sebelumnya, `max-width:88vw` menambah satu deviasi lagi dari clamp resmi yang terdokumentasi)
- **Breaking change:** Tidak
- **Verifikasi:** `tsc --noEmit` bersih. Dicek via `getBoundingClientRect()` di browser: pada viewport 1470px (88vw=1293.6px, tidak mengikat), kartu aktif tetap persis `880×586.664` — konfirmasi `max-width` baru ini tidak mengubah perilaku di viewport lebar. **Belum sempat diverifikasi visual di viewport sempit** (resize_window lewat automation tool gagal benar-benar mengecilkan `window.innerWidth` di sesi ini — tetap terbaca 1470 meski sudah diminta resize ke 973×700), jadi perilaku shrink di layar sempit baru diverifikasi lewat pembacaan CSS/matematika, bukan screenshot langsung.
- **Belum selesai / follow-up:**
  1. Belum ada verifikasi visual langsung (screenshot) untuk perilaku `max-width:88vw` di viewport sempit/mobile — perlu dicoba manual oleh user atau di sesi lain dengan browser yang resize-nya berhasil.
  2. `design_system_final.md` §HeroCarousel masih perlu direview manual oleh manusia untuk mencerminkan seluruh rangkaian perubahan hari ini (rotateY, width 880px fixed, max-width 88vw) — lihat entry-entry sebelumnya di atas.

### [2026-08-18 01:06] HeroCarousel — width kartu jadi fixed 880px (bukan clamp responsif lagi), percobaan atas instruksi user ("coba dulu")

- **Tipe:** Fix (eksperimental, eksplisit diminta user pakai kata "coba dulu")
- **Scope:** `src/features/landing/HeroCarousel.tsx`
- **Ringkasan:** Width dasar semua kartu (aktif maupun tetangga) diubah dari `clamp(300px, 58vw, 640px)` jadi fixed `880px`, meniru width kartu di referensi HTML standalone. `aspect-ratio: 3/2` yang sudah ada dipertahankan (tidak diubah), jadi height ikut otomatis jadi fixed `586.67px` (dikonfirmasi via `getBoundingClientRect()`: kartu aktif `880×586.66`, kartu tetangga `627.18×548.45` setelah `scale(0.82)`). Mekanisme size-differentiation TIDAK diubah — tetap pakai `transform: scale()` untuk mengecilkan kartu tetangga, bukan width terpisah per kartu (sesuai konfirmasi user).
- **Perubahan pendamping (diperlukan, bukan pilihan bebas):** `.carousel-viewport` height dinaikkan dari `clamp(300px, 40vw, 460px)` jadi `clamp(300px, 44vw, 600px)` — height lama (max 460px) lebih kecil dari height kartu baru (586.67px fixed), jadi kartu aktif akan ke-crop vertikal oleh `overflow:hidden` viewport kalau tidak dinaikkan. Nilai `600px` dipilih untuk kasih sedikit margin di atas 586.67px.
- **⚠️ Deviasi lanjutan dari `design_system_final.md` §HeroCarousel:** dokumen itu mendokumentasikan width kartu sebagai `clamp(300px, 58vw, 640px)` (responsif) — BUKAN kasus "mekanisme lama yang sudah digantikan" seperti rotateY di entry sebelumnya, ini memang spec final yang berlaku sampai sekarang. User sudah dikonfirmasi lewat pertanyaan eksplisit sebelum implementasi (target 880×586.67px via aspect-ratio yang ada, bukan angka 535.961px yang sempat disebut user tapi tidak match aspect-ratio manapun — dikonfirmasi user pakai opsi 586.67px) dan memilih tetap fixed 880px (bukan clamp) meski berisiko overflow horizontal di layar sempit karena viewport full-bleed pakai `overflow:hidden` (card lebih lebar dari layar akan ke-crop di kiri-kanan, bukan menyusut).
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — `width` kartu: `clamp(300px, 58vw, 640px)` → `880px`. Height viewport: `clamp(300px, 40vw, 460px)` → `clamp(300px, 44vw, 600px)`.
- **Terkait requirement:** F-07 (Landing Hero), `design_system_final.md` §HeroCarousel (makin tidak sinkron, lihat catatan di atas dan di entry `[2026-08-18 00:55]`)
- **Breaking change:** Tidak (visual only), tapi berpotensi overflow/crop horizontal di viewport sempit (<880px) — belum ditest khusus di breakpoint mobile.
- **Verifikasi:** `tsc --noEmit` bersih. Dicek via browser + `getBoundingClientRect()` langsung di DOM (bukan cuma baca kode): dimensi kartu aktif & tetangga sesuai perhitungan di atas, tidak ada clipping vertikal di viewport desktop (~1446px lebar) yang dites.
- **Belum selesai / follow-up:**
  1. Sama seperti entry sebelumnya — `design_system_final.md` §HeroCarousel butuh direview manual oleh manusia, sekarang makin tidak sinkron (width juga ikut berubah, bukan cuma rotateY).
  2. **Belum ditest di layar sempit/mobile.** Karena width kartu sekarang fixed 880px tanpa clamp, kemungkinan besar bakal ke-crop kiri-kanan parah di layar <880px lebar (viewport full-bleed `overflow:hidden`). User bilang ini "coba dulu" — kemungkinan bukan keputusan final, perlu ditest lebih lanjut atau ditambahkan breakpoint responsif kalau mau dipakai permanen.

### [2026-08-18 00:55] HeroCarousel — rotateY 3D-tilt dibalikin lagi ke neighbor slide (kontradiksi sadar dengan design_system_final.md)

- **Tipe:** Fix
- **Scope:** `src/features/landing/HeroCarousel.tsx`
- **Ringkasan:** Atas instruksi eksplisit user, neighbor slide (kartu kiri/kanan non-aktif) HeroCarousel dikasih balik efek 3D `rotateY` + `perspective`, ditune dari referensi HTML standalone (`amunisi/IOE 2027 Landing (Standalone) (1).html`, mekanisme `rawSlides.map`/`CARD_W`/`peek`) yang dipakai user sebagai referensi gaya visual. Mekanisme lama diadaptasi ke unit responsif proyek ini (persen, bukan px fixed dari `CARD_W=880`): `NEIGHBOR_OFFSET_PERCENT` 58→60, `NEIGHBOR_SCALE` 0.86→0.82, tambah `NEIGHBOR_ROTATE_DEG=22` (baru), `transformOrigin` dibuat dinamis (`0% 50%`/`100% 50%` di sisi kiri/kanan biar rotasi "hinge" dari tepi dekat kartu tengah, bukan dari titik tengah kartu sendiri) — sama seperti pola `origin`/`diff===-1`/`diff===1` di referensi standalone. `perspective: 2200px` ditambah di `.carousel-viewport` supaya `rotateY` kelihatan efeknya (tanpa `perspective`, `rotateY` cuma keliatan squash 2D, bukan tilt 3D). `NEIGHBOR_OPACITY` (0.5) dan mekanisme `zIndex`/shortest-path wrap TIDAK diubah — user cuma minta ubah transform (offset/scale/rotate).
- **⚠️ KONTRADIKSI SADAR dengan dokumen sumber:** `design_system_final.md:904` eksplisit bilang mekanisme `rotateY`/`scale(0.88)`/`translateX(±82%)` dari "iterasi 3" **sudah digantikan** oleh mekanisme `translateX`-percent tanpa rotateY (iterasi 4, entry `[2026-08-16 09:20]` di bawah) dan secara eksplisit melarang "jangan campur lagi" nilai-nilai itu. Saya sudah flag kontradiksi ini ke user sebelum mengerjakan (lihat percakapan) dan user memilih tetap lanjut implementasi + catat unsync di sini, bukan update dokumen dulu. **`design_system_final.md` §HeroCarousel sekarang TIDAK SINKRON dengan kode** — dokumen masih bilang "jangan pakai rotateY lagi", tapi kode sekarang pakai rotateY. Perlu direview manual oleh manusia: apakah dokumen mau diupdate jadi "iterasi 5" resmi (rotateY balik jadi keputusan final), atau ini cuma perubahan sementara yang nanti di-revert.
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — tambah `NEIGHBOR_ROTATE_DEG`, field `rotateY`+`transformOrigin` di `SlideGeometry`/`getSlideGeometry()`, `perspective:2200px` di viewport style, `transform` slide sekarang include `rotateY(${geo.rotateY}deg)`. Tune `NEIGHBOR_OFFSET_PERCENT` (58→60) dan `NEIGHBOR_SCALE` (0.86→0.82).
- **Terkait requirement:** F-07 (Landing Hero), `design_system_final.md` §HeroCarousel (sekarang tidak sinkron, lihat catatan di atas)
- **Breaking change:** Tidak
- **Verifikasi:** `tsc --noEmit` bersih. Dicek visual via dev server (`localhost:3000`) pakai browser — kartu tengah tetap `scale(1)`/z-index teratas/tanpa rotasi, kartu tetangga kiri-kanan sekarang tampil miring 3D (`rotateY`) dengan peek lebih kecil, tidak lagi menabrak/menempel rata di tepi kartu tengah.
- **Belum selesai / follow-up:**
  1. `design_system_final.md:904` (§HeroCarousel, catatan riwayat revisi) perlu diupdate manual oleh manusia untuk mencerminkan keputusan ini — lihat detail kontradiksi di atas.
  2. Saat proses verifikasi, sempat `pkill -f "next dev"` yang secara tidak sengaja mematikan proses dev server lain milik user yang sudah berjalan sebelumnya di port 3000 (PID 48583) — sudah di-restart ulang dev server di port 3000, tapi state proses lama (kalau ada yang belum di-save/berjalan di background di proses itu) tidak bisa dipulihkan begitu saja. User perlu cek sendiri apakah ada dampak dari ini.

### [2026-08-16 10:05] HeroCarousel slide 1 — kembali ke CountdownTimer circle-gradient, buang gauge kotak

- **Tipe:** Fix (perubahan cepat, revert sebagian dari entry sebelumnya)
- **Scope:** `src/features/landing/HeroCarousel.tsx`, `src/features/landing/landingContent.ts`
- **Ringkasan:** Atas instruksi langsung user, komponen `HeroGauge` lokal (kotak persegi, 4 unit Hari/Jam/Menit/Detik) yang baru dibangun di iterasi 4 dibuang, diganti kembali pakai component `CountdownTimer` yang sudah ada (circle-gradient, 3 unit Hours/Minutes/Seconds) — sama seperti sebelum iterasi 4. Ini **membalik** keputusan eksplisit di entry sebelumnya ("gauge... BUKAN pengganti CountdownTimer... jangan disatukan atau saling menggantikan") — dicatat di sini supaya jelas ini perubahan arah sadar dari user, bukan saya yang menyalahi instruksi sebelumnya sendiri.
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — hapus total `HeroGauge`, `GaugeTime`, `getGaugeTime`, `GAUGE_UNITS` (±40 baris). Import `CountdownTimer` dari `@/components/ui/CountdownTimer`, render itu langsung di slide 1
  - `src/features/landing/landingContent.ts` — field `hasGauge` di-rename jadi `showCountdown` (lebih akurat merepresentasikan isinya sekarang)
- **Terkait requirement:** F-07 (Landing Hero), `design_system_final.md` §Countdown Timer (component yang dipakai ulang, tidak diubah sama sekali)
- **Breaking change:** Tidak
- **Verifikasi:** Build+lint bersih. SSR HTML dicek: circle 72px/112px + label `Hours`/`Minutes`/`Seconds` hadir (konfirmasi `CountdownTimer` asli terpasang), 0 kemunculan `clamp(46px` (bekas gauge kotak) dan 0 kemunculan label `Hari`/`Jam`/`Menit`/`Detik` (konfirmasi gauge lama benar-benar hilang, bukan sisa).
- **Belum selesai / follow-up:**
  1. **`design_system_final.md` §HeroCarousel "Countdown gauge" sekarang tidak sinkron dengan implementasi** — dokumen masih describe gauge kotak 4-unit, tapi kode sekarang pakai `CountdownTimer` circle 3-unit. Perlu diupdate manual oleh manusia kalau dokumen itu mau tetap jadi source of truth yang akurat.
  2. Unit "Hari" (days) yang sempat ada di gauge sekarang hilang lagi — `CountdownTimer` tidak punya unit hari (sesuai spec asli component itu: "tidak perlu unit 'days' tambahan"). Kalau target tanggal (5 Feb 2027) masih jauh dari sekarang, angka "Hours" bisa menampilkan angka besar (ratusan jam) alih-alih breakdown hari — perilaku ini sudah ada sejak `CountdownTimer` pertama dibangun, bukan regresi baru dari perubahan ini, cuma jadi relevan lagi sekarang dipakai di slide 1.

### [2026-08-16 09:20] HeroCarousel — ITERASI KE-4, rewrite total dari referensi HTML/CSS/JS kedua

- **Tipe:** Fix (rewrite total, bukan patch — kode iterasi 3 dibuang sepenuhnya)
- **Scope:** `src/features/landing/HeroCarousel.tsx`, `src/features/landing/landingContent.ts`, `src/features/landing/TimelineSection.tsx`, `src/app/globals.css`
- **Ringkasan:** Rewrite total HeroCarousel dari referensi kedua yang lebih matang UX-nya (mekanisme wrap infinite-loop bawaan via shortest-path offset, maksimal 1 tetangga terlihat tiap sisi — bukan makin transparan makin jauh). **Bukan karena iterasi 3 salah** — user eksplisit bilang iterasi 3 tidak keliru, cuma referensi baru ini dinilai lebih baik dan diminta dipakai sebagai basis. Semua nilai (`translateX(±82%)`, `rotateY`, `scale(0.88)` dari iterasi 3) sudah tidak berlaku, diganti total dengan mekanisme offset baru (`translateX(offset×58%) scale(0.86)`, TANPA rotateY/perspective 3D sama sekali). `CountdownTimer.tsx` (component circle-gradient utama, dipakai 5+ tempat) **TIDAK disentuh** — gauge kotak baru di HeroCarousel ini komponen lokal terpisah, khusus slide 1.
- **📜 Ringkasan riwayat 4 iterasi (lanjutan dari entry sebelumnya):**
  1. Iterasi 1: nama komponen doang, tanpa detail visual — flat carousel.
  2. Iterasi 2: KELIRU simpulkan mekanisme `absolute`+`translateX(%)` sendiri masalahnya — direfactor ke flex-track (salah arah).
  3. Iterasi 3: nilai literal dari referensi PERTAMA (`translateX(±82%)`, `rotateY(±18deg)`, `scale(0.88)`, banyak-tetangga-makin-transparan) — dikembalikan ke `absolute`+`transform`, BENAR secara mekanisme, tapi digantikan di iterasi ini bukan karena salah.
  4. **Iterasi 4 (entry ini)**: referensi KEDUA (lebih baru, UX lebih matang) — mekanisme offset baru (`offset×58%`, `scale(0.86)`, TANPA rotateY, maksimal 1 tetangga terlihat, shortest-path wrap eksplisit di kode `if (offset > n/2) offset -= n`), plus fitur baru yang tidak pernah ada di iterasi manapun sebelumnya: keyboard nav (ArrowLeft/Right), counter teks "{aktif+1} dari {total}", gauge countdown 4-unit (Hari/Jam/Menit/Detik) khusus slide 1, CTA pill sederhana (ganti dari blob asimetris iterasi 3), TIDAK ADA chevron prev/next sama sekali (eksplisit dihapus, beda dari iterasi 1-3 yang semuanya punya chevron).
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — rewrite total. Struktur baru: `carousel-section` (`max-width:1100px mx-auto`) → `carousel-viewport` (full-bleed breakout `100vw`+`left:50%`+`margin-left:-50vw`, `height:clamp(300px,40vw,460px)`, `tabIndex=0`+`onKeyDown` untuk ArrowLeft/Right) → slide (`position:absolute` semua di `top:50%,left:50%`, dibedakan transform) → slide-inner (motif sonar rings via `.hero-slide-sonar::before`) → eyebrow/title/desc/gauge/CTA. `getSlideGeometry()` = adaptasi `useState`+pure-function dari `layout()` vanilla JS referensi (bukan DOM manipulation) — persis logika shortest-path offset, `abs>1` → hidden penuh
  - `src/features/landing/landingContent.ts` — model konten baru: `eyebrow`+`title`+`desc` (satu paragraf, ganti dari title+subtitle+description terpisah), `hasGauge` (cuma slide 1), `cta` sekarang wajib di semua 3 slide (slide 1 dapat CTA baru "Lihat Jadwal", sebelumnya sengaja tanpa CTA)
  - `src/features/landing/TimelineSection.tsx` — tambah `id="timeline"`, target anchor scroll untuk CTA "Lihat Jadwal" slide 1
  - `src/app/globals.css` — tambah `.hero-slide-sonar::before` (motif sonar rings, `repeating-radial-gradient`, tidak bisa lewat inline style React) dan `.hero-slide` + `@media (prefers-reduced-motion: reduce)` (transition di-override jadi `opacity 300ms ease` saja) — pola yang sama dengan `@keyframes waterFlow` yang sudah ada (CSS yang tidak bisa direpresentasikan Tailwind/inline masuk globals.css)
- **Terkait requirement:** F-07/F-08, `design_system_final.md` §HeroCarousel (revisi total ke-4)
- **Breaking change:** Tidak
- **📐 Verifikasi konkret — SSR HTML + verifikasi algoritmik (bukan cuma "sudah dites"):**
  - SSR HTML `active=0` (state awal), transform 3 slide dicek byte-per-byte:
    ```
    slide[0]: translate(-50%, -50%) translateX(0%) scale(1);   opacity:1;   z-index:20  → ACTIVE ✅
    slide[1]: translate(-50%, -50%) translateX(58%) scale(0.86); opacity:0.5; z-index:19  → RIGHT  ✅
    slide[2]: translate(-50%, -50%) translateX(-58%) scale(0.86); opacity:0.5; z-index:19 → LEFT   ✅ (shortest-path wrap: 2-0=2 > n/2=1.5 → offset-=3 → -1, BUKAN "+2 jauh ke kanan")
    ```
  - `rotateY` muncul **0×** di HTML (dikonfirmasi mekanisme 3D-tilt lama benar-benar hilang, bukan cuma disembunyikan)
  - Chevron (`chevron-left`/`chevron-right`/"Slide sebelumnya"/"Slide berikutnya") muncul **0×** (dikonfirmasi benar-benar dihapus)
  - Dots: aktif `width:26px;background:var(--color-tertiary-600)`, non-aktif `width:8px;background:var(--color-neutral-900)` — match spec persis
  - Counter: `1<!-- --> dari <!-- -->3` di HTML (comment marker React normal antar text node interpolasi — render visual jadi "1 dari 3", bukan bug)
  - Gauge label: `Hari`, `Jam`, `Menit`, `Detik` semua hadir (CSS `uppercase` cuma visual, teks asli tetap title-case di data)
  - `tabindex="0" role="group"` hadir di viewport untuk keyboard nav
  - **Verifikasi algoritmik `getSlideGeometry()` via Node, SEMUA 3 nilai `active` (0,1,2) × 3 slide = 9 kombinasi, plus cek eksplisit ke-6 transisi wrap (0→1,1→2,2→0 dan sebaliknya):** setiap transisi SELALU resolve ke offset ±58% (tidak pernah lompat jauh), termasuk kasus kritis `active=2→slide 0` (harus jadi tetangga KANAN, offset+1, bukan +2 lewat belakang) dan `active=0→slide 2` (harus jadi tetangga KIRI, offset-1) — **keduanya terverifikasi benar**.
  - Build + lint bersih, tidak ada hydration error/warning di dev server log.
- **Belum selesai / follow-up:**
  1. **Background section/viewport dihapus** — spec baru tidak menyebutkan warna background sama sekali untuk `carousel-section`/`carousel-viewport` (beda dari iterasi 3 yang eksplisit minta gradient gelap). Disimpulkan dari sinyal tidak langsung: dots non-aktif pakai `neutral-900` (gelap) yang cuma masuk akal kalau backdrop-nya TERANG, bukan gradient gelap seperti sebelumnya — jadi background gradient hero LAMA saya hapus, section sekarang transparan (mewarisi bg halaman, `neutral-100`). **Ini inferensi dari sinyal desain, bukan instruksi eksplisit — perlu dikonfirmasi visual.**
  2. **Teks "eyebrow"** ("Welcome to" / "Competition" / "Event") tidak ada di spec sama sekali — dikarang sendiri, placeholder rendah-risiko, gampang diganti.
  3. **Tujuan CTA "Lihat Jadwal" (slide 1)** diarahkan ke `#timeline` (scroll ke `TimelineSection` di halaman yang sama) — spec tidak sebutkan destinasi eksplisit, ini interpretasi saya berdasarkan asosiasi kata "Jadwal"→Timeline.
  4. **`font-weight: 600` untuk judul (Coolvetica)** — kontradiksi kecil vs Typography section dokumen ini sendiri yang bilang Coolvetica cuma py 1 weight (bold/700, "❌ tidak ada weight lain"). Diimplementasikan literal (600) apa adanya — karena Coolvetica belum di-self-host (masih fallback Montserrat, lihat entry lama), fallback font Montserrat MEMANG punya weight 600, jadi secara visual tidak akan error, tapi dicatat sebagai inkonsistensi dokumen kalau nanti Coolvetica asli dipasang (perlu cek apakah font aslinya punya cut 600 atau perlu di-clamp ke 700).
  5. Follow-up item dari CountdownTimer (component utama, TIDAK disentuh task ini) masih berlaku semua — lihat entry-entry sebelumnya.

### [2026-08-15 23:40] HeroCarousel & CountdownTimer — ITERASI KE-3, rewrite total dari spec literal

- **Tipe:** Fix (rewrite total, bukan patch)
- **Scope:** `src/features/landing/HeroCarousel.tsx`, `src/features/landing/landingContent.ts`, `src/components/ui/CountdownTimer.tsx`
- **Ringkasan:** Rewrite total kedua komponen dari nol mengikuti `design_system_final.md` §HeroCarousel dan §Countdown Timer yang sudah direvisi TOTAL oleh user — kali ini berisi nilai CSS/transform LITERAL hasil ekstraksi dari kode referensi asli (bukan ringkasan konsep seperti 2 iterasi sebelumnya). Mekanisme positioning dikembalikan dari flex-track (iterasi 2, KELIRU) ke `position: absolute` + `transform` semua card di titik yang sama (`top:50%,left:50%`) — ini justru mekanisme yang BENAR dipakai referensi asli. Root cause bug overlap di iterasi 1 kemungkinan bukan di pilihan mekanisme, tapi di kalibrasi/CSS lain yang bentrok (dikonfirmasi user, dicatat sebagai riwayat di kode & di sini).
- **📜 Riwayat 3 iterasi (dicatat eksplisit sesuai permintaan, supaya history jelas tanpa perlu investigasi ulang):**
  1. **Iterasi 1** (entry `[2026-08-15 19:30]` di bawah): dibangun dari nama komponen doang di `ROUTES.md`, tanpa detail visual — carousel flat, tanpa efek 3D sama sekali.
  2. **Iterasi 2** (entry `[2026-08-15 21:15]`): spec waktu itu berbentuk RINGKASAN/interpretasi konsep ("posisi absolute + translateX persentase" disebut sebagai *masalahnya*), bukan nilai literal — disimpulkan (KELIRU) bahwa mekanisme `position:absolute`+`translateX(%)` itu sendiri yang salah, di-refactor total ke flex-track+`translate3d` pixel-based. Ternyata setelah user kasih kode referensi lengkap, mekanisme absolute+`translateX(%)` itu MEMANG yang dipakai referensi dan bekerja benar di sana — kesimpulan iterasi 2 salah arah root-cause-nya.
  3. **Iterasi 3 (entry ini)**: spec ditulis ulang total oleh user berisi nilai CSS persis dari kode referensi (bukan ringkasan) — dikembalikan ke `position:absolute`+`transform` (termasuk `translateX(±82%)`, dikonfirmasi SUDAH benar & final, jangan diubah ke unit lain), plus detail yang sebelumnya tidak pernah ada di 2 iterasi awal: ukuran card SAMA untuk semua slide (cuma beda lewat `scale()`), z-index flat 20/19 (bukan tier per-jarak), chevron `display:none` eksplisit di mobile, tombol CTA blob-shape dengan bentuk+animasi persis dari referensi.
  - **Pelajaran untuk ke depan:** kalau spec berbentuk ringkasan/paraphrase (bukan nilai CSS literal yang bisa di-copy-paste), risiko kehilangan detail penting di proses peringkasan itu nyata — sebaiknya diverifikasi ulang ke sumber asli sebelum menyimpulkan root cause bug dari deskripsi konsep semata.
- **File diubah:**
  - `src/components/ui/CountdownTimer.tsx` — rewrite total. Outer ring: `box-shadow: var(--shadow-md)` (final, ganti dari placeholder "drop-shadow-light"), background gradient border SAMA dengan HeroCarousel card. Inner circle: `linear-gradient(to bottom, primary-500, primary-1000)` (final, ganti dari placeholder `[token terang]→[token gelap]`). Icon **`mdi:timer`** (ganti dari `mdi:timer-outline`), size responsif `size-4 md:size-5` (16px/20px). Diverifikasi via perbandingan SVG path body persis dari `mdiIconBundle.generated.json` — bukan cuma asumsi nama icon benar
  - `src/features/landing/HeroCarousel.tsx` — rewrite total. Struktur kembali ke 2-level (stage `position:relative` + `perspective:1000px` inline langsung di situ → card `position:absolute` semua di `top:50%,left:50%`). 3 state transform LITERAL sebagai lookup table (`TRANSFORM_BY_POSITION`), bukan formula generik, supaya tidak ada drift numerik dari nilai yang wajib persis. `getSlidePosition()` circular shortest-path (dibawa balik dari iterasi 1, sempat dihapus di iterasi 2) — penting untuk wrap infinite-loop mulus dua arah. Chevron `hidden md:flex` (sebelumnya sudah begini, dikonfirmasi tetap benar). Tombol CTA blob-shape baru: `border-radius` asimetris per slide, gradient radial+linear pakai token project, `animation: waterFlow 8s` (reuse `@keyframes waterFlow` yang sudah ada dari Button), shine overlay pseudo-element
  - `src/features/landing/landingContent.ts` — tambah `blobRadius` literal per slide (slide 2: `52% 53% 54% 55% / 56% 57% 58% 59%`, slide 3: `50% 51% 52% 53% / 54% 55% 56% 57%`, persis dari spec)
- **Terkait requirement:** F-07/F-08, `design_system_final.md` §HeroCarousel §Countdown Timer (revisi total, versi literal)
- **Breaking change:** Tidak
- **📐 Verifikasi transform aktual di SSR HTML — dibandingkan byte-per-byte dengan spec (bukti konkret, bukan "sudah dites"):**
  ```
  SPEC left:   translate(-50%, -50%) translateX(-82%) rotateY(-18deg) scale(0.88); opacity:0.6; z-index:19
  HTML aktual: transform:translate(-50%, -50%) translateX(-82%) rotateY(-18deg) scale(0.88);opacity:0.6;z-index:19;cursor:pointer  ✅ MATCH

  SPEC active: translate(-50%, -50%) translateX(0%) rotateY(0deg) scale(1); opacity:1; z-index:20
  HTML aktual: transform:translate(-50%, -50%) translateX(0%) rotateY(0deg) scale(1);opacity:1;z-index:20;cursor:default  ✅ MATCH

  SPEC right:  translate(-50%, -50%) translateX(82%) rotateY(18deg) scale(0.88); opacity:0.6; z-index:19
  HTML aktual: transform:translate(-50%, -50%) translateX(82%) rotateY(18deg) scale(0.88);opacity:0.6;z-index:19;cursor:pointer  ✅ MATCH

  Transition (semua card): transform 520ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 520ms cubic-bezier(0.2, 0.8, 0.2, 1)  ✅ MATCH
  Chevron: class mengandung "hidden ... md:flex"  ✅ MATCH (tersembunyi mobile)
  Dots aktif: "w-6 bg-neutral-100" — non-aktif: "w-2 bg-neutral-100/50"  ✅ MATCH
  CTA blob border-radius slide 2: "52% 53% 54% 55% / 56% 57% 58% 59%"  ✅ MATCH
  CTA blob border-radius slide 3: "50% 51% 52% 53% / 54% 55% 56% 57%"  ✅ MATCH
  CTA blob animation: "waterFlow 8s ease-in-out infinite"  ✅ MATCH
  Countdown icon: SVG path body dibandingkan persis vs mdiIconBundle.generated.json → cocok dengan entry "timer", BUKAN "timer-outline"  ✅ MATCH
  ```
  Build + lint bersih, tidak ada hydration error/warning di dev server log.
- **⚠️ Kontradiksi internal DI DALAM section spec yang sama, dilaporkan (bukan ditebak):** §Countdown Timer "Icon label tanggal target" bilang final = `mdi:timer` ("BUKAN `mdi:timer-outline` seperti versi draft sebelumnya"), tapi paragraf "Label tanggal target" beberapa baris di bawahnya masih menyebut `mdi:timer-outline` + contoh tanggal lama "17 Jun 2026" (tidak match `EVENT_DATE` 5 Feb 2027 yang sudah final). Kemungkinan besar sisa teks draft lama yang belum terhapus saat revisi. Dipakai `mdi:timer` sesuai instruksi yang lebih eksplisit & lebih detail. **Perlu dibersihkan manual di dokumen kalau memang cuma sisa draft.**
- **🔴 KONTRAS GAGAL — dilaporkan sesuai instruksi eksplisit ("jangan asumsikan otomatis benar"), diverifikasi pakai perhitungan WCAG matematis (bukan tebakan visual):** Warna teks CTA blob `var(--color-primary-1000)` (`#2C5F53`) terhadap gradient background-nya:
  | Background stop | Hex | Rasio kontras | WCAG AA (normal ≥4.5, large-text ≥3.0) |
  |---|---|---|---|
  | `primary-200` | `#B3E6DA` | 4.84:1 | ✅ PASS |
  | `primary-300` | `#A0DFD1` | **1.09:1** | ❌ FAIL parah |
  | `secondary-400` | `#6ABBC8` | **1.66:1** | ❌ FAIL parah |
  | `primary-700` | `#3A9882` | **2.65:1** | ❌ FAIL (di bawah large-text sekalipun) |

  Karena `background-size: 220% 220%, 320% 100%` + `animation: waterFlow` membuat gradient ini BERGERAK terus-menerus, teks tombol akan melewati SEMUA stop di atas secara bergantian sepanjang siklus 8 detik — artinya ada momen-momen teks nyaris tidak terbaca (rasio 1.09:1 itu SANGAT buruk, hampir tidak ada beda warna). Font-size 13px/600 juga TIDAK memenuhi kualifikasi "large text" WCAG (butuh ≥18px reguler atau ≥14px bold — cek konversi px lain kalau perlu presisi pt). **Ini bukan asumsi/kekhawatiran — ini kegagalan terkonfirmasi secara matematis.** Diimplementasikan APA ADANYA sesuai instruksi eksplisit ("warna...tebakan terbaik...wajib direview visual" — user yang mau ambil keputusan final, bukan saya menebak ulang token pengganti). **Perlu keputusan: ganti token warna teks/background, atau terima sebagai kondisi sementara sampai direview desainer.**
- **Belum selesai / follow-up:**
  1. **Kontras CTA blob GAGAL WCAG AA di 3 dari 4 titik gradient** — lihat detail di atas. Blocking untuk aksesibilitas kalau tidak diperbaiki.
  2. Kontradiksi icon `mdi:timer` vs `mdi:timer-outline` di dalam 1 section — lihat detail di atas, kemungkinan cuma sisa teks draft, tapi belum dikonfirmasi eksplisit.
  3. CTA slide 1 tetap "tidak ada tombol CTA blob, cuma Countdown Timer" — dipertahankan dari implementasi sebelumnya sesuai izin user ("kalau implementasi sebelumnya sudah punya bentuk yang masuk akal, boleh dipertahankan").
  4. Tujuan link CTA slide 2/3 (`/competitions`, `/events`) masih interpretasi saya — spec cuma kasih bentuk visual tombol, bukan tujuan link.
  5. Durasi/easing transisi (520ms cubic-bezier(0.2,0.8,0.2,1)) sekarang KONFIRMASI LITERAL dari spec (bukan lagi pinjaman dari TiltedCard seperti 2 iterasi sebelumnya) — sudah selaras, tidak perlu diubah lagi.
  6. Kode lama dari iterasi 2 (flex-track, `ResizeObserver`, `useLayoutEffect`, `getRelativeOffset` versi lama) sudah DIBUANG SEPENUHNYA, bukan sisa ter-comment atau dead code — sesuai instruksi "jangan ada sisa kode dari pendekatan sebelumnya yang tertinggal".

### [2026-08-15 21:15] Fix bug: HeroCarousel card overlap — refactor absolute+% ke flex-track+pixel

- **Tipe:** Fix
- **Scope:** `src/features/landing/HeroCarousel.tsx`
- **Ringkasan:** Root cause bug card tumpang tindih: implementasi sebelumnya pakai `position: absolute` dengan semua slide di titik sama (`top-1/2 left-1/2`), digeser pakai `translateX(N%)` PER CARD — tapi `%` pada `translateX` dihitung relatif ke lebar elemen ITU SENDIRI (CSS spec), bukan ke container/viewport, jadi jarak antar slide jadi tidak presisi/tidak bisa diprediksi dan slide kiri/kanan render menumpuk di atas slide aktif. Fix: refactor total ke `design_system_final.md` §HeroCarousel §"⚠️ Mekanisme positioning" (direvisi user) — flex track dengan lebar slide TETAP (px, beda per breakpoint), 1 pergeseran `translate3d` dalam PIXEL pada TRACK (bukan per-card), per-card cuma `rotateY`+`scale`+`opacity` tanpa `translateX` tambahan sama sekali.
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — refactor struktural:
    - DOM: `<section>` → `<div ref={viewportRef}>` (viewport, `overflow-hidden`, TIDAK punya transform/perspective sendiri) → `<div>` (track, `display:flex`, `perspective:1000px`, `transform:translate3d(-Xpx,0,0)`) → tiap slide (`flex-shrink:0`, lebar tetap `w-[300px] md:w-[420px]`, cuma `rotateY`+`scale` di transform-nya, TANPA `translateX`)
    - Lebar slide FIXED per breakpoint (bukan `%` relatif): `w-[300px]` mobile, `md:w-[420px]` desktop (nilai literal ~seperti contoh "w-220/~880px" di spec, disesuaikan ke ukuran card yang sudah ada, bukan angka dari dokumen persis — flag review)
    - Tinggi slide tetap `h-[380px]` mobile / `md:h-[440px]` desktop (tidak berubah dari sebelumnya)
    - Diukur REAKTIF via `ResizeObserver` pada `viewportRef` & `firstSlideRef` (bukan hardcode px di JS) — recalc tiap kali salah satu resize (termasuk crossing breakpoint md), pakai `useLayoutEffect` (bukan `useEffect`) supaya koreksi posisi terjadi SEBELUM browser paint, minimalkan flash
    - `getRelativeOffset()` (circular shortest-path, dipakai versi sebelumnya) DIHAPUS — tidak relevan lagi karena track sekarang linear (DOM order tetap), relative position sekarang cuma `i - index` langsung. Index tetap cycle circular via modulo di `goTo()` (auto-rotate/prev/next tetap terasa "infinite loop", cuma transisi 2→0 akan terlihat geser panjang balik, bukan instant-wrap — trade-off yang wajar untuk track linear, bukan bug)
    - Fitur interaktif yang SUDAH BENAR dipertahankan 1:1 tanpa perubahan logic: click-to-activate slide non-aktif, drag/swipe Pointer Events (mouse+touch unified), pause-on-interaction (hover + drag), auto-rotate, chevron nav, dots indicator, countdown di slide 1, CTA di slide 2/3
- **Terkait requirement:** F-07/F-08, `design_system_final.md` §HeroCarousel (revisi "⚠️ Mekanisme positioning")
- **Breaking change:** Tidak
- **📐 Formula pixel offset (dicatat eksplisit sesuai permintaan, untuk trace bug serupa nanti):**
  ```
  offsetPx = (index × slideWidth) − (viewportWidth − slideWidth) / 2
  track.transform = translate3d(-offsetPx px, 0, 0)
  ```
  - `index` = index slide aktif (0-based)
  - `slideWidth` = lebar AKTUAL slide pertama, diukur via `firstSlideRef.current.getBoundingClientRect().width` (bukan dihardcode — otomatis benar di breakpoint manapun karena CSS yang menentukan lebar sesungguhnya, JS cuma membaca hasilnya)
  - `viewportWidth` = lebar AKTUAL viewport, diukur via `viewportRef.current.getBoundingClientRect().width`
  - Term kedua `(viewportWidth − slideWidth) / 2` = offset supaya slide ke-`index` jatuh PAS di tengah viewport (bukan cuma nempel kiri track)
  - Ditandatangani NEGATIF di `translate3d` karena geser track ke KIRI (nilai transform negatif) memindahkan slide yang posisinya makin ke kanan (index makin besar) ke tengah viewport
  - Contoh verifikasi manual (viewport 1512px, slideWidth 420px desktop): index=0 → offset=0−546=−546 → track geser kanan 546px → slide0 (span track-x 0..420, center 210) jatuh di viewport-x 546+210=756 = tepat tengah viewport (1512/2). index=1 → offset=420−546=−126 → slide1 (span track-x 420..840, center 630) jatuh di 630+126=756 = tepat tengah juga. ✅
  - Recalc dipicu ulang tiap `index` berubah DAN tiap `ResizeObserver` fire (resize window / breakpoint berubah) — lihat `useLayoutEffect` di kode untuk implementasi lengkap
- **Belum selesai / follow-up:**
  1. **Lebar slide (300px/420px) bukan angka dari dokumen** — spec cuma kasih contoh ilustratif ("misal w-220/~880px", eksplisit pakai kata "misal"), disesuaikan ke ukuran card sebelumnya. Perlu direview visual begitu ada browser automation atau user cek manual.
  2. **Durasi/easing transisi (520ms cubic-bezier(.2,.8,.2,1)) masih dipinjam dari TiltedCard** — sudah dicek TETAP sesuai rentang baru di spec (500-550ms, easing kustom bukan bawaan CSS), jadi tidak perlu diubah dari entry sebelumnya, tapi tetap bukan nilai asli dari dokumen ini. `emil-design-eng` masih belum invokable di sesi ini.
  3. **Transisi 2→0 (wrap dari slide terakhir ke slide pertama) akan terlihat geser jauh** (bukan instant-wrap seperti carousel infinite-loop dengan clone slide) — konsekuensi wajar dari track linear sesuai spec (formula-nya eksplisit linear berbasis index, bukan circular). Kalau ternyata mau instant-wrap yang mulus, itu perlu teknik clone-slide tambahan (di luar scope spec saat ini, butuh keputusan baru kalau memang diinginkan).
  4. Item follow-up dari entry sebelumnya (CTA per-slide interpretasi, dropdown Navbar tanpa submenu, dst) masih berlaku, tidak berubah oleh fix ini.

### [2026-08-15 19:30] HeroCarousel 3D coverflow + Navbar & Footer (F-01–F-04)

- **Tipe:** Feature + Fix
- **Scope:** `src/features/landing/HeroCarousel.tsx`, `src/components/ui/{Navbar,Footer,CountdownTimer}.tsx`, `src/app/(public)/layout.tsx`, `src/app/(auth)/`, `scripts/generate-icon-bundle.mjs` output
- **Ringkasan:** (1) HeroCarousel dibangun ulang total dari flat-slide jadi efek 3D coverflow sesuai section baru `design_system_final.md` §HeroCarousel (perspective+rotateY+scale+opacity, klik-untuk-aktif, swipe/drag mouse+touch, pause-on-interaction). (2) Navbar & Footer dibangun dari nol (F-01–F-04) dan dipasang sebagai layout `(public)/layout.tsx`, KECUALI `/login` & `/register` yang dipindah ke route group `(auth)/` baru (dikonfirmasi user — bukan asumsi). (3) Ketemu & fix bug hydration mismatch nyata di CountdownTimer (digit detik beda antara SSR dan client). (4) Smoke test menemukan keterbatasan metodologi curl/SSR untuk fitur reaktif client-side (Navbar avatar-toggle) — dilaporkan jujur, bukan diklaim "terverifikasi".
- **File diubah:**
  - `src/features/landing/HeroCarousel.tsx` — rebuild total: stage `perspective(1000px)`, tiap slide `translate(-50%,-50%) translateX(relative×82%) rotateY(relative×18deg) scale(...)`, opacity per-tier, slide non-aktif clickable, drag via Pointer Events (mouse+touch unified), chevron+dots dipertahankan, transisi `transform`+`opacity` (bukan `all`) 520ms `cubic-bezier(.2,.8,.2,1)` (dipinjam dari TiltedCard, `emil-design-eng` tidak invokable di sesi ini — lihat follow-up)
  - `src/features/landing/landingContent.ts` — tambah `showCountdown` (cuma slide 1) dan `cta` (slide 2→`/competitions`, slide 3→`/events`) per slide
  - `src/components/ui/CountdownTimer.tsx` — **fix bug**: tambah `suppressHydrationWarning` di span digit detik. Root cause: nilai `Date.now()`-based ini SAH beda antara waktu SSR-render dan waktu client hydrate (delta ratusan ms–detik), React menganggap ini hydration mismatch dan melempar error di console — pola resmi React untuk live clock/timestamp
  - `src/components/ui/Navbar.tsx` — baru. Logo placeholder + "IOE 2027", link Competition/Events (style dropdown-label + `mdi:chevron-down`, TANPA submenu sungguhan — tidak ada spec isi dropdown di dokumen manapun), Login CTA (147×46) / Profile CTA (116×47, avatar atau `mdi:account-circle`) reaktif `useIsLoggedIn()`/`useUser()`, hamburger mobile (F-02), background gradient `primary-600→400→100` (cross-reference dari spec Footer "sama kayak Navbar")
  - `src/components/ui/Footer.tsx` — baru. Link Competitions/Events (skip "Privacy & Policy" — lihat follow-up), kontak panitia placeholder eksplisit (`kontak@ioe2027.example`, `+62 XXX-XXXX-XXXX`), 4 slot `mdi:instagram` (literal dari spec), copyright
  - `src/app/(public)/layout.tsx` — baru. Wrap `children` dengan `<Navbar />`+`<Footer />`
  - `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx` — dipindah dari `(public)/` (URL tidak berubah — route group tidak memengaruhi path)
  - `scripts/generate-icon-bundle.mjs` output (`mdiIconBundle.generated.json`) — regenerate, 21 icon (tambah `waves`, `chevron-down`, `menu`, `account-circle`, `instagram`)
- **Terkait requirement:** F-07/F-08 (HeroCarousel), F-01–F-04 (Navbar/Footer), `design_system_final.md` §HeroCarousel (baru) §Navbar §Footer
- **Breaking change:** Tidak (URL tidak berubah untuk /login /register meski file pindah folder)
- **✅ Kontradiksi/keputusan RESOLVED (dikonfirmasi user, bukan asumsi):**
  1. Navbar/Footer **dikecualikan** dari `/login` dan `/register` — deviasi dari bacaan literal PRD F-01/F-04 ("setiap halaman publik" tanpa pengecualian eksplisit di dokumen manapun). User pilih opsi ini secara sadar sebagai keputusan baru, bukan yang sudah terdokumentasi — **PRD_IOE_2027_v4.md F-01/F-04 sebaiknya diupdate manual untuk mencatat exception ini secara eksplisit**, supaya dev/agent berikutnya tidak perlu tanya ulang.
- **Belum selesai / follow-up:**
  1. **Bug hydration mismatch di CountdownTimer sudah di-fix**, tapi worth dicatat: ini kemungkinan sudah ada sejak Countdown Timer pertama dibangun (entry sebelumnya) — cuma baru ketahuan sekarang karena baru kali ini saya cek dev server log dengan teliti setelah full page load. Kalau ada komponen live-time lain nanti, ingat pola `suppressHydrationWarning` ini.
  2. **Nilai geometri 3D carousel yang TIDAK ada di spec** (cuma rotateY/scale/opacity yang diberi angka pasti): jarak `translateX` antar slide (82% dari lebar card sendiri — interpretasi saya), ukuran card (380×w78%/mobile, 440×w46%/desktop — interpretasi saya), warna card background (secondary-1000, gradient border reuse dari FannedCard/SpeakerCard). Semua ditandai jelas di kode, perlu direview visual oleh desainer begitu ada browser automation atau user cek manual.
  3. **Durasi/easing transisi carousel** (520ms cubic-bezier(.2,.8,.2,1)) dipinjam dari TiltedCard karena `emil-design-eng` (skill yang direkomendasikan dokumen untuk detail ini) **tidak invokable di sesi ini** ("Unknown skill: emil-design-eng") — kemungkinan skill di luar scope direktori project ini tidak ter-load. Kalau skill itu tersedia nanti, worth di-generate ulang buat verifikasi nilai ini.
  4. **CTA per-slide (label & tujuan) adalah interpretasi saya** — spec cuma bilang "CTA button" tanpa detail. Slide 1 (overview) sengaja tanpa CTA (perannya intro+countdown).
  5. **Dropdown "Competition"/"Events" di Navbar cuma styled sebagai dropdown** (border+chevron-down icon) tapi **tidak ada submenu sungguhan** — tidak ada dokumen manapun yang mendetailkan isi dropdown-nya, jadi diimplementasikan sebagai link langsung. Kalau ternyata memang harus ada submenu, perlu spec tambahan.
  6. **Link "Privacy & Policy" di Footer SENGAJA di-skip** — disebut di `design_system_final.md` §Footer tapi TIDAK ada di F-04 (PRD cuma minta "kontak panitia, tautan media sosial, dan copyright") dan tidak ada route `/privacy` di `ROUTES.md` manapun. Ini gap kecil antar 2 dokumen — kalau memang dibutuhkan, perlu route baru dulu (di luar scope task ini, dan `ROUTES.md` bilang jangan bikin route baru tanpa konfirmasi).
  7. **"Icon Instagram (×4)" di Footer diimplementasikan literal** (4 instance icon Instagram, bukan 4 platform berbeda) karena dokumen cuma menyebutkan icon itu tanpa penjelasan kenapa 4× — kemungkinan placeholder Figma untuk 4 slot sosial media yang platform aslinya belum ditentukan. Worth dikonfirmasi ke desainer/klien.
  8. **⚠️ PENTING — keterbatasan smoke test, dilaporkan jujur:** Toggle Navbar Login↔Profile berdasarkan status login **TIDAK BISA diverifikasi lewat curl/SSR HTML check** seperti task-task sebelumnya. Root cause: `useIsLoggedIn()`/`useUser()` bergantung pada cache TanStack Query yang diisi `SessionBootstrap` lewat fetch `/api/auth/me` **di client, setelah hydration** — curl tidak menjalankan JS sama sekali, jadi HTML yang di-curl SELALU menampilkan state "belum login" (Login button) apapun status cookie-nya, meski user sebenarnya sudah login. Yang SUDAH diverifikasi: (a) `/api/auth/me` mengembalikan data user yang benar kalau dikasih cookie valid (dites langsung, sukses), (b) kode `Navbar.tsx` memanggil `useIsLoggedIn()`/`useUser()` dengan benar (code review, sama persis dengan hooks yang sudah terbukti jalan di task Login/Register sebelumnya). Yang **BELUM** diverifikasi: apakah avatar/Profile CTA benar-benar muncul di browser sungguhan setelah login. Ini genuinely butuh browser automation atau cek manual oleh user — bukan sesuatu yang bisa "dipaksakan lolos" lewat structural check. Kalau user mau saya coba pendekatan lain (misal component test pakai Testing Library — ini akan jadi keputusan baru nambah testing framework yang belum ada di `TECHNICAL_CONSTRAINTS_FE.md`, perlu dikonfirmasi dulu sebelum saya install apapun), tinggal bilang.
  9. `design_system_final.md` §Countdown Timer kehilangan heading `### Countdown Timer`-nya sendiri (keprint sepertinya hilang tertimpa saat section HeroCarousel disisipkan sebelum section itu) — bukan masalah fungsional buat saya (sudah tahu section itu dari kerjaan sebelumnya), cuma dicatat siapa tahu perlu dirapikan manual.

### [2026-08-15 16:45] Countdown Timer di Landing Hero (resolve kontradiksi) + audit & fix MDI icon loading offline

- **Tipe:** Feature + Fix
- **Scope:** `src/components/ui/CountdownTimer.tsx`, `src/utils/eventDate.ts`, `src/features/landing/HeroCarousel.tsx`, `src/components/ui/iconRegistry.ts`, `scripts/`, seluruh file yang pakai `@iconify/react` (10 file)
- **Ringkasan:** Menuntaskan 2 follow-up dari task Landing Page sebelumnya. (1) Countdown Timer ditambahkan ke Hero, dibangun dari nol (belum ada implementasi apapun sebelumnya). (2) Audit strategi loading icon MDI menemukan `@iconify/react` (default import) TIDAK render SVG sama sekali saat SSR (fallback ke `<span>` kosong) dan baru resolve icon setelah hydration lewat fetch ke `api.iconify.design` — solusinya bukan ganti library, tapi pindah ke entry point resmi `@iconify/react/offline` (drop-in, API identik) dikombinasikan dengan bundle subset icon MDI yang di-generate otomatis dari kode. Diverifikasi empiris: sebelum fix, SSR HTML berisi `<span></span>` kosong untuk tiap icon; sesudah fix, SSR HTML berisi `<svg>` dengan path lengkap, nol dependency network.
- **File diubah:**
  - `src/utils/eventDate.ts` — baru. `EVENT_DATE = new Date("2027-02-05T07:00:00+07:00")`, dikonfirmasi user sebagai keputusan final klien (bukan asumsi)
  - `src/components/ui/CountdownTimer.tsx` — baru. Circle Hours/Minutes/Seconds (72px/112px outer, 68px/108px inner), separator 2-dot vertikal, label tanggal target `mdi:timer-outline`, update tiap detik, reusable via prop `targetDate` (dipakai lagi nanti di Competition/Event Details & Overview per spec dokumen)
  - `src/features/landing/HeroCarousel.tsx` — render `<CountdownTimer targetDate={EVENT_DATE} />` sebagai elemen tunggal (bukan per-slide) di dalam hero, reposisi dot navigasi supaya tidak tumpang tindih
  - `scripts/generate-icon-bundle.mjs` — baru. Scan `src/` untuk semua `mdi:xxx` yang dipakai, extract subset dari `@iconify-json/mdi/icons.json` (devDependency baru, ~3MB, cuma dipakai script ini), tulis `src/components/ui/mdiIconBundle.generated.json` (~3.8KB, di-commit ke repo). Exit dengan error kalau ada nama icon salah ketik. Script baru: `npm run icons:bundle`
  - `src/components/ui/mdiIconBundle.generated.json` — baru, generated. 16 icon yang benar-benar dipakai saat ini
  - `src/components/ui/iconRegistry.ts` — baru. `addCollection(mdiIconBundle)` di module scope (`@iconify/react/offline`), diexport sebagai komponen `<IconRegistry />` (return null) yang dirender di `layout.tsx` — pola sama persis dengan `SessionBootstrap` yang sudah ada, supaya module-nya benar-benar ke-load sebelum children render
  - `src/app/layout.tsx` — render `<IconRegistry />` sebelum `<SessionBootstrap />`
  - `src/components/ui/{Button,Toast,Input,InlineFieldError,FormBanner}.tsx`, `src/features/landing/{HeroCarousel,AboutSection,MemoriesSection}.tsx`, `src/components/ui/CountdownTimer.tsx` — ganti `import { Icon } from "@iconify/react"` → `"@iconify/react/offline"`. **Tidak ada perubahan lain** di call site manapun (`<Icon icon="mdi:xxx">` tetap sama persis)
  - `package.json` — tambah devDependency `@iconify-json/mdi`, script `icons:bundle`
- **Terkait requirement:** F-07/F-08 (Landing Hero), `design_system_final.md` §Countdown Timer, `TECHNICAL_CONSTRAINTS_FE.md` §Browser & Device Support (target LCP < 2.5s mobile / < 2.0s desktop)
- **Breaking change:** Tidak
- **✅ Kontradiksi RESOLVED (sebelumnya dilaporkan di entry 2026-08-15 14:10):** User mengkonfirmasi eksplisit "ya, pakai countdown" untuk Landing Hero, dengan tanggal target final dari klien: **5 Februari 2027, 07:00 WIB** (bukan asumsi/tebakan — dikonfirmasi user langsung). `design_system_final.md` §Countdown Timer sekarang selaras dipakai di Landing Hero sesuai yang disebutkan di dokumen tsb.
- **Belum selesai / follow-up:**
  1. **2 nilai di spec Countdown Timer masih substitusi dari token yang sudah ada** (bukan literally di dokumen): `box-shadow: drop-shadow-light` (tidak ada di Shadow Scale) → dipakai `shadow-md`; gradient inner circle `[token terang]→[token gelap]` (placeholder literal belum di-resolve di dokumen) → dipakai `primary-500→primary-1000`. Outer ring background TIDAK termasuk asumsi — dipakai gradient border-via-padding yang sama persis dengan FannedCard/SpeakerCard (dikonfirmasi reused eksplisit di dokumen: "teknik gradient-border-via-padding dipakai berulang di ...Countdown Timer"). 2 substitusi di atas perlu direview desainer.
  2. **`TECHNICAL_CONSTRAINTS_FE.md` jadi tidak sinkron** — §Stack masih bilang "Pakai `@iconify/react` dengan prefix `mdi:`" tanpa menyebut sub-path `/offline` atau requirement regenerate bundle. Perlu diupdate manual oleh manusia untuk mendokumentasikan pola ini supaya dev/agent berikutnya tidak balik pakai default import.
  3. **`@iconify/react/offline` TIDAK ADA fallback network sama sekali** (beda dari default mode yang fallback fetch API kalau data lokal belum ada). Icon MDI baru yang dipakai di kode tapi lupa di-`npm run icons:bundle` akan render KOSONG (bukan delayed-tapi-akhirnya-muncul seperti sebelumnya) — trade-off yang disengaja (fail-visible saat dev lebih baik daripada silent network dependency di production), sudah didokumentasikan di komentar `iconRegistry.ts` & `generate-icon-bundle.mjs`, tapi berisiko kelupaan kalau developer/agent lain tidak baca komentarnya. Belum ada CI check otomatis untuk staleness bundle vs kode — kalau jadi masalah nyata, follow-up: tambah check ini ke lint/CI.
  4. **Folder baru `scripts/`** tidak ada di struktur folder `TECHNICAL_CONSTRAINTS_FE.md` (yang cuma describe `src/`). Alasan: ini tooling build-time (Node script, tidak pernah di-import ke app), bukan bagian runtime app structure — konsisten dengan konvensi umum (folder `scripts/` di root, terpisah dari `src/`), bukan pattern yang saya karang sendiri. Tidak perlu diupdate ke dokumen karena di luar cakupan struktur `src/` yang didokumentasikan, tapi dicatat di sini untuk transparansi.
  5. **Visual smoke test manual** — sesuai arahan user, TIDAK dipaksakan lagi karena tidak ada browser automation di sesi ini. Verifikasi dilakukan lewat pendekatan structural yang sudah terbukti solid: `build`+`lint` bersih, dev server live tanpa error, SSR HTML diperiksa langsung (icon `<svg>` count sebelum/sesudah fix, teks countdown/unit label hadir), regresi dicek di `/login` (icon Input tetap render offline dengan benar). Pendekatan ini akan terus dipakai untuk task berikutnya sampai browser automation tersedia.

### [2026-08-15 14:10] Bangun Landing Page (/) sesungguhnya, menggantikan placeholder

- **Tipe:** Feature
- **Scope:** `src/features/landing/`, `src/app/(public)/page.tsx`
- **Ringkasan:** Mengganti placeholder `/` dengan 4 section sesungguhnya (F-07–F-11): HeroCarousel, AboutSection, TimelineSection, MemoriesSection. Halaman murni statis (tidak fetch BE), konten hardcoded — deskripsi About dikutip langsung dari PRD §1 Overview (bukan dikarang), sisanya (sponsor, tanggal timeline, foto memories, maskot) placeholder eksplisit karena aset asli belum dikirim klien (PRD §8/§13 A6).
- **File diubah:**
  - `src/features/landing/landingContent.ts` — baru. Data hardcoded: `heroSlides` (3 item, F-07), `aboutDescription` (kutipan PRD §1), `sponsors`, `timelineItems`, `memories` — semua ditandai placeholder di komentar kecuali yang eksplisit dikutip
  - `src/features/landing/HeroCarousel.tsx` — baru. Carousel 3 slide, auto-rotate 6s (pause on hover/touch, F-08 SHOULD), nav manual via dot + arrow button + swipe touch, easing dipinjam dari TiltedCard (`cubic-bezier(.2,.8,.2,1)`) karena carousel tidak punya spec transisi sendiri
  - `src/features/landing/AboutSection.tsx` — baru. Maskot placeholder (icon di lingkaran gradient, bukan gambar asli), deskripsi dari PRD, grid tile sponsor placeholder (F-09)
  - `src/features/landing/TimelineSection.tsx` — baru. Timeline dot+garis (vertikal mobile, horizontal desktop), tanggal placeholder (F-10)
  - `src/features/landing/MemoriesSection.tsx` — baru. Grid galeri placeholder (gradient tile + icon, bukan foto asli) (F-11)
  - `src/app/(public)/page.tsx` — ganti `PlaceholderPage` dengan komposisi 4 section di atas
  - `src/app/globals.css` — tidak ada token baru ditambahkan; hanya dipakai token yang sudah ada (spacing 2xl/3xl/4xl/md/sm/lg, warna primary/secondary/tertiary/neutral, type scale h1-h6/b1-b4)
- **Terkait requirement:** F-07, F-08, F-09, F-10, F-11 (PRD_IOE_2027_v4.md); route `/` (ROUTES.md)
- **Breaking change:** Tidak
- **Struktur folder — deviasi kecil dari `TECHNICAL_CONSTRAINTS_FE.md`:** Dibuat folder baru `features/landing/` yang **tidak ada** di daftar `features/` pada dokumen tsb (cuma ada auth/competitions/events/dashboard/profile/admin). Alasan: mengikuti pola yang sudah dipakai untuk `features/auth/` (LoginForm/RegisterForm) di task sebelumnya — komponen komposit spesifik-halaman masuk `features/<nama>/`, komponen atom reusable masuk `components/ui/`. Bukan pattern baru yang saya karang, hanya konsistensi dengan preseden yang sudah ada. `TECHNICAL_CONSTRAINTS_FE.md` perlu diupdate manual untuk menambahkan `landing/` ke daftar `features/`.
- **⚠️ Kontradiksi antar dokumen — dilaporkan, BELUM diputuskan sepihak:** `design_system_final.md` §Countdown Timer menyebut komponen itu dipakai di **5+ tempat termasuk "Landing Hero"** ("Dipakai di 5+ tempat: Landing Hero, Competition Details, Competition Overview, Event Details, Event Overview"). Tapi `PRD_IOE_2027_v4.md` F-07–F-09 (requirement resmi untuk Hero/Landing) **sama sekali tidak menyebut countdown** — hanya carousel 3 item + nav manual/auto-rotate + about section. Karena PRD adalah sumber requirement (bukan design_system_final.md, yang sumber styling), HeroCarousel dibangun **TANPA** countdown mengikuti PRD. Kalau ternyata Landing Hero memang butuh countdown (mis. countdown ke hari-H event), perlu konfirmasi eksplisit — komponen `Countdown Timer` sudah punya spec detail di `design_system_final.md` dan gampang ditambahkan begitu diputuskan.
- **Belum selesai / follow-up:**
  1. **Kontradiksi Countdown Timer di atas** — perlu keputusan user/klien, lihat poin di atas.
  2. **Tidak ada spec visual untuk AboutSection/TimelineSection/MemoriesSection di `design_system_final.md`** sama sekali (beda dari HeroCarousel yang setidaknya disebut di F-07/F-08, dan beda dari komponen lain yang punya spec detail seperti Button/Input/FannedCard). Layout 3 section ini murni komposisi saya sendiri memakai token yang sudah ada (warna/spacing/radius/type scale) — TimelineSection mengadaptasi kosakata visual dot+garis dari `SpeakerCard §Rundown` (konteks beda: itu buat rundown workshop yang scrollable, bukan timeline event keseluruhan) karena tidak ada pattern timeline horizontal lain di dokumen. Disarankan masuk antrean `impeccable` (`audit`/`critique`) atau `ui-ux-pro-max` untuk review begitu tim desain sempat.
  3. **Ikon MDI (`@iconify/react`) fetch data icon dari CDN publik `api.iconify.design` saat runtime di client**, bukan bundled offline — dikonfirmasi reachable & cepat (~200ms) dari environment saya, tapi ini karakteristik bawaan `@iconify/react` mode default yang belum disebutkan di `TECHNICAL_CONSTRAINTS_FE.md`. Relevan untuk task ini karena ada target LCP eksplisit (< 2.5s mobile) — kalau CDN lambat/down, icon (chevron carousel, dll) bisa telat muncul. Bukan bug baru (sudah dipakai sejak Toast/Button di task sebelumnya), tapi baru kelihatan relevan sekarang karena landing page eksplisit disorot soal LCP. Kalau jadi masalah nyata, opsi follow-up: bundle icon offline via `addCollection`/`@iconify-json/mdi` alih-alih fetch API.
  4. **Belum ada Navbar/Footer** di halaman ini — sesuai scope task (cuma diminta 4 section: HeroCarousel/AboutSection/TimelineSection/MemoriesSection, persis kolom "Komponen Utama" landing di `ROUTES.md`). F-01–F-04 (Navbar/Footer di **semua** halaman publik) belum dikerjakan — kemungkinan jadi task terpisah karena sifatnya cross-page/shared layout, bukan spesifik landing.
  5. **Verifikasi visual browser tidak bisa saya lakukan langsung** — tidak ada tool browser automation (claude-in-chrome) yang aktif/tersambung di environment ini. Yang sudah diverifikasi sebagai gantinya: `npm run build` + `npm run lint` bersih, dev server live (`GET /` → 200, tanpa error di log), HTML hasil SSR dicek berisi keempat section + tidak ada `<img>`/asset yang 404-prone, dan CSS hasil compile dicek langsung untuk memastikan utility class custom (`py-4xl`, `text-h1`, dst — termasuk varian `md:`) benar-benar ke-generate (bukan cuma lolos build tapi diam-diam no-op). **Belum** diverifikasi secara visual/manual di breakpoint 375px vs desktop seperti diminta — perlu dicek manual oleh user di browser (`npm run dev` → buka `http://localhost:3000`), atau beri tahu saya kalau ada cara mengaktifkan browser automation di sesi ini.

### [2026-08-15 10:20] Bangun halaman /login dan /register sesungguhnya, terhubung ke auth infra

- **Tipe:** Feature
- **Scope:** `src/features/auth/`, `src/components/ui/`, `src/app/(public)/{login,register}/`, `amunisi/ERROR_HANDLING_FE.md`
- **Ringkasan:** Mengganti placeholder `/login` dan `/register` dengan form sesungguhnya (React Hook Form + Zod) yang terhubung penuh ke `authService`/`useAuth` hooks/`QueryProvider`/`SessionBootstrap`/`proxy.ts` yang sudah dibangun sebelumnya. Menambahkan komponen dasar yang belum ada (`Button`, `Input`, `GoogleAuthButton`) sesuai `design_system_final.md`. Smoke test end-to-end nyata dijalankan (bukan cuma route/redirect check) memakai mock Workers server sementara di luar repo dan **seluruh 11 langkah lulus** — lihat detail di bawah.
- **File diubah:**
  - `src/components/ui/Button.tsx` — baru. Variant primary/secondary/ghost/destructive, size sm/md/lg, organicRadius, glossy sheen, water-flow animation, disabled state sesuai `design_system_final.md` §Button
  - `src/components/ui/Input.tsx` — baru. Label di atas, icon opsional, state error/disabled/focus sesuai §Input
  - `src/components/ui/GoogleLogo.tsx` — baru. Logo Google resmi 4-warna (paths standar publik, tidak dimodifikasi)
  - `src/components/ui/GoogleAuthButton.tsx` — baru. Style Secondary reuse, logo di KANAN teks, wiring Google Identity Services (`accounts.google.com/gsi/client`), disabled + pesan kalau `NEXT_PUBLIC_GOOGLE_CLIENT_ID` kosong
  - `src/components/ui/InlineFieldError.tsx` — extend: tambah prop `action` (label+href) untuk kasus EMAIL_ALREADY_REGISTERED (link "Login di sini")
  - `src/features/auth/schemas.ts` — baru. `loginSchema`, `registerSchema` (Zod) sesuai field di `API_CONTRACT.md` + `confirmPassword`/`consentPdp` FE-only
  - `src/features/auth/passwordStrength.ts` — baru. Heuristik indikator kekuatan password (USER_FLOWS_v2.md edge case)
  - `src/features/auth/LoginForm.tsx` — baru. Email+password, `useLogin()`+`useGoogleLogin()`, INVALID_CREDENTIALS → inline banner
  - `src/features/auth/RegisterForm.tsx` — baru. Name/email/password/confirmPassword/consentPdp, `useRegister()`+`useGoogleLogin()`, EMAIL_ALREADY_REGISTERED → inline field + CTA login
  - `src/app/(public)/login/page.tsx`, `src/app/(public)/register/page.tsx` — ganti placeholder dengan form asli, dibungkus `<Suspense>` (dibutuhkan `useSearchParams` untuk redirect-back)
  - `src/app/globals.css` — tambah `@keyframes waterFlow` untuk Button
  - `amunisi/ERROR_HANDLING_FE.md` — isi baris "Catatan per Form" untuk Register & Login (diminta eksplisit oleh dokumen itu sendiri saat form baru dibuat)
- **Terkait requirement:** F-40, F-41, F-42, F-43 (login/register), `POST /auth/register`, `POST /auth/login`, `POST /auth/google` (API_CONTRACT.md), error code `INVALID_CREDENTIALS`/`EMAIL_ALREADY_REGISTERED`/`VALIDATION_ERROR` (ERROR_HANDLING_FE.md)
- **Breaking change:** Tidak
- **Smoke test end-to-end (nyata):** Dijalankan pakai mock Workers server sementara (Node `http`, di luar repo, dihapus setelah selesai) yang mengimplementasikan shape persis `POST /auth/register`, `POST /auth/login`, `GET /profile` dari `API_CONTRACT.md`, plus Next.js dev server sungguhan (bukan cuma build/lint check). Semua lewat `curl` dengan cookie jar asli:
  1. Register akun baru → `201`, body `{success:true,data:{user}}` **tanpa token** (token tidak pernah sampai ke client) ✅
  2. Cookie `ioe_token` (httpOnly) ter-set di response ✅
  3. Akses `/dashboard` dengan cookie → `200` (tidak di-redirect) ✅
  4. `GET /api/auth/me` dengan cookie → data user benar (session bootstrap jalan) ✅
  5. Logout → `200`, cookie `ioe_token` di-clear (`Max-Age=0`) ✅
  6. Akses `/dashboard` lagi (cookie sudah clear) → `307` redirect ke `/login?redirect=%2Fdashboard` ✅
  7. `GET /api/auth/me` setelah logout → `data: null` ✅
  8. Register dengan email yang sama → `400 EMAIL_ALREADY_REGISTERED` ✅
  9. Login dengan password salah → `401 INVALID_CREDENTIALS` ✅
  10. Login dengan credential benar → `200` + cookie baru ter-set ✅
  11. Tidak ada error/warning di log dev server sepanjang seluruh flow ✅

  **Semua 11 langkah lulus, tidak ada yang gagal.**
- **Belum selesai / follow-up:**
  1. **Aturan kekuatan password (F-42) adalah ASUMSI, bukan dari dokumen.** Tidak ada satupun dokumen (PRD/TECHNICAL_CONSTRAINTS/design_system_final) yang menetapkan rule konkret. Dipakai default wajar: min 8 karakter + harus ada huruf & angka (`src/features/auth/schemas.ts`). **Perlu dikonfirmasi ke user/klien**, gampang diubah nanti.
  2. **Login Google (F-41) belum bisa diuji end-to-end sungguhan** — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` masih kosong (blocker lama, AUTH_IMPLEMENTATION.md §Awareness A2). `GoogleAuthButton` sudah wired penuh ke Google Identity Services + `useGoogleLogin()`, tapi tombol otomatis disabled + tampil pesan sampai Client ID diisi. Begitu Client ID tersedia, seharusnya langsung berfungsi tanpa ubah kode.
  3. **Tidak ada spec Checkbox di `design_system_final.md`.** Checkbox consent PDP di RegisterForm dibuat dengan styling minimal (native checkbox + `accent-primary-600`) karena tidak ada rujukan visual — perlu dikonfirmasi ke desainer kalau butuh style khusus.
  4. **Radius Input untuk LoginForm/RegisterForm pakai base spec `Input` component**, bukan varian pill (Event Registration) atau rounded-xl/2xl eksplisit (ProfileForm) — dokumen tidak menyebutkan varian mana yang dipakai untuk Login/Register secara spesifik, jadi dipakai default spec dasarnya. Flag untuk konfirmasi kalau desainer punya preferensi lain.
  5. **Button belum full sesuai spec animasi**: ripple-on-click dan rising bubble particles (§Efek Akuatik 2 & 3) disederhanakan jadi spinner biasa untuk state loading — glossy sheen dan water-flow ambient sudah diimplementasikan. Follow-up saat pass animasi (`emil-design-eng`), konsisten dengan simplifikasi Toast yang sudah dicatat di entry sebelumnya.
  6. **VALIDATION_ERROR per-field masih fallback ke form-level banner untuk Register/Login** — `API_CONTRACT.md` §Format response error tidak mendefinisikan shape detail per-field (cuma `{code, message}` flat), padahal `ERROR_HANDLING_FE.md` §Mapping mengasumsikan "BE mengirim detail per field". Ini gap/kontradiksi kecil antar 2 dokumen tsb yang perlu diselaraskan manusia — lihat baris baru di `ERROR_HANDLING_FE.md` §Catatan per Form yang mencatat fallback ini secara eksplisit.
  7. Mock Workers server yang dipakai smoke test **tidak disimpan ke repo** (sengaja, di luar `amunisi/` dan di luar `src/`) — kalau ke depannya tim butuh mock server yang reusable untuk dev tanpa BE asli, itu keputusan terpisah yang belum diambil (folder `mocks/` di `TECHNICAL_CONSTRAINTS_FE.md` saat ini isinya cuma dimaksudkan untuk JSON contoh response, bukan server).

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
