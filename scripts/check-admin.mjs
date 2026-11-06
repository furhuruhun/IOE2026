// Exercise the actual admin proxy with isolated cookie and Workers adapters.
import assert from "node:assert/strict";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
let token;
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === "@/lib/api") return { getTokenFromCookies: async () => token, COOKIE_NAME: "ioe_token", CLEAR_AUTH_COOKIE_OPTIONS: { maxAge: 0 } };
  return originalLoad.call(this, request, ...args);
};
const { GET, POST, PATCH } = load("../src/app/api/admin/[...path]/route.ts");
const context = path => ({ params: Promise.resolve({ path: path.split("/") }) });
const request = (method = "GET", origin) => new Request("http://localhost/api/admin/registrations", { method, ...(origin ? { headers: { origin }, body: "{}" } : {}) });
const savedFetch = globalThis.fetch;
const savedBase = process.env.WORKERS_API_URL;
let calls = 0;
try {
  globalThis.fetch = async (url, options) => { calls++; assert.equal(options.headers.Authorization, "Bearer admin-token"); assert.equal(options.cache, "no-store"); return new Response("expired", { status: 401 }); };
  assert.equal((await GET(request(), context("registrations"))).status, 401);
  assert.equal(calls, 0);
  token = "admin-token";
  assert.equal((await GET(request(), context("auth/me"))).status, 404);
  delete process.env.WORKERS_API_URL;
  assert.equal((await GET(request(), context("registrations"))).status, 503);
  process.env.WORKERS_API_URL = "https://worker.example/api";
  globalThis.fetch = async (url, options) => { assert.equal(url, "https://worker.example/api/admin/schedules"); assert.equal(options.headers.Authorization, "Bearer admin-token"); return Response.json({ success: true, data: {} }); };
  assert.equal((await GET(request(), context("schedules"))).status, 200);
  globalThis.fetch = async () => { calls++; return new Response("expired", { status: 401 }); };
  assert.equal((await POST(request("POST", "https://foreign.example"), context("announcements"))).status, 403);
  assert.equal(calls, 0);
  const expired = await GET(request(), context("registrations"));
  assert.equal(expired.status, 401);
  assert.match(expired.headers.get("set-cookie"), /ioe_token=.*Max-Age=0/i);
  globalThis.fetch = async (url, options) => { assert.equal(options.headers.Authorization, "Bearer admin-token"); return Response.json({ success: false, error: { code: "ADMIN_ONLY", message: "Forbidden" } }, { status: 403 }); };
  assert.equal((await PATCH(request("PATCH"), context("submissions/sub-1"))).status, 403);
  globalThis.fetch = async () => new Response("csv-content", { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="teams-export.csv"' } });
  const csv = await GET(request(), context("registrations/export"));
  assert.equal(await csv.text(), "csv-content");
  assert.equal(csv.headers.get("Content-Type"), "text/csv");
  assert.match(csv.headers.get("Content-Disposition"), /teams-export.csv/);
  assert.equal(csv.headers.get("Cache-Control"), "no-store");
  console.log("PASS admin proxy: authentication, allowlist, missing configuration, origin check, role denial, expired-cookie clearing, CSV streaming");
} finally {
  globalThis.fetch = savedFetch;
  Module._load = originalLoad;
  if (savedBase === undefined) delete process.env.WORKERS_API_URL; else process.env.WORKERS_API_URL = savedBase;
}
