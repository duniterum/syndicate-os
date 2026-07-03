/**
 * Canon Integrity Guard — Phase 1 Slice 2.8 (hardening only)
 * ---------------------------------------------------------------------------
 * A permanent, lightweight, dependency-free (beyond zod) verification pass that
 * runs BEFORE any future RPC / live-adapter work. It exists because the vendored
 * canon directory is intentionally EXCLUDED from the api-server TypeScript
 * program (read-only vendored assets), which means broken relative imports can
 * hide from normal `tsc`. This guard closes that gap and locks the public
 * `/api/source-status` contract.
 *
 * Run:  pnpm --filter @workspace/api-server run verify:canon
 *
 * IMPORTANT distinction (by design):
 *   - INTERNAL vendored canon files (src/canon/the-syndicate/**) ARE allowed to
 *     contain full contract addresses. This guard NEVER bans addresses there; it
 *     only checks that their relative import/export graph resolves.
 *   - The PUBLIC serialized /api/source-status payload must NEVER contain a full
 *     address (or PII, Supa-as-source wording, fake values, forbidden postures,
 *     or financial/casino framing). Those bans apply ONLY to the payload.
 *
 * The guard imports the already-built, schema-validated, self-guarded payload
 * from src/data/sourceStatus (no HTTP, no running server required). It does NOT
 * import or execute any browser/client code.
 *
 * Exit code: 0 if every check passes, 1 otherwise.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { sourceStatusResponse } from "../src/data/sourceStatus";

const HERE = dirname(fileURLToPath(import.meta.url));
const API_SERVER_ROOT = resolve(HERE, "..");
const CANON_DIR = join(API_SERVER_ROOT, "src", "canon", "the-syndicate");
const PROVENANCE_PATH = join(CANON_DIR, "PROVENANCE.md");

const PINNED_SHA = "cf4ca34c74599de1324e77052f1a81dd15cb1cc0";
const REPO_SLUG = "duniterum/TheSyndicate";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { section: string; name: string; ok: boolean; detail?: string };
const results: Check[] = [];
const info: string[] = [];
function check(section: string, name: string, ok: boolean, detail?: string): void {
  results.push({ section, name, ok, detail });
}

// ── filesystem helpers ───────────────────────────────────────────────────────
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/**
 * Strip `//` line and block comments while respecting string/template literals,
 * so relative specifiers quoted inside comments or prose (e.g. a CONVERSION note
 * that says `relative import "./syndicate-config"`) are not mistaken for real
 * import edges, and `https://` inside string literals is never truncated.
 */
function stripComments(src: string): string {
  let out = "";
  let str: string | null = null;
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    const c2 = src[i + 1];
    if (str) {
      out += c;
      if (c === "\\" && i + 1 < src.length) {
        out += src[i + 1];
        i += 1;
      } else if (c === str) {
        str = null;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      str = c;
      out += c;
      continue;
    }
    if (c === "/" && c2 === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    out += c;
  }
  return out;
}

function relativeSpecifiers(source: string): string[] {
  const code = stripComments(source);
  const specs: string[] = [];
  const patterns = [
    /\bfrom\s+["'](\.[^"']+)["']/g, // import/export (incl. `export *`) ... from "./x"
    /\bimport\s*\(\s*["'](\.[^"']+)["']\s*\)/g, // dynamic import("./x")
    /\bimport\s+["'](\.[^"']+)["']/g, // side-effect import "./x"
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) specs.push(m[1]);
  }
  return specs;
}

