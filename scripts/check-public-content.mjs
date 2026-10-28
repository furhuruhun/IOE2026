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
function render(file, name, props = {}) {
  const Component = load(path.join(root, file))[name];
  return renderToStaticMarkup(React.createElement(QueryClientProvider,{client},React.createElement(Component,props)));
}
const preview = process.env.NODE_ENV === "development";
const about = render("features/landing/AboutSection.tsx","AboutSection");
const timeline = render("features/landing/TimelineSection.tsx","TimelineSection");
const footer = render("components/ui/Footer.tsx","Footer");
const hero = render("features/landing/HeroCarousel.tsx","HeroCarousel");
assert.equal(hero.includes("Hours"), preview, "unconfirmed landing milestone is preview-only");
const shortCourse = render("features/events/ShortCoursePage.tsx","ShortCoursePage");
assert.ok(!/<a[^>]+href="#"/.test(footer), "placeholder socials never become links");
assert.ok(!render("components/ui/Navbar.tsx","Navbar").includes('role="switch"'), "preview-only theme control is absent");
assert.ok(timeline.includes('id="timeline"'), "secondary schedule destination remains available");
assert.equal(about.includes("Sponsor A"), preview);
assert.equal(about.includes("about-stats-track"), preview);
assert.equal(timeline.includes("Milestone 01"), preview);
assert.equal(shortCourse.includes("Real-Case Project Exposure"), preview);
assert.equal(shortCourse.includes("15 Agustus 2026"), preview);
assert.equal(shortCourse.includes("Pembicara seminar menyusul"), preview);
if (preview) assert.ok(about.includes("Preview") && footer.includes("Preview") && shortCourse.includes("Preview"));
for (const [file,name] of [["features/landing/MemoriesSection.tsx","MemoriesSection"],["features/competitions/CompetitionMemoriesSection.tsx","CompetitionMemoriesSection"],["features/competitions/CompetitionTestimonialCarousel.tsx","CompetitionTestimonialCarousel"]]) {
  assert.equal(render(file,name).length > 0,preview, `${name} preview-only`);
}
assert.equal(render("features/competitions/CompetitionDetailPrizeSection.tsx","CompetitionDetailPrizeSection",{slug:"business-case-competition"}).length > 0,preview,"unconfirmed competition prize widget is preview-only");
const competitionAbout = render("features/competitions/CompetitionAboutSection.tsx","CompetitionAboutSection");
assert.equal(competitionAbout.includes("Rp 50.000.000"),preview);
assert.ok(!render("features/competitions/CompetitionDiscordCTA.tsx","CompetitionDiscordCTA").includes('href="https://discord.gg/PLACEHOLDER"'));
client.clear();
console.log(`PASS ${process.env.NODE_ENV} content guards, preserved preview samples, social destinations and theme visibility`);
