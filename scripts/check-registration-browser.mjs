// Run against Next dev + isolated headless Chromium (see PHASE6_REGISTRATION.md).
// Creates one temporary dev-only fixture page, removed in finally. No readiness source is edited.
import assert from "node:assert/strict";
import { mkdir, writeFile, unlink, rmdir, access } from "node:fs/promises";

const origin = process.env.UI_ORIGIN ?? "http://localhost:3000";
const debug = process.env.UI_DEBUG_URL ?? "http://127.0.0.1:9223";
const fixtureDir = "src/app/(protected)/phase6-fixture";
const fixtureFile = `${fixtureDir}/page.tsx`;
if (typeof WebSocket === "undefined") throw new Error("Node 20 requires: node --experimental-websocket scripts/check-registration-browser.mjs");
try { await access(fixtureDir); throw new Error("Fixture path already exists; refusing to overwrite"); }
catch (error) { if (error.code !== "ENOENT") throw error; }
await mkdir(fixtureDir);
await writeFile(fixtureFile, `"use client";
import { RegistrationFoundationPage } from "@/features/events/RegistrationFoundationPage";
import { shortCourseContent } from "@/features/events/shortCourseContent";
import { talkshowContent } from "@/features/events/talkshowContent";
if (process.env.NODE_ENV === "development") {
  shortCourseContent.registrationFormReady = typeof window !== "undefined";
  talkshowContent.registrationFormReady = typeof window !== "undefined";
}
export default function Fixture() { return <RegistrationFoundationPage slug="talkshow" />; }
`);