function resolves(fromFile: string, spec: string): boolean {
  const base = resolve(dirname(fromFile), spec);
  const candidates = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), base];
  return candidates.some((c) => (c.endsWith(".ts") || c.endsWith(".tsx")) && existsSync(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// A) Vendored canon graph integrity (import graph only — addresses NOT checked)
// ─────────────────────────────────────────────────────────────────────────────
function sectionA(): string[] {
  const canonFiles = existsSync(CANON_DIR)
    ? walk(CANON_DIR).filter((f) => f.endsWith(".ts"))
    : [];
  check("A", "canon directory exists with .ts files", canonFiles.length > 0, `${canonFiles.length} files`);

  let edges = 0;
  const broken: string[] = [];
  for (const file of canonFiles) {
    for (const spec of relativeSpecifiers(readFileSync(file, "utf8"))) {
      edges += 1;
      if (!resolves(file, spec)) {
        broken.push(`${relative(CANON_DIR, file)} -> ${spec}`);
      }
    }
  }
  info.push(`A) canon graph: ${canonFiles.length} .ts files, ${edges} relative import/export edges checked`);
  check("A", "zero broken relative import/export edges", broken.length === 0, broken.join(" | ") || undefined);
  return canonFiles;
}

// ─────────────────────────────────────────────────────────────────────────────
// B) Provenance integrity
// ─────────────────────────────────────────────────────────────────────────────
function sectionB(canonFiles: string[]): void {
  const exists = existsSync(PROVENANCE_PATH);
  check("B", "PROVENANCE.md exists", exists);
  if (!exists) return;

  const text = readFileSync(PROVENANCE_PATH, "utf8");
  const lower = text.toLowerCase();

  check("B", "cites TheSyndicate repo URL/slug", text.includes(REPO_SLUG));
  check("B", "cites pinned main commit SHA", text.includes(PINNED_SHA));
  check("B", "records an inspection note", /inspection method|inspected|untrusted external data/i.test(text));
  check("B", "records a source date", /20\d\d-\d\d-\d\d/.test(text));
  check("B", "documents original upstream source paths", text.includes("src/lib/"));
  check("B", "has a public/internal safety classification section", /safety review|server-side only|pii/i.test(text));
  check("B", "states canon is read-only and not a live RPC read", /read-only/i.test(text) && /(rpc|live read)/i.test(text));
  check(
    "B",
    "states full addresses are server-side only and never in public payload",
    /server-side only/i.test(lower) && lower.includes("payload") && lower.includes("never"),
  );

  // every vendored file (excluding our own barrel) is listed by its local path
  const vendored = canonFiles.filter((f) => relative(CANON_DIR, f) !== "index.ts");
  const missing = vendored
    .map((f) => relative(CANON_DIR, f))
    .filter((rel) => !text.includes(rel));
  check(
    "B",
    "lists every vendored file's local destination path",
    missing.length === 0,
    missing.length ? `missing: ${missing.join(", ")}` : `${vendored.length} files listed`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// C) Public payload contract (bans apply ONLY here, to the serialized payload)
// ─────────────────────────────────────────────────────────────────────────────
// Canonical public-display subset of @workspace/os-contracts SourcePosture
// (Slice 2.20B convergence). LIVE_ACTION / AUTH_REQUIRED / ADMIN_ONLY are
// intentionally NOT allowed in this public, read-only payload.
const ALLOWED_POSTURES = new Set([
  "READ_ONLY_PROOF",
  "NOT_WIRED",
  "VERIFIED_SOURCE_PENDING_ADAPTER",
  "FUTURE",
]);
// Forbidden in the serialized payload: the rejected prior-art postures AND the
// retired 6-state dialect now converged onto canonical SourcePosture. Matched as
// lowercased substrings; the underscore forms never collide with payload prose
// ("not_live" vs "not live", "adapter_required" vs "pending adapter").
const FORBIDDEN_POSTURES = [
  "LIVE_READ",
  "PROTOTYPE",
  "SIMULATED",
  "ADAPTER_REQUIRED",
  "NOT_LIVE",
];

const FORBIDDEN_FRAMING_SUBSTRINGS = [
  "guaranteed profit",
  "guaranteed return",
  "passive income",
  "payout",
  "jackpot",
  "betting",
  "wager", // also covers "wagering"
  "reward farming",
  "liquidity mining",
  "buy for upside",
  "casino",
  "fake live",
  "airdrop",
  "supa", // Supa-Exchange is reference memory, never a Syndicate source
];
const FORBIDDEN_FRAMING_PATTERNS = [/\broi\b/i, /\byield/i, /\bprofit\b/i];
const FULL_ADDRESS = /0x[a-fA-F0-9]{40}/;

function sectionC(): void {
  const payload = sourceStatusResponse;
  const categories = Object.values(payload.categories);
  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();

  // Public Online Integration MVP (founder-approved, July 2026) added four
  // posture categories: walletSession, linkGeneration, continuity, buyReadiness.
  check("C", "exactly 24 categories", categories.length === 24, `got ${categories.length}`);
  check("C", "mode === POSTURE_ONLY", payload.mode === "POSTURE_ONLY", payload.mode);
  check("C", "expectedChainId === 43114", payload.expectedChainId === 43114, String(payload.expectedChainId));
  check("C", "generatedBy === static-canon", payload.generatedBy === "static-canon", payload.generatedBy);
  check("C", "every category field === its key", categories.every((c) => c.category === c.key));
  check("C", "every value === null", categories.every((c) => c.value === null));
  check("C", "every posture is supported", categories.every((c) => ALLOWED_POSTURES.has(c.posture)));

  const forbiddenPostureHit = FORBIDDEN_POSTURES.filter((p) => lower.includes(p.toLowerCase()));
  check("C", "no forbidden/retired posture literal in payload", forbiddenPostureHit.length === 0, forbiddenPostureHit.join(", ") || undefined);

  check("C", "no full 0x[40] address in payload", !FULL_ADDRESS.test(serialized));

  const framingHit = FORBIDDEN_FRAMING_SUBSTRINGS.filter((s) => lower.includes(s));
  check("C", "no forbidden financial/casino/Supa framing (substrings)", framingHit.length === 0, framingHit.join(", ") || undefined);

  const patternHit = FORBIDDEN_FRAMING_PATTERNS.filter((re) => re.test(serialized));
  check("C", "no forbidden financial framing (ROI/yield/profit)", patternHit.length === 0, patternHit.map(String).join(", ") || undefined);
}

// ─────────────────────────────────────────────────────────────────────────────
// D) SourceStatus posture expectations after Slice 2.7
// ─────────────────────────────────────────────────────────────────────────────
function sectionD(): void {
  const payload = sourceStatusResponse;
  const categories = Object.values(payload.categories);
  const counts: Record<string, number> = {};
  for (const c of categories) counts[c.posture] = (counts[c.posture] ?? 0) + 1;
  info.push(`D) posture counts: ${JSON.stringify(counts)}`);

  // Posture vocabulary converged onto @workspace/os-contracts SourcePosture
  // (Slice 2.20B). Public Online Integration MVP (founder-approved, July 2026):
  // the read-only sale group of the reality spine went live (sale, source),
  // the wallet session shell went public (walletSession), and the read-only
  // link builder shipped (linkGeneration) — all READ_ONLY_PROOF. continuity is
  // VERIFIED_SOURCE_PENDING_ADAPTER (Part B verified server-side, no public
  // adapter) and buyReadiness stays NOT_WIRED (no transaction surface exists).
  check("D", "READ_ONLY_PROOF count === 9", counts.READ_ONLY_PROOF === 9, String(counts.READ_ONLY_PROOF ?? 0));
  check("D", "NOT_WIRED count === 7", counts.NOT_WIRED === 7, String(counts.NOT_WIRED ?? 0));
  check("D", "VERIFIED_SOURCE_PENDING_ADAPTER count === 1", counts.VERIFIED_SOURCE_PENDING_ADAPTER === 1, String(counts.VERIFIED_SOURCE_PENDING_ADAPTER ?? 0));
  check("D", "FUTURE count === 7", counts.FUTURE === 7, String(counts.FUTURE ?? 0));

  const expectedReadOnly = [
    "archive",
    "chain",
    "contracts",
    "guardrails",
    "linkGeneration",
    "sale",
    "source",
    "token",
    "walletSession",
  ];
  const actualReadOnly = categories
    .filter((c) => c.posture === "READ_ONLY_PROOF")
    .map((c) => c.key)
    .sort();
  check(
    "D",
    "READ_ONLY_PROOF set === {archive, chain, contracts, guardrails, linkGeneration, sale, source, token, walletSession}",
    JSON.stringify(actualReadOnly) === JSON.stringify(expectedReadOnly),
    actualReadOnly.join(", "),
  );

  check(
    "D",
    "sale is READ_ONLY_PROOF (live read-only spine group)",
    payload.categories.sale?.posture === "READ_ONLY_PROOF",
    payload.categories.sale?.posture,
  );
  check(
    "D",
    "continuity is VERIFIED_SOURCE_PENDING_ADAPTER",
    payload.categories.continuity?.posture === "VERIFIED_SOURCE_PENDING_ADAPTER",
    payload.categories.continuity?.posture,
  );
  check(
    "D",
    "buyReadiness remains NOT_WIRED (no transaction surface)",
    payload.categories.buyReadiness?.posture === "NOT_WIRED",
    payload.categories.buyReadiness?.posture,
  );

  // Founder confirmation: these stay NOT_WIRED (no adapter added in this slice).
  for (const key of ["proof", "treasury", "routing"]) {
    check("D", `${key} remains NOT_WIRED`, payload.categories[key]?.posture === "NOT_WIRED", payload.categories[key]?.posture);
  }
}

// ── run ──────────────────────────────────────────────────────────────────────
const canonFiles = sectionA();
sectionB(canonFiles);
sectionC();
sectionD();

const failed = results.filter((r) => !r.ok);
const sections = ["A", "B", "C", "D"];
console.log("\nCanon Integrity Guard — Phase 1 Slice 2.8\n" + "=".repeat(46));
for (const s of sections) {
  console.log(`\n[${s}]`);
  for (const r of results.filter((r) => r.section === s)) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
  }
}
console.log("\n" + "-".repeat(46));
for (const line of info) console.log(line);
console.log("-".repeat(46));
console.log(`Result: ${results.length - failed.length}/${results.length} checks passed`);

if (failed.length > 0) {
  console.error(`\nGUARD FAILED: ${failed.length} check(s) failed.`);
  process.exit(1);
}
console.log("GUARD PASSED: canon integrity + public payload contract are intact.\n");
