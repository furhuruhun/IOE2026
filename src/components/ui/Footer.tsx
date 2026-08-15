import Link from "next/link";
import { Icon } from "@iconify/react/offline";

// Spec: design_system_final.md §Footer. F-04 (PRD_IOE_2027_v4.md).
//
// Catatan cakupan (lihat CHANGELOG untuk detail):
// - Link "Privacy & Policy" yang disebut di spec visual SENGAJA tidak dibuat — tidak ada
//   route untuk itu di ROUTES.md maupun requirement di F-04, bikan link ke halaman yang
//   belum ada = broken link di setiap halaman publik.
// - Kontak panitia & 4 social icon di bawah PLACEHOLDER eksplisit (klien belum kirim data
//   final) — domain email pakai .example (reserved IANA utk placeholder, dijamin bukan
//   domain asli) supaya tidak keliru dikira kontak sungguhan.

const FOOTER_LINKS = [
  { label: "Competitions", href: "/competitions" },
  { label: "Events", href: "/events" },
];

// "Icon Instagram (×4)" — literal dari spec, kemungkinan placeholder Figma untuk 4 slot
// sosial media yang platform aslinya belum ditentukan. Semua 4 pakai mdi:instagram sesuai
// spec, href placeholder (bukan link sungguhan).
const SOCIAL_SLOTS = 4;

export function Footer() {
  return (
    <footer
      className="mt-auto text-neutral-1000"
      style={{ background: "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400), var(--color-primary-100))" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-lg px-6 py-2xl md:px-12">
        <div className="flex flex-col gap-lg md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-heading text-h6 text-secondary-1000">IOE 2027</span>
            <p className="font-body text-b3">
              Kontak panitia:{" "}
              <a href="mailto:kontak@ioe2027.example" className="underline underline-offset-2">
                kontak@ioe2027.example
              </a>{" "}
              (placeholder)
            </p>
            <p className="font-body text-b3">WhatsApp: +62 XXX-XXXX-XXXX (placeholder)</p>
          </div>

          <nav className="flex gap-lg">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-micro text-b3 hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-sm">
            {Array.from({ length: SOCIAL_SLOTS }, (_, i) => (
              <a
                key={i}
                href="#"
                aria-label={`Social media IOE 2027 (${i + 1}) — placeholder`}
                className="flex size-9 items-center justify-center rounded-full bg-neutral-100/60 transition-colors hover:bg-neutral-100"
              >
                <Icon icon="mdi:instagram" className="size-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-1000/15 pt-md">
          <p className="font-body text-b3">© {new Date().getFullYear()} Indonesia Ocean Expo — KMKL ITB.</p>
        </div>
      </div>
    </footer>
  );
}
