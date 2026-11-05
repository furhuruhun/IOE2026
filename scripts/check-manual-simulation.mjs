// Run only against a dedicated local dev server with manual simulation enabled.
// Configure its WORKERS_API_URL=http://127.0.0.1:3999 to verify zero forwarding.
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdir, readFile, rmdir, writeFile } from 'node:fs/promises';

const origin = process.env.SIMULATION_ORIGIN ?? 'http://127.0.0.1:3107';
assert(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
let upstream = 0, cookie = '';
const sink = http.createServer((request, response) => { upstream++; response.end('{}'); });
await new Promise(resolve => sink.listen(3999, '127.0.0.1', resolve));
async function call(path, method = 'GET', body, useCookie = cookie) {
  const response = await fetch(origin + path, { method, headers: { ...(useCookie ? { Cookie: useCookie } : {}), ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  assert.equal(response.headers.get('x-ioe-simulation'), 'true', path);
  const set = response.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  return { status: response.status, body: method === 'HEAD' ? null : await response.json() };
}
const control = (action, scenario) => call('/api/simulation', 'POST', { action, scenario });
const login = () => call('/api/auth/login', 'POST', { email: 'participant@example.test', password: 'Simulation123!' });
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ phone: '08123456789', institution: 'Synthetic Institute', domicile: 'Bandung', sessionType: 'seminar' })) data.set(key, value);
  data.set('cvFile', new Blob(['%PDF-1.4 synthetic'], { type: 'application/pdf' }), 'synthetic.pdf');
  return data;
}
try {
  assert.equal((await control('reset')).status, 200);
  assert.equal((await call('/api/auth/me')).body.data, null);
  assert.equal((await login()).status, 200);
  assert.equal((await call('/api/profile', 'PUT', { name: 'Edited Simulation', phone: '08123456789', institution: 'Edited Institute', domicile: 'Bandung' })).status, 200);
  assert.equal((await call('/api/profile')).body.data.name, 'Edited Simulation');
  const [a, b] = await Promise.all([call('/api/events/talkshow/register', 'POST', form()), call('/api/events/talkshow/register', 'POST', form())]);
  assert.deepEqual([a.status, b.status].sort(), [200, 400]);
  assert.equal((await call('/api/dashboard/events')).body.data.length, 1);
  assert.equal((await call('/api/dashboard/calendar')).body.data.length, 1);
  await call('/api/auth/logout', 'POST'); await login();
  assert.equal((await call('/api/events/talkshow')).body.data.isRegisteredByUser, true);
  console.log('PASS login/profile/multipart/duplicate tabs/dashboard/calendar/logout persistence');
  for (const [scenario, expected, persisted] of [['validation', 400, false], ['closed', 400, false], ['full', 400, false], ['already-registered', 400, false], ['before-commit', 503, false], ['after-commit', 502, true], ['dashboard-error', 200, true]]) {
    await control('reset'); await login(); await control('scenario', scenario);
    assert.equal((await call('/api/events/talkshow/register', 'POST', form())).status, expected, scenario);
    const state = JSON.parse(await readFile('out/manual-simulation/state.json', 'utf8'));
    assert.equal(state.registrations.length, persisted ? 1 : 0, scenario);
    if (scenario === 'dashboard-error') assert.equal((await call('/api/dashboard/events')).status, 503);
    console.log('PASS scenario ' + scenario);
  }
  await control('scenario', 'expired'); assert.equal((await call('/api/profile')).status, 401);
  for (const [path, method] of [['/api/unknown.file', 'DELETE'], ['/api', 'GET'], ['/api/auth/google', 'POST'], ['/api/competitions/x/team', 'POST'], ['/api/competitions/x/requirements/y/upload', 'POST'], ['/api/events/talkshow/register', 'PATCH']]) assert.equal((await call(path, method, method === 'POST' ? form() : undefined)).status, 404);
  await writeFile('out/manual-simulation/state.json', 'corrupt');
  assert.equal((await call('/api/events')).status, 503);
  assert.equal((await control('reset')).status, 200);
  await mkdir('out/manual-simulation/state.tmp');
  try { assert.equal((await call('/api/events')).status, 503); }
  finally { await rmdir('out/manual-simulation/state.tmp'); }
  assert.equal((await call('/api/events')).status, 200);
  assert.equal(upstream, 0);
  console.log('PASS expiry/unsupported/dotted paths/storage error/reset; ZERO upstream requests');
} finally { sink.close(); }
