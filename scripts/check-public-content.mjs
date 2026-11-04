// Checks the actual React component branches without changing Next config or publishing data.
// Run in separate processes: NODE_ENV=production/development node scripts/check-public-content.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const load = createRequire(import.meta.url);
const { QueryClient, QueryClientProvider } = load("@tanstack/react-query");
const root = path.resolve("src");
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...rest) {
  return resolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
for (const extension of [".ts", ".tsx"]) {
  Module._extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
      fileName:filename,
    });
    module._compile(outputText, filename);
  };
}
Module._extensions[".css"] = module => { module.exports = {}; };
const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
client.setQueryData(["auth","currentUser"], null);
client.setQueryData(["events","list",null], {events:[],isDemo:true});
const { mockCompetitionDetails } = load(path.join(root,"mocks/competitionDetails.ts"));
client.setQueryData(["competitions","detail","business-case-competition"],mockCompetitionDetails.find(item=>item.slug === "business-case-competition"));
function render(file, name, props = {}) {
  const Component = load(path.join(root, file))[name];
  return renderToStaticMarkup(React.createElement(QueryClientProvider,{client},React.createElement(Component,props)));
}
const preview = process.env.NODE_ENV === "development";
const about = render("features/landing/AboutSection.tsx","AboutSection");
const timeline = render("features/landing/TimelineSection.tsx","TimelineSection");
const footer = render("components/ui/Footer.tsx","Footer");
const hero = render("features/landing/HeroCarousel.tsx","HeroCarousel");
assert.ok(!hero.includes("Hours"), "removed unconfirmed landing countdown stays absent in both modes");
const shortCourse = render("features/events/ShortCoursePage.tsx","ShortCoursePage");
assert.ok(!/<a[^>]+href="#"/.test(footer), "placeholder socials never become links");
const navbar = render("components/ui/Navbar.tsx","Navbar");
assert.equal((navbar.match(/role="switch"/g) ?? []).length, 1, "one functional theme switch in both modes");
assert.ok(navbar.includes('aria-checked="false"') && navbar.includes('aria-label="Aktifkan tema gelap"'), "theme switch has an accessible server snapshot");
assert.ok(timeline.includes('id="timeline"'), "secondary schedule destination remains available");
assert.equal(about.includes("Sponsor A"), preview);
assert.equal(about.includes("about-stats-track"), preview);
assert.equal(timeline.includes("Milestone 01"), preview);
assert.equal(shortCourse.includes("Real-Case Project Exposure"), preview);
assert.equal(shortCourse.includes("15 Agustus 2026"), preview);
assert.equal(shortCourse.includes("Pembicara seminar menyusul"), preview);
assert.equal((about.match(/Preview/g) ?? []).length, 0, "sponsor and statistic notices removed");
assert.equal(timeline.includes("Preview"), false, "sample milestones have no preview notice");
assert.ok(!footer.includes("Preview") && !shortCourse.includes("Preview"), "no visible preview notices");
// These sections were deliberately removed; verify public pages do not restore them.
for (const file of ["app/(public)/page.tsx", "app/(public)/competitions/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(!/MemoriesSection|CompetitionTestimonialCarousel/.test(source), `${file}: removed sample sections remain absent`);
}
assert.equal(render("features/competitions/CompetitionDetailPrizeSection.tsx","CompetitionDetailPrizeSection",{slug:"business-case-competition"}).length > 0,preview,"unconfirmed competition prize widget is preview-only");
const competitionAbout = render("features/competitions/CompetitionAboutSection.tsx","CompetitionAboutSection");
assert.equal(competitionAbout.includes("Rp 50.000.000"),preview);
assert.equal((competitionAbout.match(/Preview/g) ?? []).length,0,"prize and sponsor notices removed");
for (const [file,name] of [["CompetitionDetailFunFactSection","CompetitionDetailFunFactSection"],["CompetitionDetailPrizeSection","CompetitionDetailPrizeSection"],["CompetitionDetailAboutSection","CompetitionDetailAboutSection"],["CompetitionTimelineSection","CompetitionTimelineSection"]]) {
  assert.equal(render(`features/competitions/${file}.tsx`,name,{slug:"business-case-competition"}).includes("Preview"),false,`${name}: no preview notices in either mode`);
}
assert.ok(!render("features/competitions/CompetitionDiscordCTA.tsx","CompetitionDiscordCTA").includes('href="https://discord.gg/PLACEHOLDER"'));
if (preview) {
  const originalUseRef = React.useRef;
  React.useRef = () => ({ current: null });
  try {
    const { CompetitionTimelineTrack } = load(path.join(root, "features/competitions/CompetitionTimelineSection.tsx"));
    const { overallTimelineItems } = load(path.join(root, "features/competitions/competitionsContent.ts"));
    const container = CompetitionTimelineTrack({ items: overallTimelineItems, ariaLabel: "Timeline fixture" });
    const target = { scrollLeft: 100, setPointerCapture: () => {} };
    const event = { pointerType: "mouse", button: 0, pointerId: 1, clientX: 300, currentTarget: target, preventDefault: () => {} };
    container.props.onPointerDown(event);
    container.props.onPointerMove({ ...event, clientX: 220 });
    assert.equal(target.scrollLeft, 180, "mouse drag scrolls timeline within its container");
    for (const end of ["onPointerUp", "onPointerCancel", "onLostPointerCapture"]) {
      container.props.onPointerDown(event);
      container.props[end]();
      container.props.onPointerMove({ ...event, clientX: 100 });
      assert.equal(target.scrollLeft, 180, `${end} stops dragging`);
    }
    container.props.onPointerDown({ ...event, pointerType: "touch" });
    container.props.onPointerMove({ ...event, clientX: 100 });
    assert.equal(target.scrollLeft, 180, "touch keeps native scrolling");
    assert.equal(container.props.tabIndex, 0, "scroll container is keyboard accessible");
  } finally {
    React.useRef = originalUseRef;
  }
}
// Render the real shared components for browser checks against the app's real CSS.
const fixtures = ["primary","secondary","ghost","destructive","text"].map(variant => render("components/ui/Button.tsx","Button",{variant,children:`${variant} action`}));
fixtures.push(render("components/ui/Button.tsx","Button",{disabled:true,children:"Disabled action"}));
for (const status of ["success","error","warning","info"]) fixtures.push(render("components/ui/Toast.tsx","Toast",{status,title:`${status} notification`,message:"Readable notification text",duration:0,onDismiss:()=>{}}));
for (const variant of ["success","error","warning","info"]) fixtures.push(render("components/ui/FormBanner.tsx","FormBanner",{variant,message:`${variant} banner text`}));
fixtures.push(render("components/ui/Input.tsx","Input",{label:"Field label",value:"Readable input value",onChange:()=>{},error:"Please enter a valid value"}));
fixtures.push('<div style="background:var(--inverse-background);color:var(--inverse-foreground)">'+render("components/ui/CountdownTimer.tsx","CountdownTimer",{targetDate:new Date("2027-03-19T23:59:00+07:00")})+'</div>');
fs.mkdirSync(".next/ui-review",{recursive:true});
fs.writeFileSync(".next/ui-review/shared-components.html",fixtures.join("\n"));
fs.writeFileSync(".next/ui-review/competition-fixtures.json",JSON.stringify({details:mockCompetitionDetails,list:load(path.join(root,"mocks/competitions.ts")).mockCompetitions}));
client.clear();
console.log(`PASS ${process.env.NODE_ENV} content guards, preserved preview samples, social destinations and theme visibility`);
