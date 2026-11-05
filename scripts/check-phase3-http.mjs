import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.PHASE3_ORIGIN ?? 'http://127.0.0.1:3107';
assert(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const indexable = process.env.PHASE3_EXPECT_INDEXING === '1';
const publicPaths = ['/', '/events', '/competitions', '/events/talkshow', '/events/workshop', '/events/short-course', '/events/exhibition', '/competitions/business-case-competition', '/competitions/paper-poster-competition', '/competitions/design-competition'];
const privatePaths = ['/login', '/register', '/profile', '/dashboard', '/admin', '/events/talkshow/register', '/confirmation?from=registration'];
const results = [];
for (const route of [...publicPaths, ...privatePaths, '/events/phase3-missing', '/competitions/phase3-missing']) {
  const cookie = ['/login', '/register'].includes(route) ? '' : 'ioe_token=controlled-metadata; ioe_simulation_session=controlled-metadata';
  const response = await fetch(origin + route, { headers: { Cookie: cookie }, redirect: 'manual' });
  const html = await response.text();
  assert.equal(response.status, 200, route);
  assert.match(html, /<title>[^<]+<\/title>/, route);
  const shouldIndex = indexable && publicPaths.includes(route);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/g) ?? [];
  assert(robots.length, route);
  assert.equal(robots.some(tag => tag.includes('noindex')), !shouldIndex, route);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (indexable && publicPaths.includes(route)) {
    assert(canonical, route);
    assert.equal(new URL(canonical[1]).href, new URL(route, process.env.PHASE3_EXPECT_ORIGIN).href);
    assert(html.includes('property="og:url"'));
  } else assert.equal(canonical, null, route);
  results.push({ route, status: response.status, indexable: shouldIndex, title: html.match(/<title>(.*?)<\/title>/)?.[1] });
}
const robots = await fetch(origin + '/robots.txt').then(r => r.text());
const sitemap = await fetch(origin + '/sitemap.xml').then(r => r.text());
if (indexable) {
  assert(robots.includes('Sitemap: ' + process.env.PHASE3_EXPECT_ORIGIN + '/sitemap.xml'));
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, publicPaths.length);
  assert(!sitemap.includes('/admin') && !sitemap.includes('/register'));
} else { assert(robots.includes('Disallow: /')); assert(!sitemap.includes('<loc>')); }
await mkdir('out/phase3', { recursive: true });
await writeFile(`out/phase3/http-${indexable ? 'indexable-fixture' : 'closed'}.json`, JSON.stringify({ results, robots, sitemap }, null, 2));
console.log(`PASS HTTP metadata for ${results.length} routes, robots and sitemap (${indexable ? 'approved-origin fixture' : 'non-indexable default'})`);
