import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

// F-01–F-04: Navbar & Footer di setiap halaman publik — KECUALI /login dan /register,
// yang sengaja dipindah ke route group (auth)/ terpisah (dikonfirmasi user, deviasi dari
// bacaan literal PRD "setiap halaman publik" karena tidak ada exclusion note eksplisit di
// dokumen manapun — lihat CHANGELOG). Route group ini tidak mengubah URL.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* pt kompensasi: Navbar sekarang `fixed` (bukan `sticky`), jadi keluar dari document
          flow — tanpa ini {children} akan ketutup navbar. Value samain sama tinggi Navbar
          (h-14 mobile / md:h-20 desktop), lihat CHANGELOG [Navbar — spec Compfest]. */}
      <div className="pt-14 md:pt-20">{children}</div>
      <Footer />
    </>
  );
}
