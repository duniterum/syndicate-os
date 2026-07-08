/**
 * Holder Index guard — static regression net (no DB, no network).
 * ---------------------------------------------------------------------------
 * Locks the founder-approved Holder Index boundaries:
 *
 *   1. The generated served snapshot module is import-free (a static literal
 *      can never perform a runtime database read), carries the generated
 *      header, and contains no address tokens or PII field names in CODE
 *      (comments are stripped before matching — never line-scan raw source).
 *   2. Structural era invariants on the imported snapshot: exactly the two
 *      numbering authorities, seats #1–#8 under PART_B_FREEZE_ROOT, seats #9+
 *      contiguous under V3_EMITTED, totals reconciled, timestamp coverage
 *      complete, status VERIFIED, and a self-consistent snapshotHash pin.
 *   3. Aggregate-only shape: the ONLY arrays in the snapshot are the 2-entry
 *      `eras` array and the string-only `boundaries` array — no per-seat rows
 *      can hide anywhere in the payload.
 *   4. The holder-index route imports only the snapshot + generated Zod
 *      schema, and NO served src file imports @workspace/db under any import
 *      syntax (static, dynamic, side-effect, or require). The snapshot
 *      module itself may be imported ONLY by the allow-listed served files
 *      (the public route + the pure own-standing mapping module, founder
 *      Decision 5a) — any new importer fails this guard.
 *   5. The OpenAPI HolderIndex schemas expose only the allow-listed property
 *      names (no wallet/address/transaction-shaped fields can be added
 *      without failing this guard).
 *
 * Usage: pnpm --filter @workspace/api-server run holder-index:guard
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import {
  computeSnapshotHash,
  ERA_PART_B,
  ERA_V3,
  ERA_PART_B_LABEL,
  ERA_V3_LABEL,
  type HolderIndexAggregates,
} from "./holder-index-core";
import { HOLDER_INDEX_SNAPSHOT } from "../src/lib/protocol/holderIndexSnapshot";
import { resolveStandingIn } from "../src/lib/protocol/holderIndexStanding";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT_PATH = resolve(ROOT, "src/lib/protocol/holderIndexSnapshot.ts");
const ROUTE_PATH = resolve(ROOT, "src/routes/holderIndex.ts");
const OPENAPI_PATH = resolve(ROOT, "../../lib/api-spec/openapi.yaml");

const failures: string[] = [];
const passes: string[] = [];

function check(name: string, ok: boolean, detail?: string): void {
  if (ok) passes.push(name);
  else failures.push(detail ? `${name} — ${detail}` : name);
}

/** Strip block and line comments before matching (guard doctrine). */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

