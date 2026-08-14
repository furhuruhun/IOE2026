"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  fetchCurrentUser,
} from "@/services/authService";
import type { User } from "@/types/auth";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// Baca ?redirect= yang di-set middleware saat redirect ke /login — lihat AUTH_IMPLEMENTATION.md §Redirect-Back.
function useRedirectAfterAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return () => {
    const redirectTo = searchParams.get("redirect");
    router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const redirect = useRedirectAfterAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      redirect();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      router.push("/dashboard");
    },
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  const redirect = useRedirectAfterAuth();

  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      redirect();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });
}

export function useUser(): User | null {
  const { data } = useCurrentUser();
  return data ?? null;
}

export function useIsLoggedIn(): boolean {
  return useUser() !== null;
}

export function useIsAdmin(): boolean {
  const user = useUser();
  return user?.role === "panitia";
}
