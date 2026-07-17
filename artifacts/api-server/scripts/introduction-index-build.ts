/**
 * CLI: introduction-index build (R5) — founder-gated, read-only against chain.
 * ---------------------------------------------------------------------------
 * Drives the SAME scan engine as the raw sale-event indexer (adaptive chunked
 * eth_getLogs with zero-gap discipline) over EXACTLY the V3
 * MembershipPurchasedV3 unit, IN MEMORY (no DB), then:
 *   1. filters attributed rows (sourceId != 0),
 *   2. live-reads at head: SYN balanceOf(recipient) per introduced member
 *      (the founder-decided DURABLE test) + sale sourceEscrowOwed(sourceId),
 *   3. cross-checks the scan against live memberCount (fail closed),
 *   4. builds the PURE read-model and rewrites the generated served snapshot
 *      src/lib/protocol/introductionSnapshot.ts (address-free by construction;
 *      per-source rows keyed by the opaque sourceKey, never the raw id).
 *
 * COMPLETENESS DISCIPLINE (the 2026-07-12 standing rule): every scan unit must
 * report status "ok" with scannedTo == head, else the build ABORTS — a snapshot
 * is never emitted from a scan with holes. A chunked public-RPC scan is only
 * trusted because the engine verifies contiguous coverage; silence is never
 * read as absence.
 *
 * Usage:  npm run introductions:build            (writes the snapshot file)
 *         npm run introductions:build -- --check (build + compare, no write —
 *                                                 exits 1 on drift)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { keccak256, encodePacked, getAddress, decodeAbiParameters } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  assertAddressSafeAggregate,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import { ethCall, ethGetBlockByNumber } from "../src/lib/protocol/evmRead";
import { callData } from "../src/lib/protocol/archiveDecoders";
import { decodeUint256Decimal } from "../src/lib/protocol/saleDecoders";
import { SELECTOR_BALANCE_OF } from "../src/lib/protocol/financialDecoders";
import { addressWord, bytes32Word } from "../src/lib/protocol/sourceDecoders";
import {
  expandScanUnits,
  runSaleEventScan,
  type Persistence,
  type RawEventRecord,
} from "../src/lib/protocol/saleEventIndexer";
import { SALE_SCAN_TARGETS, FINANCIAL_TARGETS } from "../src/data/protocolTargets";
import {
  buildIntroductionReadmodel,
  readmodelContentJson,
  readmodelHash,
  INTRODUCTION_READMODEL_VERSION,
  type AttributedPurchaseRow,
  type IntroductionReadmodel,
} from "../src/lib/protocol/introductionReadmodel";

const ZERO_BYTES32 = `0x${"0".repeat(64)}`;
// keccak256("sourceEscrowOwed(bytes32)")[0..4] — recomputed here from the
// signature (never hand-typed) because no existing decoder module carries it.
const SELECTOR_SOURCE_ESCROW_OWED = keccak256(
  encodePacked(["string"], ["sourceEscrowOwed(bytes32)"]),
).slice(0, 10);
const SELECTOR_MEMBER_COUNT = "0x11aee380"; // memberCount() — financialDecoders

const here = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.resolve(
  here,
  "..",
  "src",
  "lib",
  "protocol",
  "introductionSnapshot.ts",
);
// The TWIN studio snapshot: same builder run, same model, same hash — read by
// the operator console (due-promotion list) and any studio surface needing the
// aggregate. Address-free by construction, so committing it to the client
// bundle leaks nothing (the introduction guard asserts twin-hash equality).
const STUDIO_SNAPSHOT_PATH = path.resolve(
  here,
  "..",
  "..",
  "studio",
  "src",
  "config",
  "introductionIndexSnapshot.ts",
);

function str(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("expected a non-empty string field");
  return v;
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes("--check");
  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  let rpcCalls = 0;
  const call = async (to: string, data: string): Promise<string> => {
    rpcCalls += 1;
    return ethCall(transport, to, data);
  };

  // ── 1. Complete scan of the ONE V3 purchase unit, in memory ───────────────
  const v3Target = SALE_SCAN_TARGETS.find((t) => t.key === "MEMBERSHIP_SALE_V3");
  if (!v3Target) throw new Error("MEMBERSHIP_SALE_V3 scan target missing");
  const units = expandScanUnits([v3Target]);
  const collected: RawEventRecord[] = [];
  const persistence: Persistence = {
    async getCursor() {
      return null; // always a full re-scan from the pinned fromBlock
    },
    async upsertCursor() {
      /* in-memory run: cursor state is judged from the run summary */
    },
    async insertEvents(recs) {
      collected.push(...recs);
      return recs.length;
    },
  };
  const summary = await runSaleEventScan({ transport, persistence, units });
  if (!summary.chainOk || summary.head === null) {
    throw new Error("chain identity not verified; no snapshot (fail closed)");
  }
  for (const u of summary.units) {
    if (u.status !== "ok" || u.scannedFrom === null || u.scannedTo !== summary.head) {
      throw new Error(
        `scan unit ${u.eventName} incomplete (status=${u.status}, to=${u.scannedTo}, head=${summary.head}) — a scan with holes never becomes a snapshot`,
      );
    }
    if (u.decodeErrors > 0) throw new Error("decode errors present; fail closed");
  }

  // ── 2. Attributed rows + live durable/escrow reads at head ────────────────
  const attributed = collected.filter(
    (r) => str(r.decodedJson["sourceId"]).toLowerCase() !== ZERO_BYTES32,
  );
  const rows: AttributedPurchaseRow[] = attributed.map((r) => ({
    chainId: r.chainId,
    eventName: r.eventName,
    blockNumber: r.blockNumber,
    logIndex: r.logIndex,
    sourceId: str(r.decodedJson["sourceId"]),
    recipient: str(r.decodedJson["recipient"]),
    acquisitionCostRaw: str(r.decodedJson["acquisitionCost"]),
  }));

  const synToken = FINANCIAL_TARGETS.synTokenAddress;
  const durableByRecipient: Record<string, boolean> = {};
  for (const rec of new Set(rows.map((r) => r.recipient.toLowerCase()))) {
    const bal = decodeUint256Decimal(
      await call(synToken, callData(SELECTOR_BALANCE_OF, [addressWord(getAddress(rec))])),
    );
    if (bal === null) throw new Error("SYN balance read failed; fail closed");
    durableByRecipient[rec] = bal !== "0";
  }
  const escrowBySourceId: Record<string, string> = {};
  const currentBpsBySourceId: Record<string, number> = {};
  // The registry address: the sale's own immutable view (never hardcoded here).
  const registryAddr = decodeAbiParameters(
    [{ type: "address" }],
    (await call(v3Target.address, callData("0xee9ab677", []))) as `0x${string}`,
  )[0]; // SOURCE_REGISTRY() — selector pinned in sourceDecoders.ts
  // SourceRecord tuple layout — SourceRegistryV1.sol struct, field order exact.
  const SOURCE_RECORD_PARAMS = [
    {
      type: "tuple",
      components: [
        { name: "sourceWallet", type: "address" },
        { name: "sourceClass", type: "uint8" },
        { name: "commissionBps", type: "uint16" },
        { name: "status", type: "uint8" },
        { name: "scope", type: "uint8" },
        { name: "startTime", type: "uint64" },
        { name: "endTime", type: "uint64" },
        { name: "grossCap", type: "uint256" },
        { name: "perBuyerCap", type: "uint256" },
        { name: "appliesToRepeatPurchases", type: "bool" },
        { name: "payoutWallet", type: "address" },
        { name: "metadataHash", type: "bytes32" },
        { name: "createdBy", type: "address" },
        { name: "updatedAt", type: "uint64" },
      ],
    },
  ] as const;
  const SELECTOR_SOURCE_CONFIG = keccak256(
    encodePacked(["string"], ["sourceConfig(bytes32)"]),
  ).slice(0, 10);
  for (const sid of new Set(rows.map((r) => r.sourceId.toLowerCase()))) {
    const owed = decodeUint256Decimal(
      await call(v3Target.address, callData(SELECTOR_SOURCE_ESCROW_OWED, [bytes32Word(sid)])),
    );
    if (owed === null) throw new Error("escrow read failed; fail closed");
    escrowBySourceId[sid] = owed;
    const record = decodeAbiParameters(
      SOURCE_RECORD_PARAMS,
      (await call(registryAddr, callData(SELECTOR_SOURCE_CONFIG, [bytes32Word(sid)]))) as `0x${string}`,
    )[0];
    currentBpsBySourceId[sid] = Number(record.commissionBps);
  }

  // Block header dates for every attributed purchase block (crossing dates are
  // chain-dated — the block timestamp, day-granularity UTC, never a clock).
  const blockDateByNumber: Record<number, string> = {};
  for (const bn of new Set(rows.map((r) => r.blockNumber))) {
    rpcCalls += 1;
    const header = await ethGetBlockByNumber(transport, bn);
    const tsHex = (header as { timestamp?: unknown }).timestamp;
    if (typeof tsHex !== "string" || !/^0x[0-9a-f]+$/i.test(tsHex)) {
      throw new Error(`block ${bn}: no readable timestamp; fail closed`);
    }
    blockDateByNumber[bn] = new Date(Number.parseInt(tsHex, 16) * 1000)
      .toISOString()
      .slice(0, 10);
  }

  // ── 3. Cross-check: the live engine's memberCount is reachable & sane ─────
  const memberCount = decodeUint256Decimal(
    await call(v3Target.address, callData(SELECTOR_MEMBER_COUNT, [])),
  );
  if (memberCount === null || Number(memberCount) < rows.length) {
    throw new Error("memberCount cross-check failed (fewer members than attributed buys)");
  }

  // ── 4. Build + emit ────────────────────────────────────────────────────────
  const model: IntroductionReadmodel = buildIntroductionReadmodel({
    rows,
    durableByRecipient,
    escrowBySourceId,
    currentBpsBySourceId,
    blockDateByNumber,
    fromBlock: v3Target.fromBlock,
    asOfBlock: summary.head,
  });
  const hash = readmodelHash(model);

  const moduleSource = `/**
 * Introduction read-model snapshot (SERVED) — GENERATED FILE. DO NOT EDIT.
 * Generated by the founder-gated introductions:build script (R5) from a
 * COMPLETE zero-gap scan of MembershipPurchasedV3 + live durable/escrow reads.
 * Address-free by construction: no wallet, no member number, no tx hash, no
 * raw sourceId — per-source rows are keyed by the opaque sourceKey
 * (introductionReadmodel.sourceKeyOf). Honest as of \`asOfBlock\`.
 */

import type { IntroductionReadmodel } from "./introductionReadmodel";

export interface IntroductionSnapshot {
  readonly status: "VERIFIED";
  readonly model: IntroductionReadmodel;
  readonly snapshotHash: string;
  readonly provenance: {
    readonly builtAt: string;
    readonly builderVersion: string;
    readonly rpcCallCount: number;
  };
}

export const INTRODUCTION_SNAPSHOT: IntroductionSnapshot = ${JSON.stringify(
    {
      status: "VERIFIED",
      model,
      snapshotHash: hash,
      provenance: {
        builtAt: new Date().toISOString(),
        builderVersion: INTRODUCTION_READMODEL_VERSION,
        rpcCallCount: rpcCalls,
      },
    },
    null,
    2,
  )};
`;

  // The leak net inspects the CONTENT we are about to serve (fail closed).
  assertAddressSafeAggregate(JSON.stringify(model), "introduction snapshot model");

  if (checkOnly) {
    // Compare DATA content, not the moving head: the committed asOfBlock is
    // always behind the live head, so a full-model compare would drift on
    // every new block even with zero new events (flaw caught 2026-07-13).
    const { INTRODUCTION_SNAPSHOT } = await import(
      "../src/lib/protocol/introductionSnapshot"
    );
    const committed = readmodelContentJson(INTRODUCTION_SNAPSHOT.model);
    const live = readmodelContentJson(model);
    if (committed !== live) {
      console.error(
        `[introductions:build --check] DATA DRIFT — the chain carries introduction data the committed snapshot does not (committed asOfBlock ${INTRODUCTION_SNAPSHOT.model.asOfBlock}, live head ${model.asOfBlock}). Re-run introductions:build.`,
      );
      process.exit(1);
    }
    console.log(
      `[introductions:build --check] OK — data content identical (committed asOfBlock ${INTRODUCTION_SNAPSHOT.model.asOfBlock}, live head ${model.asOfBlock}; the head advancing alone is not drift).`,
    );
    return;
  }

  const studioModuleSource = `// config/introductionIndexSnapshot.ts — GENERATED FILE. DO NOT EDIT.
// The TWIN of the api-server's introductionSnapshot (same builder run, same
// model, same hash — introduction-index.guard asserts equality). Address-free
// by construction: opaque source keys, counts, rates, block numbers — no
// wallet, no member number, no tx hash, no raw sourceId. Honest SERVED
// SNAPSHOT, labeled asOfBlock. Rebuild: api-server introductions:build.

export interface IntroductionIndexSourceStats {
  readonly attributedPurchases: number;
  readonly introducedMembers: number;
  readonly durableIntroductions: number;
  readonly commissionPaidRaw: string;
  readonly escrowOwedRaw: string;
  readonly firstBlock: number;
  readonly lastBlock: number;
  readonly currentBps: number;
  readonly entitledBps: number;
  readonly entitledTitle: string;
  readonly promotionDue: boolean;
  readonly crossedAtBlock: number | null;
  readonly crossedAtDateUtc: string | null;
}

export interface IntroductionIndexSnapshot {
  readonly snapshotHash: string;
  readonly asOfBlock: number;
  readonly durableTest: string;
  readonly totals: {
    readonly attributedPurchases: number;
    readonly distinctSources: number;
    readonly introducedMembers: number;
    readonly durableIntroductions: number;
    readonly commissionPaidRaw: string;
  };
  readonly bySource: Readonly<Record<string, IntroductionIndexSourceStats>>;
}

export const INTRODUCTION_INDEX_SNAPSHOT: IntroductionIndexSnapshot = ${JSON.stringify(
    {
      snapshotHash: hash,
      asOfBlock: model.asOfBlock,
      durableTest: model.durableTest,
      totals: model.totals,
      bySource: model.bySource,
    },
    null,
    2,
  )};
`;
  writeFileSync(SNAPSHOT_PATH, moduleSource, { encoding: "utf8" });
  writeFileSync(STUDIO_SNAPSHOT_PATH, studioModuleSource, { encoding: "utf8" });
  console.log(
    `[introductions:build] wrote snapshot — asOfBlock ${model.asOfBlock}, ` +
      `${model.totals.attributedPurchases} attributed purchase(s), ` +
      `${model.totals.distinctSources} source(s), ` +
      `${model.totals.durableIntroductions} durable introduction(s), ${rpcCalls} rpc calls, ${hash}`,
  );
}

main().catch((e) => {
  console.error(`[introductions:build] FAILED: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
