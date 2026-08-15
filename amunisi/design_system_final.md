# Design System — IOE 2027

Ditarik langsung dari Figma Variables (file "Design System") via MCP. Section ini fokus ke Color Tokens dulu — typography, spacing, dan komponen menyusul.

## Struktur Token
Figma project ini pakai 2 layer:
1. **Primitive palette** (`Color/[NamaWarna]/[step]`) — raw hex value, step 100–1000 + "Default"
2. **Semantic alias** (`primary`, `secondary`, `tertiary`, `success`, `error`, `warning`, `neutral`) — sebagian besar mereferensikan ke primitive palette di atas, sebagian (`error`, `warning`, `neutral`) berdiri sendiri dengan hex langsung

**Aturan pemakaian:** kode (CSS/component) SELALU pakai nama **semantic alias** (misal `--color-primary-500`), JANGAN pernah reference primitive langsung (`--color-mint-500`) di komponen — biar kalau suatu saat primary color di-rebrand, tinggal ubah mapping alias-nya, tidak perlu ubah tiap komponen.

---

## Primitive Palette

### Ice Blue
| Step | Hex |
|---|---|
| 100 | #E6F5FA |
| 200 | #DEF2F8 |
| 300 | #D5EFF6 |
| 400 | #CDECF4 |
| 500 | #C1E7F1 |
| Default | #ACDFED |
| 700 | #89AFBA |
| 800 | #73929A |
| 900 | #657F86 |
| 1000 | #576B71 |

⚠️ Ice Blue belum kelihatan dipakai di alias manapun (primary/secondary/dst) — kemungkinan dipakai buat sesuatu yang lain (misal ilustrasi/maskot), atau alias-nya belum sempat ke-capture. Perlu dicek lagi kalau butuh dipetakan ke semantic.

### Sea Green (→ dipakai sebagai `success`)
✅ **Sudah dibalik** supaya konsisten sama arah skala warna lain (100=terang → 1000=gelap). Raw value di Figma Variables saat ini masih pakai urutan lama (100=gelap→1000=terang) — **perlu disinkronkan manual di Figma** biar dokumentasi ini dan sumber aslinya nggak beda.

| Step | Hex |
|---|---|
| 100 | #B7E3DC |
| 200 | #9FDAD0 |
| 300 | #86D1C5 |
| 400 | #6EC8B9 |
| 500 | #4ABAA7 |
| Default | #0EA381 |
| 700 | #138270 |
| 800 | #146E5F |
| 900 | #166154 |
| 1000 | #185349 |

### Mint (→ dipakai sebagai `primary`)
| Step | Hex |
|---|---|
| 100 | #C6ECE3 |
| 200 | #B3E6DA |
| 300 | #A0DFD1 |
| 400 | #8ED9C8 |
| 500 | #71D0BA |
| Default | #42C0A3 |
| 700 | #3A9882 |
| 800 | #347F6E |
| 900 | #306F61 |
| 1000 | #2C5F53 |

### Light Sage (→ dipakai sebagai `tertiary`)
| Step | Hex |
|---|---|
| 100 | #DFF5EA |
| 200 | #D5F2E3 |
| 300 | #CBEFDB |
| 400 | #C0ECD4 |
| 500 | #B0E7CA |
| Default | #96DFB8 |
| 700 | #79AF92 |
| 800 | #66927A |
| 900 | #5A7F6B |
| 1000 | #4E6B5C |

### Cyan (→ dipakai sebagai `secondary`)
| Step | Hex |
|---|---|
| 100 | #B5DDE4 |
| 200 | #9CD2DB |
| 300 | #83C7D1 |
| 400 | #6ABBC8 |
| 500 | #45AABB |
| Default | #078EA4 |
| 700 | #0D7383 |
| 800 | #10616E |
| 900 | #135661 |
| 1000 | #154B54 |

---

## Semantic Alias (dipakai di kode)

### `primary` (→ Mint)
| Step | Referensi | Hex |
|---|---|---|
| 100 | Color/Mint/100 | #C6ECE3 |
| 200 | Color/Mint/200 | #B3E6DA |
| 300 | Color/Mint/300 | #A0DFD1 |
| 400 | Color/Mint/400 | #8ED9C8 |
| 500 | Color/Mint/500 | #71D0BA |
| 600 | Color/Mint/Default | #42C0A3 |
| 700 | Color/Mint/700 | #3A9882 |
| 800 | Color/Mint/800 | #347F6E |
| 900 | Color/Mint/900 | #306F61 |
| 1000 | Color/Mint/1000 | #2C5F53 |

### `secondary` (→ Cyan)
| Step | Referensi | Hex |
|---|---|---|
| 100 | Color/Cyan/100 | #B5DDE4 |
| 200 | Color/Cyan/200 | #9CD2DB |
| 300 | Color/Cyan/300 | #83C7D1 |
| 400 | Color/Cyan/400 | #6ABBC8 |
| 500 | Color/Cyan/500 | #45AABB |
| 600 | Color/Cyan/Default | #078EA4 |
| 700 | Color/Cyan/700 | #0D7383 |
| 800 | Color/Cyan/800 | #10616E |
| 900 | Color/Cyan/900 | #135661 |
| 1000 | Color/Cyan/1000 | #154B54 |

### `tertiary` (→ Light Sage)
| Step | Referensi | Hex |
|---|---|---|
| 100 | Color/Light Sage/100 | #DFF5EA |
| 200 | Color/Light Sage/200 | #D5F2E3 |
| 300 | Color/Light Sage/300 | #CBEFDB |
| 400 | Color/Light Sage/400 | #C0ECD4 |
| 500 | Color/Light Sage/500 | #B0E7CA |
| 600 | Color/Light Sage/Default | #96DFB8 |
| 700 | Color/Light Sage/700 | #79AF92 |
| 800 | Color/Light Sage/800 | #66927A |
| 900 | Color/Light Sage/900 | #5A7F6B |
| 1000 | Color/Light Sage/1000 | #4E6B5C |

### `success` (→ Sea Green, sudah dibalik — lihat catatan di Primitive Palette)
⚠️ Kolom "Referensi" masih pakai nama variable asli dari Figma (`Color/Sea Green/100` dst) — nilai hex di tabel ini sudah versi terbalik/benar, TAPI kalau kamu buka Figma-nya langsung sebelum disinkronkan, variable dengan nama itu masih nunjuk ke hex yang lama.

| Step | Referensi | Hex |
|---|---|---|
| 100 | Color/Sea Green/100 | #B7E3DC |
| 200 | Color/Sea Green/200 | #9FDAD0 |
| 300 | Color/Sea Green/300 | #86D1C5 |
| 400 | Color/Sea Green/400 | #6EC8B9 |
| 500 | Color/Sea Green/500 | #4ABAA7 |
| 600 | Color/Sea Green/Default | #0EA381 |
| 700 | Color/Sea Green/700 | #138270 |
| 800 | Color/Sea Green/800 | #146E5F |
| 900 | Color/Sea Green/900 | #166154 |
| 1000 | Color/Sea Green/1000 | #185349 |

### `error` (standalone, tidak mereferensikan primitive)
| Step | Hex |
|---|---|
| 100 | #FEE3D4 |
| 200 | #FDC0AB |
| 300 | #FB9580 |
| 400 | #F86D60 |
| 500 | #F42D2D |
| 600 | #D12030 |
| 700 | #AF1631 |
| 800 | #8D0E2F |
| 900 | #75082E |
| 1000 | #5F0726 |

### `warning` (standalone)
| Step | Hex |
|---|---|
| 100 | #FFEAD2 |
| 200 | #FFCEA6 |
| 300 | #FFAD7A |
| 400 | #FF8C59 |
| 500 | #FF5722 |
| 600 | #DB3918 |
| 700 | #B72111 |
| 800 | #930E0A |
| 900 | #7A060B |
| 1000 | #610509 |

### `neutral` (standalone, grayscale)
| Step | Hex |
|---|---|
| 100 | #F8F8F9 |
| 200 | #E5E5E4 |
| 300 | #D6D6D5 |
| 400 | #C0C0C0 |
| 500 | #A6A5A5 |
| 600 | #898989 |
| 700 | #717171 |
| 800 | #5F5F5F |
| 900 | #3E3E3E |
| 1000 | #393C3C |

---

## Typography