// Any import/require syntax, including bare side-effect imports.
const DB_IMPORT_RE =
  /(from\s*["']@workspace\/db["'])|(import\s*["']@workspace\/db["'])|(import\s*\(\s*["']@workspace\/db["']\s*\))|(require\s*\(\s*["']@workspace\/db["']\s*\))/;

const STANDALONE_ADDRESS_RE = /0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/;

// ---------------------------------------------------------------------------
// 1. Snapshot module: generated, import-free, leak-free code
// ---------------------------------------------------------------------------

check("snapshot module exists", existsSync(SNAPSHOT_PATH), SNAPSHOT_PATH);

const snapshotRaw = existsSync(SNAPSHOT_PATH) ? readFileSync(SNAPSHOT_PATH, "utf8") : "";
const snapshotCode = stripComments(snapshotRaw);

check(
  "snapshot module carries the GENERATED header",
  snapshotRaw.includes("GENERATED FILE") && snapshotRaw.includes("DO NOT EDIT BY HAND"),
);
check(
  "snapshot module is import-free (no import/require of any kind in code)",
  !/\bimport\b/.test(snapshotCode) && !/\brequire\s*\(/.test(snapshotCode),
  "a static served snapshot must not import anything",
);
check(
  "snapshot module code contains no standalone 0x address token",
  !STANDALONE_ADDRESS_RE.test(snapshotCode),
);
const PII_IDENTIFIERS = [
  "entryWallet",
  "entry_wallet",
  "entryTransaction",
  "entry_transaction",
  "entryLogIndex",
  "entry_log_index",
  "entryRoutedFold",
  "entry_routed_fold",
];
for (const id of PII_IDENTIFIERS) {
  check(`snapshot module code is free of PII identifier "${id}"`, !snapshotCode.includes(id));
}

// ---------------------------------------------------------------------------
// 2. Structural era invariants + hash pin (imported literal)
// ---------------------------------------------------------------------------

const snap = HOLDER_INDEX_SNAPSHOT;
check("snapshot status is VERIFIED", snap.status === "VERIFIED");
check("snapshot gate tag matches", snap.gate === "HOLDER_INDEX_AGGREGATES_V1");
check("snapshot has exactly 2 eras", snap.eras.length === 2);

const partB = snap.eras.find((e) => e.era === ERA_PART_B);
const v3 = snap.eras.find((e) => e.era === ERA_V3);
check("PART_B_FREEZE_ROOT era present", partB !== undefined);
check("V3_EMITTED era present", v3 !== undefined);
if (partB && v3) {
  check("PART_B era label is founder-locked", partB.label === ERA_PART_B_LABEL, partB.label);
  check("V3 era label is founder-locked", v3.label === ERA_V3_LABEL, v3.label);
  check("PART_B seats start at #1", partB.seatNumberLow === 1);
  check("PART_B seats end at #8", partB.seatNumberHigh === 8);
  check(
    "PART_B count matches its seat range",
    partB.count === partB.seatNumberHigh - partB.seatNumberLow + 1,
  );
  check("V3 seats start at #9 (immediately after the freeze era)", v3.seatNumberLow === 9);
  check("V3 count matches its seat range", v3.count === v3.seatNumberHigh - v3.seatNumberLow + 1);
  check("memberTotal reconciles with era counts", snap.memberTotal === partB.count + v3.count);
}
check(
  "timestamp coverage is complete (fail-closed founder non-negotiable)",
  snap.timestampCoverage.withVerifiedTimestamp === snap.timestampCoverage.total &&
    snap.timestampCoverage.total === snap.memberTotal,
);
check("chainId is Avalanche C-Chain", snap.chainId === 43114);

const { snapshotHash, ...aggregates } = snap;
check(
  "snapshotHash pin is self-consistent with content",
  computeSnapshotHash(aggregates as HolderIndexAggregates) === snapshotHash,
  "the generated module was altered outside the gated build",
);

// ---------------------------------------------------------------------------
// 3. Aggregate-only shape: no per-seat arrays anywhere
// ---------------------------------------------------------------------------

function collectArrayPaths(value: unknown, path: string, out: string[]): void {
  if (Array.isArray(value)) {
    out.push(path);
    value.forEach((v, i) => collectArrayPaths(v, `${path}[${i}]`, out));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectArrayPaths(v, path ? `${path}.${k}` : k, out);
  }
}
const arrayPaths: string[] = [];
collectArrayPaths(snap, "", arrayPaths);
const allowedArrays = new Set(["eras", "boundaries"]);
const illegalArrays = arrayPaths.filter((p) => !allowedArrays.has(p));
check(
  "only `eras` and `boundaries` arrays exist (no per-seat rows possible)",
  illegalArrays.length === 0,
  illegalArrays.join(", "),
);
check(
  "boundaries is string-only",
  snap.boundaries.every((b) => typeof b === "string"),
);

// ---------------------------------------------------------------------------
// 4. Route + served-src import discipline
// ---------------------------------------------------------------------------

check("holder-index route exists", existsSync(ROUTE_PATH), ROUTE_PATH);
const routeCode = stripComments(existsSync(ROUTE_PATH) ? readFileSync(ROUTE_PATH, "utf8") : "");
check(
  "route validates through the generated Zod schema",
  routeCode.includes("GetHolderIndexResponse.parse("),
);
check(
  "route imports the static snapshot (no other data source)",
  routeCode.includes("../lib/protocol/holderIndexSnapshot"),
);
for (const banned of ["@workspace/db", "drizzle", '"pg"', "'pg'"]) {
  check(`route is free of ${banned}`, !routeCode.includes(banned));
}

function walkTsFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "canon" || entry === "node_modules") continue;
      walkTsFiles(full, out);
    } else if (/\.(ts|tsx|mts|cts)$/.test(entry)) {
      out.push(full);
    }
  }
}
const servedFiles: string[] = [];
walkTsFiles(resolve(ROOT, "src"), servedFiles);
// Founder-approved lazy-DB exceptions: the operator-role bridge (read-only
// ACTIVE lookup) and the operator write-zone service may reach @workspace/db,
// but ONLY via a lazy dynamic import() — never a static/top-level/require
// form — so the served read-only server still boots with no DB. Their full
// fail-closed shapes are pinned by guard-auth-zone.ts.
const DB_LAZY_ALLOW = new Set([
  "src/auth/operatorContext.ts",
  "src/operator/referralTermsService.ts",
]);
const DB_STATIC_IMPORT_RE =
  /(from\s*["']@workspace\/db["'])|(import\s*["']@workspace\/db["'])|(require\s*\(\s*["']@workspace\/db["']\s*\))/;
