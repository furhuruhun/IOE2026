// Exercise the real logout hook, service and cookie response with hook/network adapters.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
const originalLoad = Module._load;
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const effects = [];
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
Module._load = function (request, ...args) {
  if (request === "@tanstack/react-query") return {
    useMutation: options => options,
    useQueryClient: () => ({ cancelQueries: async () => effects.push("cancel"), clear: () => effects.push("clear") }),
  };
  if (request.startsWith("@/")) return load(path.resolve("src", request.slice(2)));
  return originalLoad.call(this, request, ...args);
};
try {
  globalThis.window = { location: { replace: url => effects.push(url) } };
  const { useLogout } = load("../src/hooks/useAuth.ts");
  const { useEventRegistrationStore: store } = load("../src/stores/useEventRegistrationStore.ts");
  const { POST } = load("../src/app/api/auth/logout/route.ts");
  const { AUTH_COOKIE_OPTIONS } = load("../src/lib/api.ts");
  const logout = useLogout();
  store.getState().record({ participantId: "p1", slug: "talkshow", eventName: "Talkshow", registrationId: "r1" });
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(logout.mutationFn(), /offline/);
  assert.deepEqual(effects, []);
  assert.ok(store.getState().receipt);
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/auth/logout");
    assert.equal(options.method, "POST");
    const response = await POST();
    const cookie = response.cookies.get("ioe_token");
    assert.equal(cookie.value, "");
    assert.equal(cookie.maxAge, 0);
    assert.equal(cookie.path, AUTH_COOKIE_OPTIONS.path);
    assert.equal(cookie.httpOnly, true);
    return response;
  };
  assert.equal(await logout.mutationFn(), null);
  await logout.onSuccess();
  assert.deepEqual(effects, ["cancel", "clear", "/login"]);
  assert.equal(store.getState().receipt, null);
  console.log("PASS logout: POST, cookie deletion, failure preserves session, query cancellation, cache/receipt cleanup, login reload");
} finally {
  Module._load = originalLoad;
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
}
