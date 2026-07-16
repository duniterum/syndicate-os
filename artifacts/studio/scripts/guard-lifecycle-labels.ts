// Guard: lifecycle-label presence.
// Every page that renders a product surface must carry an honesty label —
// <LifecycleBadge> or <TruthLabel> — so no surface can quietly imply it is live.
//
// Allowlisted (render no protocol/surface VALUES, so need no label):
//   - Learning.tsx  : real, fully-live educational prose.
//   - not-found.tsx : utility 404 fallback.
//   - OperatorPreviewUnavailable.tsx : utility fallback shown at INTERNAL
//     routes when the build-time operator preview gate is off; renders only
//     honest posture prose, no protocol/surface values.
//
// Node-loadable (Node >= 22.6 / 24), dependency-free.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(here, "..", "src", "pages");
const EXEMPT = new Set([
  "Learning.tsx",
  "not-found.tsx",
  "OperatorPreviewUnavailable.tsx",
  // §11 slot-2c teaser pages: their honesty label IS rendered — by the shared
  // TeaserSurface chassis from spec.lifecycle (chassis check below pays for
  // the exemption, so it cannot rot into an unlabeled surface).
  // (ACT-1: Activity + Fire Ledger went LIVE and render their badge directly —
  // removed from this list; only the Chronicle teaser remains chassis-labeled.)
  "ChronicleTeaser.tsx",
]);

// The chassis check that pays for the teaser exemptions: TeaserSurface must
// itself render the LifecycleBadge from its spec — if that ever disappears,
// this guard goes red even though the pages are exempt.
{
  const chassis = readFileSync(
    path.resolve(here, "..", "src", "components", "TeaserSurface.tsx"),
    "utf8",
  );
  if (!/LifecycleBadge/.test(chassis) || !/spec\.lifecycle/.test(chassis)) {
    console.error(
      "[guard:lifecycle] FAIL — TeaserSurface no longer renders <LifecycleBadge lifecycle={spec.lifecycle}>; the teaser-page exemptions are void.",
    );
    process.exit(1);
  }
}
// StatusPill is the canonical status atom since the Phase-1 consolidation:
// TruthLabel is a thin wrapper over it, and it replaced the older
// LifecycleBadge/PostureBadge sprawl. A page rendering any of these carries an
// honesty label. (The whitepaper labels every section with a <StatusPill>.)
// AUD-TRUTH-2 (2026-07-16): PostureBadge joined the accepted labels — it IS an
// honesty label (the source-status registry's posture text, e.g. "Verified —
// view only"); /status carries one per registry row and lost its only
// TruthLabel when the operator surface map moved to /os-map.
const LABEL_RE = /\b(LifecycleBadge|TruthLabel|StatusPill|PostureBadge)\b/;

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
