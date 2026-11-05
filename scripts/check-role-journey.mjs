// Real frontend redirect/guard logic with isolated identity/router adapters.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";
const load = createRequire(import.meta.url);
const react = load("react");
const originalLoad = Module._load;
let identity = { isPending: false, isSuccess: true, data: { role: "panitia" } };
let modalOpens = 0, lookups = 0;
const routes = [];
let pathname = "/dashboard";
let returnTo = null;
for (const extension of [".ts", ".tsx"]) Module._extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
Module._load = function (request, ...args) {
  if (request === "react") return { ...react, useEffect: effect => effect(), useCallback: callback => callback };
  if (request === "next/navigation") return { usePathname: () => pathname, useSearchParams: () => ({ get: () => returnTo }), useRouter: () => ({ replace: route => routes.push(route), push: route => routes.push(route) }) };
  if (request === "@tanstack/react-query") return { useMutation: options => options, useQueryClient: () => ({ setQueryData() {} }) };
  if (request === "next/link") return () => null;
  if (request === "@/hooks/useAuth") return { useCurrentUser: () => identity };
  if (request === "@/hooks/useErrorHandler") return { useErrorHandler: () => () => {} };
  if (request === "@/stores/useTeamModalStore") return { useTeamModalStore: select => select({ open: () => modalOpens++ }) };
  if (request === "@/services/teamService") return { fetchMyTeam: async () => { lookups++; return null; } };
  if (["@/components/ui/Button", "@/components/ui/FormBanner"].includes(request)) return { Button: () => null, FormBanner: () => null };
  if (request.startsWith("@/")) return load(path.resolve("src", request.slice(2)));
  return originalLoad.call(this, request, ...args);
};
try {
  const { getRoleRedirect, COMMITTEE_DESTINATION } = load("../src/utils/roleJourney.ts");
  for (const target of [null, "https://evil.example", "//evil.example", "javascript:alert(1)"]) {
    assert.equal(getRoleRedirect(target, "panitia"), "/admin");
    assert.equal(getRoleRedirect(target, "peserta"), "/dashboard");
  }
  for (const target of ["/dashboard", "/dashboard/profile", "/events/talkshow/register", "/events/short-course/register/", "/competitions/x?openTeamModal=1", "/%64ashboard", "/confirmation"]) {
    assert.equal(getRoleRedirect(target, "panitia"), COMMITTEE_DESTINATION, target);
    assert.equal(getRoleRedirect(target, "peserta"), target);
  }
  for (const target of ["/profile", "/events/talkshow", "/competitions/x", "/admin"]) assert.equal(getRoleRedirect(target, "panitia"), target);
  const { RoleJourney, ParticipantAction, CommitteeLink } = load("../src/features/auth/RoleJourney.tsx");
  const children = "participant content";
  assert.notEqual(RoleJourney({ children }), children);
  assert.equal(routes.pop(), COMMITTEE_DESTINATION);
  assert.equal(ParticipantAction({ children }).type, CommitteeLink);
  identity = { isPending: true, isSuccess: false, data: undefined };
  assert.notEqual(RoleJourney({ children }), children);
  assert.equal(ParticipantAction({ children }), null);
  assert.equal(routes.length, 0);
  identity = { isPending: false, isSuccess: false, isError: true, data: undefined };
  assert.notEqual(RoleJourney({ children }), children);
  identity = { isPending: false, isSuccess: true, data: { role: "peserta" } };
  assert.equal(RoleJourney({ children }), children);
  assert.equal(ParticipantAction({ children }), children);
  identity = { isPending: false, isSuccess: true, data: null };
  assert.notEqual(RoleJourney({ children }), children);
  assert.equal(routes.pop(), "/login?redirect=%2Fdashboard");
  assert.equal(ParticipantAction({ children }), children);
  identity.data = { role: "panitia" };
  pathname = "/profile";
  assert.equal(RoleJourney({ children }), children);
  pathname = "/events/short-course/register";
  assert.notEqual(RoleJourney({ children }), children);
  assert.equal(routes.pop(), COMMITTEE_DESTINATION);
  const { useRegisterGuard: createGuard } = load("../src/features/competitions/useRegisterGuard.ts");
  const context = { competitionId: "x", competitionName: "Test", slug: "test" };
  await createGuard(context)();
  assert.equal(routes.pop(), COMMITTEE_DESTINATION);
  assert.equal(lookups, 0); assert.equal(modalOpens, 0);
  identity.data = { role: "peserta" };
  await createGuard(context)();
  assert.equal(lookups, 1); assert.equal(modalOpens, 1);
  identity.data = null;
  await createGuard(context)();
  assert.equal(routes.pop(), "/login?redirect=%2Fcompetitions%2Ftest%3FopenTeamModal%3D1");
  const { useLogin: createLogin, useGoogleLogin: createGoogleLogin, useRegister: createRegister } = load("../src/hooks/useAuth.ts");
  for (const createMutation of [createLogin, createGoogleLogin]) {
    for (const role of ["peserta", "panitia"]) {
      returnTo = null;
      createMutation().onSuccess({ user: { role } });
      assert.equal(routes.pop(), role === "panitia" ? "/admin" : "/dashboard");
      returnTo = "/events/talkshow/register";
      createMutation().onSuccess({ user: { role } });
      assert.equal(routes.pop(), role === "panitia" ? COMMITTEE_DESTINATION : returnTo);
    }
  }
  createRegister().onSuccess({ user: { role: "peserta" } });
  assert.equal(routes.pop(), "/dashboard");
  const { TeamModal } = load("../src/features/competitions/TeamModal.tsx");
  identity = { isSuccess: true, data: { role: "panitia" } };
  assert.equal(TeamModal(), null);
  identity = { isPending: true, data: undefined };
  assert.equal(TeamModal(), null);
  identity = { isSuccess: false, isError: true, data: { role: "peserta" } };
  assert.ok(TeamModal(), "A background identity error must not discard participant modal edits");
  console.log("PASS role journeys: safe redirects, committee/participant/anonymous/loading/error states, profile access, registration routes and team guards");
} finally { Module._load = originalLoad; }
