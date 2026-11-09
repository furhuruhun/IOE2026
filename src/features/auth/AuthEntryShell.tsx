import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";

export function AuthEntryShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pt-14 md:pt-20">
      <Navbar showMobileMenu={false} showDesktopMenu={false} />
      {children}
      <Footer />
    </div>
  );
}
