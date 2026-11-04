// Exercise the real proxy, fetchWorkers, NextResponse, mock data and error mapping.
// Cookies, network and hook adapters are replaced; no live backend is changed.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
const root = path.resolve("src");
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return resolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
Module._extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};

const originalLoad = Module._load;
let token = "test-token";
const pushed = [];
let cleared = 0;
let guardAdapters = false;
let teamLookupError;
let modalOpens = 0;
Module._load = function(request, ...rest) {
  if (guardAdapters && request === "@/hooks/useAuth") return { useIsLoggedIn: () => true };
  if (guardAdapters && request === "@/services/teamService") return { fetchMyTeam: async () => { if (teamLookupError) throw teamLookupError; return null; } };
  if (guardAdapters && request === "@/stores/useTeamModalStore") return { useTeamModalStore: select => select({ open: () => modalOpens++ }) };
  if (request === "next/headers") return { cookies: async () => ({ get: () => token ? { value: token } : undefined }) };
  if (request === "next/navigation") return { useRouter: () => ({ push: value => pushed.push(value) }), usePathname: () => "/dashboard" };
  if (request === "react") return { useCallback: callback => callback };
  if (request === "@tanstack/react-query") return { useQueryClient: () => ({ clear: () => cleared++ }) };
  return originalLoad.call(this, request, ...rest);
};
const { getSafeRedirect } = load("../src/utils/safeRedirect.ts");
for (const raw of [null, undefined, 1, "", "//evil.com", "/\\evil.com", "https://x.com", "javascript:alert(1)", "/\t/evil.com", "/\n/evil.com", "/a/..//evil.com"]) {
  assert.equal(getSafeRedirect(raw), "/dashboard", String(raw));
}
for (const raw of ["/dashboard", "/competitions/x?openTeamModal=1", "/dashboard#top"]) assert.equal(getSafeRedirect(raw), raw);
const { unwrapResponse, ApiError } = load("../src/services/apiResponse.ts");
assert.equal(await unwrapResponse(Response.json({ success: true, data: null })), null);
assert.deepEqual(await unwrapResponse(Response.json({ success: true, data: [1] })), [1]);
for (const response of [new Response("<html>error</html>", { status: 502 }), new Response("", { status: 504 }), Response.json(null), Response.json({}), Response.json({ success: true }), Response.json({ success: false }), Response.json({ success: true, data: 1 }, { status: 500 })]) {
  await assert.rejects(unwrapResponse(response), error => error instanceof ApiError && error.code === "SERVER_ERROR");
}
await assert.rejects(unwrapResponse(new Response("", { status: 401 })), { code: "UNAUTHORIZED" });
await assert.rejects(unwrapResponse(Response.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "invalid" } }, { status: 401 })), { code: "INVALID_CREDENTIALS" });
const { ERROR_MESSAGES } = load("../src/constants/errorMessages.ts");
const contract = fs.readFileSync("amunisi/API_CONTRACT (2).md", "utf8").split("## [FONDASI 4/4] Error Code Reference")[1].split("## Mock Data")[0];
const errorDoc = fs.readFileSync("amunisi/ERROR_HANDLING_FE.md", "utf8");
const { ERROR_CATALOG } = load("../backend/src/lib/errors.ts");
for (const code of [...contract.matchAll(/\| `([A-Z_]+)` \|/g)].map(match => match[1]).concat(Object.keys(ERROR_CATALOG))) {
  assert.ok(ERROR_MESSAGES[code], `Missing FE mapping: ${code}`);
  assert.ok(errorDoc.includes('`' + code + '`'), `Missing treatment documentation: ${code}`);
  if (code !== "UNAUTHORIZED") assert.equal(ERROR_MESSAGES[code].message, ERROR_CATALOG[code].message);
}
// Hook adapters above make this a pure behavioral check, without a React renderer.
const { useErrorHandler: createHandler } = load("../src/hooks/useErrorHandler.ts");
globalThis.window = { location: { search: "?tab=events" } };
const handle = createHandler();
let notices = 0;
handle(new ApiError("UNAUTHORIZED", "expired"), { onToast: () => notices++ });
assert.equal(cleared, 1);
assert.equal(notices, 0);
assert.equal(pushed.pop(), "/login?redirect=%2Fdashboard%3Ftab%3Devents");
handle(new ApiError("UNAUTHORIZED", "expired"), { redirectTo: "/login?redirect=%2Fevents%2Ftalkshow%2Fregister" });
assert.equal(pushed.pop(), "/login?redirect=%2Fevents%2Ftalkshow%2Fregister");
console.log("PASS redirect sanitizer, response parsing, contract/backend error-map coverage, silent session recovery");
const savedFetch = globalThis.fetch;
try {
  const events = load("../src/services/eventService.ts");
  globalThis.fetch = async () => Response.json({ success: true, data: [{ slug: "talkshow" }] }, { headers: { "X-IOE-Demo-Data": "true" } });
  assert.equal((await events.fetchEvents()).isDemo, true);
  globalThis.fetch = async () => Response.json({ success: true, data: { id: "talkshow", slug: "talkshow", name: "Talkshow", deadline: "2027-01-01", isRegisteredByUser: false } }, { headers: { "X-IOE-Demo-Data": "true" } });
  assert.equal((await events.fetchEvent("talkshow")).isDemo, true);
  await assert.rejects(events.fetchEvent("other"), { code: "SERVER_ERROR" });
  const teams = load("../src/services/teamService.ts");
  globalThis.fetch = async () => new Response("", { status: 404 });
  assert.equal(await teams.fetchMyTeam("test"), null);
  const auth = load("../src/services/authService.ts");
  globalThis.fetch = async () => Response.json({ success: true, data: null });
  assert.equal(await auth.fetchCurrentUser(), null);
} finally { globalThis.fetch = savedFetch; }
console.log("PASS migrated Events demo provenance, slug validation, team 404 and anonymous session semantics");
guardAdapters = true;
const { useRegisterGuard: createGuard } = load("../src/features/competitions/useRegisterGuard.ts");
const guard = createGuard({ competitionId: "test", slug: "test", competitionName: "Test" });
teamLookupError = new ApiError("UNAUTHORIZED", "expired");
await guard();
assert.equal(modalOpens, 0);
assert.equal(pushed.pop(), "/login?redirect=%2Fcompetitions%2Ftest%3FopenTeamModal%3D1");
teamLookupError = undefined;
await guard();
assert.equal(modalOpens, 1);
guardAdapters = false;
console.log("PASS expired team lookup redirects without opening the registration modal");
const routes = [
  ["competitions/route.ts", "GET", null],
  ["competitions/[slug]/route.ts", "GET", null],
  ["competitions/[slug]/team/join/route.ts", "POST", { teamCode: "bad" }],
  ["competitions/[slug]/team/join-public/route.ts", "POST", { teamId: "bad" }],
  ["competitions/[slug]/team/public/route.ts", "GET", null],
  ["competitions/[slug]/team/route.ts", "POST", { teamName: "Test" }],
];
const originalFetch = globalThis.fetch;
const originalMode = process.env.NODE_ENV;
const originalUrl = process.env.WORKERS_API_URL;
try {
 for (const mode of ["development", "production"]) for (const configured of [false, true]) {
  process.env.NODE_ENV = mode;
  if (configured) process.env.WORKERS_API_URL = "https://upstream.invalid";
  else delete process.env.WORKERS_API_URL;
  for (const [file, method, input] of routes) {
   for (const key of Object.keys(load.cache)) if (key.startsWith(root + path.sep)) delete load.cache[key];
   const route = load(path.join(root, "app/api", file));
   const invoke = (raw = JSON.stringify(input)) => route[method](new Request("http://localhost/api/test", { method, ...(method === "POST" ? { headers: { "Content-Type": "application/json" }, body: raw } : {}) }), { params: Promise.resolve({ slug: "business-case-competition" }) });
   let calls = 0;
   globalThis.fetch = async () => { calls++; throw new Error("network down"); };
   let response = await invoke();
   if (configured) assert.equal(response.status, 502, file);
   else if (mode === "production") assert.equal(response.status, 503, file);
   else assert.notEqual(response.status, 503, file);
   assert.equal(calls, configured ? 1 : 0);
   if (configured) {
    globalThis.fetch = async () => new Response("not json", { status: 502 });
    assert.equal((await invoke()).status, 502);
    if (file.includes("/team/")) {
      globalThis.fetch = async () => new Response("expired", { status: 401 });
      response = await invoke();
      assert.equal(response.status, 401);
      assert.match(response.headers.get("set-cookie"), /ioe_token=;.*Max-Age=0/i);
    }
    for (const status of [200, 401, 404, 500, 503]) {
     const body = status === 200 ? { success: true, data: [] } : { success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR", message: "test" } };
     globalThis.fetch = async (_url, options) => {
      if (file.includes("/team/")) assert.equal(options.headers.Authorization, "Bearer test-token");
      return Response.json(body, { status });
     };
     response = await invoke();
     assert.equal(response.status, status);
     assert.deepEqual(await response.json(), body);
     if (status === 401 && file.includes("/team/")) assert.match(response.headers.get("set-cookie"), /ioe_token=;.*Max-Age=0/i);
    }
   }
   if (method === "POST") assert.equal((await invoke("{bad")).status, 400);
   if (file.includes("/team/")) {
    token = undefined;
    assert.equal((await invoke()).status, 401);
    token = "test-token";
   }
  }
  if (configured) {
    const me = load(path.join(root, "app/api/auth/me/route.ts"));
    for (const status of [401, 500]) {
      globalThis.fetch = async () => Response.json({ success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR", message: "test" } }, { status });
      const response = await me.GET();
      assert.equal(response.status, status === 401 ? 200 : 500);
      if (status === 401) {
        assert.deepEqual(await response.json(), { success: true, data: null });
        assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
      } else assert.equal(response.headers.get("set-cookie"), null);
    }
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal((await me.GET()).status, 502);
  }
  console.log(`PASS ${mode}, configured=${configured}: competition/team proxy boundaries, status forwarding, JSON validation, authentication`);
 }
} finally {
 globalThis.fetch = originalFetch;
 if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode;
 if (originalUrl === undefined) delete process.env.WORKERS_API_URL; else process.env.WORKERS_API_URL = originalUrl;
 Module._load = originalLoad;
}
