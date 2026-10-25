import { RegistrationFoundationPage } from "@/features/events/RegistrationFoundationPage";

// Protected by src/proxy.ts. This foundation has no registration mutation.
// Auto-fill institution/phone/domicile dari GET /profile — lihat API_CONTRACT.md POST /events/:id/register.
export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <RegistrationFoundationPage slug={slug} />;
}
