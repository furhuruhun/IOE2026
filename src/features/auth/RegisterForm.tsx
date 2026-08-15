"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister, useGoogleLogin } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { InlineFieldError } from "@/components/ui/InlineFieldError";
import { GoogleAuthButton } from "@/components/ui/GoogleAuthButton";
import type { ApiError } from "@/services/authService";
import { registerSchema, type RegisterFormValues } from "./schemas";
import { getPasswordStrength, PASSWORD_STRENGTH_STYLE } from "./passwordStrength";

// F-40, F-42, F-18a(n/a). Flow: USER_FLOWS_v2.md §Flow Registrasi Akun (Email).
export function RegisterForm() {
  const registerMutation = useRegister();
  const googleLogin = useGoogleLogin();
  const handleApiError = useErrorHandler();
  const [formBanner, setFormBanner] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { consentPdp: false },
  });

  const password = watch("password") ?? "";
  const consentChecked = watch("consentPdp");
  const strength = getPasswordStrength(password);

  const onSubmit = (values: RegisterFormValues) => {
    setFormBanner(null);
    setEmailTaken(false);

    // consentPdp & confirmPassword sengaja TIDAK dikirim ke BE — lihat API_CONTRACT.md
    // POST /auth/register (request body cuma { name, email, password }) dan
    // TECHNICAL_CONSTRAINTS_FE.md §Awareness A3 (consent validasi FE-only).
    registerMutation.mutate(
      { name: values.name, email: values.email, password: values.password },
      {
        onError: (error) => {
          const apiError = error as ApiError;
          if (apiError.code === "EMAIL_ALREADY_REGISTERED") {
            setEmailTaken(true);
            return;
          }
          handleApiError(apiError, {
            onInlineBanner: setFormBanner,
            onInlineField: setFormBanner,
            onToast: setFormBanner,
          });
        },
      }
    );
  };

  const handleGoogleIdToken = (idToken: string) => {
    setFormBanner(null);
    setEmailTaken(false);
    googleLogin.mutate(
      { idToken },
      {
        onError: (error) => {
          handleApiError(error as ApiError, { onToast: setFormBanner, onInlineBanner: setFormBanner });
        },
      }
    );
  };

  const isPending = registerMutation.isPending || googleLogin.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-sm flex-col gap-4">
      {formBanner && <FormBanner message={formBanner} variant="error" />}

      <Input
        label="Nama Lengkap"
        type="text"
        icon="mdi:account-outline"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <div>
        <Input
          label="Email"
          type="email"
          icon="mdi:email-outline"
          autoComplete="email"
          error={emailTaken ? undefined : errors.email?.message}
          {...register("email")}
        />
        {emailTaken && (
          <InlineFieldError
            message="Email ini sudah terdaftar, coba login"
            action={{ label: "Login di sini", href: "/login" }}
          />
        )}
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          icon="mdi:lock-outline"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {strength && !errors.password && (
          <p className="mt-1.5 text-b4 text-neutral-600">
            Kekuatan password:{" "}
            <span className={`font-semibold ${PASSWORD_STRENGTH_STYLE[strength].className}`}>
              {PASSWORD_STRENGTH_STYLE[strength].label}
            </span>
          </p>
        )}
      </div>

      <Input
        label="Konfirmasi Password"
        type="password"
        icon="mdi:lock-check-outline"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {/* Tidak ada spec Checkbox di design_system_final.md — styling minimal, flag di CHANGELOG. */}
      <div>
        <label className="flex items-start gap-2 text-b3 text-neutral-800">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded-sm border-neutral-500 accent-primary-600"
            {...register("consentPdp")}
          />
          <span>
            Saya menyetujui pengumpulan &amp; penggunaan data sesuai kebijakan privasi (UU PDP) IOE 2027.
          </span>
        </label>
        {errors.consentPdp && <InlineFieldError message={errors.consentPdp.message ?? ""} />}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={registerMutation.isPending}
        disabled={isPending || !consentChecked}
        className="w-full"
      >
        {registerMutation.isPending ? "Mendaftar..." : "Register"}
      </Button>

      <GoogleAuthButton onIdToken={handleGoogleIdToken} disabled={isPending} />

      <p className="text-center text-b3 text-neutral-700">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-micro font-semibold text-secondary-600 hover:underline">
          Login di sini
        </Link>
      </p>
    </form>
  );
}
