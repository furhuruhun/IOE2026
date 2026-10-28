import type { Metadata } from "next";
import { Inter, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/store/QueryProvider";
import { SessionBootstrap } from "@/store/SessionBootstrap";
import { IconRegistry } from "@/components/ui/iconRegistry";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "IOE 2027 — Indonesia Ocean Expo",
  description:
    "Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation — KMKL ITB",
};

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
          <SessionBootstrap />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
