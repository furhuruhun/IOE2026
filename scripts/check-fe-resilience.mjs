// Render actual recovery components and verify their state/semantic contracts.
// No browser, server or backend is required.
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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};

Module._extensions[".tsx"] = Module._extensions[".ts"];
Module._extensions[".css"] = () => {};
const React = load("react");
const { renderToStaticMarkup } = load("react-dom/server");
const { EventRegistrationFeedback } = load("../src/features/events/EventRegistrationFeedback.tsx");
const { RECOVERY_MESSAGES: copy } = load("../src/constants/recoveryMessages.ts");
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
const defaults = { isPending: false, isError: false, isFetching: false, hasEvent: true, onRetry: () => {} };
assert.equal(render(EventRegistrationFeedback, defaults), "");
assert.match(render(EventRegistrationFeedback, { ...defaults, isPending: true, hasEvent: false }), /role="status"/);
assert.ok(render(EventRegistrationFeedback, { ...defaults, hasEvent: false }).includes(copy.registrationUnavailable));
for (const hasEvent of [false, true]) {
  const html = render(EventRegistrationFeedback, { ...defaults, isError: true, hasEvent });
  assert.ok(html.includes(hasEvent ? copy.registrationRefreshFailed : copy.registrationFailed));
  assert.match(html, /role="alert"/);
  assert.ok(html.includes(copy.retry));
  assert.doesNotMatch(html, /autofocus|tabindex/);
}
assert.match(render(EventRegistrationFeedback, { ...defaults, isError: true, isFetching: true }), /disabled=""/);
assert.ok(render(EventRegistrationFeedback, { ...defaults, isError: true, isFetching: true }).includes(copy.retrying));
const error = Object.assign(new Error("PRIVATE_ERROR_MUST_NOT_BE_DISPLAYED"), { digest: "private-digest" });
for (const file of ["error", "(public)/error", "(protected)/error"]) {
  const Component = load(`../src/app/${file}.tsx`).default;
  const html = render(Component, { error, retry: () => {} });
  assert.match(html, /id="main-content"/);
  assert.match(html, /<h1/);
  assert.ok(html.includes(copy.retry));
  assert.doesNotMatch(html, /PRIVATE_ERROR|private-digest/);
  if (file.includes("protected")) assert.match(html, /href="\/dashboard"/);
}
const GlobalError = load("../src/app/global-error.tsx").default;
const html = render(GlobalError, { error, retry: () => {} });
assert.match(html, /<html lang="id"/);
assert.match(html, /<body/);
assert.match(html, /system-ui/);
assert.match(html, /data-theme="light"/);
assert.doesNotMatch(html, /PRIVATE_ERROR|private-digest/);
console.log("PASS event feedback states, cached warning, retry disabled state, all boundary markup and independent global document");

const { RouteLoading } = load("../src/components/ui/RouteLoading.tsx");
const loading = render(RouteLoading, {});
assert.match(loading, /aria-busy="true"/);
assert.match(loading, /role="status"/);
assert.match(loading, /motion-reduce:animate-none/);
console.log("PASS route loading semantics and reduced-motion classes");
