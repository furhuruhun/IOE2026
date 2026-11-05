// Controlled FE checks only: no backend modules or network calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const originalResolve = Module._resolveFilename, originalLoad = Module._load;
Module._resolveFilename = function(request, parent, ...rest) {
  return originalResolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, parent, ...rest);
};
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX }, fileName: filename }).outputText, filename);
};
const React = require('react');
let identity, effects = [], redirects = [], cleared = 0, pathname = '/admin';
Module._load = function(request, ...rest) {
  if (request === 'server-only') return {};
  if (request === 'next/navigation') return { usePathname: () => pathname, useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push: url => redirects.push(url) }) };
  if (request === '@tanstack/react-query') return { useQuery: () => identity, useQueryClient: () => ({ clear: () => cleared++ }) };
  // Server rendering uses Zustand's initial snapshot. Model client subscriptions
  // explicitly here; the browser check exercises the actual store after redirect.
  if (request === 'zustand') return { create: initialize => {
    let state;
    state = initialize(patch => { state = { ...state, ...patch }; });
    return selector => selector(state);
  } };
  if (request === 'react') return { ...React, useEffect: effect => effects.push(effect), useCallback: callback => callback };
  return originalLoad.call(this, request, ...rest);
};

const seo = require('../src/lib/siteMetadata.ts');
const keys = ['NODE_ENV', 'IOE_SITE_ENV', 'IOE_PUBLIC_ORIGIN', 'IOE_ALLOW_INDEXING', 'VERCEL_ENV'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
try {
  for (const key of keys) delete process.env[key];
  const checkClosed = () => {
    assert.equal(seo.rootMetadata().robots.index, false);
    assert.equal(seo.publicMetadata('/events').alternates, undefined);
    assert.equal(seo.publicMetadata('/events').openGraph.url, undefined);
    assert.deepEqual(seo.siteSitemap(), []);
    assert.equal(seo.siteRobots().rules.disallow, '/');
  };
  checkClosed();
  process.env.NODE_ENV = 'production'; process.env.IOE_SITE_ENV = 'production'; process.env.IOE_ALLOW_INDEXING = '1';
  for (const origin of ['', 'bad', 'http://ioe.example.org', 'https://localhost', 'https://127.0.0.1', 'https://user:pass@ioe.example.org', 'https://ioe.example.org/path', 'https://ioe.example.org/?q=x', 'https://ioe.example.org/#x', 'https://ioe.example.org:444']) {
    process.env.IOE_PUBLIC_ORIGIN = origin; checkClosed();
  }
  // Reserved example domain is a controlled fixture, never an actual configuration.
  process.env.IOE_PUBLIC_ORIGIN = 'https://ioe.example.org';
  assert.equal(seo.rootMetadata().robots.index, true);
  assert.equal(seo.rootMetadata().openGraph.locale, 'id_ID');
  assert.equal(seo.rootMetadata().title.template, '%s | IOE 2027');
  for (const page of seo.publicPages) {
    const metadata = seo.publicMetadata(page.path);
    assert(metadata.description); assert.equal(metadata.alternates.canonical, new URL(page.path, process.env.IOE_PUBLIC_ORIGIN).href);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.robots.index, true);
    assert.equal(metadata.openGraph.images, undefined);
  }
  assert.equal(seo.siteSitemap().length, 9);
  assert(seo.siteSitemap().every(item => !item.url.includes('/events/workshop')));
  assert.equal(seo.publicMetadata('/events/workshop').robots.index, false);
  assert.equal(seo.publicMetadata('/events/workshop').alternates, undefined);
  assert(seo.siteSitemap().every(item => !/login|register|dashboard|profile|confirmation|admin|api/.test(new URL(item.url).pathname)));
  assert.equal(seo.publicMetadata('/events/unknown').robots.index, false);
  assert.equal(seo.publicMetadata('/events/unknown').alternates, undefined);
  assert.equal(seo.privateMetadata('Admin').robots.index, false);
  process.env.VERCEL_ENV = 'preview'; checkClosed(); delete process.env.VERCEL_ENV;
  process.env.IOE_SITE_ENV = 'preview'; checkClosed(); process.env.IOE_SITE_ENV = 'production';
  process.env.NODE_ENV = 'development'; checkClosed();
  process.env.NODE_ENV = 'production'; process.env.IOE_ALLOW_INDEXING = '0';
  assert.equal(seo.rootMetadata().robots.index, false); assert.deepEqual(seo.siteSitemap(), []);
  console.log('PASS SEO opt-in/origin validation/preview policy/public catalogue/private and unknown metadata');
} finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }

const { renderToStaticMarkup } = require('react-dom/server');
const { AdminGate, AdminAccessNotice } = require('../src/features/auth/AdminGate.tsx');
const base = { isPending: false, isFetching: false, isError: false, data: null, error: null, refetch: async () => {} };
const user = role => ({ id: 'controlled-user', role, name: 'Controlled User' });
for (const [label, state, destination, allowed] of [
  ['loading', { isPending: true }, null, false],
  ['anonymous', {}, '/login?redirect=%2Fadmin', false],
  ['participant', { data: user('peserta') }, '/dashboard', false],
  ['committee', { data: user('panitia') }, null, true],
  ['error', { isError: true, error: new Error('offline') }, null, false],
  ['cached committee error', { data: user('panitia'), isError: true, error: new Error('offline') }, null, false],
  ['committee revalidating', { data: user('panitia'), isFetching: true }, null, false],
  ['unauthorized', { isError: true, error: { code: 'UNAUTHORIZED' } }, '/login?redirect=%2Fadmin', false],
  ['admin-only', { isError: true, error: { code: 'ADMIN_ONLY' } }, '/dashboard', false],
]) {
  identity = { ...base, ...state }; effects = []; redirects = [];
  const html = renderToStaticMarkup(React.createElement(AdminGate));
  assert.equal(html.includes('Admin Panel'), allowed, label);
  // Run the gate effect; Link/Toast DOM effects belong to the browser check.
  effects[0]?.();
  assert.deepEqual(redirects, destination ? [destination] : [], label);
  if (destination === '/dashboard') {
    pathname = '/dashboard';
    assert(renderToStaticMarkup(React.createElement(AdminAccessNotice)).includes('Kamu tidak punya akses'));
    pathname = '/admin';
  }
  if (label === 'error') assert(html.includes('Coba lagi'));
  console.log('PASS admin ' + label);
}
assert(cleared >= 2);
