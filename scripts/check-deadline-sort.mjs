import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/utils/sortByDeadline.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const { sortByDeadline } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const items = [
  {id:"later",dueDate:"2027-03-01T00:00:00+07:00",status:"pending"},
  {id:"invalid",dueDate:"not-a-date",status:"rejected"},
  {id:"tie-1",dueDate:"2027-01-01T00:00:00+07:00",status:"accepted"},
  {id:"missing",status:"pending"},
  {id:"tie-2",dueDate:"2026-12-31T17:00:00Z",status:"pending"},
  {id:"empty",dueDate:" "},
];
const original = [...items];
const sorted = sortByDeadline(items);
assert.deepEqual(sorted.map(item=>item.id), ["tie-1","tie-2","later","invalid","missing","empty"]);
assert.deepEqual(items, original, "input is not mutated");
assert.equal(sorted.length, items.length);
assert.ok(sorted.every(item=>items.includes(item)), "all original items/statuses retained");
assert.deepEqual(sortByDeadline([]), []);
console.log("PASS stable deadline sorting, invalid/missing dates, non-mutation and item preservation");