| Font | Sumber | Pemakaian (final) |
|---|---|---|
| **Coolvetica** | Typodermic Fonts | **Display/Headline** — Hero Title, Section Header, Page Title. Ekspresif, buat narik perhatian di awal |
| **Montserrat** | Google Fonts | **UI Action & Interactive Components** — teks di DALAM wujud tombol (Hero CTA, Form button "Register"/"Submit"), Sidebar/Nav CTA, dropdown trigger label (misal "Competition", "Events" di Navbar). Geometric & tegas — dipakai buat semua elemen yang sifatnya "actionable/interactive", bukan cuma `<button>` literal |
| **Inter** | Google Fonts / Rsms.me | **Contextual CTA & Microcopy (text-based, BUKAN tombol)** — link teks ("Lupa Kata Sandi?", "Daftar di sini"), teks penjelas di banner, toast/alert message, tab label |
| **Plus Jakarta Sans** | Google Fonts | **Body Text & Form Input (teks panjang)** — paragraf, deskripsi lomba/event, isi input field, tabel data |

✅ **Batasan Button vs CTA jelas:** bedanya bukan dari "seberapa penting aksinya", tapi dari **wujud elemennya**. Kalau teksnya dibungkus container/background tombol → **Montserrat**. Kalau teksnya berdiri sendiri tanpa background kontainer (link, microcopy, alert) → **Inter**.

### Cara Load Font (technical note untuk FE)
- **Inter, Montserrat, Plus Jakarta Sans**: tersedia di Google Fonts, load via `next/font/google`, gratis tanpa syarat khusus
- **Coolvetica**: TIDAK ada di Google Fonts — file font (.woff2/.ttf) harus di-self-host di project

## Type Scale

Responsive — beda value untuk **mobile** (breakpoint 440px) dan **website/desktop** (breakpoint 1440px). Paragraph spacing seluruhnya 0 di semua level.

| Level | Font Size (mobile → website) | Line Height (mobile → website) | Rasio LH:FS |
|---|---|---|---|
| H1 | 48px → 60px | 58px → 72px | ~1.2 |
| H2 | 40px → 48px | 48px → 58px | ~1.2 |
| H3 | 32px → 40px | 40px → 48px | ~1.2–1.25 |
| H4 | 28px → 32px | 32px → 38px | ~1.14–1.19 |
| H5 | 24px → 24px | 28px → 29px | ~1.17–1.21 |
| H6 | 20px → 20px | 24px → 24px | 1.2 |
| Paragraph Large | 20px → 20px | 24px → 24px | 1.2 |
| Paragraph Medium | 16px → 16px | 19px → 19px | ~1.19 |
| Paragraph Small | 14px → 14px | 17px → 17px | ~1.21 |
| Paragraph Super Small | 12px → 12px | 16px → 16px | ~1.33 |

✅ H1–H6 pakai **Coolvetica** (Headline). Paragraph Large/Medium/Small/Super Small pakai **Plus Jakarta Sans** (Body/Deskripsi/Form Input). Montserrat (Button) dan Inter (Contextual CTA/Microcopy) dipakai di luar Type Scale ini.

## Font Weight

| Token | Weight (numeric) | Pemakaian |
|---|---|---|
| `thin` | 300 | Footnote, catatan kaki, metadata kecil (misal "Deadline passed", timestamp) |
| `regular` | 400 | Teks biasa — deskripsi lomba, body paragraph, instruksi |
| `semibold` | 600 | Emphasis — label penting, nama field wajib, teks yang perlu menonjol dalam paragraf |
| `bold` | 700 | Judul/headline — H1-H6, nama kompetisi/event, CTA button |

### Mapping per Font
| Font | `thin` (300) | `regular` (400) | `semibold` (600) | `bold` (700) |
|---|---|---|---|---|
| **Coolvetica** (Headline) | ❌ | ❌ | ❌ | ✅ satu-satunya weight |
| **Plus Jakarta Sans** (Body/Input) | ✅ | ✅ weight utama | ✅ emphasis | ✅ |
| **Inter** (Microcopy) | — | ✅ link/tab biasa | ✅ toast/alert | — |
| **Montserrat** (Button) | — | — | ✅ | ✅ |

**Cara pakai:**
- H1–H6 (Coolvetica) → selalu `bold`
- Paragraph (Plus Jakarta Sans) → `regular` untuk teks biasa, `semibold`/`bold` untuk emphasis
- Isi Button (Montserrat) → `semibold` atau `bold`
- Microcopy (Inter) → `regular` untuk link/tab, `semibold` untuk toast/alert

**Lisensi:** Coolvetica Regular/Italic/Condensed/Compressed/Crammed **GRATIS termasuk komersial**. Inter, Montserrat, Plus Jakarta Sans seluruhnya open source via Google Fonts.

---

## Spacing Scale

| Token | Value | Dipakai untuk |
|---|---|---|
| `xs` | 4px | Gap icon-teks dalam button, padding badge |
| `sm` | 8px | Padding dalam input/button kecil |
| `md` | 16px | Padding standar card, gap antar form field |
| `lg` | 24px | Padding card besar, gap antar card dalam grid |
| `xl` | 32px | Gap antar sub-section |
| `2xl` | 48px | Gap antar section besar (Hero → About) |
| `3xl` | 64px | Padding vertikal section (top/bottom) |
| `4xl` | 96px | Jarak section paling lega (Hero yang besar) |

## Border Radius Scale

| Token | Value | Dipakai untuk |
|---|---|---|
| `none` | 0px | Table, elemen yang sengaja tegas |
| `sm` | 4px | Input, badge kecil |
| `md` | 8px | Button, Card kecil |
| `lg` | 16px | Card besar (Tilted/Fanned Card), Modal |
| `full` | 9999px | Avatar, badge pill, tombol bulat |

## Shadow / Elevation Scale

| Token | Value (CSS box-shadow) | Dipakai untuk |
|---|---|---|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | Card default (subtle) |
| `md` | `0 4px 6px rgba(0,0,0,0.10)` | Card saat hover, Dropdown |
| `lg` | `0 10px 15px rgba(0,0,0,0.10)` | Modal, Toast |
| `xl` | `0 20px 25px rgba(0,0,0,0.15)` | Overlay besar |
| `2xl` | `0 35px 64px rgba(0,0,0,0.19)` | Efek "melayang" dramatis — khusus TiltedCard state focus |

---

## Komponen

### Button

**Variants:**

| Variant | Background | Text color | Dipakai untuk |
|---|---|---|---|
| **Primary** | `radial-gradient(circle at 30% 30%, #B0E7CA 0%, #A0DFD1 42%, #6ABBC8 80%), linear-gradient(90deg, #146E5F 0%, #B0E7CA 33%, #A0DFD1 68%, #6ABBC8 100%)` | `#154B54` (Cyan/1000) | Aksi utama — "Register", "Submit", "Create Team", "Join Team", "Continue" |
| **Secondary** | `radial-gradient(circle at 30% 30%, #B5DDE4 0%, #9CD2DB 42%, #6ABBC8 80%), linear-gradient(90deg, #10616E 0%, #B5DDE4 33%, #9CD2DB 68%, #6ABBC8 100%)` | `#154B54` (Cyan/1000) | Aksi sekunder — "Learn More", toggle "Rundown"/"Detail" di SpeakerCard |
| **Ghost** | `rgba(154,210,219,.15)` + `border: 1.5px solid #6ABBC8` | `#3E3E3E` | Aksi netral/cancel — "Cancel", "Close" |
| **Destructive** | `radial-gradient(circle at 30% 30%, #FEE3D4 0%, #FDC0AB 42%, #FB9580 80%), linear-gradient(90deg, #75082E 0%, #FEE3D4 33%, #FDC0AB 68%, #FB9580 100%)` | `#5F0726` | Aksi berbahaya — "Delete", "Remove Member" |

**States:**

| State | Treatment |
|---|---|
| Default | Sesuai variant + animasi `waterFlow` |
| Hover | Overlay `linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.1))` di atas base gradient |
| Pressed | Overlay `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2))` — 2× lebih gelap dari hover |
| Disabled | `color: rgba(62,62,62,.5); background: transparent; border: 1.5px solid #D6D6D5` (Neutral/300) |
| Processing | Base gradient tanpa overlay gelap, animasi `waterFlow` MATI, digantikan bubble particle animation |

**Size Variants:**

