// Focused frontend check. All API requests are fulfilled in this isolated tab.
// Start Chrome with --remote-debugging-port=9223 and the frontend on port 3000.
// Run: node --experimental-websocket scripts/check-hero.mjs
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.UI_ORIGIN ?? "http://localhost:3000";
const debug = process.env.UI_DEBUG_URL ?? "http://localhost:9223";
const output = process.env.UI_OUTPUT ?? ".next/hero-review";
await mkdir(output, { recursive: true });
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then(r => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
socket.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request?.reject(new Error(message.error.message));
    else request?.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  else if (message.method === "Fetch.requestPaused") {
    await send("Fetch.fulfillRequest", {
      requestId: message.params.requestId, responseCode: 200,
      responseHeaders: [{ name: "Content-Type", value: "application/json" }],
      body: Buffer.from(JSON.stringify({ success: true, data: null })).toString("base64"),
    });
  }
});
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await wait(100); }
  assert.fail(`Timed out: ${expression}`);
}
const active = () => evaluate("document.querySelector('button[aria-current=true]')?.getAttribute('aria-label')");
async function key(name) {
  const code = { ArrowRight: 39, ArrowLeft: 37, Enter: 13, Tab: 9 }[name];
  for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: name, code: name, windowsVirtualKeyCode: code, text: type === "keyDown" && name === "Enter" ? "\r" : undefined });
}
async function screenshot(name) {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${output}/${name}.png`, Buffer.from(data, "base64"));
}
function contrast(a, b) {
  const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
async function checkContrast() {
  const labels = await evaluate(`(()=>{
    const labels=[];
    for(const e of document.querySelectorAll('[data-position=active] h1>span, [data-position=active] p, [data-position=active] a, [data-position=active] [data-program] span, [data-position=active] [class*=masthead] span, [class*=preview] > span, nav[aria-label="Jelajahi kegiatan IOE"] a')) {
      const s=getComputedStyle(e);
      if(!e.getClientRects().length || s.visibility!=='visible') continue;
      let opacity=1;for(let p=e;p;p=p.parentElement)opacity*=parseFloat(getComputedStyle(p).opacity);
      if(!opacity) continue;
      for(const node of e.childNodes) {
        if(node.nodeType!==Node.TEXT_NODE || !node.textContent.trim()) continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const r of range.getClientRects()) {
          if(r.left<0 || r.right>innerWidth || r.top<0 || r.bottom>innerHeight) continue;
          labels.push({text:node.textContent,color:s.color,opacity,size:parseFloat(s.fontSize),weight:parseInt(s.fontWeight),rect:{x:r.x,y:r.y,w:r.width,h:r.height}});
        }
      }
    }
    const style=document.createElement('style');style.id='hero-contrast';style.textContent='[aria-roledescription=carousel] * {-webkit-text-fill-color:transparent!important;text-shadow:none!important}';document.head.append(style);
    return labels;
  })()`);
  let shot;
  try { shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); }
  finally { await evaluate("document.querySelector('#hero-contrast').remove()"); }
  const paints = await evaluate(`(async()=>{
    const bitmap=await createImageBitmap(await (await fetch('data:image/png;base64,${shot.data}')).blob());
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const x=canvas.getContext('2d');x.drawImage(bitmap,0,0);
    const swatch=document.createElement('canvas').getContext('2d');
    return ${JSON.stringify(labels)}.map(label=>{
      swatch.fillStyle=label.color;swatch.fillRect(0,0,1,1);
      return {...label,fg:[...swatch.getImageData(0,0,1,1).data].slice(0,3),backgrounds:[.1,.5,.9].map(t=>[...x.getImageData(Math.floor(label.rect.x+label.rect.w*t),Math.floor(label.rect.y+label.rect.h*.5),1,1).data].slice(0,3))};
    });
  })()`);
  return paints.map(paint => {
    const ratio = Math.min(...paint.backgrounds.map(bg => contrast(paint.fg.map((v,i)=>v*paint.opacity+bg[i]*(1-paint.opacity)), bg)));
    const threshold = paint.size >= 24 || (paint.size >= 18.667 && paint.weight >= 700) ? 3 : 4.5;
    assert.ok(ratio >= threshold, `${paint.text}: contrast ${ratio.toFixed(2)} < ${threshold}`);
    return { text: paint.text, ratio: Number(ratio.toFixed(2)), threshold };
  });
}
const results = [];
try {
  await send("Page.enable");
  await send("Page.bringToFront");
  await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*://*/api/*" }] });
  for (const width of process.env.UI_WIDTHS?.split(",").map(Number) ?? [320, 390, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: origin });
    await until("!!document.querySelector('[data-position=active] h1') && !!document.querySelector('button[aria-current=true]')");
    await evaluate("document.fonts.ready");
    await wait(1000);
    // Focus provides the existing persistent autoplay safeguard during layout checks.
    await evaluate("const viewport=document.querySelector('[aria-roledescription=carousel] [role=group]');viewport.focus();viewport.blur()");
    for (const theme of ["light", "dark"]) {
      await evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      for (let slide = 0; slide < 3; slide++) {
        await evaluate(`document.querySelectorAll('button[aria-label^="Ke slide"]')[${slide}].click()`);
        await until(`document.querySelectorAll('button[aria-label^="Ke slide"]')[${slide}].getAttribute('aria-current')==='true'`);
        await wait(1200);
        await until("!document.querySelector('.hero-track').getAnimations({subtree:true}).some(a=>a.playState==='running')");
        await until("[...document.querySelectorAll('[data-position=active] img')].filter(i=>i.getClientRects().length && getComputedStyle(i).visibility==='visible').every(i=>i.complete && i.naturalWidth>0)");
        await evaluate("Promise.all([...document.querySelectorAll('[data-position=active] img')].filter(i=>i.getClientRects().length && getComputedStyle(i).visibility==='visible').map(i=>i.decode()))");
        await wait(150);
        const layout = await evaluate(`(() => {
          const hero=document.querySelector('[aria-roledescription=carousel]');
          const card=hero.querySelector('[data-position=active]');
          const poster=card.firstElementChild;
          const box=poster.getBoundingClientRect();
          const background=card.querySelector('[data-slide-background]');
          const backgroundBox=background.getBoundingClientRect();
          const texts=[...card.querySelectorAll('h1, h1>span, p, a, [data-program] span')].filter(e=>e.getClientRects().length);
          const fit=texts.every(e=>{const r=e.getBoundingClientRect();return e.scrollWidth<=e.clientWidth+1 && r.left>=box.left-1 && r.right<=box.right+1 && r.bottom<=box.bottom-8});
          const links=[...hero.querySelectorAll('nav a')];
          const pagination=[...hero.querySelectorAll('button[aria-label^="Ke slide"]')];
          return {fit,overflow:document.documentElement.scrollWidth>innerWidth,
            h1:hero.querySelectorAll('h1').length, hiddenLinks:[...hero.querySelectorAll('[aria-hidden=true] a')].every(a=>a.tabIndex===-1),
            discovery:links.map(a=>a.getAttribute('href')),targets:[...links,...pagination].every(e=>{const r=e.getBoundingClientRect();return r.height>=44 && r.width>=44}),
            title:card.querySelector('h1').getAttribute('aria-label'), radius:parseFloat(getComputedStyle(poster).borderTopLeftRadius),
            imagery:[...card.querySelectorAll('img:not([data-slide-background])')].map(i=>i.getAttribute('src')),
            background:{src:new URL(background.currentSrc,location.href).searchParams.get('url') ?? decodeURIComponent(new URL(background.currentSrc,location.href).pathname),fit:getComputedStyle(background).objectFit,
              covers:backgroundBox.left<=box.left+1.1 && backgroundBox.right>=box.right-1.1 && backgroundBox.top<=box.top+1.1 && backgroundBox.bottom>=box.bottom-1.1},
            programs:[...card.querySelectorAll('[data-program]')].map(e=>e.textContent),
            textPaint:[...card.querySelectorAll('h1,p')].map(e=>({color:getComputedStyle(e).color,background:getComputedStyle(poster).backgroundColor}))};
        })()`);
        assert.ok(layout.fit, `text fits ${width}/${theme}/${slide}: ${JSON.stringify(layout)}`);
        assert.equal(layout.overflow, false, "page has no horizontal overflow");
        assert.equal(layout.h1, 1, "one active hero heading");
        assert.equal(layout.radius, 24, "structured carousel uses a shared rounded silhouette");
        assert.deepEqual(layout.background,{src:['/images/parent/Card IOE.webp','/images/parent/Card 2.webp','/images/parent/Card 3.webp'][slide],fit:'cover',covers:true},"correct existing background covers each slide without stretching");
        if (slide === 0) assert.ok(layout.imagery.some(src=>src.includes('logo-navibar')), "overview retains its main brand illustration");
        assert.ok(await evaluate("!document.querySelector('[aria-roledescription=carousel] [class*=masthead], [aria-roledescription=carousel] [data-program], [aria-roledescription=carousel] [class*=previewNumber]')"), "card headers and numbered footers are removed");
        assert.ok(layout.imagery.every(src=>['logo-navibar','ioe-oil-rig-design-aquatic','ioe-paper-poster-aquatic'].some(asset=>src.includes(asset))), "existing blue illustration family only; no masks or ribbons");
        assert.ok(layout.hiddenLinks && layout.targets, "inactive links and 44px targets");
        assert.deepEqual(layout.discovery, ["/competitions", "/events", "#timeline"]);
        const contrast = await checkContrast();
        await screenshot(`${width}-${theme}-${slide + 1}`);
        results.push({ width, theme, slide: slide + 1, ...layout, contrast });
        console.log(`PASS ${width}/${theme}/slide ${slide + 1}: layout, targets, painted text contrast`);
      }
    }
    await evaluate("document.querySelector('[aria-roledescription=carousel] [role=group]').focus()");
    const before = await active();
    await key("ArrowRight"); await wait(600);
    assert.notEqual(await active(), before, "right arrow navigates");
    await until("!document.querySelector('.hero-track').getAnimations({subtree:true}).some(a=>a.playState==='running')");
    await wait(100);
    await key("ArrowLeft");
    await until(`document.querySelector('button[aria-current=true]').getAttribute('aria-label')===${JSON.stringify(before)}`);
    await wait(600);
    assert.equal(await active(), before, "left arrow navigates");
    if (width === 1440) {
      const neighbor = await evaluate("(()=>{const e=[...document.querySelectorAll('[data-position=after] [class*=preview]')].find(e=>{const r=e.getBoundingClientRect();return r.left>0 && r.right<innerWidth && r.height>0});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
      for(const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, button: "left", clickCount: 1, ...neighbor });
      await wait(650);
      assert.notEqual(await active(), before, "adjacent preview click navigates");
      await evaluate("document.querySelector('button[aria-label^=\"Ke slide 2\"]').focus()");
      await key("Enter");
      await until("document.querySelector('button[aria-current=true]').getAttribute('aria-label').startsWith('Ke slide 2')");
      await wait(650);
      assert.ok((await active()).startsWith("Ke slide 2"), "pagination supports keyboard activation");
    }
  }
  // Fresh mount for the six-second autoplay, hover, touch, and focus checks.
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: origin });
  await until("!!document.querySelector('button[aria-current=true]')"); await wait(1000);
  const beforeAuto = await active(); await wait(6600);
  assert.notEqual(await active(), beforeAuto, "six-second autoplay");
  const point = await evaluate("(()=>{const r=document.querySelector('[aria-roledescription=carousel] [role=group]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+100}})()");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point }); await wait(600);
  const beforeHover = await active(); await wait(6600);
  assert.equal(await active(), beforeHover, "hover pauses autoplay");
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 }); await wait(6600);
  assert.notEqual(await active(), beforeHover, "leaving hover resumes autoplay");
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const beforeSwipe = await active();
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 300, y: point.y }] });
  await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: point.y }] });
  await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 90, y: point.y }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await wait(600);
  assert.notEqual(await active(), beforeSwipe, "touch swipe navigates");
  await evaluate("document.querySelector('[aria-roledescription=carousel] [role=group]').focus()");
  const beforeFocus = await active(); await wait(6600);
  assert.equal(await active(), beforeFocus, "keyboard focus pauses autoplay");
  assert.equal(await evaluate("[...document.querySelectorAll('button')].some(b=>/Jeda carousel|Putar otomatis/.test(b.textContent))"), false);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: origin });
  await until("!!document.querySelector('button[aria-current=true]')"); await wait(1000);
  const beforeReduced = await active(); await wait(6600);
  assert.equal(await active(), beforeReduced, "reduced motion disables autoplay");
  await evaluate("document.querySelector('[aria-roledescription=carousel] [role=group]').focus()");
  await key("ArrowRight"); await wait(100);
  assert.notEqual(await active(), beforeReduced, "reduced motion retains manual navigation");
  assert.deepEqual(errors, [], "no browser runtime exceptions");
  await writeFile(`${output}/results.json`, JSON.stringify({ results, interactions: "passed", errors }, null, 2));
  console.log(`PASS ${results.length} hero layouts; arrows, pagination, autoplay, hover/resume, touch, focus, reduced motion; API requests isolated.`);
} finally {
  await send("Page.close");
  socket.close();
}
