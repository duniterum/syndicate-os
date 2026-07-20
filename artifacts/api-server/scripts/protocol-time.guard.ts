/**
 * Protocol Time guard — fixture + static verification (SERVER-ONLY, tsx-run).
 * ---------------------------------------------------------------------------
 * Verifies, WITHOUT any network or DB dependency:
 *   A. Fixture behaviour of the pure core helpers (parse / plausibility /
 *      monotonicity / witness divergence / output gate / redaction).
 *      All fixture hex is BUILT AT RUNTIME — never literal long hex.
 *   B. Static discipline of the enrichment runner:
 *      - timestamps are chain-derived only (Date.now confined to the sanity bound)
 *      - decodedJson / rawJson are never touched
 *      - writes target block_timestamp ONLY; no update/delete anywhere
 *      - chainId is anchored to EXPECTED_CHAIN_ID via probeChain-first
 *      - no RPC URL/secret can reach the report (output gate + redaction)
 *      - scope is the existing raw index only (no eth_getLogs / rescan)
 *   C. Surface discipline: no new public route; served src/ never reads the
 *      block_timestamp cache; package scripts registered tsx script-side only.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AVALANCHE_CCHAIN_ERA_MIN_SEC,
  MAX_FUTURE_SKEW_SEC,
  parseHexQuantity,
  parseBlockHash,
  parseBlockHeader,
  checkPlausibility,
  checkMonotonicNonDecreasing,
  checkWitness,
  assertTimeSafeOutput,
  redactError,
  toIsoUtc,
} from "../src/lib/protocol/protocolTimeCore";

let passCount = 0;
let failCount = 0;
function check(name: string, pass: boolean, detail?: string): void {
  if (pass) {
    passCount += 1;
    process.stdout.write(`[PASS] ${name}${detail ? ` — ${detail}` : ""}\n`);
  } else {
    failCount += 1;
    process.stdout.write(`[FAIL] ${name}${detail ? ` — ${detail}` : ""}\n`);
  }
}
function throws(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

// Runtime-built hex fixtures (never literal long hex — leak-guard discipline).
const hex64 = "ab".repeat(32);
const goodHash = "0x" + hex64;
const otherHash = "0x" + "cd".repeat(32);
const T0 = AVALANCHE_CCHAIN_ERA_MIN_SEC + 50_000_000;
const NOW = T0 + 1_000_000;
const hexTs = "0x" + T0.toString(16);

// --- A. Fixture behaviour -------------------------------------------------
check("parseHexQuantity parses a valid quantity", parseHexQuantity("0x10", "q") === 16);
check("parseHexQuantity rejects non-hex", throws(() => parseHexQuantity("16", "q")));
check("parseHexQuantity rejects non-string", throws(() => parseHexQuantity(16, "q")));
check("parseBlockHash accepts a 32-byte hash", parseBlockHash(goodHash, "h") === goodHash);
check("parseBlockHash rejects short hex", throws(() => parseBlockHash("0x" + "ab".repeat(20), "h")));

const goodHeader = { number: "0x64", hash: goodHash, timestamp: hexTs };
const parsed = parseBlockHeader(goodHeader, 100);
check(
  "parseBlockHeader parses a verified header",
  parsed.blockNumber === 100 && parsed.blockHash === goodHash && parsed.timestampSec === T0,
);
check(
  "parseBlockHeader HARD FAILS on requested/returned block mismatch",
  throws(() => parseBlockHeader(goodHeader, 101)),
);
check(
  "parseBlockHeader HARD FAILS on zero timestamp",
  throws(() => parseBlockHeader({ ...goodHeader, timestamp: "0x0" }, 100)),
);
check(
  "parseBlockHeader HARD FAILS on missing hash",
  throws(() => parseBlockHeader({ number: "0x64", timestamp: hexTs }, 100)),
);

check("plausibility accepts an in-era timestamp", checkPlausibility(T0, NOW).pass);
check(
  "plausibility rejects a pre-C-Chain-era timestamp",
  !checkPlausibility(AVALANCHE_CCHAIN_ERA_MIN_SEC - 1, NOW).pass,
);
check(
  "plausibility rejects a future timestamp beyond skew",
  !checkPlausibility(NOW + MAX_FUTURE_SKEW_SEC + 1, NOW).pass,
);
check(
  "plausibility tolerates small clock skew (sanity bound, not a source)",
  checkPlausibility(NOW + MAX_FUTURE_SKEW_SEC - 1, NOW).pass,
);

check(
  "monotonicity accepts EQUAL adjacent timestamps (non-decreasing, chain-legal)",
  checkMonotonicNonDecreasing([
    { blockNumber: 1, timestampSec: T0 },
    { blockNumber: 2, timestampSec: T0 },
    { blockNumber: 3, timestampSec: T0 + 2 },
  ]).pass,
);
check(
  "monotonicity rejects a decreasing timestamp",
  !checkMonotonicNonDecreasing([
    { blockNumber: 1, timestampSec: T0 + 10 },
    { blockNumber: 2, timestampSec: T0 },
  ]).pass,
);

check(
  "witness passes when hash+timestamp agree",
  !throws(() =>
    checkWitness(
      { blockHash: goodHash, timestampSec: T0 },
      { blockHash: goodHash, timestampSec: T0 },
      "fixture",
    ),
  ),
);
check(
  "witness passes when witness has no recorded hash (nullable raw rows)",
  !throws(() =>
    checkWitness({ blockHash: goodHash, timestampSec: T0 }, { blockHash: null }, "fixture"),
  ),
);
check(
  "witness HARD FAILS on hash divergence",
  throws(() =>
    checkWitness(
      { blockHash: goodHash, timestampSec: T0 },
      { blockHash: otherHash, timestampSec: T0 },
      "fixture",
    ),
  ),
);
check(
  "witness HARD FAILS on timestamp divergence",
  throws(() =>
    checkWitness(
      { blockHash: goodHash, timestampSec: T0 },
      { blockHash: goodHash, timestampSec: T0 + 1 },
      "fixture",
    ),
  ),
);

check(
  "output gate rejects URLs",
  throws(() => assertTimeSafeOutput('{"x":"https://example.invalid/rpc"}')),
);
check(
  "output gate rejects 20-byte hex material",
  throws(() => assertTimeSafeOutput('{"x":"0x' + "ab".repeat(20) + '"}')),
);
check(
  "output gate rejects bare 32-byte hex",
  throws(() => assertTimeSafeOutput('{"x":"' + hex64 + '"}')),
);
check(
  "output gate accepts a counts/dates-only report",
  !throws(() =>
    assertTimeSafeOutput(
      JSON.stringify({ chainId: 43114, cachedBlocks: 3, iso: toIsoUtc(T0) }),
    ),
  ),
);
check(
  "redactError strips URLs and long hex",
  (() => {
    const red = redactError(`fail at https://x.invalid/k?key=abc block ${goodHash}`);
    return !/https?:/.test(red) && !red.includes(hex64);
  })(),
);

// --- B. Static discipline of the runner ------------------------------------
// Static scans operate on COMMENT-STRIPPED source: doc headers legitimately
// name the very primitives they forbid ("no eth_getLogs", "never reads
// decodedJson"), so scanning raw text would self-match on documentation.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => {
      const idx = l.indexOf("//");
      return idx === -1 ? l : l.slice(0, idx);
    })
    .join("\n");
}

const here = dirname(fileURLToPath(import.meta.url));
const enrichSrc = stripComments(
  readFileSync(join(here, "protocol-time-enrich.ts"), "utf8"),
);
// M4-a: the core moved to served src (ONE source shared by the founder-gated
// replay script and the unattended backbone's incremental enrichment).
const coreSrc = stripComments(
  readFileSync(
    join(here, "..", "src", "lib", "protocol", "protocolTimeCore.ts"),
    "utf8",
  ),
);

{
  const dateNowLines = enrichSrc
    .split("\n")
    .filter((l) => l.includes("Date.now"));
  check(
    "runner: Date.now confined to the sanity upper bound (never a timestamp source)",
    dateNowLines.length === 1 && dateNowLines[0].includes("nowSec"),
    `dateNowLines=${dateNowLines.length}`,
  );
}
check(
  "runner: never touches decodedJson / rawJson",
  !enrichSrc.includes("decodedJson") &&
    !enrichSrc.includes("decoded_json") &&
    !enrichSrc.includes("rawJson") &&
    !enrichSrc.includes("raw_json"),
);
{
  const inserts = enrichSrc.match(/\.insert\(([^)]*)\)/g) ?? [];
  check(
    "runner: INSERTs target block_timestamp only",
    inserts.length === 1 && inserts[0].includes("blockTimestamp"),
    `inserts=${inserts.length}`,
  );
  check(
    "runner: no update/delete anywhere",
    !enrichSrc.includes(".update(") && !enrichSrc.includes(".delete("),
  );
  check(
    "runner: no raw-SQL writes",
    !/insert\s+into|update\s+\w+\s+set|delete\s+from/i.test(
      enrichSrc.replace(/writes are INSERTs into block_timestamp only[^"]*/g, ""),
    ),
  );
}
check(
  "runner: probeChain gates everything and EXPECTED_CHAIN_ID anchors rows",
  enrichSrc.includes("probeChain(transport)") &&
    enrichSrc.includes("probe.chainIdOk") &&
    enrichSrc.includes("chainIds[0] === EXPECTED_CHAIN_ID"),
);
check(
  "runner: scope is the existing raw index only (no rescan primitives)",
  !enrichSrc.includes("ethGetLogs") && !enrichSrc.includes("eth_getLogs"),
);
check(
  "runner: report passes the fail-closed output gate before printing",
  enrichSrc.includes("assertTimeSafeOutput(serialized)"),
);
check(
  "runner: hard-fail path prints REDACTED errors only",
  enrichSrc.includes("redactError(message)"),
);
check(
  "runner: no env secret value is ever printed (only names are referenced)",
  !/process\.stdout\.write\([^)]*process\.env/.test(enrichSrc) &&
    !/console\.log/.test(enrichSrc),
);
check(
  "core: pure module — no DB, no network, no canon import",
  !coreSrc.includes("@workspace/db") &&
    !coreSrc.includes("rpcTransport") &&
    !coreSrc.includes("../src/canon") &&
    !coreSrc.includes("fetch("),
);

