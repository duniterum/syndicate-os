// Guard: lifecycle-label presence.
// Every page that renders a product surface must carry an honesty label —
// <LifecycleBadge> or <TruthLabel> — so no surface can quietly imply it is live.
//
// Allowlisted (render no protocol/surface VALUES, so need no label):
//   - Learning.tsx  : real, fully-live educational prose.
//   - not-found.tsx : utility 404 fallback.
//
// Node-loadable (Node >= 22.6 / 24), dependency-free.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(here, "..", "src", "pages");
const EXEMPT = new Set(["Learning.tsx", "not-found.tsx"]);
const LABEL_RE = /\b(LifecycleBadge|TruthLabel)\b/;

const errors: string[] = [];
let ok = 0;
for (const f of readdirSync(pagesDir).filter((n) => n.endsWith(".tsx"))) {
  if (EXEMPT.has(f)) continue;
  const src = readFileSync(path.join(pagesDir, f), "utf8");
  if (LABEL_RE.test(src)) ok++;
  else
    errors.push(
      `page ${f} renders no <LifecycleBadge>/<TruthLabel> (add an honesty label, or allowlist it with a reason)`,
    );
}

console.log(`[guard:lifecycle] ${ok} page(s) carry a lifecycle/truth label.`);
if (errors.length) {
  console.error(`[guard:lifecycle] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(`[guard:lifecycle] PASS \u2014 all non-exempt pages are honesty-labelled.`);
