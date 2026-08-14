import { NextRequest, NextResponse } from "next/server";

// Next.js 16 mendeprekasi file convention `middleware.ts` → `proxy.ts` (export function
// `proxy`, bukan `middleware`). Perilaku identik dengan yang dideskripsikan sebagai
// "middleware.ts" di AUTH_IMPLEMENTATION.md §7 dan TECHNICAL_CONSTRAINTS_FE.md §Struktur
// Folder — hanya nama file & nama fungsi export yang berubah karena versi Next.js yang
// ter-install (16.3.1). Lihat CHANGELOG.md untuk catatan dokumen yang jadi tidak sinkron.

const COOKIE_NAME = "ioe_token";

// Route yang butuh login. /events/[slug]/register ditangani terpisah di bawah
// karena /events dan /events/[slug] harus tetap public.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/admin"];

const AUTH_ROUTES = ["/login", "/register"];

const EVENT_REGISTER_PATTERN = /^\/events\/[^/]+\/register\/?$/;

// Catatan penting (AUTH_IMPLEMENTATION.md §7): /competitions/[slug] SENGAJA
// tidak masuk daftar ini. Route itu tetap Public — force-auth untuk modal
// Create/Join Team di-guard di level komponen (useIsLoggedIn), bukan di sini.
function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  return EVENT_REGISTER_PATTERN.test(pathname);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(COOKIE_NAME);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Proxy hanya cek ada/tidaknya cookie (bukan decode role) supaya tidak ada
// roundtrip ke Workers di tiap request. Validasi role admin dilakukan di komponen
// lewat useIsAdmin(); Workers tetap return 403 ADMIN_ONLY sebagai safety net.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
