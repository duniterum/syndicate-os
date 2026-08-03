// guard-referral-terms.ts — THE PROGRAM TERMS' DESIGNED HOME (/referral-terms). BLOCKING.
// ---------------------------------------------------------------------------
// THE CATCH (founder, live prod 2026-08-03): the referral program's terms are
// a hash-anchored plain document (referral-program-terms-v1.txt — its
// keccak256 is each member source's on-chain metadataHash), served RAW, with
// no designed home and no footer door; and the /join card doored to the
// GENERAL Terms of Use instead. This page is the designed shell around THE
// document — never a second copy of it.
//
// THE PINS:
//   1. THE ROUTE EXISTS EVERYWHERE (line-anchored raw scans — commented-out
//      entries never count): page · App · modules · classification · SEO.
//   2. ONE DOCUMENT — the page renders the FETCHED served file only: it
//      imports TERMS_PATH from THE termsDocument authority, never retypes
//      the URL, and carries NO retyped body prose (the hash law: a second
//      copy of the text would drift from the anchored bytes).
//   3. THE COMMITMENT IS LIVE — the page mounts TermsCommitmentHash (the
//      hash computed from the served bytes at render, with its on-chain
//      verify door) — the same mechanic /referral carries, imported.
//   4. THE FOOTER DOOR — the Legal shelf carries "referral-terms".
//
// NOT COVERED (stated): the document's CONTENT truth (the hash anchors it;
// changing it is a v2 + founder-signed re-anchor, never an edit), rendered
// pixels (the rig), the on-chain metadataHash equality (VerifyOnChain's
// door + the api guards own that).
// Scans are comment-stripped (line-first, closer-preserving lookaheads).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const PAGE = path.join(srcDir, "pages", "ReferralTerms.tsx");
const APP = path.join(srcDir, "App.tsx");
const MODULES = path.join(srcDir, "config", "modules.ts");
const CLASSIFICATION = path.join(srcDir, "config", "surfaceClassification.ts");
const SEO = path.join(srcDir, "lib", "seo-route-registry.ts");
const NAVIGATION = path.join(srcDir, "config", "navigation.ts");

function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const read = (p: string): string => (existsSync(p) ? readFileSync(p, "utf8") : "");
const pageRaw = read(PAGE);
const page = stripComments(pageRaw);

// ── 1. THE ROUTE EXISTS EVERYWHERE ──────────────────────────────────────────
check(page.length > 0, "terms: the page exists", "terms: pages/ReferralTerms.tsx MISSING");
check(
  /^\s*<PublicRoute path="\/referral-terms">/m.test(read(APP)),
  "terms: routed in App (live line)",
  "terms: no live /referral-terms route line in App.tsx",
);
check(
  /^\s*path: "\/referral-terms",$/m.test(read(MODULES)),
  "terms: in the modules registry (live line)",
  "terms: no live /referral-terms entry in config/modules.ts",
);
check(
  /^\s*routePath: "\/referral-terms",$/m.test(read(CLASSIFICATION)),
  "terms: surface-classified (live line)",
  "terms: no live /referral-terms entry in surfaceClassification.ts",
);
check(
  /^\s*path: "\/referral-terms",$/m.test(read(SEO)),
  "terms: in the SEO route registry (live line)",
  "terms: no live /referral-terms entry in seo-route-registry.ts",
);

// ── 2. ONE DOCUMENT ─────────────────────────────────────────────────────────
check(
  /\bTERMS_PATH\b/.test(page),
  "terms: the document path is THE termsDocument authority, imported",
  "terms: the page does not import TERMS_PATH — the canonical file path is ONE fact in lib/termsDocument.ts",
);
check(
  !/referral-program-terms-v1\.txt/.test(page),
  "terms: the file path is never retyped",
  "terms: the .txt path is retyped in the page — import TERMS_PATH",
);
// Distinctive body phrases that may exist ONLY in the served document — a
// retyped body would drift from the hash-anchored bytes.
for (const phrase of ["LIFETIME attribution", "500 basis points", "payoutWallet"]) {
  check(
    !pageRaw.includes(phrase),
    `terms: no retyped body («${phrase}» absent)`,
    `terms: the page retypes document body text («${phrase}») — the ONE document is the fetched served file; a second copy drifts from the anchored bytes`,
  );
}

// ── 3. THE COMMITMENT IS LIVE ───────────────────────────────────────────────
check(
  /<TermsCommitmentHash \/>/.test(page),
  "terms: the live keccak256 commitment + on-chain verify door are mounted",
  "terms: TermsCommitmentHash is not mounted — the hash computed from the served bytes (with its verify door) is the page's proof spine",
);

// ── 4. THE FOOTER DOOR ──────────────────────────────────────────────────────
check(
  /"terms", "privacy", "risk", "referral-terms"|"referral-terms", "terms"|"terms", "referral-terms"/.test(read(NAVIGATION)),
  "terms: the Legal footer shelf carries the program terms",
  'terms: "referral-terms" is missing from the Legal footer shelf in navigation.ts (founder order: the terms link in the footer, comme il faut)',
);

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:referral-terms] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:referral-terms] PASS — ${ok.length}/${ok.length} program-terms pins hold.`);
