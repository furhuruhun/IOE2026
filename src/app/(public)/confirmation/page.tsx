import { notFound, redirect } from "next/navigation";
import { RegistrationConfirmation } from "@/features/events/RegistrationConfirmation";
import { privateMetadata } from "@/lib/siteMetadata";
import { EVENTS_ENABLED } from "@/lib/eventAvailability";

export const metadata = privateMetadata("Status Pendaftaran");

// Retain the documented navigation marker; it is not proof of registration.
// The client shows success only with a validated, participant-scoped receipt.
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (!EVENTS_ENABLED) notFound();
  const { from } = await searchParams;

  if (from !== "registration") {
    redirect("/");
  }

  return <RegistrationConfirmation />;
}
