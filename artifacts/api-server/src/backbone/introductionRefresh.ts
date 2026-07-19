/**
 * Event Backbone — INTRODUCTION READ-MODEL REFRESH (M0, founder GO).
 * ---------------------------------------------------------------------
 * The R5 introduction read-model, refreshed in-process on every backbone
 * cycle. The committed snapshot (`introductionSnapshot.ts`, founder-gated
 * `introductions:build`) stays the BOOT FALLBACK — this refresh only ever
 * upgrades freshness, never replaces the founder-gated build discipline.
 *
 * Architecture (REUSE-BEFORE-CREATE, the M4 lesson applied):
 *   - Attributed rows come from the backbone's OWN sale lane
 *     (sale_event_raw — gapless by cursor discipline), NOT a fresh ~850-call
 *     rescan: the refresh costs ~a dozen live eth_calls per cycle.
 *   - COMPLETENESS FAIL-CLOSED: the V3 purchase cursor must sit at the
 *     cycle's head, else the refresh is SKIPPED (the last-good model — or
 *     the committed snapshot — keeps serving; a model is never built over a
 *     scan with holes).
 *   - Live reads at head, ported EXACTLY from the founder-gated script:
 *     SYN balanceOf(recipient) per introduced member (the founder-decided
 *     DURABLE test) · sale sourceEscrowOwed(sourceId) · the registry's live
 *     commissionBps via the sale's own immutable SOURCE_REGISTRY() view ·
 *     memberCount cross-check.
 *   - Block dates come from the Protocol Time cache (chain-verified, already
 *     enriched by the backbone for every sale row block) — zero extra RPC,
 *     never a wall clock.
 *   - decodedJson access is whitelisted to exactly {sourceId, recipient,
 *     acquisitionCost} via the `p.` accessor (guard-pinned). These GATED
 *     fields are legitimate HERE and only here in the served process: the
 *     built model is address-free by construction (opaque sourceKeys), and
 *     the output is leak-scanned before it is ever held.
 *
 * This is the backbone zone's SECOND (and last) lazy-DB file — every
 * @workspace/db reach is a dynamic import; pool lifecycle is never touched.
 */

import { keccak256, encodePacked, getAddress, decodeAbiParameters } from "viem";
import {
  assertAddressSafeAggregate,
  type RpcTransport,
} from "../lib/protocol/rpcTransport";
import { ethCall } from "../lib/protocol/evmRead";
import { callData } from "../lib/protocol/archiveDecoders";
import { decodeUint256Decimal } from "../lib/protocol/saleDecoders";
import { SELECTOR_BALANCE_OF } from "../lib/protocol/financialDecoders";
import {
  SELECTOR_SOURCE_REGISTRY,
  addressWord,
  bytes32Word,
} from "../lib/protocol/sourceDecoders";
import {
  buildIntroductionReadmodel,
  readmodelHash,
  type AttributedPurchaseRow,
} from "../lib/protocol/introductionReadmodel";
import { setLiveIntroductionModel } from "../lib/protocol/introductionLiveModel";
// Slice ④ (founder GO 2026-07-19): the per-row model — same cycle, same
// rows, same durable flags; published in the same breath as the aggregate.
import {
  setIntroductionRowsModel,
  type OwnIntroductionRow,
  type OwnReceiptAnatomy,
} from "../lib/protocol/introductionRowsModel";
import {
  setSourceOwnershipIndex,
  type OwnedSourceEdge,
} from "../lib/protocol/sourceOwnershipIndex";
import { SALE_SCAN_TARGETS, FINANCIAL_TARGETS } from "../data/protocolTargets";
import { BACKBONE_EXPECTED_CHAIN_ID } from "./backboneDb";

