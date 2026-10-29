// Exercise the real proxy, fetchWorkers, NextResponse, mock data and error mapping.
// Only cookies and the upstream network are replaced; no live backend is changed.
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
Module._load = function(request, ...rest) {
  if (request === "next/headers") return { cookies: async () => ({ get: () => ({ value: "test-token" }) }) };
  return originalLoad.call(this, request, ...rest);
};
const originalFetch = globalThis.fetch;
const originalMode = process.env.NODE_ENV;
const originalUrl = process.env.WORKERS_API_URL;
try {
  for (const mode of ["development", "production"]) {
    process.env.NODE_ENV = mode;
    for (const configured of [false, true]) {
      if (configured) process.env.WORKERS_API_URL = "https://upstream.invalid";
      else delete process.env.WORKERS_API_URL;
      for (const file of ["lib/api.ts", "lib/eventProxy.ts"]) delete load.cache[load.resolve(path.join(root, file))];
      const { eventProxy } = load(path.join(root, "lib/eventProxy.ts"));
      let requests = [];
      globalThis.fetch = async (...args) => { requests.push(args); throw new TypeError("connection refused"); };
      for (const slug of [undefined, "talkshow"]) {
        const response = await eventProxy(slug);
        const body = await response.json();
        const demo = !configured && mode === "development";
        assert.equal(response.status, configured ? 502 : demo ? 200 : 503, `${mode}, configured=${configured}, slug=${slug}`);
        assert.equal(body.success, demo);
        assert.equal(response.headers.get("X-IOE-Demo-Data"), demo ? "true" : null);
        assert.equal(response.headers.get("Cache-Control"), "private, no-store");
        if (!demo) assert.equal(body.error.code, "SERVER_ERROR");
        else assert.ok(slug ? body.data.slug === slug : Array.isArray(body.data));
      }
      if (!configured) {
        assert.equal(requests.length, 0, "unconfigured mode makes no upstream request");
        if (mode === "development") assert.equal((await eventProxy("missing")).status, 404);
        continue;
      }
      assert.equal(requests[1][0], "https://upstream.invalid/events/talkshow");
      assert.equal(requests[1][1].headers.Authorization, "Bearer test-token");
      assert.equal(requests[1][1].cache, "no-store");
      globalThis.fetch = async () => new Response("invalid JSON", { status: 200 });
      assert.equal((await eventProxy()).status, 502, "malformed upstream JSON never becomes demo data");
      for (const status of [200, 401, 404, 500, 503]) {
        const upstream = status === 200 ? { success: true, data: [{ id: "real" }] } : { success: false, error: { code: "UPSTREAM_TEST", message: "upstream failure" } };
        globalThis.fetch = async () => Response.json(upstream, { status });
        const response = await eventProxy("a/b");
        assert.equal(response.status, status, "upstream status is preserved");
        assert.deepEqual(await response.json(), upstream, "upstream envelope is preserved");
        assert.equal(response.headers.get("X-IOE-Demo-Data"), null);
        assert.equal(response.headers.get("Cache-Control"), "private, no-store");
        assert.equal(!!response.cookies.get("ioe_token"), status === 401, "only 401 clears authentication");
      }
      console.log(`PASS ${mode}: network/JSON failures, upstream statuses, auth, cache and demo boundaries`);
    }
  }
} finally {
  globalThis.fetch = originalFetch;
  if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode;
  if (originalUrl === undefined) delete process.env.WORKERS_API_URL; else process.env.WORKERS_API_URL = originalUrl;
}
