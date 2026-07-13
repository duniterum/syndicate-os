// introductionReadmodel.ts — R5: the introduction read-model (pure builder).
// ---------------------------------------------------------------------------
// Mirrors the proven activity-heartbeat / member-continuity pattern: a PURE
// builder (no db, no network, no clock), a founder-gated build script that
// gathers inputs and emits a generated served snapshot, and a guard suite.
//
// WHAT IT COUNTS (SPEC_REFERRAL_SYSTEM §⑩/⑪ R5 + CONNECTOR_LADDER_POLICY):
//   per source — attributed purchases · introduced members (unique recipients)
//   · DURABLE INTRODUCTIONS (the ladder unit) · commission paid (sum of the
//   event's acquisitionCost) · escrow owed (live sale read at build time).
//
// THE DURABLE TEST (founder GO 2026-07-13, recommendation adopted — one
// constant, one-line change if the founder later rules otherwise): a seat is
// PERMANENT in the bytecode (knownMember/memberNumberOf are never cleared), so
// "still holds their seat" is always true and gives anti-fraud nothing.
// Adopted test: the introduced member's wallet still holds SYN (> 0) at index
// time — mirrors the referrer's own good-standing rule ("you cannot recommend
// what you have left") and drops buy-and-dump introductions from the count.
// The COUNT may go down as well as up; a signed promotion never reverts
// (rank is acquired — the ladder law).
//
// PRIVACY BOUNDARY (ADR-003 + the Visibility Law): the emitted snapshot
// carries NO wallet address, NO member number, NO transaction hash, and NO
// raw sourceId — per-source rows are keyed by an OPAQUE derived key
// (sha256 of the lowercase sourceId, prefixed + truncated so no 40-hex run
// can ever appear). The own-row endpoint re-derives the key from the
// session's own wallet; a directory lookup surface does not exist.

import { createHash } from "node:crypto";
import { entitledRateRung } from "./connectorLadderCanon";

export const INTRODUCTION_READMODEL_VERSION = "introduction-readmodel v1 (R5, July 2026)";

/** The founder-decided durable test (see header). */
export const DURABLE_TEST = "SYN_BALANCE_HELD" as const;

export const EXPECTED_CHAIN_ID = 43114;
const ZERO_BYTES32 = `0x${"0".repeat(64)}`;
const BYTES32_RE = /^0x[0-9a-f]{64}$/;
const ADDRESS_RE = /^0x[0-9a-f]{40}$/;
const DECIMAL_RE = /^(0|[1-9][0-9]*)$/;

/** Opaque per-source key: no raw sourceId (and no 40-hex run) is ever served. */
export function sourceKeyOf(sourceId: string): string {
  const norm = sourceId.toLowerCase();
  if (!BYTES32_RE.test(norm)) {
    throw new Error("sourceKeyOf: not a bytes32 source id");
  }
  return `src_${createHash("sha256").update(norm).digest("hex").slice(0, 24)}`;
}

/** SERVER-ONLY input row (subset of a decoded MembershipPurchasedV3 event). */
export type AttributedPurchaseRow = {
  chainId: number;
  eventName: string;
  blockNumber: number;
  logIndex: number;
  /** bytes32, non-zero (zero-source rows must be filtered out by the caller). */
  sourceId: string;
  /** SERVER-ONLY; never emitted. */
  recipient: string;
  /** Exact decimal string (USDC base units) — the commission the buyer's tx paid. */
  acquisitionCostRaw: string;
};

export type IntroductionSourceStats = {
  attributedPurchases: number;
  introducedMembers: number;
  durableIntroductions: number;
  commissionPaidRaw: string;
  /** Live sale read at build time; "0" when nothing is escrowed. */
  escrowOwedRaw: string;
  firstBlock: number;
  lastBlock: number;
  // ── LADDER-PROMOTION-SCREEN facts (founder rule: simple + transparency) ──
  /** The source's commission rate read LIVE from the registry at build time. */
  currentBps: number;
  /** The rate the durable count entitles per CONNECTOR_LADDER_POLICY. */
  entitledBps: number;
  entitledTitle: string;
  /** true = entitled > current — a promotion is DUE, awaiting the founder's
   * signature. No gap compensation: the new rate applies at its on-chain
   * recording (never retroactive); the waiting is visible and dated. */
  promotionDue: boolean;
  /** The purchase block of the introduction that crossed the entitled rung's
   * threshold (among currently-durable ones) — chain-dated, never a clock.
   * Null when the entitled rung is the base rung (nothing was crossed). */
  crossedAtBlock: number | null;
  /** UTC day of that block ("YYYY-MM-DD"), from the block header timestamp. */
  crossedAtDateUtc: string | null;
};

