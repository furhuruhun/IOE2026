import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /events/[slug]/register — Protected (force auth via middleware.ts). ROUTES.md.
// Auto-fill institution/phone/domicile dari GET /profile — lihat API_CONTRACT.md POST /events/:id/register.
export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Register: ${slug}`}
      fId="F-31, F-34a, §7"
      note="RegistrationForm, SessionRadioGroup, PaymentProofUpload — belum dibangun."
    />
  );
}
