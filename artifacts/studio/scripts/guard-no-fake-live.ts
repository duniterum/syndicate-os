// Guard: no fake "LIVE" labels.
// Nothing in this read-only foundation may render an affirmative live-status word
// (LIVE / Live / Online / Active) as a JSX text node. Honest lifecycle wording is
// rendered from config (variables), never as a hardcoded "Live" chip.
//
// Node-loadable (Node >= 22.6 / 24).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const FAKE_LIVE_RE = />\s*(LIVE|Live|Online|Active)\s*</g;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (statSync(fp).isDirectory()) out.push(...walk(fp));
    else if (name.endsWith(".tsx")) out.push(fp);
  }
  return out;
}

const errors: string[] = [];
let scanned = 0;
for (const fp of walk(srcDir)) {
  scanned++;
  const lines = readFileSync(fp, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = line.match(FAKE_LIVE_RE);
    if (m) {
      errors.push(
        `${path.relative(srcDir, fp)}:${i + 1} hardcoded live label ${JSON.stringify(m)} \u2014 use a config-driven lifecycle/truth label`,
      );
    }
  });
}

console.log(`[guard:live] scanned ${scanned} component file(s).`);
if (errors.length) {
  console.error(`[guard:live] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(`[guard:live] PASS \u2014 no hardcoded LIVE/Online/Active labels.`);
