import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /dashboard — Protected (middleware.ts). ROUTES.md.
// Detail aktivitas ("See Details") pakai client-state di halaman ini juga (Zustand
// useDashboardDetailStore), bukan route terpisah — lihat TECHNICAL_CONSTRAINTS_FE.md.
export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      fId="F-44–F-52"
      note="Sidebar, MyJourney, AssignmentList, CalendarWidget — belum dibangun."
    />
  );
}