const ZERO_BYTES32 = `0x${"0".repeat(64)}`;
// Selectors recomputed from their signatures (never hand-typed) — the exact
// approach the founder-gated script uses.
const SELECTOR_SOURCE_ESCROW_OWED = keccak256(
  encodePacked(["string"], ["sourceEscrowOwed(bytes32)"]),
).slice(0, 10);
const SELECTOR_SOURCE_CONFIG = keccak256(
  encodePacked(["string"], ["sourceConfig(bytes32)"]),
).slice(0, 10);
const SELECTOR_MEMBER_COUNT = "0x11aee380"; // memberCount() — financialDecoders

// SourceRecord tuple layout — SourceRegistryV1.sol struct, field order exact
// (transcribed in the R2 slice; kept in lockstep with the script).
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

export interface IntroductionRefreshSummary {
  refreshed: boolean;
  /** Why the refresh was skipped (fail-closed reasons; address-free). */
  skippedReason: string | null;
  asOfBlock: number | null;
  attributedRows: number;
  distinctSources: number;
  liveReads: number;
}

function str(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error("expected a non-empty string field");
  }
  return v;
}

/** The V3 cursor must sit at the cycle head — a hole never becomes a model. */
async function saleLaneCompleteTo(head: number): Promise<boolean> {
  const { db, indexerCursor } = await import("@workspace/db");
  const { and, eq } = await import("drizzle-orm");
  const rows = await db
    .select({
      lastScannedBlock: indexerCursor.lastScannedBlock,
      status: indexerCursor.status,
    })
    .from(indexerCursor)
    .where(
      and(
        eq(indexerCursor.chainId, BACKBONE_EXPECTED_CHAIN_ID),
        eq(indexerCursor.contractKey, "MEMBERSHIP_SALE_V3"),
        eq(indexerCursor.eventName, "MembershipPurchasedV3"),
      ),
    );
  const r = rows[0];
  // The PERSISTED cursor vocabulary is "complete" | "idle" | "running" |
  // "error" (saleEventIndexer writes "complete" when lastScanned >= head —
  // "ok" exists ONLY in the in-memory run summary; the first prod run proved
  // the difference). The decisive fact is the cursor sitting at the head;
  // the status check only excludes a faulted/mid-write lane.
  return (
    r !== undefined &&
    r.lastScannedBlock >= head &&
    (r.status === "complete" || r.status === "idle")
  );
}

/** Slice ④: the attributed row + its own tx-hash COLUMN (never a decodedJson
 * field — the whitelist below is unchanged); feeds the per-row model only.
 * Slice ⑤: + the receipt's own AMOUNT fields (numbers only, no addresses) —
 * null when any of them is malformed; the row itself still serves. */
type AttributedRowWithTx = AttributedPurchaseRow & {
  transactionHash: string;
  grossRaw: string | null;
  commissionBps: number | null;
  netRaw: string | null;
  vaultRaw: string | null;
  liquidityRaw: string | null;
  operationsRaw: string | null;
};

/** Exact decimal string (base units) or null — anatomy fields fail SOFT to
 * null (the breakdown is dropped, never the row; slice-④ truth unaffected). */
function decStr(v: unknown): string | null {
  return typeof v === "string" && /^[0-9]+$/.test(v) ? v : null;
}