| Variant | Padding | Font Size | Tinggi estimasi | Dipakai untuk |
|---|---|---|---|---|
| `sm` | `6px 12px` | 13px | ~32px | Badge-like action, aksi sekunder kecil |
| `md` | `11px 27px` | 16px | ~40px | **Default** — form submit, CTA umum |
| `lg` | `18px 44px` | 18px | ~52px | Hero CTA, tombol utama halaman |

Font: Montserrat `semibold` (600) untuk `sm`/`md`, `bold` (700) untuk `lg`. Hover/pressed padding: `11px 31px` (sedikit lebih lebar dari default md).

**Border Radius:** elliptical organicRadius (`r1 r2 r3 r4 / r2 r4 r1 r3`) — generate sekali saat komponen pertama mount (`useMemo` atau `useState` dengan initializer), lock nilai itu seumur hidup komponen. **Jangan re-randomize tiap render** — UI akan "goyang".

**Efek Akuatik (4 animasi):**

1. **Glossy water-surface sheen:**
```css
position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
background: linear-gradient(120deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.4) 50%, rgba(255,255,255,0) 72%);
```

2. **Ripple saat klik:**
```css
@keyframes rippleOnce {
  0% { transform: translate(-50%,-50%) scale(0); opacity: .6; }
  100% { transform: translate(-50%,-50%) scale(9); opacity: 0; }
}
```
Muncul dari titik klik (`clientX/clientY` relatif ke button), warna `rgba(255,255,255,.55)`, durasi 0.7s.

3. **Rising bubble particles (khusus Processing/Hero):**
```css
@keyframes bubbleRise {
  0% { transform: translateY(0) scale(.4); opacity: 0; }
  15% { opacity: .85; }
  100% { transform: translateY(-26px) scale(1); opacity: 0; }
}
```
Titik 6–14px, posisi horizontal acak, delay bertahap per bubble, infinite loop 1.4s.

4. **Water flow (gradient "mengalir" ambient):**
```css
@keyframes waterFlow {
  0%   { background-position: 0% 0%, 0% 50%; }
  50%  { background-position: 100% 100%, 100% 50%; }
  100% { background-position: 0% 100%, 50% 50%; }
}
```
`background-size: 220% 220%, 320% 100%`. Durasi beda per variant biar nggak sinkron: Primary 8s, Secondary 8.6s, Destructive 7.4s. Otomatis mati saat state Processing.

**Button Primary — box-shadow:** `0 8px 20px rgba(20,110,95,.25)`

⚠️ **Figma perlu di-update manual:** component asli di Figma masih pakai `Arsenal SC:Bold` — ganti ke Montserrat. Dokumentasi ini dianggap sumber kebenaran yang benar, Figma yang ketinggalan.

---

### Sidebar CTA / Nav Button (Dashboard)

| Property | Value |
|---|---|
| Size | 165px × 46px |
| Border radius | ~12px |
| Background (default) | `#F0F5FA` |
| Background (hover) | overlay `rgba(0,0,0,.1)` di atas base |
| Background (pressed) | base color + `box-shadow: 0 4px 4px rgba(0,0,0,.25)` |
| Font | **Montserrat Bold**, 14.456px |
| Text color | `#393C3C` (Neutral/1000) |
| Icon | MDI (Material Design Icons) |

✅ **Icon Set — standar tunggal MDI.** Yang perlu diganti manual di Figma:
- `lsicon:down-filled` → `mdi:chevron-down`
- `iconamoon:profile-fill` → `mdi:account-circle`
---

### Navbar — Login CTA & Profile CTA

| Property | Value |
|---|---|
| Size | 147px × 46px (Login) / 116px × 47px (Profile) |
| Border radius | 15px |
| Background | Sama persis gradient Button Primary |
| Font | **Montserrat Bold** |
| Text color | `#154B54` (Cyan/1000) |
| Icon (Profile) | `mdi:account-circle` |
---

### Navbar — Dropdown Label ("Competition", "Events")

| Property | Value |
|---|---|
| Font | **Montserrat Bold** |
| Text color | `#5F5F5F` (Neutral/800) |
| Border | `1.5px solid white`, radius `15px` |
| Icon | `mdi:chevron-down` |

**Catatan Non-Kritis:** Logo di Navbar masih "IOE 2026" — placeholder asset, menunggu aset final dari klien.

---

### Footer

| Property | Value |
|---|---|
| Background | `linear-gradient(primary/600 → primary/400 → primary/100)` — sama kayak Navbar |
| Link ("Competitions", "Events", "Privacy & Policy") | Inter Regular, 14px |
| Copyright text & info text | Plus Jakarta Sans, 14px |
| Divider line | CSS `border-top` — jangan pakai image asset |
| Text color | `#393C3C` (Neutral/1000) |
| Icon Instagram (×4) | `mdi:instagram` |

⚠️ Line-height asli di Figma `33.089px` — artifact auto-height, bukan nilai yang disengaja. Implementasi pakai `17px` sesuai Type Scale Paragraph Small.

---

### Badge

Elemen pill kecil, non-clickable, buat nunjukin status/kategori singkat.

| Variant | Background | Text Color | Contoh Pemakaian |
|---|---|---|---|
| **Success** | `success/500` `#4ABAA7` | `#154B54` (Cyan/1000) | "Accepted", "Approved", "Verified" |
| **Error** | `error/800` `#8D0E2F` | `#F8F8F9` (Neutral/100) | "Rejected" |
| **Warning** | `warning/300` `#FFAD7A` | `#393C3C` (Neutral/1000) | "Pending" |
| **Neutral** | `neutral/900` `#3E3E3E` | `#F8F8F9` (Neutral/100) | "Group Task", "Individual Task", "Batch 1/2" |

✅ Kontras Error & Warning dipilih tinggi (dark bg + light text, atau light bg + dark text) untuk WCAG AA.

---

### Status Banner

Komponen lebar penuh yang muncul di dalam Registration Requirements accordion setelah item di-expand. Berbeda dari Badge (pill kecil di header) — ini lebih lebar, dipakai untuk menyampaikan hasil review panitia.

**Spesifikasi Umum:**

| Property | Value |
|---|---|
| Border radius | `8px` — `rounded-lg` |
| Padding | `12px / 8px` — `px-3 py-2` |
| Font | Inter Semibold, 14px |
| Lebar | `w-full` |
| Icon | MDI, 16px, stroke-width 2 |
| Layout | `flex items-start gap-2` — icon rata atas, teks bisa 1–2 baris |

**Varian per Status:**

| Status | Background | Text | Icon |
|---|---|---|---|
| **Success** | `success/500 #4ABAA7` | `success/1000 #185349` | `mdi:check-circle` |
| **Rejected** | `error/400 #F86D60` | `error/1000 #5F0726` | `mdi:close-circle` |
| **Pending** | `warning/400 #FF8C59` | `warning/1000 #610509` | `mdi:alert` |
| **Lock Deadline** | `error/500 #F42D2D @ 18% opacity` | `error/1000 #5F0726 @ 75% opacity` | `mdi:lock` |

**Catatan Rejected:** bisa punya baris kedua untuk alasan penolakan — `font-weight: 500`, `font-size: 13px`, `opacity: 0.85`. Layout teks pakai `flex-col gap-1`.

**Catatan Lock Deadline:** kondisi terpisah dari status Accepted — background dan teks pakai opacity rendah untuk kesan "terkunci/tidak aktif", beda dari Rejected yang saturasi penuh.

---

### Input

Diekstrak dari inspect element COMPFEST (form registrasi Event & Profile) + HTML source langsung.

| Property | Value |
|---|---|
| Tinggi | `42px` mobile (`h-10.5`), `48px` desktop (`h-12`) |
| Border radius | `12px` mobile (`rounded-xl`), `16px` desktop (`rounded-2xl`) |
| Background | `transparent` |
| Border default | `1px solid #A6A5A5` (`neutral/500`) |
| Font | Plus Jakarta Sans |
| Font size | `text-b3` mobile, `text-b2` desktop |
| Placeholder | `#A6A5A5` (`neutral/500`) |
| Placeholder hover | `#393C3C` (`neutral/1000`) — berubah saat hover container |
| Filled text | `#154B54` (`cyan/1000`) |
| Label | Selalu di atas input, bukan floating. Bold, `#154B54` (`cyan/1000`) |
| Icon (opsional, kiri) | `20px` mobile (`size-5`), `28px` desktop (`size-7`). Posisi `left: 12px` mobile, `left: 16px` desktop. Warna default `neutral/500`, ikut berubah saat focus |
| Overflow | `overflow-hidden` di container |
| Transition | `transition-colors duration-200` |

