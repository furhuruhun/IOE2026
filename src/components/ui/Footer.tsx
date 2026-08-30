import Link from "next/link";
import { Icon } from "@iconify/react/offline";

// Spec: design_system_final.md §Footer. F-04 (PRD_IOE_2027_v4.md).
//
// Struktur ulang [2026-08-30]: dual responsive layout (lg:hidden — stack rata tengah /
// hidden lg:flex — 3 kolom) atas permintaan literal user, menggantikan layout single-column
// sebelumnya. Lihat CHANGELOG untuk detail keputusan & penyimpangan dari dokumen rujukan:
// - Spacing container (p-4/gap-5 mobile, px-[80px]/py-[35px]/gap-[30px] desktop) HARDCODED
//   sesuai instruksi literal user, TIDAK snap ke --spacing-* scale (design_system_final.md
//   tidak spesifik soal spacing Footer, jadi "wajib tanya dulu" CLAUDE.md §6 — user sudah
//   menegaskan nilai ini 2x, dianggap sebagai keputusan sadar, bukan asumsi).
// - Brand/logo lockup (icon mdi:waves + "IOE 2027") BUKAN bagian spec §Footer (dokumen itu
//   cuma nyebut Background/Link/Copyright/Divider/Text color/Icon Instagram) — direplikasi
//   PERSIS dari lockup Navbar.tsx supaya brand konsisten satu sumber, bukan nilai baru.
// - Warna, font, text color, divider, & icon tetap ikut §Footer + token semantic project
//   (primary-600→400→100 gradient, font-micro/font-body, text-neutral-1000).
//
// Catatan cakupan lama (masih berlaku):
// - Link "Privacy & Policy" SENGAJA tidak dibuat — tidak ada route di ROUTES.md maupun
//   requirement di F-04.
// - 4 social icon PLACEHOLDER eksplisit (klien belum kirim data final).
//
// [2026-08-31] Kontak panitia (email + WhatsApp) DIHAPUS atas instruksi literal user.
// F-04 (PRD_IOE_2027_v4.md) minta "kontak panitia, tautan media sosial, dan copyright" —
// penghapusan ini bikin implementasi TIDAK SINKRON dengan F-04. Lihat CHANGELOG untuk
// detail; F-04 atau desain final sebaiknya diupdate manual oleh manusia kalau kontak
// panitia memang dimaksudkan hilang permanen dari Footer (bukan cuma dipindah ke halaman
// lain).
//
// Font size CTA (nav links) & copyright juga di-hardcode (18px mobile / 16px desktop untuk
// link, 10px mobile / 16px desktop untuk copyright) sesuai instruksi literal user — 18px &
// 10px TIDAK ADA di Type Scale `design_system_final.md` (b1 20px/b2 16px/b3 14px/b4 12px),
// dipakai apa adanya (arbitrary value) bukan snap ke token terdekat.

const FOOTER_LINKS = [
  { label: "Competitions", href: "/competitions" },
  { label: "Events", href: "/events" },
];

// "Icon Instagram (×4)" — literal dari spec, kemungkinan placeholder Figma untuk 4 slot
// sosial media yang platform aslinya belum ditentukan. Semua 4 pakai mdi:instagram sesuai
// spec, href placeholder (bukan link sungguhan).
const SOCIAL_LINKS = Array.from({ length: 4 }, (_, i) => ({
  label: `Social media IOE 2027 (${i + 1}) — placeholder`,
  href: "#",
  icon: "mdi:instagram",
}));

function FooterBrand({ iconSize, textSize }: { iconSize: string; textSize: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3.5">
      <span className={`flex ${iconSize} items-center justify-center rounded-md bg-secondary-1000 text-neutral-100`}>
        <Icon icon="mdi:waves" className="size-1/2" />
      </span>
      <span className={`font-heading ${textSize} text-secondary-1000`}>IOE 2027</span>
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto text-neutral-1000"
      style={{ background: "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))" }}
    >
      {/* Mobile / tablet — rata tengah, satu kolom (lg:hidden) */}
      <div className="flex flex-col items-center justify-center gap-5 p-4 lg:hidden">
        <FooterBrand iconSize="size-8" textSize="text-lg" />

        <nav className="flex flex-col items-center justify-start gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-micro text-[18px] tracking-wider text-neutral-1000 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="inline-flex items-center justify-center gap-14">
          {SOCIAL_LINKS.map((social, i) => (
            <a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="transition-opacity hover:opacity-80"
            >
              <Icon icon={social.icon} className="size-6 md:size-9" />
            </a>
          ))}
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-3.5">
          <div className="h-px w-full bg-neutral-1000/15" />
          <p className="font-body text-[10px] tracking-wide text-neutral-1000">
            © {year} Indonesia Ocean Expo — KMKL ITB.
          </p>
        </div>
      </div>

      {/* Desktop — 3 kolom (hidden lg:flex) */}
      <div className="hidden flex-col items-center justify-start gap-[30px] px-[80px] py-[35px] lg:flex">
        <div className="flex w-full items-start justify-between">
          <FooterBrand iconSize="size-9" textSize="text-xl xl:text-2xl" />

          <nav className="mt-3 inline-flex flex-col items-start justify-start gap-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-micro text-b2 tracking-wider text-neutral-1000 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-80 flex-col items-start justify-start gap-10">
            <p className="font-body text-b1 font-semibold tracking-normal text-neutral-1000">
              For more information, check out our other social media!
            </p>
            <div className="inline-flex items-center justify-start gap-14">
              {SOCIAL_LINKS.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="transition-opacity hover:opacity-80"
                >
                  <Icon icon={social.icon} className="size-8 xl:size-10" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start justify-center gap-7">
          <div className="h-px w-full bg-neutral-1000/15" />
          <p className="font-body text-b2 tracking-normal text-neutral-1000">
            © {year} Indonesia Ocean Expo — KMKL ITB.
          </p>
        </div>
      </div>
    </footer>
  );
}
