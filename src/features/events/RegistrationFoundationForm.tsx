"use client";

import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineFieldError } from "@/components/ui/InlineFieldError";
import { getErrorEntry } from "@/constants/errorMessages";
import { validateDocument } from "@/utils/validateDocument";
import type { Profile } from "@/types/profile";
import type { EventDetail, EventRegistrationInput } from "@/types/event";
import { useRegisterEvent } from "@/hooks/useEvents";
import { ApiError } from "@/services/authService";

interface FoundationValues {
  sessionType: "seminar" | "workshop";
  speakerId: string;
  phone: string;
  institution: string;
  domicile: string;
  lineId: string;
  cvFile: File | null;
  paymentProof: File | null;
}

// A mounted form owns its defaults and edits. Query refreshes do not reset it,
// and no mutation, browser storage or Profile cache update is performed.
export function RegistrationFoundationForm({ profile, event, slug, onSuccess, onError }: {
  profile: Profile;
  event: EventDetail;
  slug: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const registration = useRegisterEvent(slug);
  const { register, control, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm<FoundationValues>({
    defaultValues: {
      sessionType: "seminar", speakerId: "",
      phone: profile.phone ?? "", institution: profile.institution ?? "",
      domicile: profile.domicile ?? "", lineId: "", cvFile: null, paymentProof: null,
    },
  });
  const cvFile = useWatch({ control, name: "cvFile" });
  const paymentProof = useWatch({ control, name: "paymentProof" });
  const sessionType = useWatch({ control, name: "sessionType" });

  const onSubmit = async (values: FoundationValues) => {
    try {
      await registration.mutateAsync(values satisfies EventRegistrationInput);
      onSuccess();
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Pendaftaran event gagal");
    }
  };

  const setFile = (field: "cvFile" | "paymentProof", formats: string[], file: File | undefined) => {
    if (!file) return;
    const code = validateDocument(file, formats);
    if (code) { setError(field, { message: getErrorEntry(code).message }); return; }
    clearErrors(field);
    setValue(field, file, { shouldDirty: true });
  };

  return (
    <form aria-label="Registration details" noValidate onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-lg rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl">
      <p className="font-body text-b3 text-neutral-800">Data dari My Profile dapat kamu ubah untuk pendaftaran ini. Perubahan di sini tidak mengubah profilmu.</p>
      <div className="grid min-w-0 gap-lg md:grid-cols-2">
        <label className="flex flex-col gap-xs font-body text-b3 font-bold text-secondary-1000">
          Session
          <select className="rounded-xl border border-neutral-500 bg-transparent p-sm font-body text-b3 font-normal" {...register("sessionType")}>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
          </select>
        </label>
        {sessionType === "workshop" && (event.speakers?.length ?? 0) > 0 && <label className="flex flex-col gap-xs font-body text-b3 font-bold text-secondary-1000">
          Speaker / session
          <select className="rounded-xl border border-neutral-500 bg-transparent p-sm font-body text-b3 font-normal" {...register("speakerId", { required: (event.speakers?.length ?? 0) > 1 ? "Pilih speaker" : false })}>
            <option value="">Pilih speaker</option>
            {event.speakers?.map(speaker => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}
          </select>
          {errors.speakerId && <InlineFieldError id={`${id}-speaker-error`} message={errors.speakerId.message ?? "Pilih speaker"} />}
        </label>}
      </div>
      <div className="grid min-w-0 gap-lg md:grid-cols-2">
        <Input id={`${id}-phone`} label="Phone Number (WhatsApp) *" type="tel" autoComplete="tel" variant="event" icon="mdi:phone" required {...register("phone", { required: "Nomor WhatsApp wajib diisi" })} />
        <Input id={`${id}-institution`} label="Institution / University *" autoComplete="organization" variant="event" icon="mdi:school" required {...register("institution", { required: "Institusi wajib diisi" })} />
        <Input id={`${id}-domicile`} label="Domicile *" autoComplete="address-level2" variant="event" icon="mdi:map-marker" required {...register("domicile", { required: "Domisili wajib diisi" })} />
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
            setFile("cvFile", ["pdf"], file);
          }} />
        {errors.cvFile && <InlineFieldError id={`${id}-cv-error`} message={errors.cvFile.message ?? ""} />}
        {cvFile && <div className="flex min-w-0 flex-wrap items-center gap-sm">
          <p role="status" className="min-w-0 flex-1 basis-32 font-body text-b3 text-secondary-1000 [overflow-wrap:anywhere]">File dipilih: {cvFile.name}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => { setValue("cvFile", null, { shouldDirty: true }); clearErrors("cvFile"); }}>Hapus CV</Button>
        </div>}
      </div>

      <div className="flex min-w-0 flex-col gap-sm">
        <label htmlFor={`${id}-payment`} className="font-body text-b3 font-bold text-secondary-1000">Payment proof (if required)</label>
        <input id={`${id}-payment`} name="paymentProof" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="block w-full min-w-0 rounded-xl border border-neutral-500 p-sm font-body text-b3 text-secondary-1000"
          onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; setFile("paymentProof", ["jpg", "png"], file); }} />
        {errors.paymentProof && <InlineFieldError id={`${id}-payment-error`} message={errors.paymentProof.message ?? "File tidak valid"} />}
        {paymentProof && <p role="status" className="font-body text-b3 text-secondary-1000">File dipilih: {paymentProof.name}</p>}
      </div>
      <Button type="submit" disabled={registration.isPending} className="self-start">{registration.isPending ? "Mengirim..." : "Submit Registration"}</Button>
    </form>
  );
}
