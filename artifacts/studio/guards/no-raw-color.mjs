// no-raw-color — BLOCKING guard. Fails if any component uses a hand-picked Tailwind
// color-shade class (bg-red-500 …) or a raw rgb()/rgba()/#hex instead of a semantic
// token. The token layer (index.css) legitimately holds raw color. Genuinely
// functional or vendored exceptions opt out per-line with a
// `no-raw-color-allow: <reason>` comment. Runs from any cwd (ROOT resolves relative
// to this file), so it can live in the guards gate.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");
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
  readFileSync(f,"utf8").split("\n").forEach((ln,i)=>{
    if(ln.includes("no-raw-color-allow")) return; // per-line documented exception
    if(BAD.some(re=>re.test(ln))) v.push(`${f}:${i+1}`);
  });
}
if(v.length){
  console.error(`no-raw-color: ${v.length} raw-color site(s) — use a semantic token, or tag a genuine exception with "no-raw-color-allow: <reason>":`);
  v.slice(0,60).forEach(x=>console.error("  "+x));
  process.exit(1);
}
console.log("no-raw-color: 0 raw-color sites — clean (blocking).");
