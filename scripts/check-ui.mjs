// Dependency-free rendered UI check. Start Next dev and headless Chrome with
// --remote-debugging-port=9223, then run: node --experimental-websocket scripts/check-ui.mjs
// API fixtures exist only in this isolated browser tab; no backend is changed.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.UI_ORIGIN ?? "http://localhost:3000";
const debug = process.env.UI_DEBUG_URL ?? "http://localhost:9223";
const target = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then(r => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
let sequence = 0;
const browserErrors = [];
const pending = new Map();
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method} ${(params.expression ?? "").slice(0,120)}`)); }, 20000);
    pending.set(id, {
      resolve: value => { clearTimeout(timeout); resolve(value); },
      reject: error => { clearTimeout(timeout); reject(error); },
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const user = { id: "ui-check", name: "UI Preview", email: "preview@example.com", role: "peserta", avatarUrl: null, institution: "Preview", phone: "081234567890", domicile: "Bandung" };
const events = ["talkshow", "workshop", "short-course"].map(slug => ({ id: `event-${slug}`, slug, name: slug === "short-course" ? "Short Course" : slug, deadline: "2027-03-19T23:59:00+07:00", isRegisteredByUser: false }));
let authenticated = false;
let scenario = "populated";
const longCompetitionName = "UI fixture: Business Case Competition with a deliberately long name";
const journey = [{ competitionId: "preview-competition", slug: "business-case-competition", name: longCompetitionName, logoUrl: null, status: "in_progress", dueDate: "2027-03-15T23:59:00+07:00" }];
const assignments = [
  {requirementId:"late",dueDate:"2027-04-01T00:00:00+07:00",status:"pending"},
  {requirementId:"invalid",dueDate:"not-a-date",status:"rejected"},
  {requirementId:"tie-1",dueDate:"2027-01-01T00:00:00+07:00",status:"accepted"},
  {requirementId:"missing",status:"pending"},
  {requirementId:"tie-2",dueDate:"2026-12-31T17:00:00Z",status:"pending"},
].map(item=>({competitionSlug:"business-case-competition",competitionName:longCompetitionName,name:`UI fixture document ${item.requirementId}`,type:"individual",acceptedFormats:["pdf"],...item}));
socket.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request?.reject(new Error(message.error.message));
    else request?.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails);
  } else if (message.method === "Fetch.requestPaused") {
    const { requestId, request } = message.params;
    const path = new URL(request.url).pathname;
    let body = [];
    let status = 200;
    if (path === "/api/auth/me") { body = authenticated ? user : null; }
    else if (path === "/api/profile") body = user;
    else if (path === "/api/events") body = events;
    else if (path.startsWith("/api/events/")) body = events.find(event => path.endsWith(event.slug));
    else if (path === "/api/dashboard/journey") body = scenario === "empty" ? [] : journey;
    else if (path === "/api/dashboard/assignments") body = scenario === "empty" ? [] : assignments;
    else if (path === "/api/dashboard/events") body = scenario === "empty" ? [] : [{eventId:"event-talkshow",slug:"talkshow",name:longCompetitionName,sessionType:"seminar",date:"2027-03-15T23:59:00+07:00"}];
    else if (path === "/api/dashboard/calendar") body = scenario === "empty" ? [] : [{date:new Date().toISOString(),label:"UI fixture schedule",type:"competition",refId:"preview-competition",logoUrl:null}];
    if (scenario === "error" && (path.startsWith("/api/dashboard/") || path === "/api/profile")) status = 503;
    if (scenario === "loading" && path.startsWith("/api/dashboard/")) await new Promise(resolve => setTimeout(resolve, 4000));
    await send("Fetch.fulfillRequest", { requestId, responseCode: status,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: Buffer.from(JSON.stringify(status >= 400 ? { success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR", message: "UI fixture failure" } } : { success: true, data: body })).toString("base64") });
  }
});
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function navigate(path) {
  await send("Page.navigate", { url: `${origin}${path}` });
  for (let i = 0; i < 80; i++) {
    await new Promise(resolve => setTimeout(resolve, 250));
    if (await evaluate(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && !!document.querySelector('main')`)) break;
  }
  await evaluate("document.fonts.ready.then(() => new Promise(resolve => setTimeout(resolve, 900)))");
  assert.equal(await evaluate("location.pathname"), path);
  assert.ok(await evaluate("!!document.querySelector('main#main-content') && !!document.querySelector('.skip-link')"), `Preview did not finish rendering ${path}`);
}
function contrast(a, b) {
  const luminance = hex => {
    const rgb = hex.trim().replace("#", "").match(/../g).map(channel => parseInt(channel, 16) / 255)
      .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(expression, message) {
  for (let i = 0; i < 80; i++) {
    if (await evaluate(expression)) return;
    await wait(100);
  }
  assert.fail(message);
}
async function press(key) {
  const keyCode = { Enter: 13, Escape: 27, Tab: 9, ArrowDown: 40 }[key];
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: keyCode, text: key === "Enter" ? "\r" : undefined });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: keyCode });
  await wait(100);
}
async function selectDashboardTab(label, width) {
  if (width < 768) {
    await evaluate("document.querySelector('main button[aria-expanded]').focus(); if(document.querySelector('main button[aria-expanded]').getAttribute('aria-expanded')==='false') document.querySelector('main button[aria-expanded]').click()");
  }
  await evaluate(`[...document.querySelectorAll('main [role=tab]')].find(e => e.textContent === ${JSON.stringify(label)}).focus()`);
  await press("Enter");
  await waitFor(`[...document.querySelectorAll('main [role=tab][aria-selected=true]')].some(e=>e.textContent===${JSON.stringify(label)})`, "tab selection");
  if (width < 768) {
    assert.ok(await evaluate(`document.activeElement === document.querySelector('main button[aria-expanded=false]') && document.activeElement.textContent.includes(${JSON.stringify(label)})`), "selection restores focus and names the mobile section: " + JSON.stringify(await evaluate("({active:document.activeElement.outerHTML.slice(0,250),menu:document.querySelector('main button[aria-expanded]').outerHTML.slice(0,350)})")));
  }
}
async function assertPaintContrast(selector) {
  const paint = await evaluate(`(()=>{
    const e=document.querySelector(${JSON.stringify(selector)}); if(!e) return null;
    const c=document.createElement('canvas'); c.width=c.height=1; const x=c.getContext('2d');
    const ancestors=[]; for(let p=e;p;p=p.parentElement) ancestors.unshift(p);
    x.fillStyle='#fff'; x.fillRect(0,0,1,1);
    for(const p of ancestors){x.fillStyle=getComputedStyle(p).backgroundColor;x.fillRect(0,0,1,1);}
    const hex=()=>[...x.getImageData(0,0,1,1).data].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');
    const bg=hex();x.fillStyle=getComputedStyle(e).color;x.fillRect(0,0,1,1);return {fg:hex(),bg};
  })()`);
  assert.ok(paint, `${selector} rendered for contrast check`);
  assert.ok(contrast(paint.fg, paint.bg) >= 4.5, `${selector} contrast: ${contrast(paint.fg, paint.bg)}`);
}
const results = [];
try {
  await send("Page.enable");
  await send("Page.bringToFront");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: `${origin}/api/*` }] });
  await mkdir(".next/ui-review", { recursive: true });
  for (const width of (process.env.UI_WIDTHS?.split(",").map(Number) ?? [320, 390, 768, 1440])) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const path of (process.env.UI_PATHS?.split(",") ?? ["/", "/events", "/events/short-course", "/events/talkshow", "/events/workshop", "/competitions", "/login", "/dashboard", "/events/short-course/register"])) {
      scenario = "populated";
      authenticated = path === "/dashboard" || path.endsWith("/register");
      await send("Network.deleteCookies", { name: "ioe_token", url: origin });
      if (authenticated) await send("Network.setCookie", { name: "ioe_token", value: "ui-preview", url: origin });
      await navigate(path);
      const layout = await evaluate(`({ width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        mainCount: document.querySelectorAll('#main-content').length,
        skipTarget: !!document.querySelector(document.querySelector('.skip-link').getAttribute('href')) })`);
      if (layout.scroll > layout.client + 1) console.log(await evaluate("[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();let p=e.parentElement;while(p && p!==document.body){if(['hidden','clip','auto','scroll'].includes(getComputedStyle(p).overflowX))return false;p=p.parentElement;}return r.right>document.documentElement.clientWidth+1 && !e.closest('[aria-hidden=true]')}).slice(0,25).map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'svg',right:e.getBoundingClientRect().right}))"));
      assert.ok(layout.scroll <= layout.client + 1, `${path} overflows at ${width}: ${layout.scroll}`);
      assert.equal(layout.mainCount, 1, `${path}: one skip target`);
      assert.ok(layout.skipTarget);
      assert.equal(await evaluate("document.querySelectorAll('header [role=switch]').length"),0,"theme preview is not public navigation");
      assert.equal(await evaluate("document.querySelectorAll('footer a[href=\"#\"]').length"),0,"placeholder socials are not destinations");
      const palette = await evaluate("Object.fromEntries(['neutral-100','neutral-700','neutral-800','neutral-200','secondary-800','secondary-1000','secondary-300','primary-900','success-900','warning-900','secondary-900','error-800'].map(name=>[name,getComputedStyle(document.documentElement).getPropertyValue('--color-'+name)]))");
      for (const [foreground, background] of [['neutral-700','neutral-100'],['secondary-800','neutral-100'],['secondary-1000','secondary-300'],['neutral-100','primary-900'],['neutral-800','neutral-200'],['neutral-100','success-900'],['neutral-100','warning-900'],['neutral-100','secondary-900'],['neutral-100','error-800']]) {
        assert.ok(contrast(palette[foreground],palette[background]) >= 4.5, `${foreground} on ${background}: contrast`);
      }
      const targets = await evaluate(`[...document.querySelectorAll('button[aria-label="Buka menu"],button[role="switch"]')].filter(b=>b.getClientRects().length).map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))`);
      assert.ok(targets.every(r=>r.w >= 44 && r.h >= 44), `${path}: touch targets`);
      if (path === "/") {
        const activeSlide = () => evaluate("document.querySelector('button[aria-current=true]').getAttribute('aria-label')");
        if (width === 320) {
          const before = await activeSlide(); await wait(6500);
          assert.notEqual(await activeSlide(),before,"six-second autoplay remains active");
          const point = await evaluate("(()=>{const r=document.querySelector('[aria-roledescription=carousel] [role=group]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+100}})()");
          await send("Input.dispatchMouseEvent",{type:"mouseMoved",...point});
          const hoveredSlide=await activeSlide(); await wait(6500);
          assert.equal(await activeSlide(),hoveredSlide,"hover still pauses autoplay");
          await send("Input.dispatchMouseEvent",{type:"mouseMoved",x:0,y:0});
          await wait(6500); assert.notEqual(await activeSlide(),hoveredSlide,"leaving hover resumes autoplay");
          const gesture=await evaluate("(()=>{const r=document.querySelector('[aria-roledescription=carousel] [role=group]').getBoundingClientRect();return {x:r.x+r.width*.8,end:r.x+r.width*.2,y:r.y+100}})()");
          const beforeSwipe=await activeSlide();
          await send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:gesture.x,y:gesture.y}]});
          await send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:gesture.end,y:gesture.y}]});
          await send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
          await waitFor(`document.querySelector('button[aria-current=true]').getAttribute('aria-label')!==${JSON.stringify(beforeSwipe)}`,"touch swipe still changes slides");
          await wait(650);
        }
        for (let slide=0;slide<3;slide++) {
          await evaluate(`document.querySelectorAll('button[aria-label^="Ke slide"]')[${slide}].click()`);
          await waitFor(`document.querySelectorAll('button[aria-label^="Ke slide"]')[${slide}].getAttribute('aria-current')==='true'`,"manual pagination");
          assert.ok(await evaluate("['/competitions','/events','#timeline'].every(href=>[...document.querySelectorAll('nav[aria-label=\"Jelajahi kegiatan IOE\"] a')].some(a=>a.getAttribute('href')===href && a.getClientRects().length && !a.closest('[aria-hidden=true]')))"),"discovery remains available on every slide");
          await wait(650);
        }
        await evaluate("new Promise(resolve => { document.querySelector('[aria-roledescription=carousel] [role=group]').focus(); setTimeout(resolve, 100); })");
        assert.ok(await evaluate("![...document.querySelectorAll('button')].some(b => /Jeda carousel|Putar otomatis/.test(b.textContent))"), "no visible rotation button");
        assert.ok(await evaluate("new Promise(resolve => { const active = () => document.querySelector('button[aria-current=true]')?.getAttribute('aria-label'); const before = active(); setTimeout(() => resolve(before === active()), 6500); })"), "keyboard focus pauses carousel");
        const targets = await evaluate("[...document.querySelectorAll('button[aria-label^=\"Ke slide\"]')].map(b=>b.getBoundingClientRect().height)");
        assert.ok(targets.every(height => height >= 44));
      }
      if (path === "/events") {
        const dots = await evaluate("[...document.querySelectorAll('button[aria-label^=\"Tampilkan dokumentasi\"]')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))");
        assert.ok(dots.length > 0 && dots.every(r=>r.w>=44 && r.h>=44), "documentation targets");
      }
      if (path === "/dashboard") {
        assert.ok(await evaluate("document.querySelector('main').innerText.includes('UI Preview')"), "data: User fixture renders the user name");
        assert.equal(await evaluate("document.querySelectorAll('main h1').length"), 1, "one dashboard heading");
        assert.ok(await evaluate("[...document.querySelectorAll('main h2')].map(e=>e.textContent).indexOf('My Preparation') < [...document.querySelectorAll('main h2')].map(e=>e.textContent).indexOf('My Journey')"),"Preparation precedes Journey in document order");
        assert.deepEqual(await evaluate("[...document.querySelectorAll('[data-requirement-id]')].map(e=>e.dataset.requirementId)"),["tie-1","tie-2","late","invalid","missing"],"stable deadlines, all statuses/items and invalid dates last");
        assert.ok(await evaluate("document.querySelector('main').textContent.includes('tidak hanya bulan yang ditampilkan')"),"calendar schedule scope is explicit");
        assert.equal(await evaluate("document.querySelectorAll('main .grid-cols-7 button').length"), 0, "dates are not inert buttons");
        await assertPaintContrast('main [aria-current="date"]');
        assert.ok(await evaluate("[...document.querySelectorAll('main .truncate')].every(e=>e.scrollWidth<=e.clientWidth)"), "no truncated dashboard names");
        if (width < 768) {
          assert.ok(await evaluate("document.querySelector('[aria-label=Assignments] h2').getBoundingClientRect().top < 700"), "mobile preparation is visible earlier");
          await evaluate("document.querySelector('main button[aria-expanded]').click()");
          assert.deepEqual(await evaluate("[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i)"), [], "unique tab IDs with mobile navigation open");
          await evaluate("document.querySelector('main [role=tab][aria-selected=true]').focus()");
          await press("Escape");
          assert.ok(await evaluate("document.activeElement===document.querySelector('main button[aria-expanded=false]')"), "Escape restores dashboard disclosure focus");
        }
        if (width < 1280) {
          await evaluate("document.querySelector('header button[aria-label=\"Buka menu\"]').focus();document.querySelector('header button[aria-label=\"Buka menu\"]').click()");
          await waitFor("!!document.querySelector('[role=dialog]')", "drawer opens");
          await press("Escape");
          await waitFor("!document.querySelector('[role=dialog]')", "drawer closes");
          assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"), "Buka menu", "Escape restores opener focus");
        }
        await selectDashboardTab("Registered Events", width);
        await waitFor("document.querySelector('main h3')?.textContent.includes('UI fixture')", "registered fixture loaded");
        assert.ok(await evaluate("!document.querySelector('main h3').classList.contains('truncate')"), "long event name wraps");
        await selectDashboardTab("Home", width);
      }
      if (path === "/events/short-course") {
        assert.ok(await evaluate("document.querySelector('#short-course-title').closest('section').innerText.includes('Hours')"), "countdown fixture rendered");
        assert.ok(await evaluate("[...document.querySelector('#short-course-title').closest('section').querySelectorAll('*')].every(e => {const r=e.getBoundingClientRect(); return r.width===0 || (r.left >= -1 && r.right <= innerWidth+1)})"), `hero content fits ${width}`);
      }
      if (path === "/login") {
        await evaluate("document.querySelector('input[type=password]').focus()");
        await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"), "Tampilkan password");
      }
      if (path.endsWith("/register")) {
        await assertPaintContrast("form [role=note]");
        assert.ok(await evaluate("!!document.querySelector('form [role=note]') && document.querySelector('form').innerText.startsWith('Pengiriman pendaftaran belum tersedia')"));
      }
      const image = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const filename = `${width}-${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}.png`;
      await writeFile(`.next/ui-review/${filename}`, Buffer.from(image.data, "base64"));
      results.push({ path, ...layout });
      console.log(`PASS ${width} ${path}`);
    }
    authenticated = true;
    await send("Network.setCookie", {name:"ioe_token", value:"ui-preview", url:origin});
    scenario = "loading";
    await navigate("/dashboard");
    assert.ok(await evaluate("document.querySelector('[aria-label=Assignments] [role=status]').textContent.includes('Loading preparation')"), "preparation loading is announced");
    await waitFor("document.querySelector('[aria-label=Assignments]').textContent.includes('UI fixture document')", "loading completes");
    await waitFor("!document.querySelector('main [aria-busy=true]')", "dashboard loading completes");
    scenario = "error";
    await navigate("/dashboard");
    await waitFor("document.querySelector('[aria-label=Assignments]').textContent.includes('Unable to load your preparation')", "local preparation error");
    assert.equal(await evaluate("document.querySelectorAll('main [role=alert]').length"), 0, "query failures stay local instead of parallel toasts");
    scenario = "populated";
    await evaluate("document.querySelector('[aria-label=Assignments] button').click()");
    await waitFor("document.querySelector('[aria-label=Assignments]').textContent.includes('UI fixture document')", "retry recovers preparation");
    scenario = "empty";
    await navigate("/dashboard");
    await waitFor("document.querySelector('main').textContent.includes('No competitions yet')", "journey empty state");
    assert.ok(await evaluate("document.querySelector('[aria-label=Assignments]').textContent.includes('Check your competition details')"), "contextual empty preparation");
    await selectDashboardTab("Registered Events", width);
    await waitFor("!!document.querySelector('main a[href=\"/events\"]')", "empty events discovery action");
    if (width === 320) {
      scenario = "populated";
      await selectDashboardTab("My Profile", width);
      await waitFor("[...document.querySelectorAll('main button')].some(b=>b.textContent.includes('Edit Personal Info'))", "profile ready");
      await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Edit Personal Info')).click()");
      await evaluate("document.querySelector('main form').requestSubmit()");
      await waitFor("!!document.querySelector('.bg-success-900')", "success toast");
      await assertPaintContrast('.bg-success-900 p');
      const point = await evaluate("(()=>{const r=document.querySelector('.bg-success-900').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
      await send("Input.dispatchMouseEvent", {type:"mouseMoved",...point});
      await wait(5200);
      assert.ok(await evaluate("!!document.querySelector('.bg-success-900')"), "hover pauses toast dismissal");
      await evaluate("document.querySelector('.bg-success-900 button').focus()");
      await send("Input.dispatchMouseEvent", {type:"mouseMoved",x:0,y:0});
      await wait(5200);
      assert.ok(await evaluate("!!document.querySelector('.bg-success-900')"), "keyboard focus pauses toast dismissal");
      await evaluate("document.querySelector('header button[aria-label=\"Buka menu\"]').focus()");
      await waitFor("!document.querySelector('.bg-success-900')", "toast dismisses after interaction ends");
      scenario = "error";
      await evaluate("[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Edit Personal Info')).click();document.querySelector('main form').requestSubmit()");
      await waitFor("!!document.querySelector('main [role=alert]')", "error toast");
      await assertPaintContrast('main [role=alert] p');
      await wait(5200);
      assert.ok(await evaluate("!!document.querySelector('main [role=alert]')"), "error remains until dismissed");
      await evaluate("document.querySelector('main [role=alert] button').focus()"); await press("Enter");
      assert.equal(await evaluate("document.querySelectorAll('main [role=alert]').length"), 0);
    }
    scenario = "populated"; authenticated = false;
    await send("Network.deleteCookies", {name:"ioe_token",url:origin});
    await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    await navigate("/");
    assert.ok(await evaluate("(()=>{const t=document.querySelector('.about-stats-track'),r=t.getBoundingClientRect();return getComputedStyle(t).animationName==='none' && [...t.children].filter(e=>!e.hasAttribute('data-stat-copy')).every(e=>{const b=e.getBoundingClientRect();return b.width>0 && b.left>=r.left-1 && b.right<=r.right+1}) && [...t.querySelectorAll('[data-stat-copy]')].every(e=>getComputedStyle(e).display==='none')})()"), "all original reduced-motion statistics are visible");
    if (width === 320) {
      const beforeReduced = await evaluate("document.querySelector('button[aria-current=true]').getAttribute('aria-label')");
      await wait(6500);
      assert.equal(await evaluate("document.querySelector('button[aria-current=true]').getAttribute('aria-label')"),beforeReduced,"reduced motion still prevents autoplay");
    }
    await send("Emulation.setEmulatedMedia", {features:[]});
    await writeFile(`.next/ui-review/results-${width}.json`, JSON.stringify(results.filter(result => result.width === width), null, 2));
    console.log(`PASS ${width} Track A + B1/B2 regressions`);
  }
  assert.deepEqual(browserErrors, [], "no browser runtime errors");
  await writeFile(".next/ui-review/results.json", JSON.stringify(results, null, 2));
} finally {
  await send("Network.deleteCookies", { name: "ioe_token", url: origin });
  await fetch(`${debug}/json/close/${target.id}`);
  socket.close();
}
