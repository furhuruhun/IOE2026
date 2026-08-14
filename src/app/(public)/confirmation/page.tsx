import { redirect } from "next/navigation";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

// Route: /confirmation. Public, TAPI hanya boleh diakses hasil submit Event Registration.
// Guard: TECHNICAL_CONSTRAINTS_FE.md §Guard Halaman /confirmation — server-side check di sini,
// bukan middleware, karena route ini tetap Public untuk kasus valid (?from=registration).
export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  if (from !== "registration") {
    redirect("/");
  }

  return (
    <PlaceholderPage
      title="Pendaftaran Berhasil"
      fId="F-53–F-54"
      note="SuccessMessage — belum dibangun. Guard ?from=registration sudah aktif."
    />
  );
}
