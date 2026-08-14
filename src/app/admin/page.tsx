import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /admin/* — Protected, role Panitia (middleware.ts cek cookie saja; role
// di-enforce di komponen via useIsAdmin() begitu fitur ini dibangun).
// ⚠️ Struktur sub-route & fitur detail masih TBD — lihat PRD_IOE_2027_v4.md §5.k (F-58)
// dan ROUTES.md §Belum Diputuskan. JANGAN bikin sub-route baru di sini tanpa requirement
// gathering terpisah (CLAUDE.md aturan #1).
export default function AdminPlaceholderPage() {
  return (
    <PlaceholderPage
      title="Admin Panel"
      fId="F-57–F-58 (TBD)"
      note="Struktur & fitur belum ditentukan — menunggu sesi requirement gathering terpisah."
    />
  );
}