**Padding input:**
| | Mobile | Desktop |
|---|---|---|
| Kiri (dengan icon) | `pl-10` (40px) | `pl-13` (52px) |
| Kanan | `pr-3` (12px) | `pr-4` (16px) |

**State Focus** (`focus-within` di container):
- Border: berubah ke `neutral/1000` `#393C3C`
- Icon: berubah ke `neutral/1000` `#393C3C`

**State Error:**
- Border container: `error/600` `#D12030`
- Icon di dalam field: `neutral/1000` `#393C3C` — tidak berubah saat error, tetap gelap
- Input mendapat `aria-invalid="true"` + `aria-describedby` ke elemen error message
- Error message muncul di **luar** container field — `mt-1.5` di bawah field
- Error message layout: `flex items-center gap-1.5`
- Error message font: Plus Jakarta Sans, `text-b3` mobile / `text-b2` desktop
- Error message icon: `mdi:alert`, `24px` (`size-6`), `shrink-0`, warna `error/600` `#D12030`
- Error message teks: warna `error/600` `#D12030`

**State Disabled:**
- Container: `opacity-50` + `cursor-not-allowed` — seluruh field menjadi 50% transparan sekaligus, bukan per-elemen
- Input element: `disabled=""` + `cursor-not-allowed`
- Border tetap `neutral/500` — tidak berubah warna, hanya opacity turun

**Konsistensi icon:**
- Field dengan icon: Phone, Line ID, Institution, Domicile (form Event Registration)
- Field tanpa icon: Name, Email, Institution (Profile form)

**Catatan border-radius per konteks:**
- Form Event Registration → pill/`full` (lebih santai, form single-purpose)
- ProfileForm → `rounded-xl` (12px) / `rounded-2xl` (16px) (lebih terkontrol, form 2 kolom)
- Dua gaya ini sengaja dipertahankan beda sesuai konteks, bukan inkonsistensi

---

### FannedCard

Dipakai di Event Details, section "What You'll Gain" (F-29, F-29a).

**Sizing (semua kartu, responsive):**
```css
width: 42vw;
max-width: 144px;   /* mobile */
max-width: 176px;   /* sm */
max-width: 256px;   /* md */
max-width: 384px;   /* lg */
max-width: 416px;   /* xl */
aspect-ratio: 3 / 4;
```

**Positioning per kartu:**
| Posisi | Transform | Z-index | Scale |
|---|---|---|---|
| **Kiri** | `translateX(-50% - clamp(110px, 30vw, 340px)) translateY(-50%) rotate(-10deg)` | 20 | 0.94 |
| **Tengah (fokus)** | `translateX(-50%) translateY(-50%) rotate(0deg)` | 30 | 1 |
| **Kanan** | `translateX(-50% + clamp(110px, 30vw, 340px)) translateY(-50%) rotate(10deg)` | 20 | 0.94 |

**Animasi transisi:**
```css
transition: transform 540ms cubic-bezier(0.25, 0.1, 0.25, 1);
```
✅ Interval auto-geser: **540ms** — kontinu, nyaris tanpa jeda diam.

**Implementasi:** 1 komponen Card reusable, dibedain lewat props/state posisi (`position: 'left' | 'center' | 'right'`).

**Border (gradient border via padding):**
```css
/* outer div: gradient background */
border-radius: 18px;   /* mobile */
border-radius: 24px;   /* sm, rounded-3xl */
border-radius: 44px;   /* xl */
padding: 1.5px;        /* mobile */
padding: 2px;          /* sm+ */
```

