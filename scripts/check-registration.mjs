// Real FE modules, controlled network/hook adapters; no server or backend writes.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url), root = path.resolve("src");
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return resolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
for (const extension of [".ts", ".tsx"]) Module._extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
  }).outputText, filename);
};
const { ApiError, unwrapResponse } = load("../src/services/apiResponse.ts");
const validation = fields => Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "invalid", fields } }, { status: 400 });
for (const fields of [undefined, null, [], "bad", { phone: 1 }, { phone: "" }, { phone: "  " }]) {
  await assert.rejects(unwrapResponse(validation(fields)), error => error instanceof ApiError && error.fields === undefined);
}
await assert.rejects(unwrapResponse(validation({ phone: "Invalid phone", unknown: "Unknown field" })), error => {
  assert.deepEqual(error.fields, { phone: "Invalid phone", unknown: "Unknown field" }); return true;
});
await assert.rejects(unwrapResponse(Response.json({ success: false, error: { code: "QUOTA_FULL", message: "full", fields: { phone: "ignored" } } })), error => error.fields === undefined);
assert.equal(new ApiError("SERVER_ERROR", "legacy consumer").fields, undefined);

const { getRegistrationEligibility: eligibility } = load("../src/features/events/registrationState.ts");
const { talkshowContent } = load("../src/features/events/talkshowContent.ts");
const { shortCourseContent } = load("../src/features/events/shortCourseContent.ts");
const event = { id: "event-1", slug: "talkshow", name: "Fixture", deadline: "2027-02-01T00:00:00+07:00", isRegisteredByUser: false };
const now = Date.parse("2027-01-01T00:00:00+07:00");
for (const slug of ["talkshow", "short-course", "workshop", "exhibition"]) assert.equal(eligibility(slug, event, false, now).available, false);
assert.equal(talkshowContent.registrationFormReady, false);
assert.equal(shortCourseContent.registrationFormReady, false);
try {
  talkshowContent.registrationFormReady = true;
  shortCourseContent.registrationFormReady = true;
  assert.equal(eligibility("talkshow", event, false, now).available, true);
  for (const [data, demo, time] of [[undefined, false, now], [event, true, now], [event, false, null], [{ ...event, deadline: "invalid" }, false, now]]) {
    assert.equal(eligibility("talkshow", data, demo, time).available, false);
  }
  assert.equal(eligibility("talkshow", { ...event, isRegisteredByUser: true }, false, now).label, "Sudah terdaftar");
  assert.equal(eligibility("talkshow", { ...event, deadline: new Date(now).toISOString() }, false, now).label, "Pendaftaran ditutup");
  shortCourseContent.registrationOpensAt = "2027-01-02T00:00:00+07:00";
  assert.equal(eligibility("short-course", event, false, now).label, "Pendaftaran belum dibuka");
  assert.equal(eligibility("talkshow", event, false, now).available, true);
} finally {
  talkshowContent.registrationFormReady = false; shortCourseContent.registrationFormReady = false; shortCourseContent.registrationOpensAt = null;
}

const { registerEvent, RegistrationOutcomeUnknownError } = load("../src/services/eventService.ts");
const originalFetch = globalThis.fetch;
const input = { sessionType: "seminar", phone: "123", institution: "ITB", domicile: "Bandung" };
try {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/events/a%2Fb/register");
    assert.equal(options.method, "POST");
    assert.equal(options.body.get("phone"), "123");
    assert.equal(options.body.has("consentPdp"), false);
    return Response.json({ success: true, data: { registrationId: "reg-fixture" } }, { status: 201 });
  };
  assert.deepEqual(await registerEvent("a/b", input), { registrationId: "reg-fixture" });
  for (const response of [Response.json({ success: true, data: {} }), new Response("bad", { status: 502 }), Response.json({ success: false, error: { code: "SERVER_ERROR", message: "error" } }, { status: 500 })]) {
    globalThis.fetch = async () => response;
    await assert.rejects(registerEvent("talkshow", input), error => error instanceof RegistrationOutcomeUnknownError);
  }
  globalThis.fetch = async () => { throw new TypeError("response lost"); };
  await assert.rejects(registerEvent("talkshow", input), error => error instanceof RegistrationOutcomeUnknownError);
  for (const code of ["QUOTA_FULL", "ALREADY_REGISTERED", "REGISTRATION_CLOSED", "UNAUTHORIZED"]) {
    globalThis.fetch = async () => Response.json({ success: false, error: { code, message: "rejected" } }, { status: 400 });
    await assert.rejects(registerEvent("talkshow", input), error => error.code === code && !(error instanceof RegistrationOutcomeUnknownError));
  }
} finally { globalThis.fetch = originalFetch; }

// Inspect actual mutation options through adapters, including a failed cache refresh.
const originalLoad = Module._load, invalidated = [];
Module._load = function(request, ...rest) {
  if (request === "@tanstack/react-query") return {
    useMutation: options => options, useQuery: () => ({}),
    useQueryClient: () => ({ invalidateQueries: ({ queryKey }) => { invalidated.push(queryKey); return Promise.reject(new Error("read failed")); } }),
  };
  if (request === "@/hooks/useAuth") return { useCurrentUser: () => ({ data: { id: "fixture-user" } }) };
  return originalLoad.call(this, request, ...rest);
};
try {
  const options = load("../src/hooks/useEvents.ts").useRegisterEvent("talkshow");
  assert.equal(options.retry, false);
  assert.equal(options.onSuccess(), undefined);
  assert.deepEqual(invalidated, [["events"], ["dashboard", "events"], ["dashboard", "calendar"]]);
  await new Promise(resolve => setTimeout(resolve, 0));
} finally { Module._load = originalLoad; }
console.log("PASS registration field parsing, readiness/eligibility, POST outcomes, legacy errors, targeted cache invalidation and failed-refresh isolation");

// Exercise the real multipart proxy, including cookie clearing on non-JSON 401s.
const previousBackend = process.env.WORKERS_API_URL;
Module._load = function(request, ...rest) {
  if (request === "next/headers") return { cookies: async () => ({ get: () => ({ value: "fixture-token" }) }) };
  return originalLoad.call(this, request, ...rest);
};
try {
  process.env.WORKERS_API_URL = "https://workers.invalid";
  const { POST } = load("../src/app/api/events/[slug]/register/route.ts");
  const request = () => { const body = new FormData(); body.set("phone", "123"); return new Request("http://localhost/api/events/talkshow/register", { method: "POST", body }); };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://workers.invalid/events/talkshow/register");
    assert.equal(options.headers.Authorization, "Bearer fixture-token");
    assert.equal(options.body.get("phone"), "123");
    return validation({ phone: "Proxy field error" });
  };
  const response = await POST(request(), { params: Promise.resolve({ slug: "talkshow" }) });
  assert.equal(response.status, 400);
  assert.deepEqual((await response.json()).error.fields, { phone: "Proxy field error" });
  globalThis.fetch = async () => new Response("Unauthorized", { status: 401 });
  const expired = await POST(request(), { params: Promise.resolve({ slug: "talkshow" }) });
  assert.equal(expired.status, 401);
  assert.equal((await expired.json()).error.code, "UNAUTHORIZED");
  assert.match(expired.headers.get("set-cookie"), /Max-Age=0/);
} finally {
  Module._load = originalLoad; globalThis.fetch = originalFetch;
  if (previousBackend === undefined) delete process.env.WORKERS_API_URL; else process.env.WORKERS_API_URL = previousBackend;
}
console.log("PASS multipart proxy preserves field errors, slug forwarding and non-JSON 401 session recovery");
