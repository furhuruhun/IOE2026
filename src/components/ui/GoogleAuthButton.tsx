"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";
import { GoogleLogo } from "./GoogleLogo";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleAuthButtonProps {
  onIdToken: (idToken: string) => void;
  disabled?: boolean;
}

// Spec: design_system_final.md §GoogleAuthButton — reuse style Secondary (sama seperti
// tombol "Cancel" ProfileForm), logo Google di KANAN teks (kebalikan konvensi umum).
//
// ⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID belum diterima dari klien (AUTH_IMPLEMENTATION.md
// §Awareness A2) — tombol di-disable + tampil catatan sampai env var itu diisi, alih-alih
// pura-pura berfungsi. Begitu Client ID tersedia, tombol otomatis aktif tanpa perlu ubah kode.
export function GoogleAuthButton({ onIdToken, disabled }: GoogleAuthButtonProps) {
  const initialized = useRef(false);
  const isConfigured = Boolean(GOOGLE_CLIENT_ID);

  const ensureInitialized = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || initialized.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onIdToken(response.credential),
    });
    initialized.current = true;
  }, [onIdToken]);

  const handleClick = () => {
    ensureInitialized();
    window.google?.accounts.id.prompt();
  };

  return (
    <div>
      {isConfigured && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !isConfigured}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black/8 px-4 py-2 font-ui font-semibold text-neutral-1000 transition-colors duration-200 hover:bg-black/12 active:bg-black/16 disabled:cursor-not-allowed disabled:opacity-50 md:rounded-2xl md:px-5 md:py-3"
      >
        <span>Continue with Google</span>
        <GoogleLogo className="size-[18px]" />
      </button>
      {!isConfigured && (
        <p className="mt-1.5 text-center text-b4 text-neutral-600">
          Login Google belum tersedia — menunggu Client ID dari klien.
        </p>
      )}
    </div>
  );
}
