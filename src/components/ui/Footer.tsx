import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/offline";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";

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
// - Tujuan tautan sosial masih placeholder sampai URL resmi tersedia.
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
  ...(EVENTS_ENABLED ? [{ label: "Events", href: "/events" }] : []),
];

const SOCIAL_LINKS = [
  { label: "Instagram IOE 2027", href: "https://www.instagram.com/ioe2027", icon: "mdi:instagram" },
  { label: "LinkedIn IOE 2027", href: "https://www.linkedin.com/company/https-www.linkedin.com-ioe2027", icon: "mdi:linkedin" },
  { label: "TikTok IOE 2027", href: "https://www.tiktok.com/@ioe2027", icon: "tiktok" },
];

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
  const socialIcon = (icon: string) => icon === "tiktok" ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
      <path d="M16.7 2h-3.1v13.2a3.1 3.1 0 1 1-2.7-3.1V9a6.2 6.2 0 1 0 5.8 6.2V8.4a8 8 0 0 0 5.3 1.8V7.1A5.4 5.4 0 0 1 16.7 2Z" />
    </svg>
  ) : <Icon icon={icon} className="size-6" aria-hidden="true" />;

  return SOCIAL_LINKS.map((social) => social.href !== "#" && /^https?:\/\//.test(social.href) ? (
    <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="flex size-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-secondary-800">{socialIcon(social.icon)}</a>
  ) : (
    <span key={social.label} role="img" aria-label={social.label} className="flex flex-col items-center gap-1 font-micro text-b4 text-secondary-1000">{socialIcon(social.icon)}</span>
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
