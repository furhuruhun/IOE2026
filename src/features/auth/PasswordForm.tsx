"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { useManualSimulation } from "@/components/ManualSimulation";
import { unwrapResponse, ApiError } from "@/services/apiResponse";
import { useEventRegistrationStore } from "@/stores/useEventRegistrationStore";

export const passwordManagementEnabled = process.env.NEXT_PUBLIC_PASSWORD_MANAGEMENT_ENABLED === "1";
type Mode = "change-password" | "forgot-password" | "reset-password";
const titles = { "change-password": "Ubah password", "forgot-password": "Lupa password?", "reset-password": "Reset password" };
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function PasswordForm({ mode }: { mode: Mode }) {
  const id = useId();
  const queryClient = useQueryClient();
  const simulation = useManualSimulation();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const token = useRef("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (mode === "reset-password") {
      const value = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (value) token.current = value;
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setMessage("");
    setSuccess(false);
    if (mode === "reset-password" && !/^[a-f0-9]{64}$/.test(token.current)) {
      setMessage("Tautan reset tidak lengkap. Minta tautan baru melalui Lupa password."); return;
    }
    if (mode !== "forgot-password" && data.get("newPassword") !== data.get("confirmPassword")) {
      setMessage("Konfirmasi password tidak sama."); return;
    }
    setPending(true);
    try {
      const body = mode === "forgot-password" ? { email: data.get("email") }
        : { newPassword: data.get("newPassword"), ...(mode === "change-password" ? { currentPassword: data.get("currentPassword") } : { token: token.current }) };
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await unwrapResponse<{ message?: string }>(response);
      form.reset();
      setSuccess(true);
      if (mode === "forgot-password") setMessage(result.message ?? "Jika email terdaftar, tautan reset akan dikirim.");
      else {
        await queryClient.cancelQueries();
        useEventRegistrationStore.getState().clear();
        // The full reload discards the QueryClient. Clearing mounted queries here
        // would refetch protected data before navigation and race the success redirect.
        window.location.replace("/login?passwordChanged=1");
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") window.location.replace("/login");
      else setMessage(error instanceof ApiError ? error.fields?.token ?? error.message : "Tidak dapat terhubung. Periksa koneksi dan coba lagi.");
    } finally { setPending(false); }
  }

  if (!passwordManagementEnabled) return mode === "change-password" ? null : <FormBanner variant="info" message="Pemulihan password belum tersedia. Hubungi panitia." />;
  return <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-neutral-300 bg-neutral-100 p-6">
    <h2 className="font-heading text-h4 text-secondary-1000">{titles[mode]}</h2>
    {simulation ? <FormBanner variant="info" message="Pengelolaan password tidak tersedia dalam simulasi lokal." /> : <>
      <p className="text-b3 text-neutral-800">{mode === "forgot-password" ? "Masukkan email akun peserta untuk menerima tautan reset." : "Minimal 8 karakter, mengandung huruf dan angka. Setelah berhasil, silakan login kembali. Untuk akun Google tanpa password, hubungi panitia melalui halaman Lupa password."}</p>
      {message && <FormBanner variant={success ? "success" : "error"} message={message} />}
      <form method="post" action={`/api/auth/${mode}`} onSubmit={submit} className="flex flex-col gap-4">
        {mode === "forgot-password" ? <Input id={`${id}-email`} name="email" label="Email peserta" type="email" required maxLength={254} autoComplete="email" disabled={pending} /> : <>
          {mode === "change-password" && <Input id={`${id}-current`} name="currentPassword" label="Password saat ini" type="password" revealable required autoComplete="current-password" disabled={pending} />}
          <Input id={`${id}-new`} name="newPassword" label="Password baru" type="password" revealable required minLength={8} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}" autoComplete="new-password" disabled={pending} />
          <Input id={`${id}-confirm`} name="confirmPassword" label="Konfirmasi password baru" type="password" revealable required autoComplete="new-password" disabled={pending} />
        </>}
        <Button type="submit" loading={pending} disabled={!hydrated} className="self-start">{mode === "forgot-password" ? "Kirim tautan reset" : titles[mode]}</Button>
      </form>
      {mode !== "forgot-password" && <Link href="/forgot-password" className="text-b3 text-secondary-800 underline">{mode === "reset-password" ? "Hubungi panitia untuk bantuan reset password" : "Lupa password atau belum memiliki password?"}</Link>}
    </>}
  </section>;
}
