import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";

// Spec: design_system_final.md §Footer. F-04 (PRD_IOE_2027_v4.md).
//
// Struktur ulang [2026-08-30]: dual responsive layout (lg:hidden — stack rata tengah /
// hidden lg:flex — 3 kolom) atas permintaan literal user, menggantikan layout single-column
// sebelumnya. Lihat CHANGELOG untuk detail keputusan & penyimpangan dari dokumen rujukan:
// - Batas container dan logo mengikuti Navbar.tsx.
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

function FooterBrand() {
  return (
    <Link href="/" className="shrink-0" aria-label="IOE 2027 — beranda">
      <Image
        src="/images/parent/logo-navibar.webp"
        alt="IOE 2027"
        width={1920}
        height={1080}
        className="h-14 w-36 object-cover md:h-20 md:w-48"
      />
    </Link>
  );
}

function SocialDestinations() {
  return SOCIAL_LINKS.map((social, i) => social.href !== "#" && /^https?:\/\//.test(social.href) ? (
    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="flex size-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-secondary-800"><Icon icon={social.icon} className="size-6" /></a>
  ) : (
    <span key={i} aria-label={social.label} className="flex flex-col items-center gap-1 font-micro text-b4 text-secondary-1000"><Icon icon={social.icon} className="size-6" aria-hidden="true" /></span>
  ));
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto text-neutral-1000"
      style={{ background: "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))" }}
    >
      {/* Mobile / tablet — rata tengah, satu kolom (lg:hidden) */}
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-center gap-5 px-6 py-8 md:px-20 lg:hidden">
        <FooterBrand />

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

        <div className="inline-flex items-center justify-center gap-4">
          <SocialDestinations />
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-3.5">
          <div className="h-px w-full bg-neutral-1000/15" />
          <p className="font-body text-b4 tracking-wide text-neutral-1000">
            © {year} Indonesia Ocean Expo — KMKL ITB.
          </p>
        </div>
      </div>

      {/* Desktop — 3 kolom (hidden lg:flex) */}
      <div className="mx-auto hidden w-full max-w-[1920px] flex-col items-center justify-start gap-8 px-6 py-8 md:px-20 lg:flex">
        <div className="flex w-full items-start justify-between">
          <FooterBrand />

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
            <div className="inline-flex items-center justify-start gap-4">
              <SocialDestinations />
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