const dbImporters = servedFiles.filter((f) => {
  const code = stripComments(readFileSync(f, "utf8"));
  if (!DB_IMPORT_RE.test(code)) return false;
  const rel = relative(ROOT, f).split("\\").join("/");
  return !(DB_LAZY_ALLOW.has(rel) && !DB_STATIC_IMPORT_RE.test(code));
});
check(
  "NO served src file imports @workspace/db (lazy-only allow-list: operatorContext.ts + referralTermsService.ts)",
  dbImporters.length === 0,
  dbImporters.map((f) => relative(ROOT, f)).join(", "),
);
for (const relPath of DB_LAZY_ALLOW) {
  const abs = resolve(ROOT, relPath);
  const code = existsSync(abs) ? stripComments(readFileSync(abs, "utf8")) : "";
  check(
    `lazy-DB exception ${relPath} exists and stays dynamic-only`,
    code.length > 0 &&
      /import\s*\(\s*["']@workspace\/db["']\s*\)/.test(code) &&
      !DB_STATIC_IMPORT_RE.test(code),
    code.length === 0 ? "file missing" : "static/require @workspace/db form detected",
  );
}

// Snapshot importer allow-list (founder Decision 5a): the static snapshot may
// be consumed ONLY by the public aggregates route and the pure own-standing
// mapping module. Any import syntax counts; comments are stripped first.
const SNAPSHOT_IMPORT_RE =
  /(from\s*["'][^"']*holderIndexSnapshot["'])|(import\s*["'][^"']*holderIndexSnapshot["'])|(import\s*\(\s*["'][^"']*holderIndexSnapshot["']\s*\))|(require\s*\(\s*["'][^"']*holderIndexSnapshot["']\s*\))/;
const SNAPSHOT_IMPORTER_ALLOW = new Set([
  "src/routes/holderIndex.ts",
  "src/lib/protocol/holderIndexStanding.ts",
]);
const snapshotImporters = servedFiles
  .filter((f) => f !== SNAPSHOT_PATH)
  .filter((f) => SNAPSHOT_IMPORT_RE.test(stripComments(readFileSync(f, "utf8"))))
  .map((f) => relative(ROOT, f));
const illegalSnapshotImporters = snapshotImporters.filter(
  (f) => !SNAPSHOT_IMPORTER_ALLOW.has(f),
);
check(
  "snapshot imported only by allow-listed served files (route + standing module)",
  illegalSnapshotImporters.length === 0,
  illegalSnapshotImporters.join(", "),
);
check(
  "own-standing mapping module exists and imports the snapshot",
  snapshotImporters.includes("src/lib/protocol/holderIndexStanding.ts"),
  "src/lib/protocol/holderIndexStanding.ts missing or no longer bound to the snapshot",
);

// ---------------------------------------------------------------------------
// 5. OpenAPI HolderIndex schema property allow-list
// ---------------------------------------------------------------------------

const openapi = existsSync(OPENAPI_PATH) ? readFileSync(OPENAPI_PATH, "utf8") : "";
check("openapi.yaml found", openapi.length > 0, OPENAPI_PATH);

function extractSchemaBlock(source: string, schemaName: string): string | null {
  const lines = source.split("\n");
  const startIdx = lines.findIndex((l) => l.trim() === `${schemaName}:` && /^ {4}\S/.test(l));
  if (startIdx === -1) return null;
  const block: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^ {4}\S/.test(line)) break;
    block.push(line);
  }
  return block.join("\n");
}

const ALLOWED_PROPS: Record<string, Set<string>> = {
  HolderIndexEra: new Set(["era", "label", "doctrine", "count", "seatNumberLow", "seatNumberHigh"]),
  HolderIndexResponse: new Set([
    "mode",
    "status",
    "chainId",
    "freezeBlock",
    "memberTotal",
    "eras",
    "timestampCoverage",
    "withVerifiedTimestamp",
    "total",
    "provenance",
    "runId",
    "builtAt",
    "builderVersion",
    "sourceDeterminismHash",
    "inputSaleEventCount",
    "inputMaxSaleEventRawId",
    "boundaries",
    "snapshotHash",
  ]),
};