--fannedcard-bg-focus: color-mix(in oklch, #42C0A3 65%, black); /* ≈ #2A7A64, solid — primary/Mint didarken biar teks putih kontras */
--fannedcard-bg-side: color-mix(in oklch, #2A7A64 55%, transparent); /* translucent, dipasangkan sama backdrop-blur-md */
/* Gradient border (via padding) */
background: linear-gradient(135deg,
  color-mix(in oklch, #42C0A3 55%, white) 0%,  /* primary/300 */
  #078EA4 55%,                                  /* secondary/Default */
  #96DFB8 100%                                  /* tertiary/Default */
);

**Background kartu:**
| Posisi | Background |
|---|---|
| **Tengah (fokus)** | `--fannedcard-bg-focus` — SOLID, tanpa opacity, tanpa blur |
| **Kiri & Kanan** | `--fannedcard-bg-side` + `backdrop-blur-md` — translucent + blur |


**Typography:**
```css
/* Judul */
font-family: var(--fannedcard-font-heading); /* → Coolvetica */
font-size: text-h7 (mobile) → text-h6 (md) → text-h4 (xl)

/* Deskripsi */
font-family: var(--fannedcard-font-body); /* → Plus Jakarta Sans */
font-size: 0.42rem (mobile) → text-b4 (md) → text-b2 (xl)
```

**Ilustrasi:**
```css
height: 48px (mobile) → 96px (md) → 144px (lg);
```
⚠️ Aset ilustrasi milik COMPFEST — IOE 2027 perlu ilustrasi sendiri.

**Padding internal (responsive):**
```css
padding: 12px 16px;   /* mobile */
padding: 16px 20px;   /* sm */
padding: 24px 28px;   /* md */
padding: 40px 32px;   /* xl */
padding: 64px 40px;   /* 2xl */
```

---

### SpeakerCard

Dipakai di Event Details (Workshop), section paling bawah setelah Timeline (F-32–F-34a).

**Layout keseluruhan:**
```css
display: grid;
grid-template-columns: 1fr 2fr; /* foto kiri, info kanan */
/* mobile: grid-cols-1 (stack vertikal) */
border-radius: 24px; /* rounded-3xl outer, rounded-4xl inner */
padding: 2px; /* gradient border via padding */
```

**Kolom kiri (foto) — sama di kedua state:**
- Badge "Speaker" (pill, reuse komponen Badge) di atas foto
- Foto speaker, full width
- Background gradient container di belakang foto

**Kolom kanan — State: Default (data speaker):**
```
Nama speaker (text-h3, Coolvetica, turun ke h4 di mobile)
Role/company (text-b2, warna lebih pudar/secondary)
--- divider ---
Judul workshop (gradient text — bg-clip-text + gradient, BUKAN warna solid)
3 baris info dengan icon: Tanggal, Platform, Waktu (icon: MDI flat)
```

**Kolom kanan — State: Rundown (toggle aktif):**
```css
max-height: 320px; overflow-y: auto;
/* custom scrollbar: width ~6px, thumb rounded */
```
Per item: Dot bulat 24px + garis vertikal penghubung ke item berikutnya (pola timeline vertikal standar) → Jam (gradient text) → Deskripsi kegiatan.

✅ Rundown **scrollable dalam container fixed-height** (max-height 320px), BUKAN card yang membesar.

**Tombol (sama di kedua state, hanya label ke-2 yang berubah):**
| Tombol | Default state | Rundown state |
|---|---|---|
| 1 (Primary) | "Register" | "Register" |
| 2 (Secondary, toggle) | "Rundown" (`mdi:format-list-numbered`) | "Detail" (`mdi:format-list-numbered`) |

**Behavior transisi:** ✅ **Slide** — konten kanan berganti dengan animasi slide.

/* Gradient border (via padding) — sama teknik dgn FannedCard */
background: linear-gradient(135deg,
  color-mix(in oklch, #42C0A3 55%, white) 0%,  /* primary/300 */
  #078EA4 55%,                                  /* secondary/Default */
  #96DFB8 100%                                  /* tertiary/Default */
);

--speakercard-bg: #132321; /* bg-component-card — neutral dark teal, netral biar foto & gradient text tetap menonjol */

/* Judul workshop & waktu rundown — gradient text, bg-clip-text */
background: linear-gradient(90deg, #42C0A3, #078EA4);

/* Font: judul nama/workshop pakai Coolvetica (sama seperti FannedCard), tombol pakai Montserrat 700, body/role pakai Plus Jakarta Sans */

---

### Accordion (Registration Requirements)

Library: **Radix UI Accordion** (headless), mode **`type="multiple"`** (banyak item bisa terbuka bersamaan). Tiap item requirement dibungkus Card terpisah — 5 Card independen bertumpuk `gap: 16px`.

**Header (state Closed):**
```css
border-radius: 12px;   /* mobile, rounded-xl */
border-radius: 36px;   /* md+ */
box-shadow: shadow/sm;
padding: 24px;
```
Layout: judul kiri, badge-badge kanan (Task Type + Status). Chevron rotate 180° saat expand, durasi **200ms**.

**Isi Expanded (urutan dari atas ke bawah):**
1. **Status Banner** — sesuai spec Status Banner di atas
2. **Baris Due Date** — `mdi:calendar-range` + teks tanggal deadline
3. **Badge "Deadline passed"** (kalau lewat) — reuse Badge Error, `mdi:lock`
4. **Banner penjelasan lock** (kalau deadline lewat) — `error` opacity rendah (~18%), `mdi:lock`, teks penjelasan
5. **List instruksi** — bullet point jenis dokumen yang diterima
6. **FileUploadDropzone**

**Animasi expand/collapse:** pakai CSS custom property `--radix-accordion-content-height`, animasi `accordion-down`/`accordion-up`.

---

### FileUploadDropzone

**State: Empty (belum ada file):**
```css
border: 2px dashed neutral/300;
background: neutral/100;
cursor: pointer;
```
Isi: `mdi:cloud-upload-outline`, teks "Tarik atau pilih file — bukti akan langsung terupload otomatis", teks kecil format diterima ("JPG, PNG, maks 500KB").

**State: Pending/Uploading:**
```css
border: 2px solid primary/500;
background: primary/100;
cursor: default;
```
Isi: spinner/loading (bisa reuse animasi bubble Button), teks "Mengupload..."

**State: Uploaded:**
```css
min-height: 280px;
border-radius: 24px;   /* mobile */
border-radius: 36px;   /* md+ */
border: 2px solid [accent token — diisi sendiri];
padding: 24px 16px;    /* mobile */
padding: 40px 32px;    /* md+ */
```
Isi: icon-icon (lihat di bawah), ilustrasi/maskot di tengah, teks "File telah **terupload!**" (kata "terupload!" gradient text, Coolvetica), nama file (Montserrat), `<input type="file" disabled>` kalau terkunci.

action icon-icon state uploaded:

3 tombol icon berjejer horizontal (`flex gap-2`), masing-masing `size-10` (40px), `border-radius: rounded-lg` (8px):

| Tombol | Icon | Fungsi |
|---|---|---|
| View | `mdi:eye` | Buka file di tab baru (`<a target="_blank">`) |
| Edit | `mdi:pencil-outline` | Ganti file |
| Remove | `mdi:trash-can-outline` | Hapus file |

**Warna icon (default):** `primary/600` `#42C0A3`
**Warna icon (hover):** `primary/800` `#347F6E`
**Background hover:** `primary/100` `#C6ECE3`

**Border state Uploaded:** `2px solid primary/600` `#42C0A3`

**State: Error (upload gagal):**
```css
border: 2px solid error/500;
background: error/100;
cursor: pointer;
```
Isi: `mdi:alert-circle-outline`, pesan error dari `error.code` (mapping via Error Code Reference di API_CONTRACT.md).

**Lock — dua kondisi independen:**
- Status `accepted` → `cursor: default`, area upload disabled permanen
- `dueDate` terlewati → `cursor: default`, area upload disabled, **apapun status saat ini**

✅ Format file: **JPG, PNG saja**, maks 500KB. PDF tidak diterima untuk 5 item Registration Requirements standar.

**Behavior penting:** validasi `FILE_TOO_LARGE` dan `INVALID_FILE_FORMAT` dicek **client-side dulu** sebelum request ke server. `REQUIREMENT_LOCKED` dan `DEADLINE_PASSED` dari response server.

---

### CalendarWidget

Dipakai di Dashboard (F-50, F-51).

**Container:**
```css
width: 368px; /* desktop */
width: 100%;  /* mobile */
border-radius: 24px;
padding: 16px 20px;   /* mobile */
padding: 24px;        /* sm+ */
gap: 20px;            /* mobile */
gap: 24px;            /* sm+ */
```

**Header:** `mdi:calendar-range` + teks bulan-tahun, Coolvetica, 18px mobile → 20px sm+. Tombol prev/next: `rounded-full`, 28px mobile → 32px sm+.

**Grid hari:**
```css
border-radius: 24px;
padding: 12px;   /* mobile */
padding: 16px;   /* sm+ */
grid-cols: 7; gap: 2px (mobile) → 4px (sm+);
```
Header hari (Mon-Sun): Montserrat Bold, 14px, centered.

**Tombol tanggal:**
```css
border-radius: 40px; /* full pill */
height: 36px;   /* mobile */
height: 40px;   /* sm+ */
font: Montserrat Bold, ~15px (mobile) → 16px (sm+);
```

**3 state tanggal:**
| State | Style | Kapan |
|---|---|---|
| Di luar bulan aktif | Warna pudar + `opacity: 0.2` | Tanggal bulan sebelumnya/berikutnya |
| Normal | Warna teks biasa, tanpa background | Mayoritas tanggal |
| Ada jadwal (highlight) | Background solid + teks kontras, pill penuh | Tanggal yang match item list bawah |

**List jadwal di bawah grid:**
```css
display: flex; flex-direction: column; gap: 8px;
```
Per item: logo kompetisi/event 20px (dari `logoUrl`) + teks Montserrat Bold 13px format `"[Tanggal] - [Kode] – [Nama Kegiatan]"`.

✅ Grid & list adalah 1 sumber data yang sama (1:1 mapping). Diferensiasi Competition vs Event lewat logo masing-masing, bukan warna/shape generik.

⚠️ Token CSS custom (`--calendar-border`, `--calendar-bg`, `--calendar-day-bg-hover`, `--calendar-grid-border`, `--calendar-accent`) belum di-resolve ke hex — diisi dengan token IOE 2027.

--calendar-bg: #132321;           /* card surface, konsisten sama komponen lain */
--calendar-border: oklch(1 0 0 / 0.08);
--calendar-grid-border: #0F1C1A;  /* grid container sedikit lebih gelap dari card, bikin depth tanpa border tebal */
--calendar-day-bg-hover: color-mix(in oklch, #42C0A3 22%, transparent); /* tint primary tipis, netral tapi kerasa aktif */
--calendar-accent: #078EA4;       /* secondary/Cyan — solid buat pill tanggal yang ada jadwal */

---

### ProfileForm

Dipakai di halaman My Profile (F-55, F-56).

**Layout container:**
```css
display: grid;
grid-template-columns: 1fr;       /* mobile */
grid-template-columns: 1fr 1fr;   /* lg+, 2 kolom */
gap: 24px;
border-radius: 12px;   /* mobile */
border-radius: 36px;   /* md+ */
padding: 24px;
```

**State: View (read-only):**
```css
/* per field */
border: 1px solid neutral/300;
border-radius: 12px;
padding: 16px 20px;
```
Label: Montserrat, size kecil. Value: Plus Jakarta Sans. Tombol: 1 — "Edit Personal Info" (primary, `mdi:pencil`), rata kanan.

**State: Edit:**
```css
border: 1px solid neutral/500;
border-radius: 12px;   /* mobile */
border-radius: 16px;   /* md+ */
height: 42px;          /* mobile */
height: 48px;          /* md+ */
focus-within: border → neutral/1000
```
✅ Field Email: `disabled` + `opacity: 50%` + `cursor: not-allowed` — read-only, tidak bisa diedit.
Tombol: 2 — "Save Changes" (primary, `mdi:content-save`) dan "Cancel" (secondary, `mdi:close`).

**Behavior:** default View → klik "Edit Personal Info" → semua field jadi editable → Save (`PUT /profile`) → kembali View dengan data baru. Cancel → kembali View, buang perubahan.

---

### MyJourneyCard

Dipakai di Dashboard, section "My Journey" (F-47, F-47a, F-48).

**Container:**
```css
display: flex; flex-direction: row;
border-radius: 12px;   /* mobile */
border-radius: 36px;   /* md+ */
padding: 24px;
gap: 8px;    /* mobile */
gap: 24px;   /* md+ */
overflow: hidden;
```

**Bagian 1 — Tombol "Add Another" (kiri, fixed):**
```css
flex-shrink: 0;
/* icon container */
size: 80px;    /* mobile */
size: 100px;   /* md+ */
border-radius: 12px;
padding: 1px; /* gradient border via padding */
```
Inner: `border-radius: 15px`, background solid, `mdi:plus-circle-outline` size 44px.

✅ **State Disabled:** `opacity: 50%` + `cursor: not-allowed` + `title` attribute berisi alasan (misal "Registration has not opened yet").

**Bagian 2 — List logo kompetisi (kanan, scrollable horizontal):**
```css
flex: 1;
overflow-x: auto;
cursor: grab;
scrollbar: hidden;
user-select: none;
```
Per item: label nama kompetisi (Plus Jakarta Sans Bold, truncate) di atas, icon container (gradient border via padding, inner rounded-15px) berisi logo (`<img>`, 56px mobile → 80px md+), clickable.

💡 **Teknik gradient-border-via-padding** dipakai berulang di FannedCard, SpeakerCard, MyJourneyCard, Countdown Timer — buat 1 komponen/utility reusable `<GradientBorderBox>`.

---

### HeroCarousel

⚠️ **Riwayat revisi** (bukan bagian spec asli dokumen ini): section ini melewati 3 iterasi sebelum versi final di bawah. Iterasi 1 cuma nama komponen tanpa detail visual. Iterasi 2 salah menyimpulkan mekanisme `position: absolute` + `translateX` persentase itu sendiri masalahnya, padahal mekanisme itu valid. Iterasi 3 mengekstrak nilai literal dari referensi pertama user (versi dengan `translateX(±82%)`), TAPI setelah itu user memberi template referensi kedua yang lebih matang secara UX (mekanisme wrap infinite loop bawaan, lebih clean) dan meminta pakai itu sebagai dasar, dengan warna disesuaikan ke token project. **Versi di bawah ini menggantikan seluruhnya** — jangan campur dengan nilai dari iterasi manapun sebelumnya (terutama jangan pakai lagi `translateX(±82%)`/`rotateY`/`scale(0.88)` dari iterasi 3, itu sudah digantikan oleh mekanisme offset baru di bawah).

**Konsep:** carousel coverflow — slide aktif di tengah (besar, `scale(1)`, `opacity: 1`), maksimal SATU slide tetangga terlihat di tiap sisi (bukan makin banyak semakin transparan seperti iterasi sebelumnya), slide di luar itu disembunyikan penuh (`opacity: 0`, `pointer-events: none`). Wrap dari slide terakhir ke pertama otomatis mulus karena posisi dihitung dari **jarak terpendek (shortest path)**, bukan urutan linear array — detail di bawah.

**HTML/CSS/JS lengkap sudah disetujui user dan siap dipakai sebagai basis implementasi** (adaptasi ke React/Next.js sesuai `TECHNICAL_CONSTRAINTS_FE.md`, tapi logika dan nilai CSS di bawah ini WAJIB diikuti persis):

**Struktur container:**
```css
.carousel-section{
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
}
.carousel-viewport{
  position: relative;
  width: 100vw;              /* full-bleed — breaks out of parent's max-width */
  left: 50%;
  margin-left: -50vw;
  height: clamp(300px, 40vw, 460px);
  overflow: hidden;
  touch-action: pan-y;
}
```

**Slide (card):**
```css
.slide{
  position: absolute;
  top: 50%; left: 50%;
  width: clamp(300px, 58vw, 640px);
  aspect-ratio: 3 / 2;
  transform-origin: center;
  transition: transform 500ms cubic-bezier(.2,.8,.2,1), opacity 500ms cubic-bezier(.2,.8,.2,1);
  border-radius: clamp(14px, 2vw, 20px);
  padding: 1px;                                   /* border via padding */
  background: linear-gradient(155deg,
    var(--color-tertiary-600) 0%,
    var(--color-secondary-1000) 45%,
    var(--color-primary-600) 130%
  );
  cursor: pointer;
}
.slide[data-active="true"]{ cursor: default; }

.slide-inner{
  position: relative;
  width: 100%; height: 100%;
  border-radius: calc(clamp(14px, 2vw, 20px) - 1px);
  background: linear-gradient(180deg, var(--color-neutral-1000), var(--color-secondary-1000) 120%);
  padding: clamp(18px, 4vw, 36px) clamp(18px, 5vw, 40px);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center;
  gap: clamp(8px, 1.6vw, 14px);
  overflow: hidden;
}
```

**Motif "sonar rings" dekoratif di background tiap card (dipertahankan dari referensi — netral, tidak brand-specific):**
```css
.slide-inner::before{
  content:"";
  position: absolute; inset: -40%;
  background: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 42px, var(--line) 43px, transparent 44px);
  /* --line: rgb(from var(--color-neutral-500) r g b / 0.16) */
  opacity: 0.35;
  pointer-events: none;
}
```

**Tipografi konten per slide:**
```css
.slide-eyebrow{
  font-family: 'Montserrat';
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-primary-600);
}
.slide-title{
  font-family: 'Coolvetica';
  font-weight: 600;
  font-size: clamp(22px, 3vw, 30px);
  color: var(--color-neutral-100);
}
.slide-desc{
  font-family: 'Plus Jakarta Sans';
  font-size: 14px; line-height: 1.6;
  color: var(--color-neutral-500);
  max-width: 380px;
}
```

**Countdown gauge (HANYA dipakai di dalam slide HeroCarousel yang butuh countdown — BUKAN pengganti komponen Countdown Timer utama yang dipakai di 5+ tempat lain, lihat section Countdown Timer di bawah untuk itu):**
```css
.gauge-row{
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: clamp(6px, 1.6vw, 10px);
  margin-top: 4px;
}
.gauge{
  width: clamp(46px, 11vw, 60px);
  padding: clamp(5px, 1vw, 8px) 4px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgb(from var(--color-tertiary-600) r g b / 0.05);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.gauge .val{
  font-family: 'Montserrat'; font-weight: 700;
  font-size: clamp(14px, 2.4vw, 18px);
  color: var(--color-tertiary-600);
}
.gauge .lbl{
  font-family: 'Montserrat';
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--color-neutral-900);
}
```
Label unit dalam Bahasa Indonesia: "Hari" / "Jam" / "Menit" / "Detik" (bukan "Days"/"Hrs"/"Min"/"Sec").

**Tombol CTA (pakai gradient Button Primary resmi project, BUKAN warna orange dari template asli):**
```css
.slide-cta{
  font-family: 'Plus Jakarta Sans'; font-weight: 600; font-size: 13px;
  color: var(--color-tertiary-1000);
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-tertiary-400));
  border: none; border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.slide-cta:hover{ transform: translateY(-2px); box-shadow: 0 8px 20px rgb(from var(--color-primary-600) r g b / 0.25); }
.slide-cta:focus-visible{ outline: 2px solid var(--color-tertiary-600); outline-offset: 3px; }
```

**⚠️ Mekanisme positioning & offset — WAJIB ikuti logika ini persis, ini yang membedakan dari iterasi sebelumnya:**

Untuk tiap slide index `i`, dengan `active` = index slide yang sedang aktif dan `n` = jumlah total slide:

```js
let offset = i - active;
// Shortest-path wrap: supaya slide pertama dan terakhir dianggap "bersebelahan"
// alih-alih memaksa slide bergeser jauh melintasi seluruh array saat wrap.
if (offset > n / 2) offset -= n;
if (offset < -n / 2) offset += n;
const abs = Math.abs(offset);
const isActive = (offset === 0);

// Slide dengan |offset| > 1 disembunyikan PENUH (bukan makin transparan) —
// carousel ini cuma pernah menampilkan aktif + 1 tetangga tiap sisi, maksimal 3 slide terlihat sekaligus.
if (abs > 1) {
  // opacity: 0, pointer-events: none — slide ini tidak dirender secara visual
} else {
  const x = offset * 58;              // dalam PERSEN — jarak tetangga dari tengah
  const scale = (abs === 0) ? 1 : 0.86;
  const zIndex = 20 - abs;
  const opacity = (abs === 0) ? 1 : 0.5;
  // transform: translate(-50%, -50%) translateX(${x}%) scale(${scale})
}
```

Ini yang membuat **wrap dari slide terakhir ke pertama otomatis mulus** tanpa perlu cloning slide atau penanganan arah khusus (berbeda dari pendekatan iterasi sebelumnya) — karena `offset` selalu dihitung sebagai jarak terpendek, bukan selisih index array mentah.

**Catatan implementasi React/Next.js:** logika `layout()` di atas (yang ditulis dalam vanilla JS di referensi) perlu diadaptasi jadi computed value per-render (misal `useMemo` berdasarkan `active` state) mengikuti pola yang sudah ada di project untuk komponen lain, bukan manipulasi DOM langsung seperti referensi aslinya.

**Navigasi:**
- **Keyboard**: `ArrowLeft`/`ArrowRight` untuk navigasi (referensi punya ini, pertahankan — bagus untuk aksesibilitas, sebelumnya tidak pernah disebutkan di iterasi manapun).
- **Swipe/touch**: threshold pergerakan `40px` untuk trigger ganti slide (dari referensi).
- **Klik langsung ke slide non-aktif** yang terlihat (aktif + 1 tetangga) untuk langsung menjadikannya aktif.
- **Dots indicator**: non-aktif `8px` (`width/height: 8px`, `background: var(--color-neutral-900)`), aktif melebar jadi `26px` dengan `background: var(--color-tertiary-600)`, transisi `width 260ms ease, background 260ms ease`.
- **Counter teks** di bawah dots: format "`{aktif+1} dari {total}`" (referensi punya `counter` element terpisah — opsional tapi disarankan dipertahankan untuk aksesibilitas/kejelasan).
- Chevron prev/next EKSPLISIT TIDAK ADA di referensi ini (beda dari iterasi sebelumnya yang punya chevron kiri-kanan) — navigasi murni via klik-slide, swipe, keyboard, dan dots. Kalau ingin tetap menambahkan chevron untuk kemudahan desktop, itu penambahan di luar spec referensi, evaluasi dan tanyakan dulu sebelum menambahkan.

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` → transition dipangkas jadi `opacity 300ms ease` saja (tanpa transform animasi), sesuai referensi.

**Auto-rotate & pause-on-interaction** (F-08, dipertahankan dari keputusan sebelumnya — TIDAK ada di referensi HTML baru ini secara eksplisit, tapi tetap wajib sesuai requirement PRD): tambahkan auto-advance dengan interval wajar (referensi Countdown Timer pakai update tiap 1 detik untuk angka — auto-rotate slide sebaiknya interval lebih lama, sekitar 5-8 detik, karena beda tujuan), pause saat hover (desktop) atau sedang di-drag/swipe (mobile).

**Konten per slide (Landing Hero, F-07):** 3 slide — (1) "Indonesia Ocean Expo 2027" dengan countdown gauge ke tanggal target (5 Feb 2027 07:00 WIB, lihat keputusan sebelumnya) dan CTA "Lihat Jadwal", (2) "Kompetisi Nasional" tanpa countdown, CTA "Lihat Kompetisi", (3) rangkaian event (Talkshow/Workshop/dst) tanpa countdown, CTA "Lihat Event". Teks deskripsi disesuaikan dengan konten final yang sudah ada di implementasi sebelumnya kalau masih relevan, atau dari PRD F-07–F-11.

---

### Countdown Timer

Dipakai di 5+ tempat: Landing Hero, Competition Details, Competition Overview, Event Details, Event Overview. **1 komponen tunggal** dipakai konsisten di semua tempat.

✅ **Nilai final** (sebelumnya open item dengan placeholder `[token terang]`/`[token gelap]`/`drop-shadow-light` — sudah di-resolve dari referensi kode literal yang diberikan user untuk konteks Landing Hero; nilai yang sama berlaku untuk 5+ lokasi lain karena komponennya reusable):

**Struktur circle per unit waktu (Hours/Minutes/Seconds):**
```css
/* Outer ring (gradient border via padding) */
size: 72px;    /* mobile */
size: 112px;   /* md+ */
border-radius: 50%;
padding: 2px;
box-shadow: var(--shadow-md);   /* ✅ final: shadow-md, BUKAN drop-shadow-light */
background: linear-gradient(135deg,
  color-mix(in oklch, var(--color-primary-300) 55%, white) 0%,
  var(--color-secondary-600) 55%,
  var(--color-tertiary-600) 100%
);   /* sama seperti gradient border HeroCarousel card, untuk konsistensi visual */

/* Inner circle */
size: 68px;    /* mobile */
size: 108px;   /* md+ */
background: linear-gradient(to bottom, var(--color-primary-500), var(--color-primary-1000));   /* ✅ final: token terang = primary-500, token gelap = primary-1000 */
border-radius: 50%;
gap: 2px;   /* gap-0.5 antar label/garis/angka di dalam circle */
```
Isi tiap circle (stack vertikal, center): label unit (`font-ui text-b4`, Montserrat), garis horizontal tipis `1px` lebar `16px` (`w-4`) warna `rgb(from var(--color-neutral-100) r g b / 0.4)`, angka besar (`font-heading text-h6 md:text-h3`, Coolvetica).

**Icon label tanggal target (di atas circle, contoh: "5 Feb 2027, 07:00 WIB"):** `mdi:timer` via `@iconify/react/offline` (BUKAN `mdi:timer-outline` seperti versi draft sebelumnya, dan BUKAN icon SVG manual/lucide) — size `16px` mobile (`size-4`), `20px` desktop (`size-5`). Text style: `font-ui text-b4 font-bold` mobile, `md:text-b3` desktop, warna `var(--color-neutral-100)`.

**Separator antar circle:** 2 dot bulat `size: 8px` (`size-2`), disusun vertikal dengan `gap: 4px` (`gap-1`), warna `rgb(from var(--color-neutral-100) r g b / 0.7)`, margin horizontal `8px` mobile (`mx-2`) / `12px` desktop (`mx-3`) — bukan tanda titik dua (:).

**Label tanggal target** (di atas circle-circle): `mdi:timer-outline` + teks tanggal lengkap ("17 Jun 2026, 07:00 WIB"), Montserrat Bold.

**Behavior real-time:** update tiap detik (client-side JS interval).

**Tampilan waktu habis:** 00:00:00 
**Deadline masih jauh:** biarkan saja, tidak perlu unit "days" tambahan

---

### TiltedCard

Dipakai di Competition Details, section "What You'll Gain" (F-15). Sumber: Framer marketplace component "Reveal Gallery Stack", mode layout `"fan"`.

--tiltedcard-bg: #16302B; /* dark teal surface, senada bg-component-card tapi beda shade buat elevasi */
--tiltedcard-border: oklch(1 0 0 / 0.1); /* putih transparan tipis, netral */

--tiltedcard-caption-bg: color-mix(in oklch, #42C0A3 30%, black 55%); /* glass pill, tint primary gelap */
--tiltedcard-caption-text: oklch(0.98 0.01 210); /* nyaris putih */
--tiltedcard-caption-border: color-mix(in oklch, #078EA4 45%, transparent); /* tint secondary tipis */

**Transform per kartu** (`center = (total-1)/2`, `relative = index - center`):
```
translate(-50%, -50%)
translate(x, y)                /* x = relative × 130px, y = |relative| × 8px */
rotateX(tiltX) rotateY(tiltY) /* tilt dinamis mouse-follow */
rotate(relative × 7deg)        /* rotasi statis dasar */
scale(baseScale)               /* 1 default, 1.02 hover, 1.08 focus */
```

**✅ Mouse-follow 3D Tilt:**
```js
tiltX = -pointerY × 5deg
tiltY = pointerX × 5deg
```
`pointerX/Y` dari posisi kursor relatif ke container (-0.5 sampai 0.5).

**Click-to-focus:**
- Klik kartu → `scale(1.08)`, terangkat `-28px`, `z-index: 100`
- Kartu lain → `opacity: 0.46`
- Animation speed: **520ms**, `cubic-bezier(.2,.8,.2,1)`

**Caption (glassmorphic pill, muncul hanya saat hover/focus):**
```css
border-radius: 999px;
padding: 8px 11px;
backdrop-filter: blur(16px);
background: var(--tiltedcard-caption-bg);   /* ⚠️ placeholder */
color: var(--tiltedcard-caption-text);      /* ⚠️ placeholder */
border: 1px solid var(--tiltedcard-caption-border); /* ⚠️ placeholder */
font: Plus Jakarta Sans, 12px, semibold;
```

**Radial sheen overlay:**
```css
background: radial-gradient(circle at 50% 45%, rgba(255,255,255,.42), transparent 58%);
opacity: 0.72; /* idle */
opacity: 1;    /* hover */
```

**Shadow:** `shadow/2xl` — `0 35px 64px rgba(0,0,0,0.19)`

⚠️ **Placeholder — wajib diganti:**
- `var(--tiltedcard-bg)` — background container (referensi asli `#F4F0EA`, tidak nyambung ke palette akuatik)
- `var(--tiltedcard-border)` — border container
- Ketiga caption token di atas

---

### GoogleAuthButton

Dipakai di Login & Register (F-41).

✅ **Reuse style Secondary** — sama persis kayak tombol "Cancel" (ProfileForm): `bg-black/8` (light mode), hover `bg-black/12`, active `bg-black/16`.

```css
font-family: Montserrat;
border-radius: 12px (mobile) → 16px (md+);
padding: px-4 py-2 (mobile) → px-5 py-3 (md+);
width: 100%;
margin-bottom: 16px;
```

**Konten:** teks "Continue with Google" + logo resmi Google — **posisi logo di KANAN teks** (kebalikan konvensi umum).

🚨 Logo Google HARUS dipakai persis apa adanya (SVG resmi, 4 warna asli: `#4285F4`, `#34A853`, `#FBBC05`, `#EB4335`). **Tidak boleh dimodifikasi** warna/bentuknya.

---

### Toast

Style: **Glass Ripple** — frosted glass, ripple masuk, progress bar "tide-drain".

**Container:**
```css
padding: 16px 18px 20px;
border-radius: 14px;
overflow: hidden;
box-shadow: 0 10px 15px rgba(0,0,0,0.25);
background:
  radial-gradient(circle at 30% 20%, rgba(255,255,255,.35) 0%, transparent 45%),
  linear-gradient(135deg, [accent] 0%, [accentDark] 55%, [accentDarker] 100%);
background-size: 200% 200%, 160% 160%;
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,.35);
animation: toastIn, waterFlow 8s ease-in-out infinite alternate;
```

**Glossy sheen overlay** (reuse dari Button):
```css
position: absolute; inset: 0; pointer-events: none;
background: linear-gradient(120deg, rgba(255,255,255,0) 28%, rgba(255,255,255,.4) 50%, rgba(255,255,255,0) 72%);
```

**Ripple masuk (sekali, saat toast muncul):**
```css
position: absolute; left: 26px; top: 26px;
width: 10px; height: 10px; border-radius: 50%;
background: rgba(255,255,255,.6); opacity: .5;
animation: rippleOnce 900ms ease-out;
```

**Icon medallion:**
```css
width: 30px; height: 30px; border-radius: 50%;
background: [gradient accent sama kayak container];
animation: waterFlow 8s ease-in-out infinite alternate;
color: #FFFFFF; font: Inter Bold 14px;
```

**Teks:**
```css
/* Title */  font: Inter 600, 14px, color: #FFFFFF;
/* Message */ font: Inter 400, 13px, line-height: 17px, color: rgba(255,255,255,.8);
```

**"Tide-drain" progress bar:**
```css
@keyframes tideDrain { 0% { width: 100%; } 100% { width: 0%; } }
/* duration: 5000ms linear forwards — sinkron dengan auto-dismiss */
```

**Animasi masuk/keluar:**
```css
@keyframes toastIn  { 0% { opacity: 0; transform: translateX(36px) scale(.97); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes toastOut { 0% { opacity: 1; transform: translateX(0) scale(1); }       100% { opacity: 0; transform: translateX(24px) scale(.96); } }
```
Masuk: `380ms cubic-bezier(.2,.8,.2,1)`. Keluar: `300ms ease`. Auto-dismiss: **5 detik**.

**4 Status Variant:**
| Status | Accent | AccentDark | AccentDarker | Icon | Token |
|---|---|---|---|---|---|
| Success | `#0EA381` | `#146E5F` | `#185349` | ✓ | `success/600, 800, 1000` |
| Error | `#D12030` | `#8D0E2F` | `#5F0726` | ✕ | `error/600, 800, 1000` |
| Warning | `#FF5722` | `#B72111` | `#610509` | ! | `warning/500, 700, 1000` |
| Info | `#078EA4` | `#10616E` | `#154B54` | i | `secondary/600, 800, 1000` |

---

### Modal Create/Join Team

Dipakai di flow Kompetisi Berbasis Tim (F-18).

**Backdrop & Container:**
```css
/* Backdrop */
position: fixed; inset: 0;
background: rgba(15,30,32,.55);
backdrop-filter: blur(3px);

/* Container */
max-width: 440px;
background: neutral/100;
border-radius: 16px; /* = radius/lg */
box-shadow: 0 20px 25px rgba(0,0,0,.15); /* = shadow/xl */
padding: 32px;
animation: teamModalIn 260ms cubic-bezier(.2,.8,.2,1);
```
```css
@keyframes teamModalIn {
  0%   { opacity: 0; transform: translateY(18px) scale(.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Tombol close:** 32px, `border-radius: full`, background `neutral/200`, hover `neutral/300`.

**Header:**
```
Judul: "Create or Join a Team" — Montserrat 800, 24px, cyan/1000
Subjudul: nama kompetisi saja (misal "Business Case Competition") — Plus Jakarta Sans, 14px, neutral/700
```

**Tab switcher:**
```css
background: neutral/200; border-radius: full; padding: 4px; gap: 4px;
/* tab aktif: background putih + shadow tipis */
```

**Tab: Create Team**
- Label "Team Name": Plus Jakarta Sans Semibold, 14px, `cyan/1000`
- Input: pill (radius full), border `neutral/300`, focus border → `secondary/Default #078EA4`
- Tombol "Create Team" (primary)

**State sukses (Create):**
- Icon checkmark dalam lingkaran: `bg-success/100`, checkmark `success/800`
- "Team created!" — Coolvetica, 20px
- Box kode tim: border `tertiary/Default #96DFB8`, kode Montserrat 700, 22px, `letter-spacing: 2px`
- Tombol Copy: `bg-primary/Default #42C0A3`, hover `primary/700`
- Tombol "Continue to Registration"

```css
@keyframes teamPop {
  0%   { transform: scale(.6); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
```

**Tab: Join Team**
- Input Team Code: pill, Montserrat 600 uppercase + letter-spacing
- Di bawah Team Code: link teks "atau pilih dari tim yang membuka pendaftaran" (Inter, warna secondary)
- Klik link → konten modal berganti ke list tim Public — lihat detail di USER_FLOWS_v2.md §Cabang C

**State sukses (Join):** sama pola kayak Create — icon checkmark, "You're in!", teks konfirmasi, tombol Continue.

**Error state:** teks di bawah input, warna `error/600 #D12030`, Inter 13px.

**Loading state:** spinner 14px, border 2px, `animation: teamSpin 700ms linear infinite` + teks "Creating..."/"Joining..."

---

## CSS Variable Reference

Saran penamaan konsisten dengan struktur Figma:

```css
/* Color tokens */
--color-primary-100: #C6ECE3;
--color-primary-600: #42C0A3; /* "Default" di Figma → step 600 di kode */
--color-secondary-600: #078EA4;
--color-tertiary-600: #96DFB8;
--color-success-500: #4ABAA7;
--color-success-1000: #185349;
--color-error-500: #F42D2D;
--color-error-600: #D12030;
--color-warning-400: #FF8C59;
--color-neutral-100: #F8F8F9;
--color-neutral-500: #A6A5A5;
--color-neutral-900: #3E3E3E;
--color-neutral-1000: #393C3C;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 96px;

/* Border radius */
--radius-none: 0px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;

/* Shadow */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.10);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.10);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
--shadow-2xl: 0 35px 64px rgba(0,0,0,0.19);

/* Komponen placeholder — diisi sendiri */
--fannedcard-bg-focus: ;
--fannedcard-bg-side: ;
--tiltedcard-bg: ;
--tiltedcard-border: ;
--tiltedcard-caption-bg: ;
--tiltedcard-caption-text: ;
--tiltedcard-caption-border: ;
--calendar-border: ;
--calendar-bg: ;
--calendar-day-bg-hover: ;
--calendar-grid-border: ;
--calendar-accent: ;
```