let socket, target, seq = 0, mode = "success", registered = false, sessionActive = true, deadline = "2030-01-01T00:00:00+07:00", posts = 0, reads = 0;
const pending = new Map(), results = [], runtimeErrors = [];
const user = { id: "phase6-user", name: "Fixture User", email: "fixture@example.test", role: "participant", phone: "", institution: "", domicile: "" };
function event(slug = "talkshow") { return { id: "event-fixture", slug, name: "Fixture Event", deadline, isRegisteredByUser: registered, speakers: [{ id: "speaker-a", name: "Speaker A" }, { id: "speaker-b", name: "Speaker B" }] }; }
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq, timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 30000);
    pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function js(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function wait(expression) {
  for (let i = 0; i < 200; i++) {
    if (await js(`!!document.body && (${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Not reached: ${expression}`);
}
async function go(path) {
  await send("Page.navigate", { url: origin + path });
  await wait(`location.pathname === ${JSON.stringify(path.split("?")[0])} && document.readyState === 'complete' && !!document.querySelector('main')`);
}
const form = "document.querySelector('form[aria-label=\"Registration details\"]')";
const submit = `${form}.querySelector('button[type=submit]')`;
async function ready() {
  sessionActive = true;
  await send("Network.setCookie", { name: "ioe_token", value: "fixture", url: origin });
  await go("/phase6-fixture");
  await wait(`${form} && !${submit}.disabled`);
}
async function fill(consent = true) {
  await js(`(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const [name, value] of Object.entries({phone:'08123456789',institution:'Fixture ITB',domicile:'Bandung'})) {
      const input = document.querySelector('[name="'+name+'"]'); set.call(input,value); input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const file = document.querySelector('[name=cvFile]'), data = new DataTransfer();
    data.items.add(new File(['%PDF-1.4 fixture'], 'fixture.pdf', {type:'application/pdf'})); file.files=data.files; file.dispatchEvent(new Event('change',{bubbles:true}));
    ${consent ? "document.querySelector('[name=consentPdp]').click();" : ""}
  })()`);
  await wait("document.body.innerText.includes('fixture.pdf')");
}
async function clickSubmit() { await js(`${submit}.click()`); }
async function record(width, test) {
  assert.equal(await js("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), true, `${test}: overflow`);
  results.push({ width, test, passed: true });
  console.log(`PASS ${width}: ${test}`);
}
try {
  target = await fetch(debug + "/json/new?about:blank", { method: "PUT" }).then(response => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
  socket.addEventListener("message", async ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id); pending.delete(message.id);
      if (message.error) request?.reject(new Error(message.error.message)); else request?.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails);
    else if (message.method === "Fetch.requestPaused") {
      const { requestId, request } = message.params, path = new URL(request.url).pathname;
      let value = null, code = 200, error;
      if (path === "/api/auth/me" || path === "/api/profile") value = sessionActive ? user : null;
      else if (path.endsWith("/register") && request.method === "POST") {
        posts++; await new Promise(resolve => setTimeout(resolve, 350));
        if (mode === "lost") { await send("Fetch.failRequest", { requestId, errorReason: "ConnectionReset" }); return; }
        if (mode === "validation") { code = 400; error = { code: "VALIDATION_ERROR", message: "invalid", fields: { phone: "Fixture phone error", institution: "Fixture institution error", domicile: "Fixture domicile error", unexpected: "unknown" } }; }
        else if (mode === "malformed") { code = 400; error = { code: "VALIDATION_ERROR", message: "invalid", fields: { phone: 42 } }; }
        else if (["QUOTA_FULL", "REGISTRATION_CLOSED", "ALREADY_REGISTERED", "UNAUTHORIZED"].includes(mode)) {
          code = mode === "UNAUTHORIZED" ? 401 : 400; error = { code: mode, message: "Fixture rejection" };
          if (code === 401) { sessionActive = false; await send("Network.deleteCookies", { name: "ioe_token", url: origin }); }
        }
        else { registered = true; value = { registrationId: "reg-fixture" }; }
      } else if (path === "/api/events") value = [event()];
      else if (path.startsWith("/api/events/")) { reads++; value = event(path.split("/").at(-1)); }
      else if (path.startsWith("/api/dashboard/")) value = [];
      await send("Fetch.fulfillRequest", { requestId, responseCode: code,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(JSON.stringify(error ? { success: false, error } : { success: true, data: value })).toString("base64") });
    }
  });
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: origin + "/api/*" }] });
  await send("Network.setCookie", { name: "ioe_token", value: "fixture", url: origin });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: "localStorage.setItem('ioe-theme','light')" });
  for (const width of [320, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 950, deviceScaleFactor: 1, mobile: false });
    registered = false; deadline = "2030-01-01T00:00:00+07:00"; mode = "success";
    for (const slug of ["talkshow", "short-course", "workshop", "exhibition"]) {
      await go(`/events/${slug}/register`); await wait(`${form} && ${submit}.disabled`);
      await js(`${form}.requestSubmit()`); assert.equal(posts, 0);
    }
    await record(width, "direct routes retain disabled readiness");
    await go("/confirmation?from=registration");
    await wait("document.body.innerText.includes('Periksa status pendaftaran')");
    await wait("document.activeElement.id === 'main-content'");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    assert.equal(await js("document.activeElement.getAttribute('href')"), "/dashboard");
    await record(width, "direct confirmation is neutral and keyboard accessible");
    await send("Page.navigate", { url: origin + "/confirmation" });
    await wait("location.pathname === '/' && !!document.querySelector('main')");
    await record(width, "confirmation without navigation marker redirects home");

    for (const initial of ["closed", "registered"]) {
      deadline = initial === "closed" ? "2020-01-01T00:00:00+07:00" : "2030-01-01T00:00:00+07:00";
      registered = initial === "registered";
      await go("/phase6-fixture"); await wait(`${form} && ${submit}.disabled && document.body.innerText.includes(${JSON.stringify(initial === "closed" ? "Pendaftaran untuk batch ini sudah ditutup" : "Kamu sudah terdaftar")})`);
      await record(width, `initial ${initial} state`);
    }
    deadline = "2030-01-01T00:00:00+07:00"; registered = false;

    await ready(); await clickSubmit();
    await wait("document.querySelector('[name=phone]').getAttribute('aria-invalid') === 'true'");
    assert.equal(await js("document.activeElement.name"), "phone");
    assert.equal(posts, 0); await record(width, "required errors and focus");
    await fill(false); await clickSubmit();
    await wait("document.querySelector('[name=consentPdp]').getAttribute('aria-invalid') === 'true'");
    assert.equal(posts, 0); await record(width, "consent required");

    await ready(); await fill();
    await js("document.querySelector('[name=sessionType][value=workshop]').click()");
    await wait("!!document.querySelector('[name=speakerId]')");
    await clickSubmit(); await wait("document.body.innerText.includes('Pilih speaker')");
    assert.equal(posts, 0); await record(width, "workshop requires speaker radio selection");

    for (const response of ["validation", "malformed"]) {
      mode = response; await ready(); await fill(); const before = posts; await clickSubmit();
      await wait(`${form}.getAttribute('aria-busy') === 'false' && document.body.innerText.includes('Ada isian yang belum sesuai')`);
      assert.equal(posts, before + 1);
      assert.equal(await js("document.querySelector('[name=phone]').value"), "08123456789");
      assert.equal(await js("document.querySelector('[name=consentPdp]').checked"), true);
      assert.equal(await js("document.body.innerText.includes('fixture.pdf')"), true);
      if (response === "validation") {
        assert.equal(await js("document.activeElement.name"), "phone");
        assert.equal(await js("document.querySelectorAll('input[aria-invalid=true]').length"), 3);
      }
      await record(width, `${response} response preserves edits/files and gives feedback`);
    }
    mode = "success"; await ready(); await fill(); deadline = "2020-01-01T00:00:00+07:00";
    const beforeClosed = posts; await clickSubmit();
    await wait("document.body.innerText.includes('Pendaftaran untuk batch ini sudah ditutup')"); assert.equal(posts, beforeClosed);
    await record(width, "deadline change caught before POST"); deadline = "2030-01-01T00:00:00+07:00";
    await ready(); await fill(); registered = true; const beforeRegistered = posts; await clickSubmit();
    await wait("document.body.innerText.includes('Kamu sudah terdaftar')"); assert.equal(posts, beforeRegistered);
    await record(width, "membership change caught before POST"); registered = false;
    for (const rejection of ["QUOTA_FULL", "REGISTRATION_CLOSED", "ALREADY_REGISTERED"]) {
      mode = rejection; await ready(); await fill(); const before = posts; await clickSubmit();
      await wait(`${form}.getAttribute('aria-busy') === 'false' && ${submit}.disabled`);
      assert.equal(posts, before + 1); await record(width, rejection);
    }
    mode = "lost"; await ready(); await fill(); const beforeLost = posts; await clickSubmit();
    await wait("document.body.innerText.includes('Status pengiriman belum dapat dipastikan')");
    assert.equal(await js(`${submit}.disabled`), true);
    await js("[...document.querySelectorAll('button')].find(b=>b.textContent==='Periksa status pendaftaran').click()");
    await wait("document.body.innerText.includes('pengiriman ulang tetap dinonaktifkan')");
    assert.equal(posts, beforeLost + 1); await record(width, "lost response blocks retry; status read never resubmits");

    mode = "UNAUTHORIZED"; await ready(); await fill(); await clickSubmit();
    await wait("location.pathname === '/login'");
    assert.equal(await js("new URLSearchParams(location.search).get('redirect')"), "/events/talkshow/register");
    await record(width, "expired-session redirect retains registration destination");

    mode = "success"; await go("/events/talkshow"); await ready(); await fill(); const beforeSuccess = posts, beforeReads = reads;
    await js(`${form}.requestSubmit(); ${form}.requestSubmit();`);
    await wait("location.pathname === '/confirmation' && location.search === '?from=registration' && document.body.innerText.includes('Pendaftaran berhasil')");
    assert.equal(posts, beforeSuccess + 1); assert.ok(reads >= beforeReads + 2, "preflight + invalidated event read");
    await wait("document.activeElement.id === 'main-content'");
    await record(width, "single POST, cache refresh, replace navigation and confirmed result");
    await mkdir("out/phase6", { recursive: true });
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`out/phase6/confirmation-${width}.png`, Buffer.from(screenshot.data, "base64"));
    await send("Page.navigateToHistoryEntry", { entryId: (await send("Page.getNavigationHistory")).entries.at(-2).id });
    await wait("location.pathname === '/events/talkshow'");
    await record(width, "replace removes completed form from Back history");
    await go("/confirmation?from=registration");
    await send("Page.reload"); await wait("document.body.innerText.includes('Periksa status pendaftaran')");
    await record(width, "refresh does not claim success from URL");
    posts = 0;
  }
  assert.deepEqual(runtimeErrors, [], "no browser runtime exceptions");
} finally {
  try {
    await mkdir("out/phase6", { recursive: true });
    await writeFile("out/phase6/browser-results.json", JSON.stringify({ results, runtimeErrors }, null, 2));
    if (socket?.readyState === 1) {
      const screenshot = await send("Page.captureScreenshot", { format: "png" });
      await writeFile("out/phase6/last-screen.png", Buffer.from(screenshot.data, "base64"));
      await writeFile("out/phase6/last-screen.txt", await js("document.body?.innerText ?? ''"));
    }
  } finally {
    socket?.close();
    if (target) await fetch(debug + "/json/close/" + target.id).catch(() => {});
    await unlink(fixtureFile); await rmdir(fixtureDir);
  }
}
