export function getSafeRedirect(raw: unknown, fallback = "/dashboard"): string {
  if (typeof raw !== "string" || !/^\/(?![\/\\])/.test(raw) || /[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  try {
    const url = new URL(raw, "https://redirect.invalid");
    if (url.origin !== "https://redirect.invalid") return fallback;
    // Normalization (e.g. /a/..//host) must not produce a protocol-relative URL.
    const result = url.pathname + url.search + url.hash;
    return /^\/(?![\/\\])/.test(result) ? result : fallback;
  } catch {
    return fallback;
  }
}
