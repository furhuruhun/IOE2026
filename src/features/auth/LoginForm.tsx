"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, useGoogleLogin } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormBanner";
import { GoogleAuthButton } from "@/components/ui/GoogleAuthButton";
import type { ApiError } from "@/services/authService";
import { loginSchema, type LoginFormValues } from "./schemas";

// F-40, F-41, F-43. Flow: USER_FLOWS_v2.md §Flow Login via Google OAuth & (implisit)
// Flow Registrasi Akun untuk pola validasi/error yang sama dipakai login.
export function LoginForm() {
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const handleApiError = useErrorHandler();
  const [formBanner, setFormBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => {
    setFormBanner(null);
    login.mutate(values, {
      onError: (error) => {
        // INVALID_CREDENTIALS → inline-banner (ERROR_HANDLING_FE.md), sengaja tidak
        // menyebutkan apakah email atau password yang salah.
        handleApiError(error as ApiError, {
          onInlineBanner: setFormBanner,
          onInlineField: setFormBanner,
          onToast: setFormBanner,
        });
      },
    });
  };

  const handleGoogleIdToken = (idToken: string) => {
    setFormBanner(null);
    googleLogin.mutate(
      { idToken },
      {
        onError: (error) => {
          handleApiError(error as ApiError, { onToast: setFormBanner, onInlineBanner: setFormBanner });
        },
      }
    );
  };

  const isPending = login.isPending || googleLogin.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-full max-w-sm flex-col gap-4">
      {formBanner && <FormBanner message={formBanner} variant="error" />}

      <Input
        label="Email"
        type="email"
        icon="mdi:email-outline"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        icon="mdi:lock-outline"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" variant="primary" size="md" loading={login.isPending} disabled={isPending} className="w-full">
        {login.isPending ? "Masuk..." : "Login"}
      </Button>

      <GoogleAuthButton onIdToken={handleGoogleIdToken} disabled={isPending} />

      <p className="text-center text-b3 text-neutral-700">
        Belum punya akun?{" "}
        <Link href="/register" className="font-micro font-semibold text-secondary-600 hover:underline">
          Daftar di sini
        </Link>
      </p>
    </form>
  );
}
