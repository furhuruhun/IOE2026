import { RegistrationFoundationPage } from "@/features/events/RegistrationFoundationPage";
import { notFound } from "next/navigation";
import { isHiddenEvent } from "@/lib/eventVisibility";

// Protected by src/middleware.ts; registration submits through the event proxy.
// Auto-fill institution/phone/domicile dari GET /profile — lihat API_CONTRACT.md POST /events/:id/register.
export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isHiddenEvent(slug)) notFound();

  return <RegistrationFoundationPage slug={slug} />;
}
