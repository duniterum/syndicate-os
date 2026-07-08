/**
 * Referral attribution activity snapshot BUILD (founder-gated, read-only scan).
 * -----------------------------------------------------------------------------
 * SourceRegistryV1 exposes NO on-chain count view — attribution activity is
 * only observable as lifecycle events. The RPC provider caps eth_getLogs at a
 * 10,000-block range, so served code cannot count live per request. This
 * script performs the chunked, read-only scan ONCE (founder-gated) and writes
 * a static, hash-pinned snapshot module (freezeGate / holder-index pattern):
 *
 *   - chainId FIRST: nothing is scanned until eth_chainId verifies Avalanche
 *     C-Chain (wrong chain => zero eth_getLogs, non-zero exit).
 *   - Read-only: only eth_chainId / eth_blockNumber / eth_getLogs are issued.
 *   - Fail-closed: ANY RPC failure aborts the whole run — no partial counts.
 *   - Aggregates only: the snapshot carries event COUNTS keyed by canonical
 *     event name. No addresses, no source ids, no topics, no tx hashes. A
 *     serialized-output address scan aborts the write if a 40-hex address
 *     token ever appears.
 *   - The count is an ACTIVITY COUNT — never a USDC or commission figure.
 *
 * Modes:
 *   --dry-run          scan + report only (default when --write is absent)
 *   --write            write src/lib/protocol/referralAttributionSnapshot.ts;
 *                      REQUIRES REFERRAL_ATTRIBUTION_BUILD_APPROVED="1"
 *                      (dual arming — founder approval is explicit, never
 *                      implied by running the script).
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

import { REFERRAL_ATTRIBUTION_SCAN_TARGET } from "../src/data/protocolTargets";
import { SOURCE_REGISTRY_V1_ABI } from "../src/canon/the-syndicate/contracts/abi/sale-abi";
import { EXPECTED_CHAIN_ID, FULL_ADDRESS_RE, type RpcTransport } from "../src/lib/protocol/rpcTransport";
import { probeChain, ethBlockNumber } from "../src/lib/protocol/evmRead";
import { makeFetchTransport } from "./avalanche-live-read-check";
import { keccak256Hex } from "./avalanche-archive-posture-check";
import { canonicalJson } from "./holder-index-core";

const BUILDER_VERSION = "referral-attribution-build v1 (reconciliation slice, July 2026)";
const CHUNK_SIZE = 10_000; // provider-imposed eth_getLogs range cap

// ── Canonical event vocabulary, derived from the vendored canon ABI ──────────
type AbiEventEntry = {
  type: string;
  name?: string;
  inputs?: readonly { type: string }[];
};

function eventTopic0(name: string): string {
  const entry = (SOURCE_REGISTRY_V1_ABI as readonly AbiEventEntry[]).find(
    (e) => e.type === "event" && e.name === name,
  );
  if (!entry || !Array.isArray(entry.inputs)) {
    throw new Error(`canon ABI has no event "${name}" — refusing to invent a signature`);
  }
  const signature = `${name}(${entry.inputs.map((i) => i.type).join(",")})`;
  return "0x" + keccak256Hex(new TextEncoder().encode(signature));
}

export const REGISTRY_EVENT_NAMES = [
  "SourceCreated",
  "SourceTermsUpdated",
  "SourceStatusChanged",
  "SourceWalletUpdated",
  "SourcePayoutWalletUpdated",
] as const;
export type RegistryEventName = (typeof REGISTRY_EVENT_NAMES)[number];

// ── Address-only chunked getLogs (script-local; served evmRead is untouched) ──
async function getLogsAddressOnly(
  transport: RpcTransport,
  address: string,
  fromBlock: number,
  toBlock: number,
): Promise<{ topics?: unknown }[]> {
  const raw = await transport("eth_getLogs", [
    {
      address,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "0x" + toBlock.toString(16),
    },
  ]);
  if (!Array.isArray(raw)) throw new Error("eth_getLogs: non-array result");
  return raw as { topics?: unknown }[];
}

type ScanResult = {
  asOfBlock: number;
  totalEvents: number;
  byEvent: Record<RegistryEventName, number>;
  otherEventCount: number;
  rpcCallCount: number;
};

async function scan(transport: RpcTransport): Promise<ScanResult> {
  const probe = await probeChain(transport);
  if (!probe.chainIdOk) {
    throw new Error(
      `chain identity NOT verified (expected ${EXPECTED_CHAIN_ID}, got ${probe.chainIdActual ?? "unreadable"}) — zero eth_getLogs issued`,
    );
  }
  const head = await ethBlockNumber(transport);
  const target = REFERRAL_ATTRIBUTION_SCAN_TARGET;
  if (!Number.isInteger(head) || head < target.fromBlock) {
    throw new Error(`head block ${head} is below the canon scan floor ${target.fromBlock}`);
  }

  const topicToName = new Map<string, RegistryEventName>();
  for (const name of REGISTRY_EVENT_NAMES) topicToName.set(eventTopic0(name).toLowerCase(), name);

  const byEvent: Record<RegistryEventName, number> = {
    SourceCreated: 0,
    SourceTermsUpdated: 0,
    SourceStatusChanged: 0,
    SourceWalletUpdated: 0,
    SourcePayoutWalletUpdated: 0,
  };
  let otherEventCount = 0;
  let totalEvents = 0;
  let rpcCallCount = 2; // chainId + blockNumber

  for (let from = target.fromBlock; from <= head; from += CHUNK_SIZE) {
    const to = Math.min(from + CHUNK_SIZE - 1, head);
    const logs = await getLogsAddressOnly(transport, target.address, from, to);
    rpcCallCount += 1;
    for (const log of logs) {
      totalEvents += 1;
      const t0 =
        Array.isArray(log.topics) && typeof log.topics[0] === "string"
          ? (log.topics[0] as string).toLowerCase()
          : null;
      const name = t0 !== null ? topicToName.get(t0) : undefined;
      if (name !== undefined) byEvent[name] += 1;
      else otherEventCount += 1;
    }
  }

  return { asOfBlock: head, totalEvents, byEvent, otherEventCount, rpcCallCount };
}

// ── Snapshot serialization (aggregates only; hash-pinned) ─────────────────────
function buildSnapshotObject(r: ScanResult) {
  const body = {
    gate: "REFERRAL_ATTRIBUTION_ACTIVITY_V1",
    status: "VERIFIED",
    chainId: EXPECTED_CHAIN_ID,
    registryKey: REFERRAL_ATTRIBUTION_SCAN_TARGET.key,
    fromBlock: REFERRAL_ATTRIBUTION_SCAN_TARGET.fromBlock,
    asOfBlock: r.asOfBlock,
    totalEvents: r.totalEvents,
    byEvent: r.byEvent,
    otherEventCount: r.otherEventCount,
    doctrine:
      "Attribution ACTIVITY COUNT only (registry lifecycle events) — never a USDC or commission figure. No commission has ever been paid on-chain; CommissionRouterV1 is not deployed.",
    provenance: {
      builtAt: new Date().toISOString(),
      builderVersion: BUILDER_VERSION,
      rpcCallCount: r.rpcCallCount,
    },
  };
  const snapshotHash = `sha256:${createHash("sha256").update(canonicalJson(body), "utf8").digest("hex")}`;
  return { ...body, snapshotHash };
}

function renderModule(snapshot: ReturnType<typeof buildSnapshotObject>): string {
  const json = JSON.stringify(snapshot, null, 2);
  return `/**
 * Referral attribution activity snapshot (SERVED, aggregates-only) — GENERATED FILE.
 * ---------------------------------------------------------------------------
 * DO NOT EDIT BY HAND. Generated by the founder-gated referral-attribution:build
 * script from a chunked read-only eth_getLogs scan of the SourceRegistryV1
 * lifecycle events (freezeGate / holder-index pattern). The RPC provider caps
 * eth_getLogs at a 10,000-block range, so this count CANNOT be a per-request
 * live read; it is a chain-derived INDEXED count, honest as of \`asOfBlock\`.
 *
 * Served code imports this constant and performs NO runtime scan or DB read.
 *
 * PRIVACY / HONESTY BOUNDARY: aggregate event counts only. No wallet
 * addresses, no source ids, no topics, no transaction hashes. The count is an
 * ACTIVITY COUNT — never a USDC or commission figure. No commission has ever
 * been paid on-chain; CommissionRouterV1 is not deployed.
 */

