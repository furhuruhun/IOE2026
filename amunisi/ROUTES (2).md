# Routes / Page Map — IOE 2027

Peta seluruh route FE, dipetakan ke Functional Requirement ID di PRD v4 supaya Claude tahu struktur final tanpa nebak dari deskripsi prosa.

| Route | Halaman | Public/Protected | Terkait PRD (F-ID) | Komponen Utama |
|---|---|---|---|---|
| `/` | Landing Page | Public | F-07–F-11 | HeroCarousel, AboutSection, TimelineSection, MemoriesSection |
| `/competitions` | Competition Overview | Public | F-22–F-26 | CountdownHero, CTAList, TimelineSection |
| `/competitions/[slug]` | Competition Details | Public | F-12–F-21 | GuidebookCTA, TiltedCardSection, FAQSection, RegisterButton (buka modal) |
| `/events` | Event Overview | Public | F-35–F-39 | CountdownHero, CTAList, TimelineSection |
| `/events/[slug]` | Event Details | Public | F-27–F-34 | FannedCardSection, SpeakerCard, RundownOverlay |
| `/events/[slug]/register` | Event Registration Form | **Protected** (force auth) | F-31, F-34a, §7 | RegistrationForm, SessionRadioGroup, PaymentProofUpload |
| `/login` | Login | Public | F-40–F-41 | LoginForm, GoogleAuthButton |
| `/register` | Register | Public | F-40, F-42 | RegisterForm |
| `/profile` | My Profile | **Protected** | F-55–F-56 | ProfileForm |
| `/dashboard` | Dashboard | **Protected** | F-44–F-52 | Sidebar, MyJourney, AssignmentList, CalendarWidget, ActivityDetailView (client-state, lihat catatan di bawah) |
| `/confirmation` | Confirmation | Public (post-submit) | F-53–F-54 | SuccessMessage |
| `/admin/*` | Admin Panel | **Protected** (role: Panitia) | F-57–F-58 | ⚠️ TBD — struktur sub-route belum ditentukan, perlu sesi requirement gathering terpisah |

## Pola Navigasi — PENTING, Dua Pattern Berbeda
Jangan disamakan treatment-nya, ini beda pattern yang disengaja:

| Alur | Pattern | Detail |
|---|---|---|
| **Pendaftaran Kompetisi** (Create/Join Team) | **Client-side state di endpoint yang sama** | Klik "Register" di `/competitions/[slug]` → tetap di `/competitions/[slug]`, modal Create/Join Team muncul sebagai overlay. Tidak ada perpindahan route. |
| **Pendaftaran Event** | **Navigasi ke route terpisah** | Klik "Register" di `/events/[slug]` → navigasi sungguhan ke `/events/[slug]/register`, halaman penuh baru. |
| **"See Details" di Dashboard Assignment** | **Client-side state di endpoint yang sama** | Klik "See Details" → tetap di `/dashboard`, konten utama berganti ke tampilan detail aktivitas (Your Team, Registration Requirements, dst). Tombol "Back" mengembalikan state, BUKAN browser back. |
| **"Lihat Rundown" di Event Details** | **Client-side state (slide overlay)** dalam SpeakerCard | Tidak mengubah route sama sekali, cuma toggle state per card |

## Protected Route Behavior
- Route **Protected**: redirect ke `/login` kalau tidak ada token/sesi aktif (force auth — F-43a)
- Setelah login sukses, redirect **balik ke halaman/route tujuan awal yang sama persis** (bukan ke halaman parent). Contoh: user klik Register di `/events/[slug]/register` → belum login → redirect `/login` → setelah sukses → balik ke `/events/[slug]/register`, BUKAN ke `/events/[slug]`
- Route `/admin/*`: khusus role Panitia, user biasa yang mencoba akses di-redirect ke `/dashboard` atau halaman 403

## Dynamic Segments
- `[slug]` untuk competitions/events: gunakan slug (bukan ID numerik) untuk SEO — contoh: `/competitions/business-case-competition`

## Catatan Trade-off: Client-side State vs Query Param
Untuk route yang pakai client-side state (`/dashboard` detail view, modal Create/Join Team): URL tidak berubah, artinya:
- Refresh halaman saat di state tersebut → balik ke tampilan default
- Browser back button (bukan tombol "Back" di UI) akan keluar dari halaman, bukan reset state

Kalau kebutuhan share-link/refresh-persist muncul di kemudian hari, pertimbangkan migrasi ke query param, misal `/dashboard?activity=[slug]` — tetap satu halaman secara UX, tapi state persist.

## Belum Diputuskan ⚠️
- Struktur sub-route `/admin/*` (dashboard admin, list pendaftar per kompetisi/event, halaman review Registration Requirements, dst) — menunggu requirement gathering

---

## Awareness — Item Belum Terselesaikan

| # | Item | Lokasi | Perlu dari siapa |
|---|---|---|---|
| A1 | **Struktur sub-route `/admin/*`** — satu-satunya open item tersisa. Blocker untuk sprint Admin Panel | Tabel route, §Belum Diputuskan | Requirement gathering terpisah | -> Tidak esensial buat implementasi sekarang jadi biarkan saja (dipending)
| A2 | **Route `/confirmation`** — saat ini Public (post-submit), tapi tidak ada guard kalau user akses langsung tanpa pernah submit. Perlu diputuskan: biarkan tampil kosong, redirect ke home, atau tambah server-side check | Tabel route | Tim dev | -> 2. Redirect ke home — kalau tidak ada "bukti" baru saja submit, langsung redirect ke /. Butuh mekanisme untuk tahu apakah user baru saja submit — misalnya via query param (/confirmation?from=registration) yang dicek di halaman.
| A3 | **Tidak ada route untuk email verification** — kalau F-54 (email konfirmasi) diimplementasikan dan butuh link verifikasi, perlu route baru (misal `/verify-email?token=...`). Belum ada di peta route sekarang | — | Bergantung keputusan F-54 | -> sudah diputuskan dan clear
