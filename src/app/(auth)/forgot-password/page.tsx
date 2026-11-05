import { eventOverviewContactActions } from "@/features/events/eventOverviewContent";
import { privateMetadata } from "@/lib/siteMetadata";
export const metadata = privateMetadata("Lupa password");
export default function ForgotPasswordPage() {
  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[32rem] px-6 py-16">
    <Link href="/login" className="ui-action ui-action-secondary ui-action-sm"><span aria-hidden="true">←</span> Kembali ke login</Link>
    <h1 className="my-6 font-heading text-h3 text-secondary-1000">Pemulihan akun</h1>
    <section aria-labelledby="recovery-contact-title" className="flex min-w-0 flex-col gap-4 rounded-xl border border-neutral-300 bg-neutral-100 p-6 text-secondary-1000">
      <h2 id="recovery-contact-title" className="font-heading text-h4">Lupa password?</h2>
      <p className="text-b3 text-neutral-800">Hubungi panitia melalui LINE untuk meminta bantuan reset password akun peserta. Sertakan nama dan email yang terdaftar.</p>
      <h3 className="font-ui text-b2 font-semibold">Contact Person</h3>
      <div className="flex flex-col items-start gap-3">
        {eventOverviewContactActions.map(contact => <a key={contact.id} href={contact.href} target="_blank" rel="noopener noreferrer" className="ui-action ui-action-secondary ui-action-sm" aria-label={`Hubungi ${contact.name} melalui LINE (buka di tab baru)`}>LINE: {contact.label}</a>)}
      </div>
      <p className="text-b3 text-neutral-800">Jangan kirim password kepada siapa pun, termasuk panitia.</p>
    </section>
  </main>;
}
import Link from "next/link";
