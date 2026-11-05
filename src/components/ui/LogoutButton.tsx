"use client";

import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const logout = useLogout();

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="secondary" size="sm" loading={logout.isPending} onClick={() => logout.mutate()}>
        {logout.isPending ? "Keluar..." : "Logout"}
      </Button>
      {logout.isError && <p role="alert" className="max-w-[16rem] text-b4 text-error-1000">Gagal keluar. Periksa koneksi dan coba lagi.</p>}
    </div>
  );
}
