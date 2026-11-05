// Local rendered UI + real Next API routes, backed by synthetic HTTP responses.
// Run Next dev on 3118 with WORKERS_API_URL=http://127.0.0.1:3998/api,
// NEXT_PUBLIC_PASSWORD_MANAGEMENT_ENABLED=1 and IOE_DEV_MANUAL_TESTING=0.
// Start a disposable Chrome with --remote-debugging-port=9238 first.
import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:3118";
const user = { id: "test-participant", name: "Password Test", email: "test@example.test", role: "peserta", avatarUrl: null, institution: "Test", phone: "08123456789", domicile: "Bandung" };
const calls = [];
const fixture = http.createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  calls.push(req.url);
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/api/profile") return res.end(JSON.stringify({ success: true, data: user }));
  if (req.url === "/api/auth/change-password" && body.currentPassword !== "Original123!") {
    res.statusCode = 401;
    return res.end(JSON.stringify({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Password lama salah" } }));
  }
  if (req.url === "/api/auth/forgot-password") return res.end(JSON.stringify({ success: true, data: { message: "Jika email terdaftar, tautan reset akan dikirim." } }));
  if (["/api/auth/change-password", "/api/auth/reset-password"].includes(req.url)) return res.end(JSON.stringify({ success: true, data: { changed: true } }));
  res.statusCode = 404;
  res.end(JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }));
});
await new Promise(resolve => fixture.listen(3998, "127.0.0.1", resolve));
let socket;
try {
  const endpoint = origin + "/api/auth/change-password";
  assert.equal((await fetch(endpoint, { method: "POST", headers: { Origin: "https://foreign.example" }, body: "{}" })).status, 403);
  assert.equal((await fetch(endpoint, { method: "POST", body: "{}" })).status, 401);
  assert.equal((await fetch(origin + "/api/auth/forgot-password", { method: "POST", body: "invalid-json" })).status, 400);
  const target = await fetch("http://127.0.0.1:9238/json/new?about:blank", { method: "PUT" }).then(response => response.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
  let sequence = 0;
  const pending = new Map(), errors = [];
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(Error(method + " timeout")); }, 60000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result); }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  });
  async function js(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function wait(expression) {
    for (let i = 0; i < 100; i++) {
      if (await js(`!!document.body && (${expression})`)) return;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    throw Error("Missing browser state: " + expression);
  }
  async function go(path, expression) {
    await send("Page.navigate", { url: origin + path });
    await wait(expression);
  }
  async function submit(values) {
    const field = Object.keys(values)[0];
    await wait(`!!document.querySelector('[name="${field}"]') && !document.querySelector('[name="${field}"]').form.querySelector('button[type="submit"]').disabled`);
    await js(`(() => {const values=${JSON.stringify(values)}; for(const [name,value] of Object.entries(values)){const el=document.querySelector('[name="'+name+'"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('[name="'+Object.keys(values)[0]+'"]').form.requestSubmit();})()`);
  }
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await mkdir("out/passwords", { recursive: true });
  for (const width of [375, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Network.setCookie", { name: "ioe_token", value: "synthetic-token", url: origin, httpOnly: true, path: "/" });
    await go("/profile", `!!document.querySelector('a[href="/change-password"]')`);
    assert.equal(await js(`!!document.querySelector('[name="currentPassword"]')`), false);
    await js(`document.querySelector('a[href="/change-password"]').click()`);
    await wait(`location.pathname === '/change-password' && !!document.querySelector('[name="currentPassword"]')`);
    await wait(`document.querySelector('[name="currentPassword"]').id !== ''`);
    await submit({ currentPassword: "wrong", newPassword: "Changed456!", confirmPassword: "Changed456!" });
    await wait(`document.body.innerText.includes('Password lama salah')`);
    assert.equal(await js(`fetch('/api/auth/me').then(r=>r.json()).then(r=>r.data?.id)`), user.id);
    await submit({ currentPassword: "Original123!", newPassword: "Changed456!", confirmPassword: "Different789!" });
    await wait(`document.body.innerText.includes('Konfirmasi password tidak sama')`);
    await submit({ currentPassword: "Original123!", newPassword: "Changed456!", confirmPassword: "Changed456!" });
    await wait(`location.pathname === '/login' && document.body.innerText.includes('Password berhasil diubah')`);
    assert.equal(await js(`fetch('/api/auth/me').then(r=>r.json()).then(r=>r.data)`), null);
    await go("/forgot-password", `!!document.querySelector('[name="email"]') && document.body.innerText.includes('Kirim tautan reset')`);
    await submit({ email: "test@example.test" });
    await wait(`document.body.innerText.includes('Jika email terdaftar, tautan reset akan dikirim.')`);
    assert.equal(await js("document.documentElement.scrollWidth <= innerWidth"), true);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`out/passwords/forgot-${width}.png`, Buffer.from(shot.data, "base64"));
    await go("/reset-password#token=" + "a".repeat(64), `!!document.querySelector('[name="newPassword"]') && location.hash === ''`);
    await submit({ newPassword: "Changed456!", confirmPassword: "Changed456!" });
    await wait(`location.pathname === '/login' && document.body.innerText.includes('Password berhasil diubah')`);
    await go("/reset-password", `!!document.querySelector('[name="newPassword"]')`);
    await submit({ newPassword: "Changed456!", confirmPassword: "Changed456!" });
    await wait(`document.body.innerText.includes('Tautan reset tidak lengkap')`);
  }
  assert.deepEqual(errors, []);
  assert.ok(calls.includes("/api/auth/change-password"));
  assert.ok(calls.includes("/api/auth/forgot-password"));
  assert.ok(calls.includes("/api/auth/reset-password"));
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
  assert.equal((await fetch(origin + "/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) })).status, 503);
  console.log("PASS rendered password flows at 375px/1440px: wrong password preserves cookie, confirmation, change clears cookie, recovery, reset fragment, incomplete link; no runtime exceptions");
} finally {
  socket?.close();
  if (fixture.listening) { fixture.closeAllConnections(); await new Promise(resolve => fixture.close(resolve)); }
}