export interface ReferralAttributionSnapshot {
  readonly gate: "REFERRAL_ATTRIBUTION_ACTIVITY_V1";
  readonly status: "VERIFIED";
  readonly chainId: number;
  readonly registryKey: "SOURCE_REGISTRY_V1";
  readonly fromBlock: number;
  readonly asOfBlock: number;
  readonly totalEvents: number;
  readonly byEvent: {
    readonly SourceCreated: number;
    readonly SourceTermsUpdated: number;
    readonly SourceStatusChanged: number;
    readonly SourceWalletUpdated: number;
    readonly SourcePayoutWalletUpdated: number;
  };
  readonly otherEventCount: number;
  readonly doctrine: string;
  readonly provenance: {
    readonly builtAt: string;
    readonly builderVersion: string;
    readonly rpcCallCount: number;
  };
  readonly snapshotHash: string;
}

export const REFERRAL_ATTRIBUTION_SNAPSHOT: ReferralAttributionSnapshot = ${json};
`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const write = args.includes("--write");

  const transport = makeFetchTransport(rpcUrls());
  const result = await scan(transport);
  const snapshot = buildSnapshotObject(result);
  const moduleSource = renderModule(snapshot);

  // Leak gate: the generated module must NEVER contain a 40-hex address token
  // (64-hex hashes pass; a shorter address token never hides inside one).
  const addressTokens = moduleSource.match(/\b(?:0x)?[0-9a-fA-F]{40}\b/g) ?? [];
  const leaked = addressTokens.filter((t) => FULL_ADDRESS_RE.test(t.startsWith("0x") ? t : `0x${t}`) && !/^[0-9a-fA-F]{64}$/.test(t));
  if (leaked.length > 0) {
    console.error(`ABORT: generated snapshot contains ${leaked.length} address-shaped token(s) — nothing written.`);
    process.exit(1);
  }

  console.log("Referral attribution activity scan (read-only):");
  console.log(`  chainId          ${snapshot.chainId} (verified)`);
  console.log(`  scan range       ${snapshot.fromBlock} → ${snapshot.asOfBlock}`);
  console.log(`  totalEvents      ${snapshot.totalEvents}`);
  for (const name of REGISTRY_EVENT_NAMES) console.log(`    ${name.padEnd(26)} ${snapshot.byEvent[name]}`);
  console.log(`  otherEventCount  ${snapshot.otherEventCount}`);
  console.log(`  rpcCallCount     ${snapshot.provenance.rpcCallCount}`);
  console.log(`  snapshotHash     ${snapshot.snapshotHash}`);

  if (!write) {
    console.log("\nDRY RUN — no file written (use --write with REFERRAL_ATTRIBUTION_BUILD_APPROVED=\"1\").");
    return;
  }
  if (process.env["REFERRAL_ATTRIBUTION_BUILD_APPROVED"] !== "1") {
    console.error("\nABORT: --write requires REFERRAL_ATTRIBUTION_BUILD_APPROVED=\"1\" (founder gate). Nothing written.");
    process.exit(1);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, "..", "src", "lib", "protocol", "referralAttributionSnapshot.ts");
  writeFileSync(outPath, moduleSource, "utf8");
  console.log(`\nWROTE ${outPath}`);
}

function rpcUrls(): string[] {
  const urls: string[] = [];
  const primary = process.env["AVALANCHE_RPC_URL"];
  const fallback = process.env["AVALANCHE_RPC_URL_FALLBACK"];
  if (typeof primary === "string" && /^https:\/\//.test(primary)) urls.push(primary);
  if (typeof fallback === "string" && /^https:\/\//.test(fallback)) urls.push(fallback);
  if (urls.length === 0) {
    console.error("ABORT: no AVALANCHE_RPC_URL configured.");
    process.exit(1);
  }
  return urls;
}

main().catch((err) => {
  console.error(`FAILED (fail closed, nothing written): ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