// --- C. Surface discipline ---------------------------------------------------
{
  const routesDir = join(here, "..", "src", "routes");
  const routeFiles = readdirSync(routesDir).sort();
  const allowed = [
    // Founder-approved backbone feed route (M4-b): receipt lines only —
    // public chain data per line; its output gate (exact-shape verify
    // anchors masked, strict scan on the rest) is pinned by backbone.guard.ts.
    "backboneFeed.ts",
    // Founder-approved backbone status route (M4-a): address-safe aggregate
    // snapshot only; its output gate is pinned by backbone.guard.ts.
    "backboneStatus.ts",
    // S7 capital-standing route: one PUBLIC seat ordinal in, a rung TITLE
    // out — the canon walk's end state; no wallet material, no amount served.
    "capitalStanding.ts",
    "health.ts",
    "holderIndex.ts",
    "index.ts",
    "joinQuote.ts",
    "protocolReality.ts",
    "publicReadThrottle.ts",
    // The painted preview cards (2026-07-20): one hash + face in, a painted
    // PNG out — relays the row's sealedAtSec like the reads do; never
    // touches the block_timestamp cache (the scan below covers it).
    "receiptCard.ts",
    // The /receipt/{txHash} public read (Q44 sealed; slice 2026-07-20): one
    // shape-validated tx hash in, that purchase's own receipt row out. It
    // relays the row's sealedAtSec exactly as the auth read does (the field
    // is named WITHOUT the cache vocabulary by design) and never touches
    // the block_timestamp cache — the scan below covers it like every route.
    "receiptLookup.ts",
    "sourceStatus.ts",
    "sourceValidate.ts",
    // Founder-approved explorer-links route (infra addresses only, never member
    // wallets — its own doctrine + member-continuity.guard pin that invariant).
    "verifyLinks.ts",
  ];
  check(
    "public route surface pinned (backboneFeed, backboneStatus, capitalStanding, health, holderIndex, index, joinQuote, protocolReality, publicReadThrottle, receiptCard, receiptLookup, sourceStatus, sourceValidate, verifyLinks only)",
    JSON.stringify(routeFiles) === JSON.stringify(allowed),
    `routes=${JSON.stringify(routeFiles)}`,
  );
}
{
  const srcDir = join(here, "..", "src");
  // M4-a: the BACKBONE ZONE is the one founder-approved exception — its
  // incremental enrichment writes the cache and its loader reads it, with the
  // discipline pinned by backbone.guard.ts. Everything else in src/ stays
  // forbidden from touching the cache.
  const backboneDir = join(srcDir, "backbone");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "canon") continue;
        walk(p);
      } else if (entry.name.endsWith(".ts")) {
        files.push(p);
      }
    }
  };
  walk(srcDir);
  const offenders = files.filter((f) => {
    if (f.startsWith(backboneDir)) return false; // the approved zone
    const s = stripComments(readFileSync(f, "utf8"));
    return s.includes("blockTimestamp") || s.includes("block_timestamp");
  });
  check(
    "served src/ outside the backbone zone NEVER touches the block_timestamp cache",
    offenders.length === 0,
    `servedFiles=${files.length}`,
  );
}
{
  const pkg = JSON.parse(
    readFileSync(join(here, "..", "package.json"), "utf8"),
  ) as { scripts?: Record<string, string> };
  const s = pkg.scripts ?? {};
  check(
    "package scripts registered (enrich + status + guard), tsx script-side only",
    (s["protocol-time:enrich"] ?? "").includes("tsx ./scripts/protocol-time-enrich.ts") &&
      (s["protocol-time:status"] ?? "").includes("--status") &&
      (s["protocol-time:guard"] ?? "").includes("tsx ./scripts/protocol-time.guard.ts"),
  );
}

process.stdout.write(
  `protocol-time guard: ${passCount}/${passCount + failCount} passed\n`,
);
if (failCount > 0) process.exitCode = 1;
