/**
 * GUARD: Part B expectations ↔ vendored canon reconciliation (tsx-only).
 * ----------------------------------------------------------------------
 * Fails loudly if the pinned Part B expectations drift from vendored canon,
 * protocol targets, the shared chain constants, or the crypto primitives.
 * No network, no DB — pure static reconciliation. Runs before any import.
 *
 * Run: pnpm --filter @workspace/api-server run partB-canon:guard
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ARTIFACT_SOURCE_TO_GENERATION,
  PART_B_EXPECTATIONS,
} from "../src/data/partBExpectations";
import {
  KECCAK_ABC,
  KECCAK_EMPTY,
  computeLeaf,
  computeRoot,
  hashPair,
  isStrictChecksumAddress,
  keccakHex,
  keccakOfAscii,
  selectorFor,
  toChecksumAddress,
} from "../src/lib/protocol/merkleFreeze";
import { EXPECTED_CHAIN_ID } from "../src/lib/protocol/rpcTransport";
import {
  CONTRACT_TARGETS,
  SALE_SCAN_TARGETS,
} from "../src/data/protocolTargets";
import {
  SALE_ABI,
  SALE_V2_ABI,
  SALE_V3_ABI,
} from "../src/canon/the-syndicate/contracts/abi/sale-abi";
import { CHAIN_REGISTRY } from "../src/canon/the-syndicate/chain/chain-registry";
import { HISTORICAL_FREEZE_GATE } from "../src/lib/protocol/freezeGate";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, detail?: string) => {
  results.push(detail === undefined ? { name, ok } : { name, ok, detail });
};

const exp = PART_B_EXPECTATIONS;
const HEX_64_RE = /^0x[0-9a-fA-F]{64}$/;
const FULL_ADDRESS_RE = /0x[0-9a-fA-F]{40}/;

// --- 1. crypto self-tests ----------------------------------------------------
check("keccak256 empty vector", keccakHex(new Uint8Array(0)) === KECCAK_EMPTY);
check("keccak256 'abc' vector", keccakOfAscii("abc") === KECCAK_ABC);
check(
  "selector recompute V1_MEMBER_ROOT() == 0x360895d2",
  selectorFor(exp.method) === "0x360895d2" && exp.selector === "0x360895d2",
  `computed=${selectorFor(exp.method)}`,
);

// EIP-55 spec vectors (public test constants from EIP-55, not real parties).
const EIP55_VECTORS = [
  "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
];
check(
  "EIP-55 checksum vectors reproduce",
  EIP55_VECTORS.every(
    (a) => toChecksumAddress(a.toLowerCase()) === a && isStrictChecksumAddress(a),
  ),
);
check(
  "strict policy rejects non-checksummed casing",
  EIP55_VECTORS.every((a) => !isStrictChecksumAddress(a.toLowerCase())),
);

// --- 2. Merkle algorithm sanity ------------------------------------------------
const l0 = keccakOfAscii("partB-guard-leaf-0");
const l1 = keccakOfAscii("partB-guard-leaf-1");
const l2 = keccakOfAscii("partB-guard-leaf-2");
check("computeRoot single leaf == leaf", computeRoot([l0]) === l0);
check("pair hashing is commutative (sorted)", hashPair(l0, l1) === hashPair(l1, l0));
check(
  "odd leaf promoted (3-leaf tree)",
  computeRoot([l0, l1, l2]) === hashPair(hashPair(l0, l1), l2),
);
check(
  "computeLeaf deterministic double-hash",
  computeLeaf(EIP55_VECTORS[0]!, 1) === computeLeaf(EIP55_VECTORS[0]!, 1) &&
    computeLeaf(EIP55_VECTORS[0]!, 1) !== computeLeaf(EIP55_VECTORS[0]!, 2),
);

// --- 3. chain pins reconcile ---------------------------------------------------
check(
  "chainId pin == rpcTransport EXPECTED_CHAIN_ID",
  exp.chainId === EXPECTED_CHAIN_ID,
  `pin=${exp.chainId} transport=${EXPECTED_CHAIN_ID}`,
);
check(
  "chainId pin == canon CHAIN_REGISTRY.id",
  exp.chainId === CHAIN_REGISTRY.id,
  `canon=${CHAIN_REGISTRY.id}`,
);
check("freezeBlock pin == 88496414", exp.freezeBlock === 88_496_414);
check("expected root is bytes32 hex", HEX_64_RE.test(exp.expectedRoot));
check(
  "memberCount 8 and distribution sums",
  exp.memberCount === 8 &&
    exp.distribution.V1 + exp.distribution.V2A + exp.distribution.V2B ===
      exp.memberCount &&
    exp.distribution.V1 === 2 &&
    exp.distribution.V2A === 3 &&
    exp.distribution.V2B === 3,
);

// --- 4. canon ABI carries the authority view ------------------------------------
type AbiEntry = {
  type: string;
  name?: string;
  stateMutability?: string;
  inputs?: unknown[];
  outputs?: { type: string }[];
};
const hasRootView = (abi: readonly unknown[]) =>
  (abi as AbiEntry[]).some(
    (e) =>
      e.type === "function" &&
      e.name === "V1_MEMBER_ROOT" &&
      e.stateMutability === "view" &&
      (e.inputs ?? []).length === 0 &&
      (e.outputs ?? [])[0]?.type === "bytes32",
  );
check("canon SALE_V3_ABI exposes V1_MEMBER_ROOT view", hasRootView(SALE_V3_ABI));
check("canon SALE_V2_ABI exposes V1_MEMBER_ROOT view", hasRootView(SALE_V2_ABI));
check(
  "canon V1 SALE_ABI has NO V1_MEMBER_ROOT (doctrine)",
  !hasRootView(SALE_ABI),
);

// --- 5. protocol targets reconcile ----------------------------------------------
const v3Contract = CONTRACT_TARGETS.find((t) => t.key === exp.authorityEngineKey);
check(
  "authority engine key exists in CONTRACT_TARGETS",
  v3Contract !== undefined && FULL_ADDRESS_RE.test(v3Contract.address),
);
const v3Scan = SALE_SCAN_TARGETS.find(
  (t) => t.key === exp.authorityEngineKey && t.generation === "V3",
);
check(
  "V3 scan target ACTIVE and post-freeze",
  v3Scan !== undefined &&
    v3Scan.status === "ACTIVE" &&
    v3Scan.fromBlock > exp.freezeBlock,
  v3Scan ? `fromBlock=${v3Scan.fromBlock} > freeze=${exp.freezeBlock}` : "missing",
);
const preFreezeGens = SALE_SCAN_TARGETS.filter((t) => t.generation !== "V3");
check(
  "V1/V2A/V2B scan targets are pre-freeze (straddle doctrine)",
  preFreezeGens.length > 0 &&
    preFreezeGens.every((t) => t.fromBlock < exp.freezeBlock),
);

// --- 6. artifact provenance pins --------------------------------------------------
check(
  "provenance commit pinned (40-hex, never 'main')",
  /^[0-9a-f]{40}$/.test(exp.artifact.commitSha),
);
check(
  "artifact paths pinned to freeze block",
  exp.artifact.outputPath.includes(`freeze-${exp.freezeBlock}`) &&
    exp.artifact.inputPath.includes(`freeze-${exp.freezeBlock}`),
);
check(
  "artifact schema id pinned",
  exp.artifact.schema === "syndicate.v3.historical-members.root.v1",
);
check("provenance repo pinned", exp.artifact.repo === "duniterum/TheSyndicate");

// --- 7. source mapping doctrine ------------------------------------------------
check(
  "source map covers exactly V1/V2a/V2b (artifact casing)",
  Object.keys(ARTIFACT_SOURCE_TO_GENERATION).sort().join(",") === "V1,V2a,V2b",
);
check(
  "source map targets enum casing V1/V2A/V2B",
  ARTIFACT_SOURCE_TO_GENERATION.V1 === "V1" &&
    ARTIFACT_SOURCE_TO_GENERATION.V2a === "V2A" &&
    ARTIFACT_SOURCE_TO_GENERATION.V2b === "V2B",
);
check(
  "no V3 in source map (freeze members are pre-freeze only)",
  !("V3" in ARTIFACT_SOURCE_TO_GENERATION),
);

// --- 8. schema layer status ------------------------------------------------------
async function schemaChecks(): Promise<void> {
  const db = await import("@workspace/db");
  check(
    "PART_B_STATUS == IMPORTED_VERIFIED",
    db.PART_B_STATUS === "IMPORTED_VERIFIED",
    String(db.PART_B_STATUS),
  );
  check(
    "partB tables exported from @workspace/db",
    typeof db.historicalMemberFreeze === "object" &&
      typeof db.historicalMember === "object",
  );
}

// --- 9. served-safety of the expectations + gate modules ---------------------------
const stripHashes = (s: string) => s.replace(/0x[0-9a-fA-F]{64}/g, "<h64>");
const expectationsSource = readFileSync(
  join(import.meta.dirname, "../src/data/partBExpectations.ts"),
  "utf8",
);
check(
  "expectations module contains NO contract address",
  !FULL_ADDRESS_RE.test(stripHashes(expectationsSource)),
);
const freezeGateSource = readFileSync(
  join(import.meta.dirname, "../src/lib/protocol/freezeGate.ts"),
  "utf8",
);
// Match actual import syntax only — doc comments may MENTION the package name
// when documenting the no-runtime-DB-read flip semantics.
const DB_IMPORT_RE = /(from\s+["']@workspace\/db["']|import\s*\(\s*["']@workspace\/db["']|require\s*\(\s*["']@workspace\/db["']|import\s+["']@workspace\/db["'])/;
check(
  "freezeGate served module: no addresses, no DB import",
  !FULL_ADDRESS_RE.test(stripHashes(freezeGateSource)) &&
    !DB_IMPORT_RE.test(freezeGateSource),
);
check(
  "freezeGate status vocabulary sane",
  HISTORICAL_FREEZE_GATE.status === "BLOCKED" ||
    (HISTORICAL_FREEZE_GATE.status as string) === "VERIFIED",
  HISTORICAL_FREEZE_GATE.status,
);

// --- report ---------------------------------------------------------------------
schemaChecks()
  .catch((err) => {
    check(
      "schema layer import",
      false,
      err instanceof Error ? err.message.slice(0, 120) : "import failed",
    );
  })
  .finally(() => {
    for (const r of results) {
      console.log(
        `${r.ok ? "[PASS]" : "[FAIL]"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`,
      );
    }
    const passed = results.filter((r) => r.ok).length;
    console.log(`partB-canon-reconcile guard: ${passed}/${results.length} passed`);
    if (passed !== results.length) process.exit(1);
  });
