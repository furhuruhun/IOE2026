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
import { getRoleRedirect } from "@/utils/roleJourney";
import type { User } from "@/types/auth";
import { useEventRegistrationStore } from "@/stores/useEventRegistrationStore";

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

  return (user: User) => {
    const redirectTo = searchParams.get("redirect");
    router.push(getRoleRedirect(redirectTo, user.role));
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const redirect = useRedirectAfterAuth();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      redirect(user);
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
      redirect(user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      useEventRegistrationStore.getState().clear();
      // Reload after cookie deletion to discard prefetched routes and mounted account state.
      window.location.replace("/login");
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
