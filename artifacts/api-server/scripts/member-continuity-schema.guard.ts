/**
 * Member Continuity SCHEMA Doctrine GUARD (static, read-only).
 * ------------------------------------------------------------
 * Verifies the Phase 2 schema-definition slice (lib/db memberContinuity)
 * enforces founder-approved doctrine WITHOUT touching any database:
 *   - sentinel 0 excluded at DDL level;
 *   - no manual / stored-eligibility columns;
 *   - no gated V3 source/referral placeholder columns;
 *   - fail-closed VERIFIED-only persistence;
 *   - per-era numbering-authority cross-checks present;
 *   - entry receipts can never be firstSeat=false rows;
 *   - expression-free indexes (publish-time introspection constraint);
 *   - derived/droppable posture declared; schema-only status marker present;
 *   - served api-server src/ never imports the schema (or @workspace/db).
 *
 * Static source scans strip comments first so doctrine-describing headers
 * (which must NAME the forbidden primitives to ban them) never self-match.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed += 1;
    console.log(`[PASS] ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.error(`[FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Strip block + line comments so header doctrine text never self-matches. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

const SCHEMA_PATH = join(
  process.cwd(),
  "../../lib/db/src/schema/memberContinuity.ts",
);
const BARREL_PATH = join(process.cwd(), "../../lib/db/src/schema/index.ts");
const SERVED_SRC = join(process.cwd(), "src");

const rawSource = readFileSync(SCHEMA_PATH, "utf8");
const code = stripComments(rawSource);

// ---------------------------------------------------------------------------
// 1. Sentinel + numbering doctrine baked into DDL.
// ---------------------------------------------------------------------------
check(
  "sentinel-0 excluded via CHECK member_number >= 1",
  /member_continuity_number_min/.test(code) && />=\s*1/.test(code),
);
check(
  "numbering authority CHECK-limited to the two era authorities",
  /member_continuity_authority_enum/.test(code) &&
    /PART_B_FREEZE_ROOT/.test(code) &&
    /V3_EMITTED/.test(code),
);
check(
  "generation ⇔ authority cross-CHECK present",
  /member_continuity_authority_era/.test(code),
);
check(
  "Part B lineage presence CHECK present",
  /member_continuity_partb_lineage/.test(code),
);
check(
  "V3 raw-event lineage presence CHECK present",
  /member_continuity_v3_lineage/.test(code),
);
check(
  "composite FK to historical_member present (Part B provenance)",
  /member_continuity_partb_fk/.test(code),
);
check(
  "build-lineage FK to verification run present and chain-scoped",
  /member_continuity_build_fk/.test(code) &&
    /member_continuity_build_fk[\s\S]{0,120}?\[t\.chainId,\s*t\.buildId\]/.test(
      code,
    ),
);
check(
  "raw-event lineage FK to sale_event_raw present (structural, not just CHECK)",
  /member_continuity_raw_event_fk/.test(code) &&
    /member_continuity_raw_event_fk[\s\S]{0,200}?saleEventRaw\.id/.test(code),
);

// ---------------------------------------------------------------------------
// 2. No manual fields, no stored eligibility, no gated placeholder columns.
//    (comment-stripped code scan; identifiers only)
// ---------------------------------------------------------------------------
check(
  "no manual-entry column identifiers",
  !/manual/i.test(code),
);
check(
  "no stored-eligibility column identifiers",
  !/eligib/i.test(code),
);
const GATED = [
  /sourceId/i,
  /source_id/i,
  /sourceClass/i,
  /source_class/i,
  /commissionBps/i,
  /commission_bps/i,
  /attributionScope/i,
  /attribution_scope/i,
  /sourceWallet/i,
  /source_wallet/i,
  /referral/i,
];
check(
  "no gated V3 source/referral placeholder columns",
  GATED.every((re) => !re.test(code)),
);

// ---------------------------------------------------------------------------
// 3. Fail-closed persistence + entry-receipt semantics.
// ---------------------------------------------------------------------------
check(
  "verification-run status CHECK-limited to 'VERIFIED'",
  /member_continuity_run_status_verified/.test(code) &&
    /=\s*'VERIFIED'/.test(code),
);
check(
  "run totals reconciliation CHECKs present",
  /member_continuity_run_totals_reconcile/.test(code) &&
    /member_continuity_run_onchain_match/.test(code),
);
const firstSeatCheck = code.match(
  /member_continuity_entry_first_seat[\s\S]{0,200}?IN\s*\(([^)]*)\)/,
);
check(
  "entry_first_seat CHECK admits only 'true' | 'unknown' (never 'false')",
  firstSeatCheck !== null &&
    /'true'/.test(firstSeatCheck[1]) &&
    /'unknown'/.test(firstSeatCheck[1]) &&
    !/'false'/.test(firstSeatCheck[1]),
);
check(
  "routed fold restricted to V2A/V2B eras",
  /member_continuity_routed_fold_era/.test(code),
);

// ---------------------------------------------------------------------------
// 4. Index + posture discipline.
// ---------------------------------------------------------------------------
check(
  "expression-free indexes (no lower(...) or sql`` inside index defs)",
  !/lower\s*\(/i.test(code),
);
check(
  "derived/droppable posture declared in header",
  /DERIVED/.test(rawSource) && /DROPPABLE/i.test(rawSource),
);
check(
  "schema-only boundary marker present (SCHEMA_DEFINED_NOT_PUSHED)",
  /MEMBER_CONTINUITY_SCHEMA_STATUS\s*=\s*\n?\s*"SCHEMA_DEFINED_NOT_PUSHED"/.test(
    rawSource,
  ),
);

// ---------------------------------------------------------------------------
// 5. Barrel export + served-code isolation.
// ---------------------------------------------------------------------------
const barrel = readFileSync(BARREL_PATH, "utf8");
check(
  "barrel exports ./memberContinuity",
  /export \* from "\.\/memberContinuity"/.test(barrel),
);

/**
 * Import-syntax matcher (NOT a plain text scan): served code may legitimately
 * MENTION table names in honesty strings (e.g. freezeGate's "No
 * member_continuity table" note). Doctrine forbids IMPORTS. Covers static
 * imports, bare side-effect imports, dynamic import(), and require().
 */
const FORBIDDEN_MODULE = /(@workspace\/db|lib\/db|memberContinuity)/;
const IMPORT_FORMS = [
  /import\s[^;]*?from\s*["']([^"']+)["']/g,
  /import\s*["']([^"']+)["']/g,
  /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  /require\s*\(\s*["']([^"']+)["']\s*\)/g,
];
function findForbiddenImports(source: string): string[] {
  const specifiers: string[] = [];
  for (const re of IMPORT_FORMS) {
    for (const m of source.matchAll(re)) {
      if (FORBIDDEN_MODULE.test(m[1])) specifiers.push(m[1]);
    }
  }
  return specifiers;
}

function walk(dir: string, hits: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      walk(p, hits);
    } else if (p.endsWith(".ts")) {
      const served = stripComments(readFileSync(p, "utf8"));
      const bad = findForbiddenImports(served);
      if (bad.length > 0) {
        hits.push(`${p} -> ${bad.join(", ")}`);
      }
    }
  }
}
const servedHits: string[] = [];
walk(SERVED_SRC, servedHits);
check(
  "served src/ never imports the schema or @workspace/db (import-syntax scan)",
  servedHits.length === 0,
  servedHits.length ? `hits: ${servedHits.join("; ")}` : "0 import hits",
);

// ---------------------------------------------------------------------------
console.log(`\nmember-continuity-schema guard: ${passed}/${passed + failed} passed`);
if (failed > 0) {
  process.exit(1);
}
