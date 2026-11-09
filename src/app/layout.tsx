import { rootMetadata } from "@/lib/siteMetadata";
import { QueryProvider } from "@/store/QueryProvider";
import { SessionBootstrap } from "@/store/SessionBootstrap";
import { IconRegistry } from "@/components/ui/iconRegistry";
import { SectionScrollNavigation } from "@/components/ui/SectionScrollNavigation";
import { Suspense } from "react";
import "./globals.css";
import { ManualSimulation } from "@/components/ManualSimulation";
import { manualSimulationEnabled } from "@/lib/manualSimulation";
import { RoleJourney } from "@/features/auth/RoleJourney";
import { AdminAccessNotice } from "@/features/auth/AdminGate";

export const metadata = rootMetadata();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="light"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <a href="#main-content" className="skip-link ui-action ui-action-secondary">Lewati ke konten utama</a>
          <IconRegistry />
          <Suspense fallback={null}><SectionScrollNavigation /></Suspense>
          <SessionBootstrap />
          <AdminAccessNotice />
          <ManualSimulation enabled={manualSimulationEnabled()}><RoleJourney>{children}</RoleJourney></ManualSimulation>
        </QueryProvider>
      </body>
    </html>
  );
}
