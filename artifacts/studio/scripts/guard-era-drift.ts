// guard-era-drift.ts — the READ-ONLY-ERA vocabulary, killed as a CLASS (S4).
// ---------------------------------------------------------------------------
// THE PATTERN (S2 full-site truth audit, founder-verified): everything written
// before the C5 go-live carried read-only-era DNA in its user-facing strings —
// "read-only foundation", "not wired", "nothing is minted", "none is wired",
// "awaiting a verified source" — even where the page had long evolved. Six
// sweeps fixed instances; this guard kills the class: era vocabulary in a
// USER-FACING STRING goes red at build time, before prod can lie by standing
// still.
//
// Scope: STRING LITERALS ("..." and `...`) in the user-facing sources (config/,
// content/, pages/, components/, lib/seo-route-registry.ts). Comments are NOT
// scanned (an engineer may honestly describe history); only strings a user or
// crawler could ever see.
//
// CASE-INSENSITIVE — the S2 lesson: a case-sensitive sweep declared victory
// while prod served "Read-only memory" with a capital R (Replit's gate caught
// it). Never again.
//
// ALLOWLIST — honest survivors, each with its reason. An era PHRASE is not the
// same as an era CLAIM: a validator page saying a check "writes nothing", a
// lifecycle label literally named "Read-only proof", or /contracts describing
// a static canon-memory page (founder-validated 2026-07-14, the deploy-gate
// exception) are truths of TODAY and stay.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

const SCAN_ROOTS = ["config", "content", "pages", "components", "wallet", join("lib", "seo-route-registry.ts")];

// The era-drift vocabulary class (case-insensitive). Deliberately CLAIM-shaPED
// phrases, not bare words: "read-only" as a MECHANISM word ("a read-only
// quote", "Sale engine (read-only)", "read-only self-readback") is honest and
// stays free; what dies is "read-only" as a claim about the SITE/PROTOCOL
// ("read-only foundation", "the public surface is read-only") — the era claim.
const ERA_PATTERNS: { re: RegExp; name: string }[] = [
  { re: /read[- ]only (foundation|shell|site|protocol|era)/i, name: "read-only site-claim" },
  { re: /(foundation|shell|site|surface|protocol) is (currently )?read[- ]only/i, name: "read-only site-claim" },
  { re: /currently read[- ]only/i, name: "read-only site-claim" },
  { re: /none is wired/i, name: "none is wired" },
  { re: /not wired/i, name: "not wired" },
  { re: /nothing is minted/i, name: "nothing is minted" },
  { re: /awaiting a verified source/i, name: "awaiting a verified source" },
  { re: /awaiting source (wiring|integration)/i, name: "awaiting source wiring" },
  { re: /coming with the event backbone/i, name: "coming with the event backbone" },
  // S6 (founder rule, engraved): an INTERNAL PLAN never becomes a public
  // promise — the Commission Router is a V4 internal discussion, never
  // announced anywhere; its name in a user-facing string is a leak.
  { re: /commission ?router/i, name: "internal-plan leak (Commission Router)" },
];

// path substring → allowed pattern names with the reason they are honest TODAY.
// (The bare-mechanism "read-only" — "a read-only quote", "(read-only)" panel
// labels, "read-only self-readback" — is NOT matched by the patterns at all;
// only claim-shaped era phrases need this list.)
const ALLOWLIST: { path: string; patterns: string[]; reason: string }[] = [
  {
    path: `config${sep}supportIntake.ts`,
    patterns: ["not wired"],
    reason:
      "TRUE today (verified S2, 2026-07-14): the ticket intake genuinely stores/sends nothing; the Guide + official channels are the live help paths",
  },
  {
    path: `pages${sep}admin${sep}`,
    patterns: ["not wired"],
    reason:
      "internal operator console previews (robots-disallowed, operator build-gated) — each KPI card honestly labels itself not-yet-live",
  },
  {
    path: `components${sep}PostureBadge.tsx`,
    patterns: ["not wired"],
    reason: "the NOT_WIRED posture's display label — lifecycle vocabulary, not a surface claim",
  },
  {
    path: `components${sep}TruthLabel.tsx`,
    patterns: ["not wired"],
    reason: "truth-label display vocabulary for genuinely pending statuses",
  },
  {
    path: `config${sep}accessState.ts`,
    patterns: ["read-only site-claim"],
    reason:
      "the Auditor role's shell skin IS read-only (zero mutations) — internal role truth, not protocol posture",
  },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

/**
 * Strip comments (// and /* *​/) so an engineer's honest HISTORY notes —
 * including quoted samples of dead copy — never trip the guard. Newlines are
 * preserved so line numbers stay true.
 */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^([^"'`\n]*?)\/\/.*$/gm, (m, head) => head + " ".repeat(m.length - head.length));
}

/** Extract string-literal contents ("...", '...', `...`) with line numbers. */
function stringLiterals(raw: string): { value: string; line: number }[] {
  const text = stripComments(raw);
  const out: { value: string; line: number }[] = [];
  const re = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/gs;
  for (const m of text.matchAll(re)) {
    const value = m[1] ?? m[2] ?? m[3] ?? "";
    if (value.length < 8) continue; // class names / ids can't carry an era claim
    const line = text.slice(0, m.index ?? 0).split("\n").length;
    out.push({ value, line });
  }
  return out;
}

const files: string[] = [];
for (const root of SCAN_ROOTS) {
  const p = join(SRC, root);
  try {
    const st = statSync(p);
    files.push(...(st.isDirectory() ? walk(p) : [p]));
  } catch {
    console.error(`[guard:era] scan root missing: ${root}`);
    process.exit(1);
  }
}

let failures = 0;
let allowlisted = 0;
for (const file of files) {
  const rel = file.slice(SRC.length + 1);
  const text = readFileSync(file, "utf8");
  for (const { value, line } of stringLiterals(text)) {
    for (const { re, name } of ERA_PATTERNS) {
      if (!re.test(value)) continue;
      const allowed = ALLOWLIST.find((a) => rel.includes(a.path) && a.patterns.includes(name));
      if (allowed) {
        allowlisted += 1;
      } else {
        failures += 1;
        console.error(
          `  ✗ ${rel}:${line} — era-drift vocabulary "${name}" in a user-facing string: "${value.slice(0, 90)}…" (if this is TODAY'S truth, add an explicit allowlist entry with its reason)`,
        );
      }
      break; // one report per literal
    }
  }
}

if (failures > 0) {
  console.error(`[guard:era] ${failures} FAILURE(S) across ${files.length} files.`);
  process.exit(1);
}
console.log(
  `[guard:era] PASS — no era-drift vocabulary in user-facing strings (${files.length} files; ${allowlisted} allowlisted honest survivor(s), each with a written reason).`,
);
