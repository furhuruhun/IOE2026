import { EventDetailPage } from "@/features/events/EventDetailPage";

// Route: /events/[slug] — Event Details. Public. ROUTES.md.
// Registration remains unavailable until its read-side availability contract is defined.
export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EventDetailPage slug={slug} />;
}
