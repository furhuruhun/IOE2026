import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /events/[slug] — Event Details. Public. ROUTES.md.
// Register CTA di sini navigasi sungguhan ke /events/[slug]/register — beda pattern dari kompetisi.
export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Event: ${slug}`}
      fId="F-27–F-34"
      note="FannedCardSection, SpeakerCard, RundownOverlay — belum dibangun."
    />
  );
}