export type IntroductionReadmodel = {
  gate: "INTRODUCTION_READMODEL_V1";
  chainId: number;
  saleKey: "MEMBERSHIP_SALE_V3";
  fromBlock: number;
  asOfBlock: number;
  durableTest: typeof DURABLE_TEST;
  totals: {
    attributedPurchases: number;
    distinctSources: number;
    introducedMembers: number;
    durableIntroductions: number;
    commissionPaidRaw: string;
  };
  bySource: Record<string, IntroductionSourceStats>;
};

export type BuildInputs = {
  rows: readonly AttributedPurchaseRow[];
  /** lowercase recipient address → still holds SYN (>0) at asOfBlock. */
  durableByRecipient: Readonly<Record<string, boolean>>;
  /** lowercase sourceId → exact decimal escrow owed (USDC base units). */
  escrowBySourceId: Readonly<Record<string, string>>;
  /** lowercase sourceId → the registry's LIVE commissionBps at build time. */
  currentBpsBySourceId: Readonly<Record<string, number>>;
  /** purchase blockNumber → UTC day ("YYYY-MM-DD") from the block header.
   * Must cover EVERY row block (fail closed — a date is never guessed). */
  blockDateByNumber: Readonly<Record<number, string>>;
  fromBlock: number;
  asOfBlock: number;
};

function fail(msg: string): never {
  throw new Error(`introduction-readmodel: ${msg}`);
}

/**
 * Pure, deterministic, fail-closed. Input order never changes the output
 * (rows are sorted by (blockNumber, logIndex)); any shape surprise throws.
 */
