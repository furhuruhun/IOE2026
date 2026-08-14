import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /competitions/[slug] — Competition Details. Public. ROUTES.md.
// Register CTA di sini pakai client-side state (modal Create/Join Team), BUKAN navigasi —
// lihat ROUTES.md §Pola Navigasi dan AUTH_IMPLEMENTATION.md §Force-auth di route Public.
export default async function CompetitionDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Competition: ${slug}`}
      fId="F-12–F-21"
      note="GuidebookCTA, TiltedCardSection, FAQSection, modal Create/Join Team — belum dibangun."
    />
  );
}