for (const [schemaName, allowed] of Object.entries(ALLOWED_PROPS)) {
  const block = extractSchemaBlock(openapi, schemaName);
  check(`openapi schema ${schemaName} exists`, block !== null);
  if (block === null) continue;
  // Property names are keys nested under a `properties:` line.
  const propNames: string[] = [];
  const lines = block.split("\n");
  const propIndents: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const m = /^(\s*)properties:\s*$/.exec(line);
    if (m) propIndents.push(m[1]!.length + 2);
    const keyMatch = /^(\s*)([A-Za-z_][A-Za-z0-9_]*):\s*$/.exec(line) ?? /^(\s*)([A-Za-z_][A-Za-z0-9_]*):\s+\S/.exec(line);
    if (keyMatch && propIndents.includes(keyMatch[1]!.length)) {
      const key = keyMatch[2]!;
      if (!["type", "enum", "items", "properties", "required", "description", "anyOf", "maxItems", "$ref"].includes(key)) {
        propNames.push(key);
      }
    }
  }
  const illegal = propNames.filter((p) => !allowed.has(p));
  check(
    `openapi schema ${schemaName} exposes only allow-listed properties`,
    illegal.length === 0,
    `unexpected: ${illegal.join(", ")}`,
  );
}

// ---------------------------------------------------------------------------
// 6. Executed pure-mapping assertions (founder Decision 5a self-readback):
//    resolveStandingIn is exercised against the REAL served snapshot for
//    every branch — MAPPED (both eras, both boundaries), STALE, sentinel,
//    malformed input — plus synthetic UNRECONCILED/AMBIGUOUS snapshots.
//    The auth fixture wallet is never a member, so without these the
//    MAPPED/STALE paths would ship with zero executed coverage.

{
  const snap = HOLDER_INDEX_SNAPSHOT;
  const partB = snap.eras.find((e) => e.era === ERA_PART_B);
  const v3 = snap.eras.find((e) => e.era === ERA_V3);
  check("standing: snapshot carries both eras for mapping tests", partB !== undefined && v3 !== undefined);

  if (partB && v3) {
    for (const [input, expected] of [
      ["0", "OUT_OF_RANGE"], // engine sentinel — never a seat
      ["abc", "OUT_OF_RANGE"],
      ["01", "OUT_OF_RANGE"], // non-canonical decimal rejected
      ["-1", "OUT_OF_RANGE"],
      ["", "OUT_OF_RANGE"],
      [(BigInt(v3.seatNumberHigh) + 1n).toString(), "STALE"], // engine ahead of snapshot
      [(BigInt(v3.seatNumberHigh) + 1000000n).toString(), "STALE"],
    ] as const) {
      const r = resolveStandingIn(snap, input);
      check(`standing: "${input}" → ${expected}`, r.kind === expected, `got ${r.kind}`);
    }

    for (const [era, seat] of [
      [partB, partB.seatNumberLow],
      [partB, partB.seatNumberHigh],
      [v3, v3.seatNumberLow],
      [v3, v3.seatNumberHigh],
    ] as const) {
      const r = resolveStandingIn(snap, seat);
      check(
        `standing: seat ${seat} → MAPPED ${era.era} with verbatim authority label`,
        r.kind === "MAPPED" &&
          r.era === era.era &&
          r.authority === era.era &&
          r.authorityLabel === era.label &&
          r.continuityStatus === "VERIFIED_IN_SNAPSHOT" &&
          r.snapshotHash === snap.snapshotHash &&
          r.snapshotStatus === "VERIFIED",
        `got ${JSON.stringify(r)}`,
      );
    }

    // Era boundary sanity for the label authorities themselves.
    check(
      "standing: era labels are the canonical authority labels",
      partB.label === ERA_PART_B_LABEL && v3.label === ERA_V3_LABEL,
    );

    // Synthetic UNRECONCILED: any non-VERIFIED status fails closed before
    // any range check runs (even for an otherwise-valid seat).
    const unverified = { ...snap, status: "PENDING" };
    const ru = resolveStandingIn(unverified as typeof snap, partB.seatNumberLow);
    check('standing: non-VERIFIED snapshot → UNRECONCILED', ru.kind === "UNRECONCILED", `got ${ru.kind}`);

    // Synthetic AMBIGUOUS: overlapping era ranges (impossible by
    // construction in a real build) must fail closed, never pick one.
    const overlapping = {
      ...snap,
      eras: [
        { ...partB, seatNumberLow: "1", seatNumberHigh: "10" },
        { ...v3, seatNumberLow: "5", seatNumberHigh: "20" },
      ],
    };
    const ra = resolveStandingIn(overlapping as typeof snap, "7");
    check("standing: overlapping eras → AMBIGUOUS", ra.kind === "AMBIGUOUS", `got ${ra.kind}`);
  }
}

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`holder-index guard: FAIL (${failures.length} failure(s); ${passes.length} passed)`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`holder-index guard: OK — ${passes.length} checks passed.`);