export function buildIntroductionReadmodel(inputs: BuildInputs): IntroductionReadmodel {
  const {
    rows,
    durableByRecipient,
    escrowBySourceId,
    currentBpsBySourceId,
    blockDateByNumber,
    fromBlock,
    asOfBlock,
  } = inputs;
  if (!Number.isInteger(fromBlock) || fromBlock <= 0) fail("bad fromBlock");
  if (!Number.isInteger(asOfBlock) || asOfBlock < fromBlock) fail("bad asOfBlock");

  const sorted = [...rows].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );

  type Acc = {
    purchases: number;
    recipients: Set<string>;
    /** unique recipient → its FIRST attributed purchase block. */
    firstBlockByRecipient: Map<string, number>;
    commission: bigint;
    firstBlock: number;
    lastBlock: number;
    sourceId: string;
  };
  const bySource = new Map<string, Acc>();
  const seenLog = new Set<string>();

  for (const r of sorted) {
    if (r.chainId !== EXPECTED_CHAIN_ID) fail(`row on unexpected chain ${r.chainId}`);
    if (r.eventName !== "MembershipPurchasedV3") fail(`unexpected event "${r.eventName}"`);
    if (!Number.isInteger(r.blockNumber) || r.blockNumber < fromBlock || r.blockNumber > asOfBlock) {
      fail(`row block ${r.blockNumber} outside scanned range`);
    }
    if (!Number.isInteger(r.logIndex) || r.logIndex < 0) fail("bad logIndex");
    const logKey = `${r.blockNumber}:${r.logIndex}`;
    if (seenLog.has(logKey)) fail(`duplicate log ${logKey}`);
    seenLog.add(logKey);

    const sourceId = r.sourceId.toLowerCase();
    if (!BYTES32_RE.test(sourceId) || sourceId === ZERO_BYTES32) {
      fail("row without a non-zero bytes32 sourceId (caller must pre-filter)");
    }
    const recipient = r.recipient.toLowerCase();
    if (!ADDRESS_RE.test(recipient)) fail("bad recipient address shape");
    if (!DECIMAL_RE.test(r.acquisitionCostRaw)) fail("acquisitionCostRaw not an exact decimal");
    if (!(recipient in durableByRecipient)) {
      fail("recipient missing from the durable-balance map (fail closed, never guessed)");
    }

    if (typeof blockDateByNumber[r.blockNumber] !== "string") {
      fail(`block ${r.blockNumber} missing from the block-date map (fail closed)`);
    }

    const key = sourceKeyOf(sourceId);
    const acc = bySource.get(key) ?? {
      purchases: 0,
      recipients: new Set<string>(),
      firstBlockByRecipient: new Map<string, number>(),
      commission: 0n,
      firstBlock: r.blockNumber,
      lastBlock: r.blockNumber,
      sourceId,
    };
    if (acc.sourceId !== sourceId) fail("source key collision (impossible input)");
    acc.purchases += 1;
    acc.recipients.add(recipient);
    const prevFirst = acc.firstBlockByRecipient.get(recipient);
    if (prevFirst === undefined || r.blockNumber < prevFirst) {
      acc.firstBlockByRecipient.set(recipient, r.blockNumber);
    }
    acc.commission += BigInt(r.acquisitionCostRaw);
    acc.firstBlock = Math.min(acc.firstBlock, r.blockNumber);
    acc.lastBlock = Math.max(acc.lastBlock, r.blockNumber);
    bySource.set(key, acc);
  }

  const out: Record<string, IntroductionSourceStats> = {};
  let tPurchases = 0;
  let tIntroduced = 0;
  let tDurable = 0;
  let tCommission = 0n;
  for (const key of [...bySource.keys()].sort()) {
    const acc = bySource.get(key)!;
    const durableRecipients = [...acc.recipients].filter(
      (a) => durableByRecipient[a] === true,
    );
    const durable = durableRecipients.length;
    const escrow = escrowBySourceId[acc.sourceId] ?? "0";
    if (!DECIMAL_RE.test(escrow)) fail("escrow figure not an exact decimal");

    // ── Ladder facts (LADDER-PROMOTION-SCREEN) ────────────────────────────
    const currentBps = currentBpsBySourceId[acc.sourceId];
    if (!Number.isInteger(currentBps) || currentBps < 0) {
      fail("source missing from the live currentBps map (fail closed)");
    }
    const entitled = entitledRateRung(durable);
    // The crossing block: the k-th earliest first-purchase block among the
    // CURRENTLY-durable introductions, k = the entitled rung's threshold.
    // Chain-dated (an event block), never a wall clock. Base rung → null.
    let crossedAtBlock: number | null = null;
    let crossedAtDateUtc: string | null = null;
    if (entitled.durableThreshold > 0) {
      const durableFirstBlocks = durableRecipients
        .map((a) => acc.firstBlockByRecipient.get(a))
        .filter((b): b is number => typeof b === "number")
        .sort((x, y) => x - y);
      const kth = durableFirstBlocks[entitled.durableThreshold - 1];
      if (kth === undefined) fail("entitled rung without enough durable blocks (impossible)");
      crossedAtBlock = kth;
      const date = blockDateByNumber[kth];
      if (typeof date !== "string") fail(`crossing block ${kth} missing from the date map`);
      crossedAtDateUtc = date;
    }

    out[key] = {
      attributedPurchases: acc.purchases,
      introducedMembers: acc.recipients.size,
      durableIntroductions: durable,
      commissionPaidRaw: acc.commission.toString(),
      escrowOwedRaw: escrow,
      firstBlock: acc.firstBlock,
      lastBlock: acc.lastBlock,
      currentBps,
      entitledBps: entitled.bps,
      entitledTitle: entitled.title,
      promotionDue: entitled.bps > currentBps,
      crossedAtBlock,
      crossedAtDateUtc,
    };
    tPurchases += acc.purchases;
    tIntroduced += acc.recipients.size;
    tDurable += durable;
    tCommission += acc.commission;
  }

  return {
    gate: "INTRODUCTION_READMODEL_V1",
    chainId: EXPECTED_CHAIN_ID,
    saleKey: "MEMBERSHIP_SALE_V3",
    fromBlock,
    asOfBlock,
    durableTest: DURABLE_TEST,
    totals: {
      attributedPurchases: tPurchases,
      distinctSources: bySource.size,
      introducedMembers: tIntroduced,
      durableIntroductions: tDurable,
      commissionPaidRaw: tCommission.toString(),
    },
    bySource: out,
  };
}

/** Canonical JSON of the stable content (hash input; provenance excluded). */
export function readmodelCanonicalJson(m: IntroductionReadmodel): string {
  return JSON.stringify(m, Object.keys(m).sort());
}

export function readmodelHash(m: IntroductionReadmodel): string {
  return `sha256:${createHash("sha256").update(readmodelCanonicalJson(m)).digest("hex")}`;
}

/**
 * Canonical JSON of the DATA content only — asOfBlock normalized out. The
 * chain head advances every scan, so a drift check comparing full models can
 * NEVER pass (a real flaw caught on the first live re-scan, 2026-07-13:
 * four distinct hashes over identical 2/1/2 totals). Two builds whose rows
 * and totals are identical are the SAME data, read at different heads.
 */
export function readmodelContentJson(m: IntroductionReadmodel): string {
  return readmodelCanonicalJson({ ...m, asOfBlock: 0 });
}
