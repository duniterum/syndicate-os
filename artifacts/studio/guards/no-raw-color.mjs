// no-raw-color — reports hand-picked Tailwind color-shade classes and raw rgb()/hex
// used in components instead of semantic tokens. REPORT-ONLY this slice (existing
// components still hardcode colors; they migrate to tokens in later slices, then this
// guard goes into the gate to make palette sprawl structurally impossible).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = "artifacts/studio/src";
const ALLOW = ["index.css"]; // the token layer + .syn-* utilities legitimately hold raw color
const PALETTES = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const BAD = [
  new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|to|via|shadow)-(?:${PALETTES})-[0-9]{2,3}\\b`),
  /#[0-9a-fA-F]{6}\b/,
  /\brgba?\([0-9]/,
];
function walk(dir){let o=[];for(const e of readdirSync(dir)){const p=join(dir,e);if(statSync(p).isDirectory())o=o.concat(walk(p));else if(/\.(ts|tsx)$/.test(p))o.push(p);}return o;}
let v=[];
for(const f of walk(ROOT)){
  if(ALLOW.some(a=>f.endsWith(a)))continue;
  readFileSync(f,"utf8").split("\n").forEach((ln,i)=>{ if(BAD.some(re=>re.test(ln))) v.push(`${f}:${i+1}`); });
}
console.log(`no-raw-color: ${v.length} site(s) still using raw color (to migrate to --identity/--live/--proof/--viz tokens in later slices).`);
if(v.length) v.slice(0,40).forEach(x=>console.log("  "+x));
