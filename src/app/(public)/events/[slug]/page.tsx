import { EventDetailPage } from "@/features/events/EventDetailPage";
import { TalkshowPage } from "@/features/events/TalkshowPage";
import { ShortCoursePage } from "@/features/events/ShortCoursePage";
import { publicMetadata } from "@/lib/siteMetadata";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return publicMetadata(`/events/${(await params).slug}`);
}

// Talkshow and Short Course have dedicated layouts. Other event slugs use the
// shared detail page and its existing data, loading, and not-found behavior.
export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "talkshow") return <TalkshowPage />;
  if (slug === "short-course") return <ShortCoursePage />;

  return <EventDetailPage slug={slug} />;
}
