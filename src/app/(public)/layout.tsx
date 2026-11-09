import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

// F-01–F-04: Navbar & Footer di halaman publik. Login dan register memasangnya
// melalui AuthEntryShell karena kedua halaman berada di route group (auth)/.
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