/** Attributed V3 rows from the backbone's own gapless sale lane. */
async function loadAttributedRows(): Promise<AttributedRowWithTx[]> {
  const db = await import("@workspace/db");
  const { and, asc, eq } = await import("drizzle-orm");
  const raw = await db.db
    .select({
      chainId: db.saleEventRaw.chainId,
      eventName: db.saleEventRaw.eventName,
      blockNumber: db.saleEventRaw.blockNumber,
      logIndex: db.saleEventRaw.logIndex,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(
      and(
        eq(db.saleEventRaw.chainId, BACKBONE_EXPECTED_CHAIN_ID),
        eq(db.saleEventRaw.eventName, "MembershipPurchasedV3"),
      ),
    )
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const rows: AttributedRowWithTx[] = [];
  for (const r of raw) {
    // decodedJson WHITELIST (introduction refresh): exactly {sourceId,
    // recipient, acquisitionCost} + the slice-⑤ AMOUNT fields {grossUsdc,
    // protocolContribution, vaultAmount, liquidityAmount, operationsAmount,
    // commissionBps} — amounts are numbers only (never addresses); the
    // built model is address-free by construction and leak-scanned below.
    // (transactionHash is the row's own COLUMN, not a decodedJson field.)
    const p = r.decodedJson as Record<string, unknown>;
    const sourceId = str(p.sourceId);
    if (sourceId.toLowerCase() === ZERO_BYTES32) continue; // not attributed
    const bpsStr = decStr(p.commissionBps);
    const bps = bpsStr === null ? null : Number(bpsStr);
    rows.push({
      chainId: r.chainId,
      eventName: r.eventName,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash,
      sourceId,
      recipient: str(p.recipient),
      acquisitionCostRaw: str(p.acquisitionCost),
      grossRaw: decStr(p.grossUsdc),
      commissionBps: bps !== null && Number.isSafeInteger(bps) && bps <= 10_000 ? bps : null,
      netRaw: decStr(p.protocolContribution),
      vaultRaw: decStr(p.vaultAmount),
      liquidityRaw: decStr(p.liquidityAmount),
      operationsRaw: decStr(p.operationsAmount),
    });
  }
  return rows;
}

/** Slice ⑤ — the receipt-backed anatomy, held ONLY when the event's own
 * amounts are whole AND internally consistent (commission + net == gross;
 * vault + liquidity + operations == net — the contract's `_routeAmounts`
 * identity). Anything off → null: an inconsistent receipt is never invented
 * into a breakdown, and the slice-④ row itself is unaffected. */
function receiptAnatomy(r: AttributedRowWithTx): OwnReceiptAnatomy | null {
  const { grossRaw, commissionBps, netRaw, vaultRaw, liquidityRaw, operationsRaw } = r;
  if (
    grossRaw === null ||
    commissionBps === null ||
    netRaw === null ||
    vaultRaw === null ||
    liquidityRaw === null ||
    operationsRaw === null
  ) {
    return null;
  }
  const gross = BigInt(grossRaw);
  const net = BigInt(netRaw);
  if (BigInt(r.acquisitionCostRaw) + net !== gross) return null;
  // The routing must match the contract's `_routeAmounts` EXACTLY (70/20/10,
  // operations = remainder) — the card captions those shares, so a receipt
  // routed any other way must never render under them (review wf_c1b2d966).
  if (BigInt(vaultRaw) !== (net * 70n) / 100n) return null;
  if (BigInt(liquidityRaw) !== (net * 20n) / 100n) return null;
  if (BigInt(vaultRaw) + BigInt(liquidityRaw) + BigInt(operationsRaw) !== net) return null;
  return { grossRaw, commissionBps, netRaw, vaultRaw, liquidityRaw, operationsRaw };
}

/** ADR-003 short form (`0x123…abcd`) — fail-closed: a malformed address
 * yields null and its row is dropped, never invented (the feedProjection
 * discipline; the short form can never trip the 40-hex output gate). */
function shortWho(addressLower: string): string | null {
  if (!/^0x[0-9a-f]{40}$/.test(addressLower)) return null;
  return `0x${addressLower.slice(2, 5)}…${addressLower.slice(-4)}`;
}

/** Chain-verified UTC day per row block, from the Protocol Time cache. */
async function loadBlockDates(
  blockNumbers: readonly number[],
): Promise<Record<number, string>> {
  if (blockNumbers.length === 0) return {};
  const db = await import("@workspace/db");
  const { and, eq, inArray } = await import("drizzle-orm");
  const rows = await db.db
    .select({
      blockNumber: db.blockTimestamp.blockNumber,
      blockTimestampSec: db.blockTimestamp.blockTimestampSec,
    })
    .from(db.blockTimestamp)
    .where(
      and(
        eq(db.blockTimestamp.chainId, BACKBONE_EXPECTED_CHAIN_ID),
        inArray(db.blockTimestamp.blockNumber, [...blockNumbers]),
      ),
    );
  const out: Record<number, string> = {};
  for (const r of rows) {
    out[r.blockNumber] = new Date(r.blockTimestampSec * 1000)
      .toISOString()
      .slice(0, 10);
  }
  for (const bn of blockNumbers) {
    if (!(bn in out)) {
      throw new Error(
        `block ${bn} has no verified timestamp in the Protocol Time cache — refresh fails closed`,
      );
    }
  }
  return out;
}

/**
 * Refresh the live introduction model from the backbone's sale lane + live
 * chain reads at `head`. Fail-closed at every step; on ANY skip/failure the
 * previous live model (or the committed snapshot) keeps serving.
 */
export async function refreshIntroductionModel(
  transport: RpcTransport,
  head: number,
): Promise<IntroductionRefreshSummary> {
  const summary: IntroductionRefreshSummary = {
    refreshed: false,
    skippedReason: null,
    asOfBlock: null,
    attributedRows: 0,
    distinctSources: 0,
    liveReads: 0,
  };

  if (!(await saleLaneCompleteTo(head))) {
    summary.skippedReason = "V3 sale cursor is not at the cycle head";
    return summary;
  }

  const v3Target = SALE_SCAN_TARGETS.find((t) => t.key === "MEMBERSHIP_SALE_V3");
  if (!v3Target) throw new Error("MEMBERSHIP_SALE_V3 scan target missing");

  let liveReads = 0;
  const call = async (to: string, data: string): Promise<string> => {
    liveReads += 1;
    const raw = await ethCall(transport, to, data);
    if (typeof raw !== "string") {
      throw new Error("eth_call returned a non-string result; fail closed");
    }
    return raw;
  };

  const rows = await loadAttributedRows();
  summary.attributedRows = rows.length;

  // Live reads at head — ported exactly from the founder-gated script.
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
  // D-TRUTH D2: the SourceRecord this loop already decodes carries the
  // source's wallet of record — keep the SERVER-ONLY wallet→sourceId edge
  // (sourceOwnershipIndex) instead of throwing it away. Zero extra reads.
  const ownershipByWallet = new Map<string, OwnedSourceEdge[]>();
  const lastBlockBySourceId = new Map<string, number>();
  for (const r of rows) {
    const sid = r.sourceId.toLowerCase();
    const prev = lastBlockBySourceId.get(sid) ?? 0;
    if (r.blockNumber > prev) lastBlockBySourceId.set(sid, r.blockNumber);
  }
  const distinctSources = new Set(rows.map((r) => r.sourceId.toLowerCase()));
  summary.distinctSources = distinctSources.size;
  if (distinctSources.size > 0) {
    // The registry address: the sale's own immutable view (never hardcoded).
    const registryAddr = decodeAbiParameters(
      [{ type: "address" }],
      (await call(
        v3Target.address,
        callData(SELECTOR_SOURCE_REGISTRY, []),
      )) as `0x${string}`,
    )[0];
    for (const sid of distinctSources) {
      const owed = decodeUint256Decimal(
        await call(
          v3Target.address,
          callData(SELECTOR_SOURCE_ESCROW_OWED, [bytes32Word(sid)]),
        ),
      );
      if (owed === null) throw new Error("escrow read failed; fail closed");
      escrowBySourceId[sid] = owed;
      const record = decodeAbiParameters(
        SOURCE_RECORD_PARAMS,
        (await call(
          registryAddr,
          callData(SELECTOR_SOURCE_CONFIG, [bytes32Word(sid)]),
        )) as `0x${string}`,
      )[0];
      currentBpsBySourceId[sid] = Number(record.commissionBps);
      // D2: the wallet the registry pays for this source, lowercased —
      // SERVER-ONLY, matched later against a session's own bound account.
      const walletOfRecord = String(record.payoutWallet).toLowerCase();
      if (/^0x[0-9a-f]{40}$/.test(walletOfRecord)) {
        const edges = ownershipByWallet.get(walletOfRecord) ?? [];
        edges.push({ sourceId: sid, lastBlock: lastBlockBySourceId.get(sid) ?? 0 });
        ownershipByWallet.set(walletOfRecord, edges);
      }
    }
  }
  for (const edges of ownershipByWallet.values()) {
    edges.sort((a, b) => b.lastBlock - a.lastBlock); // most recently active first
  }

  // Cross-check: the live engine's memberCount is reachable & sane.
  const memberCount = decodeUint256Decimal(
    await call(v3Target.address, callData(SELECTOR_MEMBER_COUNT, [])),
  );
  if (memberCount === null || Number(memberCount) < rows.length) {
    throw new Error(
      "memberCount cross-check failed (fewer members than attributed buys)",
    );
  }

  const blockDateByNumber = await loadBlockDates([
    ...new Set(rows.map((r) => r.blockNumber)),
  ]);

  const model = buildIntroductionReadmodel({
    rows,
    durableByRecipient,
    escrowBySourceId,
    currentBpsBySourceId,
    blockDateByNumber,
    fromBlock: v3Target.fromBlock,
    asOfBlock: head,
  });

  // The model is address-free by construction — prove it before holding it.
  assertAddressSafeAggregate(JSON.stringify(model));

  // Slice ④ — the PER-ROW model, from the SAME rows, dates and durable flags
  // this cycle already computed (zero extra reads). ADR-003: the introduced
  // wallet enters each row as the server-derived SHORT form only; a malformed
  // address drops its row (never invented). Keys (full sourceIds) are
  // SERVER-ONLY; the values are leak-scanned before the model is held.
  const rowsBySourceId = new Map<string, OwnIntroductionRow[]>();
  for (const r of rows) {
    const who = shortWho(r.recipient.toLowerCase());
    if (who === null) continue;
    const sid = r.sourceId.toLowerCase();
    const list = rowsBySourceId.get(sid) ?? [];
    list.push({
      isoDayUtc: blockDateByNumber[r.blockNumber] ?? "",
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash.toLowerCase(),
      who,
      commissionRaw: r.acquisitionCostRaw,
      durable: durableByRecipient[r.recipient.toLowerCase()] === true,
      anatomy: receiptAnatomy(r),
    });
    rowsBySourceId.set(sid, list);
  }
  for (const list of rowsBySourceId.values()) {
    list.sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex);
  }
  // BOUNDARY-AWARE address gate for the ROWS payload (prod-proven fix,
  // Replit cycle f5250f8): the rows legitimately carry 64-hex tx anchors,
  // and the unbounded aggregate scanner would fault on ANY of them (every
  // 64-hex contains a 40-hex substring — the refresh faulted every cycle in
  // prod while the empty dev table hid it). A bare 40-hex address still
  // fail-closes; short forms (0x123…abcd) and 64-hex anchors pass — the
  // exact gate the serving routes use.
  {
    const rowsJson = JSON.stringify(Array.from(rowsBySourceId.values()));
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(rowsJson)) {
      throw new Error(
        "address-shaped token in the introduction rows model — fail closed",
      );
    }
  }

  setLiveIntroductionModel({
    model,
    modelHash: readmodelHash(model),
    refreshedIso: new Date().toISOString(), // ops metadata, never chain truth
  });
  // Published in the same breath as the aggregate (one cycle, one truth).
  setIntroductionRowsModel({ asOfBlock: head, rowsBySourceId });
  // D2: publish the ownership edge in the same breath as the model it
  // belongs to (one cycle, one truth). Empty map when no source has an
  // attributed purchase — a built-and-empty index, never a dark one.
  setSourceOwnershipIndex(ownershipByWallet, head);

  summary.refreshed = true;
  summary.asOfBlock = head;
  summary.liveReads = liveReads;
  return summary;
}
