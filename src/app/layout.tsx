import { rootMetadata } from "@/lib/siteMetadata";
import { Inter, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/store/QueryProvider";
import { SessionBootstrap } from "@/store/SessionBootstrap";
import { IconRegistry } from "@/components/ui/iconRegistry";
import { SectionScrollNavigation } from "@/components/ui/SectionScrollNavigation";
import { Suspense } from "react";
import "./globals.css";
import { ManualSimulation } from "@/components/ManualSimulation";
import { manualSimulationEnabled } from "@/lib/manualSimulation";
import { AdminAccessNotice } from "@/features/auth/AdminGate";

// Coolvetica (Headline/H1-H6) TIDAK ada di Google Fonts — harus di-self-host dari file
// .woff2/.ttf resmi (lisensi Typodermic Fonts, gratis termasuk komersial). File-nya belum
// tersedia di repo ini. Sementara fallback ke Montserrat Bold lewat --font-coolvetica-fallback
// di globals.css. Lihat CHANGELOG untuk follow-up item ini.
const montserrat = Montserrat({
  variable: "--font-coolvetica-fallback",
  subsets: ["latin"],
  weight: ["700"],
});

const montserratUi = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata = rootMetadata();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${montserratUi.variable} ${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var saved=localStorage.getItem('ioe-theme');var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){document.documentElement.dataset.theme='light'}})();` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <a href="#main-content" className="skip-link ui-action ui-action-secondary">Lewati ke konten utama</a>
          <IconRegistry />
          <Suspense fallback={null}><SectionScrollNavigation /></Suspense>
          <SessionBootstrap />
          <AdminAccessNotice />
          <ManualSimulation enabled={manualSimulationEnabled()}>{children}</ManualSimulation>
        </QueryProvider>
      </body>
    </html>
  );
}
