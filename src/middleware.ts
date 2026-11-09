import { NextRequest, NextResponse } from "next/server";
import { manualSimulationEnabled, SIMULATION_COOKIE } from "@/lib/manualSimulation";

// OpenNext Cloudflare memerlukan Edge Middleware; proxy.ts di Next.js 16 berjalan
// di runtime Node.js dan belum didukung adapter. Aturan akses tetap sama.

const COOKIE_NAME = "ioe_token";

// Route yang butuh login. /events/[slug]/register ditangani terpisah di bawah
// karena /events dan /events/[slug] harus tetap public.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/change-password", "/admin"];

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const simulation = manualSimulationEnabled();
  if (simulation && (pathname === "/api" || pathname.startsWith("/api/"))) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Cross-origin simulation request rejected" } }, { status: 403 });
    }
  }
  if (simulation && pathname === "/api/manual-simulation") return NextResponse.next();
  if (simulation && (pathname === "/api" || pathname.startsWith("/api/"))) {
    const target = new URL("/api/manual-simulation", req.url);
    const headers = new Headers(req.headers);
    // Origin was validated against the browser-facing host before rewriting.
    headers.delete("origin");
    headers.set("x-ioe-simulation-path", pathname);
    return NextResponse.rewrite(target, { request: { headers } });
  }
  const hasSession = req.cookies.has(simulation ? SIMULATION_COOKIE : COOKIE_NAME);

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

// Middleware hanya cek ada/tidaknya cookie (bukan decode role) supaya tidak ada
// roundtrip ke Workers di tiap request. Validasi role admin dilakukan di komponen
// lewat useIsAdmin(); Workers tetap return 403 ADMIN_ONLY sebagai safety net.
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
