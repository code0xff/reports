// Parses every mermaid block extracted from the RENDERED report pages with the
// real mermaid parser, so a malformed diagram fails here rather than in a
// reader's browser.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 26 exposes globalThis.navigator as a getter-only property; mermaid.parse
// does not need it, so we leave the native one in place.

const mermaid = (await import("mermaid")).default;
mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });

const blocks = JSON.parse(readFileSync("blocks.json", "utf8"));
let pass = 0, fail = 0;
for (const b of blocks) {
  try {
    await mermaid.parse(b.src);
    console.log(`PASS  ${b.lang} block ${b.i}  ${b.src.trim().split("\n")[0].slice(0, 20)}`);
    pass++;
  } catch (e) {
    console.log(`FAIL  ${b.lang} block ${b.i}  ${String(e.message ?? e).split("\n")[0]}`);
    fail++;
  }
}
console.log(`\n${pass} parsed, ${fail} failed`);
process.exit(fail ? 1 : 0);
