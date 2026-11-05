import { AdminGate } from "@/features/auth/AdminGate";
import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = privateMetadata("Admin");

// Route: /admin/* — Protected, role Panitia (middleware.ts cek cookie saja; role
// di-enforce di komponen via useIsAdmin()). Backend authorization remains separate.
// ⚠️ Struktur sub-route & fitur detail masih TBD — lihat PRD_IOE_2027_v4.md §5.k (F-58)
// dan ROUTES.md §Belum Diputuskan. JANGAN bikin sub-route baru di sini tanpa requirement
// gathering terpisah (CLAUDE.md aturan #1).
export default function AdminPlaceholderPage() {
  return <AdminGate />;
}
