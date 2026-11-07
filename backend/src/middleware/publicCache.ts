import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../env";

// Public catalog data changes through the admin panel, but it does not need to
// be recomputed for every visitor. Authenticated requests are deliberately
// excluded because their response contains registration state.
const PUBLIC_CACHE_CONTROL = "public, max-age=60, s-maxage=60, stale-while-revalidate=30";

export const publicReadCache: MiddlewareHandler<AppContext> = async (c, next) => {
  if (c.req.method !== "GET" || c.req.header("Authorization")) {
    await next();
    return;
  }

  // The Cache API is available in Workers. Keep local Node-based tests and
  // tooling functional when they do not provide the Workers global.
  if (typeof caches === "undefined") {
    await next();
    return;
  }

  const cacheKey = new Request(c.req.url, { method: "GET" });
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const headers = new Headers(cached.headers);
    headers.set("X-IOE-Cache", "HIT");
    return new Response(cached.body, { status: cached.status, headers });
  }

  await next();
  const response = c.res;
  if (response.status !== 200 || response.headers.has("Set-Cookie")) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", PUBLIC_CACHE_CONTROL);
  headers.set("Vary", "Authorization");
  headers.set("X-IOE-Cache", "MISS");
  const cacheable = new Response(response.body, { status: response.status, headers });
  c.executionCtx.waitUntil(caches.default.put(cacheKey, cacheable.clone()));
  c.res = cacheable;
  return cacheable;
};
