"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorEntry } from "@/constants/errorMessages";
import type { ApiError } from "@/services/authService";

interface ErrorLike {
  code?: string;
  message?: string;
}

interface HandleErrorCallbacks {
  onInlineField?: (message: string) => void;
  onInlineBanner?: (message: string) => void;
  onToast?: (message: string) => void;
}

// Hook terpusat: terima error dari service layer (.code dari API_CONTRACT.md),
// tentukan treatment sesuai ERROR_HANDLING_FE.md, lalu eksekusi (toast/inline/redirect).
// Komponen HANYA perlu supply callback untuk treatment yang relevan ke form/aksi tsb.
export function useErrorHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(
    (error: ApiError | ErrorLike | undefined, callbacks: HandleErrorCallbacks = {}) => {
      const entry = getErrorEntry(error?.code);
      const message = entry.message || error?.message || "Terjadi kesalahan, coba lagi nanti";

      switch (entry.treatment) {
        case "inline-field":
          callbacks.onInlineField?.(message);
          break;
        case "inline-banner":
          callbacks.onInlineBanner?.(message);
          break;
        case "toast":
          callbacks.onToast?.(message);
          break;
        case "redirect-silent":
          // UNAUTHORIZED — expected flow (token expired), tidak perlu toast.
          queryClient.clear();
          router.push(entry.redirectTo ?? "/login");
          break;
        case "redirect-message":
          callbacks.onToast?.(message);
          router.push(entry.redirectTo ?? "/dashboard");
          break;
      }

      return { message, treatment: entry.treatment };
    },
    [router, queryClient]
  );
}
