"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { InlineFieldError } from "@/components/ui/InlineFieldError";
import { getErrorEntry, REGISTRATION_RECOVERY } from "@/constants/errorMessages";
import { validateDocument } from "@/utils/validateDocument";
import type { Profile } from "@/types/profile";
import type { EventDetail, EventRegistrationInput } from "@/types/event";
import { useRegisterEvent } from "@/hooks/useEvents";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ApiError } from "@/services/apiResponse";
import { fetchEvent, RegistrationOutcomeUnknownError } from "@/services/eventService";
import { getRegistrationEligibility } from "./registrationState";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { FormBanner } from "@/components/ui/FormBanner";
import type { EventRegistrationResult } from "@/types/event";
import { useManualSimulation } from "@/components/ManualSimulation";

interface FoundationValues {
  sessionType: "seminar" | "workshop";
  speakerId: string;
  phone: string;
  institution: string;
  domicile: string;
  lineId: string;
  cvFile: File | null;
  paymentProof: File | null;
  consentPdp: boolean;
}

// A mounted form owns its defaults and edits. Query refreshes do not reset it,
// and event submission never writes these edits back to the Profile cache.
export function RegistrationFoundationForm({ profile, event, slug, isDemo, blocked, onSuccess, onError }: {
  profile: Profile;
  event: EventDetail;
  slug: string;
  isDemo: boolean;
  blocked: boolean;
  onSuccess: (result: EventRegistrationResult) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const simulation = useManualSimulation();
  const handleError = useErrorHandler();
  const registration = useRegisterEvent(slug);
  const now = useCurrentTime();
  const lock = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const focusTarget = useRef<keyof FoundationValues | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const eligibility = getRegistrationEligibility(slug, event, isDemo, now, simulation);
  const unavailable = blocked || !eligibility.available || Boolean(rejection) || uncertain;
  const { register, control, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm<FoundationValues>({
    defaultValues: {
      sessionType: "seminar", speakerId: "",
      phone: profile.phone ?? "", institution: profile.institution ?? "",
      domicile: profile.domicile ?? "", lineId: "", cvFile: null, paymentProof: null, consentPdp: false,
    },
  });
  const cvFile = useWatch({ control, name: "cvFile" });
  const paymentProof = useWatch({ control, name: "paymentProof" });
  const sessionType = useWatch({ control, name: "sessionType" });
  useEffect(() => {
    if (!busy && focusTarget.current) {
      form.current?.querySelector<HTMLInputElement>(`[name="${focusTarget.current}"]`)?.focus();
      focusTarget.current = null;
    }
  }, [busy]);

  const checkStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const latest = await fetchEvent(slug);
      setFeedback(!latest.isDemo && latest.event.isRegisteredByUser
        ? REGISTRATION_RECOVERY.registered
        : REGISTRATION_RECOVERY.stillUnknown);
    } catch (error) {
      handleError(error as Error, { redirectTo: `/login?redirect=${encodeURIComponent(`/events/${slug}/register`)}`, onToast: onError, onInlineBanner: onError, onInlineField: onError });
    } finally { setChecking(false); }
  };

  const onSubmit = async (values: FoundationValues) => {
    // Synchronous lock also covers the eligibility read before the mutation starts.
    if (lock.current || unavailable) return;
    const current = getRegistrationEligibility(slug, event, isDemo, Date.now(), simulation);
    if (!current.available) { setRejection(current.note); return; }
    lock.current = true;
    setBusy(true);
    setFeedback(null);
    let result: EventRegistrationResult | undefined;
    try {
      const latest = await fetchEvent(slug);
      const state = getRegistrationEligibility(slug, latest.event, latest.isDemo, Date.now(), simulation);
      if (!state.available) { setRejection(state.note); return; }
      if (values.sessionType === "workshop") {
        const speakers = latest.event.speakers ?? [];
        if ((speakers.length > 1 && !values.speakerId) || (values.speakerId && !speakers.some(speaker => speaker.id === values.speakerId))) {
          setError("speakerId", { message: "Pilih speaker / sesi yang tersedia" });
          focusTarget.current = "speakerId";
          return;
        }
      }
      // Consent is client-only. A hidden workshop selection must not leak into seminar requests.
      const { consentPdp: consent, ...input } = values;
      if (!consent) { setError("consentPdp", { message: "Persetujuan penggunaan data wajib dicentang" }); return; }
      result = await registration.mutateAsync({ ...input, speakerId: input.sessionType === "workshop" ? input.speakerId : undefined } satisfies EventRegistrationInput);
    } catch (error) {
      if (error instanceof RegistrationOutcomeUnknownError) {
        setUncertain(true);
        setFeedback(error.message);
      }
      if (error instanceof ApiError && ["REGISTRATION_CLOSED", "QUOTA_FULL", "ALREADY_REGISTERED"].includes(error.code)) {
        setRejection(getErrorEntry(error.code).message);
      }
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.fields) {
        const fields: (keyof FoundationValues)[] = ["phone", "institution", "domicile", "lineId", "sessionType", "speakerId", "cvFile", "paymentProof"];
        let first: keyof FoundationValues | undefined;
        for (const field of fields) {
          if (Object.hasOwn(error.fields, field)) {
            setError(field, { type: "server", message: error.fields[field] });
            first ??= field;
          }
        }
        if (first) focusTarget.current = first;
      }
      handleError(error as Error, {
        redirectTo: `/login?redirect=${encodeURIComponent(`/events/${slug}/register`)}`,
        onToast: onError, onInlineField: setFeedback, onInlineBanner: setFeedback,
      });
    } finally {
      // Confirmed success remains locked even if navigation takes time.
      if (!result) { lock.current = false; setBusy(false); }
    }
    if (result) onSuccess(result);
  };

  const setFile = (field: "cvFile" | "paymentProof", formats: string[], file: File | undefined) => {
    if (!file) return;
    const code = validateDocument(file, formats);
    if (code) { setError(field, { message: getErrorEntry(code).message }); return; }
    clearErrors(field);
    setValue(field, file, { shouldDirty: true });
  };

  return (
    <form ref={form} aria-label="Registration details" aria-busy={busy} noValidate onSubmit={event => { void handleSubmit(onSubmit)(event); }} className="flex min-w-0 flex-col gap-lg rounded-3xl border border-secondary-200 bg-neutral-100 p-lg md:p-xl">
      {(unavailable || feedback) && <FormBanner variant={uncertain ? "warning" : feedback || rejection ? "error" : "info"} message={feedback ?? rejection ?? (blocked ? REGISTRATION_RECOVERY.readFailed : eligibility.note)} />}
      {uncertain && <Button type="button" variant="secondary" disabled={checking} onClick={checkStatus}>{checking ? "Memeriksa..." : "Periksa status pendaftaran"}</Button>}
      <p className="font-body text-b3 text-neutral-800">Data dari My Profile dapat kamu ubah untuk pendaftaran ini. Perubahan di sini tidak mengubah profilmu.</p>
      <fieldset disabled={busy || unavailable} className="flex min-w-0 flex-col gap-lg">
      <legend className="sr-only">Data pendaftaran event</legend>
      <div className="grid min-w-0 gap-lg md:grid-cols-2">
        <fieldset aria-invalid={Boolean(errors.sessionType)} className="flex flex-col gap-xs font-body text-b3 text-secondary-1000">
          <legend className="font-bold">Which session do you want to attend?</legend>
          {(["seminar", "workshop"] as const).map(value => <label key={value} className="flex min-h-11 items-center gap-sm">
            <input type="radio" value={value} aria-describedby={errors.sessionType ? `${id}-session-error` : undefined} {...register("sessionType")} />{value === "seminar" ? "Seminar" : "Workshop"}
          </label>)}
          {errors.sessionType && <InlineFieldError id={`${id}-session-error`} message={errors.sessionType.message ?? "Pilih sesi"} />}
        </fieldset>
        {sessionType === "workshop" && <fieldset aria-invalid={Boolean(errors.speakerId)} className="flex flex-col gap-xs font-body text-b3 text-secondary-1000">
          <legend className="font-bold">Speaker / session</legend>
          {event.speakers?.length ? event.speakers.map(speaker => <label key={speaker.id} className="flex min-h-11 items-center gap-sm">
            <input type="radio" value={speaker.id} aria-describedby={errors.speakerId ? `${id}-speaker-error` : undefined}
              {...register("speakerId", { validate: value => sessionType !== "workshop" || (event.speakers?.length ?? 0) <= 1 || Boolean(value) || "Pilih speaker" })} />{speaker.name}
          </label>) : <p>Informasi speaker belum tersedia.</p>}
          {errors.speakerId && <InlineFieldError id={`${id}-speaker-error`} message={errors.speakerId.message ?? "Pilih speaker"} />}
        </fieldset>}
      </div>
      <div className="grid min-w-0 gap-lg md:grid-cols-2">
        <Input id={`${id}-phone`} label="Phone Number (WhatsApp) *" type="tel" autoComplete="tel" variant="event" icon="mdi:phone" error={errors.phone?.message} required {...register("phone", { validate: value => Boolean(value.trim()) || "Nomor WhatsApp wajib diisi" })} />
        <Input id={`${id}-institution`} label="Institution / University *" autoComplete="organization" variant="event" icon="mdi:school" error={errors.institution?.message} required {...register("institution", { validate: value => Boolean(value.trim()) || "Institusi wajib diisi" })} />
        <Input id={`${id}-domicile`} label="Domicile *" autoComplete="address-level2" variant="event" icon="mdi:map-marker" error={errors.domicile?.message} required {...register("domicile", { validate: value => Boolean(value.trim()) || "Domisili wajib diisi" })} />
        <Input id={`${id}-line`} label="LINE ID (Optional)" variant="event" icon="mdi:chat" error={errors.lineId?.message} {...register("lineId")} />
      </div>

      <div className="flex min-w-0 flex-col gap-sm">
        <label htmlFor={`${id}-cv`} className="font-body text-b3 font-bold text-secondary-1000">CV (Optional)</label>
        <p id={`${id}-cv-help`} className="font-body text-b3 text-neutral-800">PDF only, maks 500 KB. File dikirim saat formulir disubmit.</p>
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
        <p id={`${id}-payment-help`} className="font-body text-b3 text-neutral-800">JPG/PNG, maks 500 KB. Sertakan hanya jika diwajibkan oleh informasi resmi panitia. Informasi biaya belum tersedia di formulir ini.</p>
        <input id={`${id}-payment`} name="paymentProof" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          aria-invalid={Boolean(errors.paymentProof)} aria-describedby={`${id}-payment-help${errors.paymentProof ? ` ${id}-payment-error` : ""}`}
          className="block w-full min-w-0 rounded-xl border border-neutral-500 p-sm font-body text-b3 text-secondary-1000"
          onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; setFile("paymentProof", ["jpg", "png"], file); }} />
        {errors.paymentProof && <InlineFieldError id={`${id}-payment-error`} message={errors.paymentProof.message ?? "File tidak valid"} />}
        {paymentProof && <div className="flex flex-wrap items-center gap-sm"><p role="status" className="font-body text-b3 text-secondary-1000">File dipilih: {paymentProof.name}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => { setValue("paymentProof", null, { shouldDirty: true }); clearErrors("paymentProof"); }}>Hapus bukti pembayaran</Button></div>}
      </div>
      <div>
        <label htmlFor={`${id}-consent`} className="flex min-h-11 items-start gap-sm font-body text-b3 text-neutral-800">
          <input id={`${id}-consent`} type="checkbox" required className="mt-xs size-4 shrink-0 accent-primary-600" aria-invalid={Boolean(errors.consentPdp)} aria-describedby={errors.consentPdp ? `${id}-consent-error` : undefined}
            {...register("consentPdp", { validate: value => value || "Persetujuan penggunaan data wajib dicentang" })} />
          Saya menyetujui pengumpulan dan penggunaan data untuk pendaftaran event IOE 2027 sesuai UU PDP.
        </label>
        {errors.consentPdp && <InlineFieldError id={`${id}-consent-error`} message={errors.consentPdp.message ?? ""} />}
      </div>
      <Button type="submit" disabled={busy || unavailable} className="self-start">{busy ? "Mengirim..." : "Submit Registration"}</Button>
      </fieldset>
    </form>
  );
}
