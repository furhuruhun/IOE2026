"use client";

import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Icon } from "@iconify/react/offline";

export function LogoutButton({ appearance = "default", menuItem = false }: { appearance?: "default" | "menu"; menuItem?: boolean }) {
  const logout = useLogout();

  return (
    <div role={menuItem ? "none" : undefined} className={`flex flex-col items-start gap-2 ${appearance === "menu" ? "w-full" : ""}`}>
      {appearance === "menu" ? (
        <button
          type="button"
          role={menuItem ? "menuitem" : undefined}
          disabled={logout.isPending}
          aria-busy={logout.isPending || undefined}
          onClick={() => { if (!logout.isPending) logout.mutate(); }}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-ui text-b3 text-error-1000 transition-colors hover:bg-error-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-800 disabled:cursor-wait disabled:opacity-60"
        >
          <Icon icon={logout.isPending ? "mdi:loading" : "mdi:logout"} aria-hidden="true" className={`size-5 shrink-0 ${logout.isPending ? "animate-spin motion-reduce:animate-none" : ""}`} />
          {logout.isPending ? "Keluar..." : "Logout"}
        </button>
      ) : (
        <Button variant="secondary" size="sm" loading={logout.isPending} onClick={() => logout.mutate()}>
          {logout.isPending ? "Keluar..." : "Logout"}
        </Button>
      )}
      {logout.isError && <p role="alert" className="max-w-[16rem] text-b4 text-error-1000">Gagal keluar. Periksa koneksi dan coba lagi.</p>}
    </div>
  );
}
