"use client";

import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineFieldError } from "@/components/ui/InlineFieldError";
import { getErrorEntry } from "@/constants/errorMessages";
import { validateDocument } from "@/utils/validateDocument";
import type { Profile } from "@/types/profile";

interface FoundationValues {
  phone: string;
  institution: string;
  domicile: string;
  lineId: string;
  cvFile: File | null;
}

// A mounted form owns its defaults and edits. Query refreshes do not reset it,
// and no mutation, browser storage or Profile cache update is performed.
export function RegistrationFoundationForm({ profile }: { profile: Profile }) {
  const id = useId();
  const { register, control, setValue, setError, clearErrors, formState: { errors } } = useForm<FoundationValues>({
    defaultValues: {
      phone: profile.phone ?? "", institution: profile.institution ?? "",
      domicile: profile.domicile ?? "", lineId: "", cvFile: null,
    },
  });
  const cvFile = useWatch({ control, name: "cvFile" });

  return (
    <form aria-label="Registration details" noValidate onSubmit={event => event.preventDefault()} className="flex min-w-0 flex-col gap-lg rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl">
      <p id={`${id}-submission`} role="note" className="rounded-xl border border-secondary-200 bg-secondary-100/40 p-md font-body text-b3 text-neutral-800">Pengiriman pendaftaran belum tersedia. Data pada form ini belum dikirim atau disimpan.</p>
      <p className="font-body text-b3 text-neutral-800">Data dari My Profile dapat kamu ubah untuk pendaftaran ini. Perubahan di sini tidak mengubah profilmu.</p>
      <div className="grid min-w-0 gap-lg md:grid-cols-2">
        <Input id={`${id}-phone`} label="Phone Number (WhatsApp) *" type="tel" autoComplete="tel" variant="event" icon="mdi:phone" required {...register("phone")} />
        <Input id={`${id}-institution`} label="Institution / University *" autoComplete="organization" variant="event" icon="mdi:school" required {...register("institution")} />
        <Input id={`${id}-domicile`} label="Domicile *" autoComplete="address-level2" variant="event" icon="mdi:map-marker" required {...register("domicile")} />
        <Input id={`${id}-line`} label="LINE ID (Optional)" variant="event" icon="mdi:chat" {...register("lineId")} />
      </div>

      <div className="flex min-w-0 flex-col gap-sm">
        <label htmlFor={`${id}-cv`} className="font-body text-b3 font-bold text-secondary-1000">CV (Optional)</label>
        <p id={`${id}-cv-help`} className="font-body text-b3 text-neutral-800">PDF only, maks 500 KB. File hanya dipilih di perangkat ini dan belum diunggah.</p>
        <input id={`${id}-cv`} name="cvFile" type="file" accept=".pdf,application/pdf" aria-invalid={Boolean(errors.cvFile)}
          aria-describedby={`${id}-cv-help${errors.cvFile ? ` ${id}-cv-error` : ""}`}
          className="block w-full min-w-0 rounded-xl border border-neutral-500 p-sm font-body text-b3 text-secondary-1000 file:mr-sm file:rounded-lg file:border-0 file:bg-secondary-100 file:px-md file:py-sm file:text-secondary-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800"
          onChange={event => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const code = validateDocument(file, ["pdf"]);
            if (code) { setError("cvFile", { message: getErrorEntry(code).message }); return; }
            clearErrors("cvFile");
            setValue("cvFile", file, { shouldDirty: true });
          }} />
        {errors.cvFile && <InlineFieldError id={`${id}-cv-error`} message={errors.cvFile.message ?? ""} />}
        {cvFile && <div className="flex min-w-0 flex-wrap items-center gap-sm">
          <p role="status" className="min-w-0 flex-1 basis-32 font-body text-b3 text-secondary-1000 [overflow-wrap:anywhere]">File dipilih: {cvFile.name}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => { setValue("cvFile", null, { shouldDirty: true }); clearErrors("cvFile"); }}>Hapus CV</Button>
        </div>}
      </div>

      <Button type="submit" disabled aria-describedby={`${id}-submission`} className="self-start">Submit Registration</Button>
    </form>
  );
}
