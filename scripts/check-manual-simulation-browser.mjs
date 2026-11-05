import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.SIMULATION_ORIGIN ?? 'http://127.0.0.1:3107';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const target = await fetch('http://127.0.0.1:9237/json/new?about:blank', { method: 'PUT' }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map(), errors = [], results = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => reject(Error(method + ' timeout')), 90000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(Error(message.error.message)); else task?.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
});
async function js(expression) {
  const value = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (value.exceptionDetails) throw Error(JSON.stringify(value.exceptionDetails));
  return value.result.value;
}
async function wait(expression) {
  for (let i = 0; i < 240; i++) { if (await js(`!!document.body && (${expression})`)) return; await new Promise(resolve => setTimeout(resolve, 500)); }
  throw Error('Missing browser state: ' + expression);
}
async function go(path) {
  await send('Page.navigate', { url: origin + path });
  await wait(`!!document.querySelector('aside[aria-label="Local simulation controls"]') && document.readyState === 'complete'`);
}
async function api(path, method = 'GET', body) {
  return js(`fetch(${JSON.stringify(path)}, {method:${JSON.stringify(method)},headers:{'Content-Type':'application/json'},body:${body ? JSON.stringify(JSON.stringify(body)) : 'undefined'}}).then(r=>r.json())`);
}
try {
  await send('Page.enable'); await send('Runtime.enable');
  await mkdir('out/manual-simulation/evidence', { recursive: true });
  for (const width of [320, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor: 1, mobile: false });
    await go('/login'); await api('/api/simulation', 'POST', { action: 'reset' }); await go('/login');
    await wait(`!!document.querySelector('[name=email]')`);
    await js(`(() => {const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; for(const [name,value] of Object.entries({email:'participant@example.test',password:'Simulation123!'})){const el=document.querySelector('[name='+name+']');set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));} document.querySelector('form').requestSubmit();})()`);
    await wait(`location.pathname === '/dashboard' && document.body.innerText.includes('Simulation Participant')`);
    await go('/profile'); await wait(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('Edit Personal Info'))`);
    await js(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Edit Personal Info')).click()`);
    await wait(`!!document.querySelector('[name=name]')`);
    await js(`(() => {const el=document.querySelector('[name=name]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'Manual Participant');el.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('form').requestSubmit();})()`);
    await wait(`document.body.innerText.includes('Manual Participant')`);
    await go('/events/talkshow'); await wait(`!!document.querySelector('a[href="/events/talkshow/register"]')`);
    await go('/events/talkshow/register');
    await wait(`!!document.querySelector('form[aria-label="Registration details"] button[type=submit]:not(:disabled)')`);
    await js(`document.querySelector('form[aria-label="Registration details"]').requestSubmit()`);
    await wait(`!!document.querySelector('[aria-invalid=true]')`);
    await js(`(() => {const f=document.querySelector('[name=cvFile]'),d=new DataTransfer();d.items.add(new File(['%PDF-1.4 synthetic'],'synthetic.pdf',{type:'application/pdf'}));f.files=d.files;f.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[name=consentPdp]').click();})()`);
    await js(`document.querySelector('form[aria-label="Registration details"]').requestSubmit()`);
    await wait(`location.pathname === '/confirmation' && document.body.innerText.includes('Talkshow')`);
    const events = await api('/api/dashboard/events'); assert.equal(events.data.length, 1);
    await send('Page.reload'); await wait(`document.body.innerText.includes('Periksa status pendaftaran')`);
    await go('/dashboard'); await wait(`document.body.innerText.includes('Manual Participant')`);
    assert.equal((await api('/api/dashboard/calendar')).data.length, 1);
    if (width < 768) {
      // The native disclosure exposes the same Radix tab triggers on mobile.
      await js(`(() => { if (!Array.from(document.querySelectorAll('[role=tab]')).some(t=>t.textContent.includes('Registered Events') && t.getBoundingClientRect().width)) { const b=Array.from(document.querySelectorAll('button[aria-expanded]')).find(b=>b.textContent.includes('Home'));b?.click(); } })()`);
    }
    await js(`(() => {const tab=Array.from(document.querySelectorAll('[role=tab]')).find(t=>t.textContent.includes('Registered Events') && t.getBoundingClientRect().width);tab?.focus();tab?.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()`);
    await wait(`!!document.querySelector('#registered-events-heading') && document.body.innerText.includes('[Simulation] Talkshow')`);
    assert.equal(await js('document.documentElement.scrollWidth <= innerWidth'), true);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`out/manual-simulation/evidence/dashboard-${width}.png`, Buffer.from(shot.data, 'base64'));
    await api('/api/auth/logout', 'POST'); await go('/events/talkshow/register');
    await wait(`location.pathname === '/login'`);
    results.push({ width, status: 'PASS', journey: 'login, profile, event, validation, multipart, confirmation, neutral refresh, dashboard/calendar, logout protection' });
    console.log('PASS browser participant journey ' + width);
  }
  assert.deepEqual(errors, []);
  await writeFile('out/manual-simulation/evidence/browser.json', JSON.stringify({ results, errors }, null, 2));
} finally { await fetch('http://127.0.0.1:9237/json/close/' + target.id); socket.close(); }
