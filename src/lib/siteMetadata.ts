import "server-only";
import type { Metadata, MetadataRoute } from "next";
import { isIP } from "node:net";
import { navigationCategories } from "@/components/ui/navbarNavigation";

const name = "IOE 2027";
const description = "Towards a Smart and Sustainable Maritime Ecosystem: Energy, Economy, and Digital Innovation — KMKL ITB";
export const noIndex: Metadata["robots"] = { index: false, follow: false };

// Operator-supplied approval, not inferred from a request Host or hosting URL.
export function getSiteConfig() {
  let origin: string | undefined;
  try {
    const url = new URL(process.env.IOE_PUBLIC_ORIGIN ?? "");
    if (url.protocol === "https:" && !url.username && !url.password && !url.port &&
        url.pathname === "/" && !url.search && !url.hash && url.hostname.includes(".") &&
        !url.hostname.endsWith(".localhost") && !isIP(url.hostname.replace(/^\[|\]$/g, ""))) origin = url.origin;
  } catch { /* Missing/invalid origin fails closed. */ }
  const production = process.env.NODE_ENV === "production" && process.env.IOE_SITE_ENV === "production" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
  if (!production) origin = undefined;
  return { name, description, origin, indexable: Boolean(origin && process.env.IOE_ALLOW_INDEXING === "1") };
}

// Reuse existing public navigation labels, without fixture deadlines or API reads.
export const publicPages = [
  { path: "/", title: "Indonesia Ocean Expo 2027", description },
  { path: "/competitions", title: "Competitions", description: "Business Case, Paper & Poster, Design Competition — IOE 2027." },
  ...navigationCategories.flatMap(category => category.children.map(item => ({ path: item.href, title: item.label, description: `${item.label} — Indonesia Ocean Expo 2027, KMKL ITB.` }))),
];

export function rootMetadata(): Metadata {
  const site = getSiteConfig();
  return {
    ...(site.origin ? { metadataBase: new URL(site.origin) } : {}),
    title: { default: name, template: `%s | ${name}` }, description,
    robots: site.indexable ? { index: true, follow: true } : noIndex,
    openGraph: { type: "website", siteName: name, locale: "id_ID", title: name, description },
    twitter: { card: "summary", title: name, description },
  };
}

export function privateMetadata(title: string): Metadata {
  return { title, robots: noIndex };
}

export function publicMetadata(path: string): Metadata {
  const page = publicPages.find(page => page.path === path);
  if (!page) return privateMetadata("Detail");
  const site = getSiteConfig();
  const url = site.origin ? new URL(path, site.origin).href : undefined;
  const title = `${page.title} | ${name}`;
  return {
    title: page.title, description: page.description,
    robots: site.indexable ? { index: true, follow: true } : noIndex,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { type: "website", siteName: name, locale: "id_ID", title, description: page.description, ...(url ? { url } : {}) },
    twitter: { card: "summary", title, description: page.description },
  };
}

export function siteSitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfig();
  if (!site.indexable || !site.origin) return [];
  return publicPages.map(page => ({ url: new URL(page.path, site.origin).href }));
}

export function siteRobots(): MetadataRoute.Robots {
  const site = getSiteConfig();
  if (!site.indexable || !site.origin) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/dashboard", "/profile", "/change-password", "/login", "/register", "/forgot-password", "/reset-password", "/confirmation", "/events"] }, sitemap: `${site.origin}/sitemap.xml` };
}
