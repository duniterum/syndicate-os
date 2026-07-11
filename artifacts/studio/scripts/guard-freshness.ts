// Guard: FRESHNESS provenance (the vocabulary the surfaces were missing).
//
// ledger §2/§11 — "enforcement is bounded by vocabulary": guard-no-fake-live is a
// literal >Live< string check and could not see a served-snapshot figure wearing
// a live signature. This guard adds the missing words as enforceable rules:
//
//   RULE A — no decorative live signature. A page that renders <LivingSignature>
//     ("read live from Avalanche") MUST read at least one live figure
//     (useHeroReality / useTokenomics). A structure-only page may not wear it.
//     (Caught /docs.)
//
//   RULE B — no live member headline without its provenance. Any file that reads
//     the live member figure (`.membersTotal` / `.membersTotalNumber`) MUST also
//     render <MembersProvenance> — the dual-authority split + the verified
//     snapshot's as-of — so a live figure never appears without its freshness
//     provenance, and the live↔snapshot divergence is never a bare contradiction.
//     (NO SNAPSHOT FOR A LIVE-READABLE FIGURE; the divergence is surfaced, not buried.)
//
// Node-loadable (Node >= 22.6 / 24), dependency-free.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

// Files that DEFINE these primitives are exempt from consuming them.
const EXEMPT = new Set([
  path.resolve(srcDir, "components", "living", "LivingSignature.tsx"),
  path.resolve(srcDir, "components", "living", "MembersProvenance.tsx"),
  path.resolve(srcDir, "components", "hero", "useHeroReality.ts"),
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (statSync(fp).isDirectory()) out.push(...walk(fp));
    else if (/\.tsx?$/.test(name)) out.push(fp);
  }
  return out;
}

const errors: string[] = [];
let scanned = 0;
for (const fp of walk(srcDir)) {
  if (EXEMPT.has(fp)) continue;
  const src = readFileSync(fp, "utf8");
  scanned++;
  const rel = path.relative(srcDir, fp);

  // RULE A
  if (src.includes("<LivingSignature")) {
    const readsLive = /useHeroReality|useTokenomics/.test(src);
    if (!readsLive) {
      errors.push(
        `${rel}: renders <LivingSignature> but reads no live figure (useHeroReality/useTokenomics) — a decorative live signature. Drop it, or read a live figure.`,
      );
    }
  }

  // RULE B
  if (/\.membersTotal\b|\.membersTotalNumber\b/.test(src)) {
    if (!src.includes("<MembersProvenance")) {
      errors.push(
        `${rel}: reads the live member figure (membersTotal) but does not render <MembersProvenance> — a live member headline must carry its dual-authority split + the verified snapshot's as-of.`,
      );
    }
  }
}

console.log(`[guard:freshness] scanned ${scanned} file(s).`);
if (errors.length) {
  console.error(`[guard:freshness] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("[guard:freshness] PASS — no decorative live signature; every live member figure carries its provenance.");
