// Read-only, real-proxy browser check. No API fixtures and no backend writes.
// The local server must temporarily select the documented Workers target + real events.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const origin = process.env.UI_ORIGIN ?? "http://localhost:3000", debug = process.env.UI_DEBUG_URL ?? "http://127.0.0.1:9223";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname)) throw new Error("Local frontend required");
if (typeof WebSocket === "undefined") throw new Error("Node 20 requires --experimental-websocket");
const target = await fetch(debug + "/json/new?about:blank", { method: "PUT" }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
let seq = 0;
const pending = new Map(), requests = [], results = [], errors = [], blockedMethods = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq, timer = setTimeout(() => reject(new Error("CDP timeout")), 30000);
    pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
socket.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id); pending.delete(message.id);
    if (message.error) request?.reject(new Error(message.error.message)); else request?.resolve(message.result);
  } else if (message.method === "Fetch.requestPaused") {
    const { requestId, request } = message.params;
    if (!["GET", "HEAD"].includes(request.method)) {
      blockedMethods.push(request.method);
      await send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
    } else await send("Fetch.continueRequest", { requestId });
  } else if (message.method === "Network.responseReceived") {
    const response = message.params.response, url = new URL(response.url);
    if (url.origin === origin && url.pathname.startsWith("/api/")) requests.push({ route: url.pathname, status: response.status, demo: response.headers["X-IOE-Demo-Data"] === "true" });
  } else if (message.method === "Runtime.exceptionThrown") errors.push({ text: message.params.exceptionDetails.text });
});
async function js(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error("Browser evaluation failed");
  return result.result.value;
}
async function wait(expression) {
  for (let i = 0; i < 160; i++) {
    if (await js(`!!document.body && (${expression})`)) return;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error("Read-only browser state did not arrive");
}
async function go(path) {
  await send("Page.navigate", { url: origin + path });
  await wait(`location.pathname === ${JSON.stringify(path.split("?")[0])} && document.readyState === 'complete' && !!document.querySelector('main')`);
}
async function record(width, name) {
  assert.equal(await js("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), true, "viewport overflow");
  results.push({ width, name, status: "PASS", source: "real local frontend and Workers reads; no fixtures" });
  console.log(`PASS ${width}: ${name}`);
}
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  for (const width of [320, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 950, deviceScaleFactor: 1, mobile: false });
    await send("Network.deleteCookies", { name: "ioe_token", url: origin });
    await go("/events/talkshow");
    await wait("document.body.innerText.includes('Informasi pendaftaran event ini belum tersedia')");
    assert.equal(await js("document.querySelectorAll('a[href=\"/events/talkshow/register\"]').length"), 0);
    await record(width, "empty real event list retains unavailable public registration");
    await send("Page.navigate", { url: origin + "/events/talkshow/register" });
    await wait("location.pathname === '/login' && !!document.querySelector('form')");
    assert.equal(await js("new URLSearchParams(location.search).get('redirect')"), "/events/talkshow/register");
    await record(width, "anonymous force-auth retains registration destination");
    await send("Network.setCookie", { name: "ioe_token", value: "phase7-deliberately-invalid", url: origin });
    await send("Page.navigate", { url: origin + "/dashboard" });
    await wait("location.pathname === '/login' && !!document.querySelector('form')");
    await record(width, "invalid session recovers through real backend rejection");
    await go("/confirmation?from=registration");
    await wait("document.body.innerText.includes('Periksa status pendaftaran') && document.activeElement.id === 'main-content'");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    assert.equal(await js("document.activeElement.getAttribute('href')"), "/dashboard");
    await record(width, "direct confirmation stays neutral with keyboard navigation");
    await mkdir("out/phase7", { recursive: true });
    const screenshot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`out/phase7/readonly-${width}.png`, Buffer.from(screenshot.data, "base64"));
  }
  assert.deepEqual(blockedMethods, [], "no mutating request was attempted");
  assert.deepEqual(errors, [], "no browser runtime exceptions");
  assert.ok(requests.some(row => row.route === "/api/events" && row.status === 200 && !row.demo));
} finally {
  await mkdir("out/phase7", { recursive: true });
  await writeFile("out/phase7/browser-readonly.json", JSON.stringify({ results, requests, errors, blockedMethods }, null, 2));
  socket.close(); await fetch(debug + "/json/close/" + target.id);
}
