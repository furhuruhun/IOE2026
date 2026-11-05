// Production frontend on 3118, synthetic upstream on 3998, disposable Chrome CDP on 9238.
// Start with WORKERS_API_URL=http://127.0.0.1:3998/api; no cloud requests or accounts.
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";
const load = createRequire(import.meta.url), originalLoad = Module._load;
Module._extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
Module._load = function (request, ...args) { return request.startsWith("@/") ? load(path.resolve("src", request.slice(2))) : originalLoad.call(this, request, ...args); };
const { mockCompetitionDetails } = load("../src/mocks/competitionDetails.ts");
const { mockEvents } = load("../src/mocks/events.ts");
Module._load = originalLoad;
const origin = "http://127.0.0.1:3118", calls = [];
const user = role => ({ id: role, role, name: role === "panitia" ? "Test Committee" : "Test Participant", email: role + "@example.test", avatarUrl: null, institution: "Test", phone: "08123456789", domicile: "Bandung" });
const fixture = http.createServer(async (request, response) => {
  let raw = ""; for await (const part of request) raw += part;
  const body = raw && request.headers["content-type"]?.includes("json") ? JSON.parse(raw) : {};
  const role = request.headers.authorization?.includes("panitia") ? "panitia" : "peserta";
  calls.push({ path: request.url, role, method: request.method });
  response.setHeader("Content-Type", "application/json");
  const ok = data => response.end(JSON.stringify({ success: true, data }));
  if (request.url === "/api/auth/login" || request.url === "/api/auth/google") { const loginRole = body.email?.startsWith("panitia") ? "panitia" : "peserta"; return ok({ token: loginRole, user: user(loginRole) }); }
  if (request.url === "/api/profile") return ok(user(role));
  if (request.url.startsWith("/api/dashboard/")) return ok([]);
  if (request.url === "/api/admin/submissions") return ok([]);
  if (request.url === "/api/admin/registrations") return ok({ teams: [], eventRegistrations: [] });
  if (request.url === "/api/competitions") return ok(mockCompetitionDetails);
  const competition = mockCompetitionDetails.find(item => request.url === `/api/competitions/${item.slug}`);
  if (competition) return ok(competition);
  if (request.url.endsWith("/team")) return ok(null);
  if (request.url.endsWith("/team/public")) return ok([]);
  if (request.url === "/api/events") return ok(mockEvents);
  const event = mockEvents.find(item => request.url === `/api/events/${item.slug}`);
  if (event) return ok(event);
  response.statusCode = 404; response.end(JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }));
});
await new Promise(resolve => fixture.listen(3998, "127.0.0.1", resolve));
let socket;
try {
  const target = await fetch("http://127.0.0.1:9238/json/new?about:blank", { method: "PUT" }).then(response => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
  let sequence = 0; const pending = new Map(), errors = [];
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence, timer = setTimeout(() => reject(Error(method + " timeout")), 30000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result); }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  });
  async function js(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function wait(expression) {
    for (let i = 0; i < 120; i++) { if (await js(`!!document.body && (${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 250)); }
    throw Error("Missing browser state: " + expression);
  }
  async function go(url, condition) { await send("Page.navigate", { url: origin + url }); await wait(condition); }
  async function roleCookie(role) { await send("Network.setCookie", { name: "ioe_token", value: role, url: origin, httpOnly: true, path: "/" }); }
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  fs.mkdirSync("out/role-journey", { recursive: true });
  for (const width of [375, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await roleCookie("panitia");
    const start = calls.length;
    await go("/dashboard", `location.pathname === '/admin' && document.body.innerText.includes('Admin Panel') && document.body.innerText.includes('khusus peserta')`);
    assert.equal(calls.slice(start).some(call => call.path.startsWith("/api/dashboard/")), false);
    assert.equal(await js(`document.body.innerText.includes('My Preparation')`), false);
    await go("/events/talkshow/register", `location.pathname === '/admin' && document.body.innerText.includes('Admin Panel')`);
    assert.equal(await js(`!!document.querySelector('form[aria-label="Registration details"]')`), false);
    await go("/events/short-course", `document.body.innerText.includes('Short Course') && !!document.querySelector('a[href="/admin"]')`);
    assert.equal(await js(`!!document.querySelector('a[href="/events/short-course/register"]')`), false);
    if (width === 375) {
      await js(`document.querySelector('button[aria-label="Buka menu"]').click()`);
      await wait(`!!document.querySelector('[role="dialog"] a[href="/admin"]')`);
      await js(`document.querySelector('button[aria-label="Tutup menu"]').click()`);
    }
    const slug = mockCompetitionDetails[0].slug;
    await go(`/competitions/${slug}?openTeamModal=1`, `location.search === '' && document.body.innerText.includes('Explore More') && !!document.querySelector('a[href="/admin"]')`);
    assert.equal(await js(`!!document.querySelector('[role="dialog"]')`), false);
    assert.equal(await js(`Array.from(document.querySelectorAll('button')).some(b=>/^(Register|Join Now)$/.test(b.textContent.trim()))`), false);
    await go("/profile", `document.body.innerText.includes('Test Committee') && !!document.querySelector('a[href="/admin"]')`);
    assert.equal(await js(`!!document.querySelector('a[href="/dashboard"]')`), false);
    assert.equal(await js(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('Edit Personal Info'))`), true);
    const shot = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`out/role-journey/committee-profile-${width}.png`, Buffer.from(shot.data, "base64"));
    await roleCookie("peserta");
    await go("/dashboard", `document.body.innerText.includes('My Preparation') && document.body.innerText.includes('Test Participant')`);
    await go(`/competitions/${slug}?openTeamModal=1`, `!!document.querySelector('[role="dialog"]') && document.body.innerText.includes('Create or Join a Team')`);
    await send("Network.deleteCookies", { name: "ioe_token", url: origin });
    await go("/login", `!!document.querySelector('[name="password"]')`);
    // Hydration completes when session bootstrap has fetched the anonymous identity.
    await new Promise(resolve => setTimeout(resolve, 500));
    await js(`(() => {for(const [name,value] of Object.entries({email:'panitia@example.test',password:'Password123!'})){const el=document.querySelector('[name='+name+']');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('form').requestSubmit();})()`);
    await wait(`location.pathname === '/admin' && document.body.innerText.includes('Admin Panel')`);
    await js(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Logout').click()`);
    await wait(`location.pathname === '/login' && !!document.querySelector('[name="password"]')`);
  }
  assert.deepEqual(errors, []);
  assert.equal(calls.some(call => call.role === "panitia" && call.method === "POST" && /\/events\/.*\/register|\/team/.test(call.path)), false);
  console.log("PASS role journeys at 375px/1440px: committee dashboard/registration redirects, public browsing, mobile navigation, modal suppression, profile access, participant dashboard/modal, committee login and logout; no runtime exceptions");
} finally { socket?.close(); fixture.closeAllConnections(); await new Promise(resolve => fixture.close(resolve)); }
