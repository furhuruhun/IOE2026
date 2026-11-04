import { redirect } from "next/navigation";
import { RegistrationConfirmation } from "@/features/events/RegistrationConfirmation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Status Pendaftaran | IOE 2027" };

// Retain the documented navigation marker; it is not proof of registration.
// The client shows success only with a validated, participant-scoped receipt.
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  if (from !== "registration") {
    redirect("/");
  }

  return <RegistrationConfirmation />;
}
