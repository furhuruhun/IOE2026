// Uses the existing local dev server and a separate headless Chrome CDP profile.
// All browser API requests are intercepted; no real accounts or data are changed.
import assert from "node:assert/strict";
import fs from "node:fs";
const origin = process.env.ADMIN_TEST_ORIGIN || "http://localhost:3000";
const target = await fetch("http://127.0.0.1:9237/json/new?about:blank", { method: "PUT" }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
let sequence = 0, failSave = false, failRead = false;
const pending = new Map(), calls = [], errors = [];
const schedules = {
  competitions: [{ id: "comp", name: "Competition test" }],
  timeline: [{ id: "milestone", competitionId: "comp", label: "Final", occursAt: "2027-01-01T20:30:45Z", showInCalendar: 1, sortOrder: 0 }],
  batches: [{ id: "batch", competitionId: "comp", name: "Batch 1", opensAt: "2027-01-01T00:00:00+07:00", closesAt: "2027-02-01T23:59:00+07:00" }],
  events: [{ id: "event", name: "Event test", opensAt: "2027-01-01T00:00:00+07:00", closesAt: "2027-02-01T23:59:00+07:00" }],
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => reject(Error(method + " timeout")), 30000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
socket.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result); }
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  if (message.method !== "Fetch.requestPaused") return;
  const { requestId, request } = message.params;
  const path = new URL(request.url).pathname;
  calls.push({ path, method: request.method, body: request.postData && JSON.parse(request.postData) });
  let result, status = 200;
  if (path === "/api/auth/me" || path === "/api/profile") result = { id: "admin", name: "Admin Test", email: "admin@example.test", role: "panitia", avatarUrl: null, institution: null, phone: null, domicile: null };
  else if (path === "/api/admin/submissions") result = [];
  else if (path === "/api/admin/registrations") result = { teams: [], eventRegistrations: [] };
  else if (path === "/api/admin/schedules") { result = schedules; if (failRead) status = 503; }
  else if (request.method === "PATCH") {
    if (failSave) status = 503;
    else {
      const group = path.includes("/timeline/") ? "timeline" : path.includes("competition-batches") ? "batches" : "events";
      Object.assign(schedules[group][0], JSON.parse(request.postData));
      result = schedules[group][0];
    }
  } else result = [];
  await send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(status === 200 ? { success: true, data: result } : { success: false, error: { code: "SERVER_ERROR", message: "Test failure" } })).toString("base64") });
});
async function js(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function wait(expression) {
  for (let i = 0; i < 160; i++) { if (await js(`!!document.body && (${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 250)); }
  throw Error("Missing state: " + expression + "\n" + await js("document.body.innerText") + "\n" + JSON.stringify(calls));
}
const select = (id, value) => js(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('change',{bubbles:true}))`);
const input = (id, value) => js(`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(document.getElementById(${JSON.stringify(id)}),${JSON.stringify(value)});document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('input',{bubbles:true}))`);
const save = id => js(`document.getElementById(${JSON.stringify(id)}).form.requestSubmit()`);
async function tab(label) {
  const point = await js(`(()=>{const e=Array.from(document.querySelectorAll('[role=tab]')).find(t=>t.textContent===${JSON.stringify(label)});e.scrollIntoView();const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
}
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: origin + "/api/*" }] });
  await send("Network.setCookie", { name: "ioe_token", value: "test-admin", url: origin, httpOnly: true });
  fs.mkdirSync("out/admin-schedules", { recursive: true });
  for (const width of [375, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: origin + "/admin" });
    await wait(`Array.from(document.querySelectorAll('[role=tab]')).some(t=>t.textContent==='Jadwal Deadline')`);
    await tab("Jadwal Deadline");
    await wait(`!!document.getElementById('schedule-competition')`);
    await select("schedule-competition", "comp"); await select("schedule-milestone", "milestone"); await select("schedule-batch", "batch"); await select("schedule-event", "event");
    await wait(`!!document.getElementById('event-closesAt')`);
    assert.equal(await js(`document.getElementById('milestone-occursAt').value`), "2027-01-02T03:30:45");
    assert.equal(await js(`document.documentElement.scrollWidth <= innerWidth`), true);
    await input("event-opensAt", "2029-01-01T00:00:00");
    const before = calls.filter(c => c.method === "PATCH").length;
    await save("event-opensAt"); await wait(`document.body.innerText.includes('Tanggal mulai harus')`);
    assert.equal(calls.filter(c => c.method === "PATCH").length, before);
    await input("event-opensAt", "2027-01-01T00:00:00");
    await input("event-closesAt", `2027-03-${width === 375 ? "01" : "02"}T23:59:00`);
    failSave = true; await save("event-closesAt"); await wait(`document.querySelector('form [role=alert]') && !document.querySelector('form button[disabled]')`);
    assert.equal(await js(`document.getElementById('event-closesAt').value`), `2027-03-${width === 375 ? "01" : "02"}T23:59`);
    failSave = false; await save("event-closesAt"); await wait(`document.body.innerText.includes('Perubahan berhasil disimpan')`);
    assert.deepEqual(calls.filter(c=>c.method==='PATCH').at(-1).body, { closesAt: `2027-03-${width === 375 ? "01" : "02"}T23:59:00+07:00` });
    await input("batch-closesAt", `2027-04-${width === 375 ? "01" : "02"}T23:59:00`); await save("batch-closesAt");
    await wait(`!document.querySelector('form button[disabled]')`);
    await input("milestone-label", `Final ${width}`); await save("milestone-label");
    await wait(`!document.querySelector('form button[disabled]')`);
    const shot = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`out/admin-schedules/${width}.png`, Buffer.from(shot.data, "base64"));
    await tab("Pendaftar");
    await wait(`document.body.innerText.includes('Data pendaftar')`);
    await tab("Reset password");
    await wait(`!!document.getElementById('reset-email')`);
  }
  for (const path of ["/api/admin/events/event/registration-window", "/api/admin/competition-batches/batch/registration-window", "/api/admin/competitions/comp/timeline/milestone"]) {
    assert.ok(calls.some(call => call.method === "PATCH" && call.path === path), path);
  }
  failRead = true;
  await send("Page.navigate", { url: origin + "/admin" });
  await wait(`Array.from(document.querySelectorAll('[role=tab]')).some(t=>t.textContent==='Jadwal Deadline')`);
  await tab("Jadwal Deadline");
  await wait(`document.body.innerText.includes('Jadwal belum dapat dimuat')`);
  failRead = false;
  await js(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Muat ulang jadwal').click()`);
  await wait(`!!document.getElementById('schedule-competition')`);
  schedules.timeline = []; schedules.batches = []; schedules.events = [];
  await js(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Muat ulang jadwal').click()`);
  await select("schedule-competition", "comp");
  await wait(`document.body.innerText.includes('Belum ada milestone') && document.body.innerText.includes('Belum ada batch') && document.body.innerText.includes('Belum ada kegiatan')`);
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log("PASS admin schedules browser: mobile/desktop, WIB, validation, failed-save retention, all three PATCH paths, existing tabs");
} finally { await send("Fetch.disable"); await send("Page.close"); socket.close(); }
