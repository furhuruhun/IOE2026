// GET-only live probes. No credentials, response bodies or backend URLs are logged.
// Direct: node scripts/check-phase7-readonly.mjs
// Local FE: UI_ORIGIN=http://localhost:3000 node scripts/check-phase7-readonly.mjs --frontend
import { createRequire } from "node:module";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), true);
const frontend = process.argv.includes("--frontend");
const documentedWorker = process.argv.includes("--documented-worker");
const configured = documentedWorker
  ? (await readFile(".env.local.example", "utf8")).match(/^WORKERS_API_URL=(.*)$/m)?.[1].trim()
  : process.env.WORKERS_API_URL;
if (!configured) throw new Error("WORKERS_API_URL is not configured");
const configuredUrl = new URL(configured);
const localBackend = ["localhost", "127.0.0.1"].includes(configuredUrl.hostname);
if (!(configuredUrl.protocol === "https:" || (configuredUrl.protocol === "http:" && localBackend)) || configuredUrl.username || configuredUrl.password || configuredUrl.search || configuredUrl.hash || configuredUrl.pathname.replace(/\/$/, "") !== "/api") {
  throw new Error("Expected a credential-free HTTPS or loopback /api base; refusing probes");
}
if (documentedWorker && !configuredUrl.hostname.endsWith(".workers.dev")) throw new Error("Documented target must be a Workers deployment");
const local = new URL(process.env.UI_ORIGIN ?? "http://localhost:3000");
if (frontend && (!["localhost", "127.0.0.1"].includes(local.hostname) || local.protocol !== "http:")) throw new Error("Frontend probes are restricted to loopback HTTP");
const base = frontend ? local.origin + "/api" : configured.replace(/\/$/, "");
const rows = [];
async function probe(route, invalidSession = false) {
  const row = { route, session: invalidSession ? "deliberately invalid test token" : "anonymous" };
  let data;
  try {
    const response = await fetch(base + route, {
      method: "GET", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: invalidSession ? frontend ? { Cookie: "ioe_token=phase7-deliberately-invalid" } : { Authorization: "Bearer phase7-deliberately-invalid" } : {},
    });
    row.status = response.status;
    row.demo = response.headers.get("X-IOE-Demo-Data") === "true";
    row.clearsSession = /ioe_token=.*Max-Age=0/i.test(response.headers.get("set-cookie") ?? "");
    let body;
    try { body = await response.json(); } catch { row.invalidJson = true; }
    row.success = body?.success === true;
    row.errorCode = typeof body?.error?.code === "string" ? body.error.code : null;
    data = body?.data;
    row.dataType = data === null ? "null" : Array.isArray(data) ? "array" : typeof data;
    if (Array.isArray(data)) row.count = data.length;
    if (data && typeof data === "object" && !Array.isArray(data)) row.fields = Object.keys(data);
  } catch (error) { row.networkError = error.name; }
  rows.push(row);
  console.log(JSON.stringify(row));
  return { row, data };
}
if (!frontend) await probe("/health");
const list = await probe("/events");
if (Array.isArray(list.data)) {
  list.row.summaryShapeValid = list.data.length ? list.data.every(item => typeof item.id === "string" && typeof item.slug === "string" && typeof item.name === "string" && typeof item.deadline === "string" && typeof item.isRegisteredByUser === "boolean") : null;
  for (const item of list.data.slice(0, 8)) {
    if (typeof item.slug !== "string") continue;
    const detail = await probe("/events/" + encodeURIComponent(item.slug));
    detail.row.slugMatches = detail.data?.slug === item.slug;
    detail.row.idMatches = detail.data?.id === item.id;
    detail.row.deadlineValid = Number.isFinite(Date.parse(detail.data?.deadline));
    detail.row.speakerCount = Array.isArray(detail.data?.speakers) ? detail.data.speakers.length : null;
  }
}
await probe("/events/phase7-known-missing-event");
await probe("/profile");
await probe("/profile", true);
await probe("/dashboard/events");
await probe("/dashboard/calendar");
if (frontend) {
  await probe("/auth/me");
  await probe("/auth/me", true);
}
await mkdir("out/phase7", { recursive: true });
await writeFile(`out/phase7/${frontend ? "frontend" : "workers"}-readonly.json`, JSON.stringify({
  observedAt: new Date().toISOString(), environmentCategory: "unknown; writes not authorized",
  target: frontend ? "local frontend proxy" : localBackend ? "configured loopback backend" : "deployed Workers API",
  configurationSource: documentedWorker ? "checked-in deployment example" : "current server environment", methods: ["GET"], rows,
}, null, 2));
if (rows.some(row => row.networkError)) process.exitCode = 1;
