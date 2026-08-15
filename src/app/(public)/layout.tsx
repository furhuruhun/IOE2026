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
      {children}
      <Footer />
    </>
  );
}
