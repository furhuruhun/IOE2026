// Controlled browser responses only; participant simulator is not expanded.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.PHASE3_ORIGIN ?? 'http://127.0.0.1:3107';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const debug = 'http://127.0.0.1:9237';
const results = [];
await mkdir('out/phase3', { recursive: true });
for (const [mode, width] of [['loading', 1440], ['anonymous', 1440], ['peserta', 320], ['panitia', 1440], ['error', 320], ['unauthorized', 1440], ['forbidden', 1440]]) {
  const target = await fetch(debug + '/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let sequence = 0;
  const pending = new Map(), errors = [];
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence, timer = setTimeout(() => reject(Error('CDP timeout ' + method)), 60000);
      pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.addEventListener('message', async ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      const pathname = new URL(request.url).pathname;
      let status = 200, body = { success: true, data: [] };
      const headers = [{ name: 'Content-Type', value: 'application/json' }];
      if (pathname === '/api/auth/me') {
        if (mode === 'loading') return; // Deliberately unresolved identity.
        const user = { id: 'controlled-user', name: 'Controlled Committee', email: 'fixture@example.test', role: mode === 'panitia' ? 'panitia' : 'peserta', avatarUrl: null, phone: null, institution: null, domicile: null };
        body = { success: true, data: mode === 'anonymous' ? null : user };
        if (['error', 'unauthorized', 'forbidden'].includes(mode)) {
          status = mode === 'error' ? 503 : mode === 'unauthorized' ? 401 : 403;
          body = { success: false, error: { code: mode === 'error' ? 'SERVER_ERROR' : mode === 'unauthorized' ? 'UNAUTHORIZED' : 'ADMIN_ONLY', message: 'Controlled response' } };
        }
        if (['anonymous', 'unauthorized'].includes(mode)) headers.push({ name: 'Set-Cookie', value: 'ioe_simulation_session=; Path=/; Max-Age=0' });
      }
      await send('Fetch.fulfillRequest', { requestId, responseCode: status, responseHeaders: headers, body: Buffer.from(JSON.stringify(body)).toString('base64') });
    }
  });
  async function js(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function wait(expression) {
    for (let i = 0; i < 180; i++) { if (await js(`!!document.body && (${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 300)); }
    throw Error(mode + ' did not reach ' + expression);
  }
  try {
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: false });
    await send('Fetch.enable', { patterns: [{ urlPattern: origin + '/api/*' }] });
    await send('Network.setCookie', { name: 'ioe_simulation_session', value: 'controlled-browser', url: origin });
    await send('Page.navigate', { url: origin + '/admin' });
    const expected = mode === 'loading' ? `document.body.innerText.includes('Memuat sesi')` : mode === 'panitia' ? `document.body.innerText.includes('Admin Panel')` : ['anonymous', 'unauthorized'].includes(mode) ? `location.pathname === '/login'` : mode === 'error' ? `document.body.innerText.includes('Terjadi kesalahan') && document.body.innerText.includes('Coba lagi')` : `location.pathname === '/dashboard' && document.body.innerText.includes('Kamu tidak punya akses')`;
    await wait(expected);
    assert.equal(await js(`document.body.innerText.includes('Admin Panel')`), mode === 'panitia');
    assert.equal(await js('document.documentElement.scrollWidth <= innerWidth'), true);
    if (['peserta', 'forbidden'].includes(mode)) {
      assert.equal(await js(`(() => { const notice=document.querySelector('[role=alert]');const r=notice.getBoundingClientRect();return r.top>=80 && r.bottom<=innerHeight && !!notice.querySelector('button[aria-label="Tutup notifikasi"]'); })()`), true, 'redirect notice must remain visible below navbar');
    }
    assert.deepEqual(errors, []);
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`out/phase3/admin-${mode}-${width}.png`, Buffer.from(screenshot.data, 'base64'));
    results.push({ mode, width, status: 'PASS', runtimeErrors: errors });
    console.log('PASS browser admin ' + mode);
  } finally { await fetch(debug + '/json/close/' + target.id); socket.close(); }
}
await writeFile('out/phase3/admin-browser.json', JSON.stringify({ results, source: 'controlled frontend responses, not backend evidence' }, null, 2));
