/**
 * Member Continuity Read-Model — SERVER-ONLY PURE BUILDER (OS Layer 4 foundation).
 * --------------------------------------------------------------------------------
 * First implementation slice of the Holder Index / member-intelligence read-model
 * canonized in docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md.
 *
 * Shape doctrine (founder-approved slice, 2026-07-02):
 *   - PURE FUNCTION, no persistence. The read-model is DERIVED, never authority:
 *     it is rebuilt in memory, on demand, from Part B (historical freeze/root)
 *     plus Part A (raw V3 firstSeat purchase rows). Nothing is written anywhere.
 *   - This module imports NO database, NO network, NO server framework, and uses
 *     NO clock — same inputs always produce byte-identical output.
 *   - Served api-server code must NEVER import this module. It is script-side
 *     only (tsx), like every other Part A / Part B gate in ./scripts.
 *
 * Authority doctrine (never violated here):
 *   - Seats #1..#N(freeze) come from Part B `historical_member` rows anchored by
 *     the VERIFIED freeze root. Raw V1/V2 events corroborate; they never number.
 *   - Seats #N+1.. come ONLY from raw V3 `MembershipPurchasedV3` rows with
 *     firstSeat=true; the EMITTED memberNumber is the numbering authority.
 *   - (blockNumber, logIndex) ordering, contiguity, and on-chain memberCount are
 *     RECONCILIATION CHECKS, never a numbering source.
 *   - The V2B memberNumber=0 sentinel can never become a member, anywhere.
 *
 * Privacy doctrine:
 *   - `MemberContinuityRecord` carries server-only identity material (entry
 *     wallet, entry transaction). It must never be serialized into any public
 *     payload, log, report, or committed artifact.
 *   - The ONLY serialization path out of this module is `toAddressSafeReport`,
 *     a whitelist projection (counts, pass/fail, shortened root, aggregates)
 *     that fail-closes by scanning its own output for hex identity material.
 */

import { createHash } from "node:crypto";
import type {
  SyndicateAdapterKind,
  SyndicateProofDomain,
  SyndicateSurface,
  MemberDataVisibility,
} from "@workspace/os-contracts";

// ---------------------------------------------------------------------------
// OS vocabulary binding (existing os-contracts taxonomy only — nothing minted).
// ---------------------------------------------------------------------------

export const MEMBER_CONTINUITY_READ_MODEL_META: {
  readonly domain: SyndicateProofDomain;
  readonly surface: SyndicateSurface;
  readonly adapterKind: SyndicateAdapterKind;
  /** A FUTURE scoped own-record view would be auth-gated; nothing is exposed today. */
  readonly futureOwnRecordVisibility: MemberDataVisibility;
  /** Today: no public projection of member records exists or is approved. */
  readonly publicProjection: "NONE";
  readonly persistence: "NONE_IN_MEMORY_ONLY";
} = {
  domain: "WALLET_MEMBER_IDENTITY",
  surface: "SERVER_SIDE_CANON",
  adapterKind: "RECEIPT_READ_MODEL_ADAPTER",
  futureOwnRecordVisibility: "AUTH_REQUIRED",
  publicProjection: "NONE",
  persistence: "NONE_IN_MEMORY_ONLY",
};

export const MEMBER_CONTINUITY_DOCTRINE = [
  "Derived, never authority: rebuildable at any time from Part B freeze/root + Part A raw V3 firstSeat rows.",
  "Historical seats come from the Part B historical freeze/root only; raw V1/V2 events corroborate but never number.",
  "The V2B memberNumber=0 sentinel is excluded always and can never become a member.",
  "Post-freeze numbering authority is the emitted V3 memberNumber; block/log ordering and on-chain memberCount are reconciliation checks only.",
  "SYN transfer does not auto-transfer historical identity.",
  "Privy is not membership truth.",
  "Rank is not identity and is never a reward.",
  "Activity is not identity authority.",
  "Chronicle is not a member feed.",
  "Source attribution never owns a member; source/referral fields stay gated, server-only, PENDING.",
  "SeatRecord721 is future, separate, founder-gated identity infrastructure only.",
  "No manual fields, no stored eligibility: every field derives from Part A / Part B inputs.",
  "freezeGate VERIFIED authorizes server-side identity truth only — never public exposure.",
  "Wallets, proofs, transaction hashes, decodedJson and rawJson are server-only; reports carry counts, pass/fail, shortened roots and aggregates only.",
] as const;

// ---------------------------------------------------------------------------
// Input shapes (narrow projections of Part A / Part B rows — mapped by caller).
// ---------------------------------------------------------------------------

export type SaleGeneration = "V1" | "V2A" | "V2B" | "V3";

export interface FreezeInput {
  readonly chainId: number;
  readonly freezeBlock: number;
  /** Public-safe on-chain commitment; only ever reported shortened. */
  readonly root: string;
  readonly memberCount: number;
  readonly validationStatus: string;
}

export interface HistoricalMemberInput {
  readonly chainId: number;
  readonly freezeBlock: number;
  readonly memberNumber: number;
  /** SERVER-ONLY wallet PII. Never serialized out of the read-model. */
  readonly wallet: string;
  readonly source: SaleGeneration;
  /** SERVER-ONLY entry trail (explorer-linkable). */
  readonly firstBlock: number;
  readonly logIndex: number;
  readonly firstTransaction: string;
}

export interface V3PurchaseEventInput {
  readonly chainId: number;
  readonly generation: string;
  readonly eventName: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** SERVER-ONLY entry trail. */
  readonly transactionHash: string;
  /** Emitted memberNumber — the #9+ numbering AUTHORITY. */
  readonly memberNumber: number;
  readonly firstSeat: boolean;
  /** SERVER-ONLY wallet PII. */
  readonly buyerWallet: string;
  /** SERVER-ONLY wallet PII. */
  readonly recipientWallet: string;
  readonly era: string | null;
  readonly chapter: string | null;
  readonly receiptId: string | null;
  readonly receiptVersion: string | null;
  /**
   * `sale_event_raw.id` of this row (V3 lineage FK in the DDL). Optional for
   * back-compat with pre-DDL callers; REQUIRED (checked) in DDL-shaped builds.
   */
  readonly saleEventRawId?: number | null;
}

/**
 * A raw V2A/V2B `Purchased` row projection (ALL of them — entry and
 * non-entry alike) used ONLY for fail-closed Routed pairing. The decoded
 * memberNumber is an OPAQUE pairing token (era-local; the V2B sentinel 0 is
 * a valid token, never a member) — it never numbers anyone here.
 */
export interface V2PurchaseRowInput {
  readonly chainId: number;
  readonly generation: string;
  readonly eventName: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** SERVER-ONLY opaque pairing key. Never serialized out of this module. */
  readonly transactionHash: string;
  readonly memberNumberToken: number | null;
}

/**
 * A raw V2A/V2B `Routed` row projection. STRUCTURALLY excludes the gated
 * referral/source namespace: this shape has no referral field and can never
 * carry one — the caller's whitelist mapping must never widen it. Amounts are
 * EXACT raw base-unit strings (never numbers — no precision loss ever).
 */
export interface RoutedRowInput {
  readonly chainId: number;
  readonly generation: string;
  readonly eventName: string;
  /** SERVER-ONLY opaque pairing key. Never serialized out of this module. */
  readonly transactionHash: string;
  readonly memberNumberToken: number | null;
  readonly vaultAmount: string;
  readonly liquidityAmount: string;
  readonly operationsAmount: string;
}

/** A Protocol Time cache row COPY (chain-verified; never fetched here). */
export interface BlockTimestampCopyInput {
  readonly chainId: number;
  readonly blockNumber: number;
  readonly blockTimestampSec: number;
}

/**
 * Optional DDL-shaping extension (S3a). When present, the builder ALSO
 * projects the would-be `member_continuity_record` / verification-run rows,
 * runs the DDL CHECK preflight, computes the canonical determinism hash and
 * reports persistence eligibility. Still a pure function — nothing here
 * touches a database, network or clock.
 */
export interface DdlExtensionInput {
  readonly v2Purchases: readonly V2PurchaseRowInput[];
  readonly routedRows: readonly RoutedRowInput[];
  readonly blockTimestamps: readonly BlockTimestampCopyInput[];
  /** Live read-only memberCount() result; null = read failed (fail closed). */
  readonly onchainMemberCount: number | null;
  /** Raw-input provenance (how much of sale_event_raw this build consumed). */
  readonly inputSaleEventCount: number;
  readonly inputMaxSaleEventRawId: number | null;
  readonly builderVersion: string;
}

/** Aggregate corroboration counts (CORROBORATING ONLY — never a numbering source). */
export interface CorroborationInput {
  readonly v1DistinctBuyerCount: number;
  readonly v2aFirstSeatTrueCount: number;
  readonly v2bFirstSeatTrueNonSentinelCount: number;
  readonly v2bSentinelRowCount: number;
}

export interface BuildInput {
  readonly freeze: FreezeInput;
  readonly historicalMembers: readonly HistoricalMemberInput[];
  readonly v3Purchases: readonly V3PurchaseEventInput[];
  readonly corroboration?: CorroborationInput;
  /** Optional S3a DDL-shaping extension (dry-run projection only). */
  readonly ddl?: DdlExtensionInput;
}

// ---------------------------------------------------------------------------
// The read-model record (SERVER-ONLY object; never serialized publicly).
// ---------------------------------------------------------------------------

export type MemberContinuityClass = "HISTORICAL_FREEZE" | "POST_FREEZE_V3";
export type NumberingAuthority =
  | "PART_B_FREEZE_ROOT"
  | "V3_EMITTED_MEMBER_NUMBER";

export interface MemberContinuityRecord {
  readonly memberNumber: number;
  readonly continuityClass: MemberContinuityClass;
  readonly generation: SaleGeneration;
  readonly numberingAuthority: NumberingAuthority;
  readonly chainId: number;
  /** SERVER-ONLY entry identity block. */
  readonly entry: {
    readonly wallet: string;
    readonly blockNumber: number;
    readonly logIndex: number;
    readonly transactionHash: string;
  };
  /**
   * Receipt/proof REFERENCE (not a copy — Merkle leaf/proof stay in Part B rows;
   * the (chainId, freezeBlock, memberNumber) PK is the pointer).
   */
  readonly receipt:
    | { readonly kind: "HISTORICAL_MERKLE"; readonly freezeBlock: number }
    | {
        readonly kind: "V3_RECEIPT";
        readonly receiptId: string | null;
        readonly receiptVersion: string | null;
      };
  /** Derived pure-function classification (emitted for V3; null pre-chapter). */
  readonly era: string | null;
  readonly chapter: string | null;
  /** Source/referral remain gated server-only PENDING — never copied here. */
  readonly sourceAttribution: { readonly status: "GATED_PENDING" };
}

export interface ContinuityCheck {
  readonly name: string;
  readonly pass: boolean;
  /** MUST stay address-safe: counts, numbers, statuses only. */
  readonly detail: string;
  readonly kind: "GATE" | "RECONCILIATION";
}

export interface BuildResult {
  /** SERVER-ONLY. Never serialize. */
  readonly records: readonly MemberContinuityRecord[];
  readonly checks: readonly ContinuityCheck[];
  readonly consistent: boolean;
  readonly gatePassed: boolean;
  readonly totals: {
    readonly total: number;
    readonly historical: number;
    readonly postFreezeV3: number;
    readonly additionalSeatEventsExcluded: number;
  };
  readonly generationTotals: Readonly<Record<SaleGeneration, number>>;
  readonly continuity: {
    readonly min: number;
    readonly max: number;
    readonly contiguous: boolean;
    readonly duplicateCount: number;
  };
  readonly freeze: {
    readonly chainId: number;
    readonly freezeBlock: number;
    readonly rootShort: string;
    readonly memberCount: number;
    readonly validationStatus: string;
  };
  /** Present only when `input.ddl` was provided AND the gate passed. */
  readonly ddl?: DdlProjection;
}

// ---------------------------------------------------------------------------
// DDL-shaped projection (S3a — dry-run only; mirrors lib/db memberContinuity).
// ---------------------------------------------------------------------------

export type DdlNumberingAuthority = "PART_B_FREEZE_ROOT" | "V3_EMITTED";
export type DdlEntryFirstSeat = "true" | "unknown";

/**
 * Folded routing detail of the ENTRY transaction only. STRUCTURALLY excludes
 * the gated referral/source namespace — this shape has exactly three keys and
 * can never carry a fourth. Amounts are EXACT raw base-unit strings.
 */
export interface DdlRoutedFoldShape {
  readonly vaultAmount: string;
  readonly liquidityAmount: string;
  readonly operationsAmount: string;
}

/**
 * The would-be `member_continuity_record` row (SERVER-ONLY — entry columns
 * are PII/de-anonymizing; never serialized publicly). Excludes only the
 * DB-owned columns: `buildId` (exists only after an approved S3b write) and
 * `createdAt`/`updatedAt` (DB defaults, wall-clock).
 */
export interface DdlRecordShape {
  readonly chainId: number;
  readonly memberNumber: number;
  readonly generation: SaleGeneration;
  readonly numberingAuthority: DdlNumberingAuthority;
  /** Part B lineage: NOT NULL iff authority is PART_B_FREEZE_ROOT. */
  readonly freezeBlock: number | null;
  /** SERVER-ONLY entry wallet PII. */
  readonly entryWallet: string;
  readonly entryBlock: number;
  readonly entryLogIndex: number;
  /** SERVER-ONLY entry proof trail. */
  readonly entryTransaction: string;
  readonly entryFirstSeat: DdlEntryFirstSeat;
  /** Protocol Time copy; null until enrichment covers the entry block. */
  readonly entryBlockTimestampSec: number | null;
  readonly entryRoutedFold: DdlRoutedFoldShape | null;
  /** Raw-event lineage: NOT NULL iff authority is V3_EMITTED. */
  readonly saleEventRawId: number | null;
}

/** Aggregate-only verification memo (would be the run row's jsonb). NO PII. */
export interface DdlVerificationSummary {
  readonly gatePassed: boolean;
  readonly consistent: boolean;
  readonly contiguous: boolean;
  readonly duplicateCount: number;
  readonly sentinelPromoted: 0;
  readonly foldSummary: DdlFoldSummary;
  readonly timestampCoverage: DdlTimestampCoverage;
  readonly onchainMatch: boolean;
  readonly ddlCheckPreflightPass: boolean;
}

/**
 * The would-be `member_continuity_verification_run` row (NO PII except
 * `freezeRoot`, which is the PUBLIC on-chain commitment; the report layer
 * still shortens it). Excludes DB-owned `id` and `builtAt`. `status` is
 * 'VERIFIED' by construction — a non-eligible build persists NOTHING, so no
 * other status can ever exist (fail-closed doctrine).
 */
export interface DdlRunShape {
  readonly chainId: number;
  readonly status: "VERIFIED";
  readonly freezeBlock: number;
  readonly freezeRoot: string;
  readonly memberTotal: number;
  readonly historicalCount: number;
  readonly v3Count: number;
  /** null = live read failed → NOT NULL column unwritable → fail closed. */
  readonly onchainMemberCount: number | null;
  readonly determinismHash: string;
  readonly inputSaleEventCount: number;
  readonly inputMaxSaleEventRawId: number | null;
  readonly builderVersion: string;
  readonly verification: DdlVerificationSummary;
}

export interface DdlFoldSummary {
  readonly v2PurchaseRowsConsidered: number;
  readonly routedRowsConsidered: number;
  readonly routedRowsPaired: number;
  readonly recordsWithFold: number;
  readonly pairingViolations: number;
}

export interface DdlTimestampCoverage {
  readonly entryBlocksDistinct: number;
  readonly entryBlocksWithVerifiedTimestamp: number;
  readonly recordsWithTimestamp: number;
  readonly recordsTotal: number;
}

export interface DdlProjection {
  /** SERVER-ONLY (rows carry wallet/tx PII). Never serialize. */
  readonly records: readonly DdlRecordShape[];
  /** SERVER-ONLY (carries the full root; report layer shortens it). */
  readonly run: DdlRunShape;
  /** Data-wise eligibility (all gates + reconciliations + DDL preflight). */
  readonly persistenceEligible: boolean;
  /** ALWAYS contains the S3b gate reason — nothing can persist in S3a. */
  readonly blockedReasons: readonly string[];
  readonly foldSummary: DdlFoldSummary;
  readonly timestampCoverage: DdlTimestampCoverage;
}

/**
 * Canonical JSON: recursively key-sorted, no whitespace. `undefined` is a
 * hard error (it would silently vanish and weaken the determinism hash).
 */
export function canonicalJson(value: unknown): string {
  if (value === undefined) {
    throw new Error("canonical serialization: undefined is not permitted");
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`)
    .join(",")}}`;
}

// ---------------------------------------------------------------------------
// Builder (pure, deterministic, fail-closed).
// ---------------------------------------------------------------------------

export function shortenRoot(root: string): string {
  return root.length > 12 ? `${root.slice(0, 10)}…` : root;
}

const V3_EVENT_NAME = "MembershipPurchasedV3";
const HISTORICAL_SOURCES: readonly SaleGeneration[] = ["V1", "V2A", "V2B"];

export function buildMemberContinuityReadModel(input: BuildInput): BuildResult {
  const checks: ContinuityCheck[] = [];
  const gate = (name: string, pass: boolean, detail: string): boolean => {
    checks.push({ name, pass, detail, kind: "GATE" });
    return pass;
  };
  const rec = (name: string, pass: boolean, detail: string): boolean => {
    checks.push({ name, pass, detail, kind: "RECONCILIATION" });
    return pass;
  };

  const freeze = input.freeze;
  const freezeSummary = {
    chainId: freeze.chainId,
    freezeBlock: freeze.freezeBlock,
    rootShort: shortenRoot(freeze.root),
    memberCount: freeze.memberCount,
    validationStatus: freeze.validationStatus,
  };

  // Deterministic canonical ordering (input order must not matter).
  const hist = [...input.historicalMembers].sort(
    (a, b) => a.memberNumber - b.memberNumber,
  );
  const v3 = [...input.v3Purchases].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );
  const firstSeats = v3.filter((r) => r.firstSeat);
  const additionalSeats = v3.filter((r) => !r.firstSeat);

  // ---- GATE checks (fail-closed: no records unless every gate passes) ----
  let gateOk = true;
  gateOk =
    gate(
      "freeze validationStatus is VERIFIED",
      freeze.validationStatus === "VERIFIED",
      `status=${freeze.validationStatus}`,
    ) && gateOk;
  gateOk =
    gate(
      "historical row count equals freeze memberCount",
      hist.length === freeze.memberCount,
      `rows=${hist.length} freezeMemberCount=${freeze.memberCount}`,
    ) && gateOk;
  gateOk =
    gate(
      "no historical memberNumber below 1 (V2B sentinel exclusion)",
      hist.every((m) => m.memberNumber >= 1),
      `min=${hist.length ? Math.min(...hist.map((m) => m.memberNumber)) : 0}`,
    ) && gateOk;
  const histNumbers = hist.map((m) => m.memberNumber);
  const expectedHist = Array.from(
    { length: freeze.memberCount },
    (_, i) => i + 1,
  );
  gateOk =
    gate(
      "historical seats are exactly 1..N(freeze), no gaps, no duplicates",
      histNumbers.length === expectedHist.length &&
        histNumbers.every((n, i) => n === expectedHist[i]),
      `derived=[${histNumbers.join(",")}]`,
    ) && gateOk;
  gateOk =
    gate(
      "historical sources are pre-V3 generations only (V1/V2A/V2B)",
      hist.every((m) => HISTORICAL_SOURCES.includes(m.source)),
      `sources=${JSON.stringify([...new Set(hist.map((m) => m.source))].sort())}`,
    ) && gateOk;
  gateOk =
    gate(
      "historical rows anchor to the verified freeze (chainId, freezeBlock)",
      hist.every(
        (m) =>
          m.chainId === freeze.chainId && m.freezeBlock === freeze.freezeBlock,
      ),
      `chainId=${freeze.chainId} freezeBlock=${freeze.freezeBlock}`,
    ) && gateOk;
  gateOk =
    gate(
      "post-freeze inputs are V3 MembershipPurchasedV3 rows only",
      v3.every(
        (r) => r.generation === "V3" && r.eventName === V3_EVENT_NAME,
      ),
      `rows=${v3.length}`,
    ) && gateOk;
  gateOk =
    gate(
      "post-freeze rows anchor to the freeze chainId",
      v3.every((r) => r.chainId === freeze.chainId),
      `chainId=${freeze.chainId} rows=${v3.length}`,
    ) && gateOk;
  gateOk =
    gate(
      "no post-freeze row carries the memberNumber=0 sentinel",
      v3.every((r) => r.memberNumber !== 0),
      `rows=${v3.length}`,
    ) && gateOk;
  gateOk =
    gate(
      "every firstSeat memberNumber is above the freeze range",
      firstSeats.every((r) => r.memberNumber > freeze.memberCount),
      `firstSeats=${firstSeats.length} freezeMemberCount=${freeze.memberCount}`,
    ) && gateOk;
  const fsNumbers = firstSeats.map((r) => r.memberNumber);
  gateOk =
    gate(
      "no duplicate emitted memberNumber among firstSeat rows",
      new Set(fsNumbers).size === fsNumbers.length,
      `emitted=[${fsNumbers.join(",")}]`,
    ) && gateOk;

  const emptyTotals = {
    total: 0,
    historical: 0,
    postFreezeV3: 0,
    additionalSeatEventsExcluded: additionalSeats.length,
  };
  const emptyGen: Record<SaleGeneration, number> = {
    V1: 0,
    V2A: 0,
    V2B: 0,
    V3: 0,
  };

  if (!gateOk) {
    return {
      records: [],
      checks,
      consistent: false,
      gatePassed: false,
      totals: emptyTotals,
      generationTotals: emptyGen,
      continuity: { min: 0, max: 0, contiguous: false, duplicateCount: 0 },
      freeze: freezeSummary,
    };
  }

  // ---- Build records (authority sources only) ----
  const records: MemberContinuityRecord[] = [
    ...hist.map(
      (m): MemberContinuityRecord => ({
        memberNumber: m.memberNumber,
        continuityClass: "HISTORICAL_FREEZE",
        generation: m.source,
        numberingAuthority: "PART_B_FREEZE_ROOT",
        chainId: m.chainId,
        entry: {
          wallet: m.wallet,
          blockNumber: m.firstBlock,
          logIndex: m.logIndex,
          transactionHash: m.firstTransaction,
        },
        receipt: { kind: "HISTORICAL_MERKLE", freezeBlock: m.freezeBlock },
        era: null,
        chapter: null,
        sourceAttribution: { status: "GATED_PENDING" },
      }),
    ),
    ...firstSeats.map(
      (r): MemberContinuityRecord => ({
        memberNumber: r.memberNumber,
        continuityClass: "POST_FREEZE_V3",
        generation: "V3",
        numberingAuthority: "V3_EMITTED_MEMBER_NUMBER",
        chainId: r.chainId,
        entry: {
          wallet: r.recipientWallet,
          blockNumber: r.blockNumber,
          logIndex: r.logIndex,
          transactionHash: r.transactionHash,
        },
        receipt: {
          kind: "V3_RECEIPT",
          receiptId: r.receiptId,
          receiptVersion: r.receiptVersion,
        },
        era: r.era,
        chapter: r.chapter,
        sourceAttribution: { status: "GATED_PENDING" },
      }),
    ),
  ].sort((a, b) => a.memberNumber - b.memberNumber);

  // ---- RECONCILIATION checks (flags, never a numbering source) ----
  const allNumbers = records.map((r) => r.memberNumber);
  const dupCount = allNumbers.length - new Set(allNumbers).size;
  const min = allNumbers.length ? allNumbers[0]! : 0;
  const max = allNumbers.length ? allNumbers[allNumbers.length - 1]! : 0;
  const contiguous =
    allNumbers.length > 0 &&
    min === 1 &&
    allNumbers.every((n, i) => n === i + 1);
  rec(
    "combined memberNumbers are contiguous 1..max with no duplicates",
    contiguous && dupCount === 0,
    `min=${min} max=${max} count=${allNumbers.length} duplicates=${dupCount}`,
  );
  const monotone = fsNumbers.every(
    (n, i) => i === 0 || n > fsNumbers[i - 1]!,
  );
  rec(
    "emitted V3 numbering is monotone in (blockNumber, logIndex) order [check-only]",
    monotone,
    `chainOrderEmitted=[${fsNumbers.join(",")}]`,
  );
  const walletDiverging = firstSeats.filter(
    (r) => r.buyerWallet.toLowerCase() !== r.recipientWallet.toLowerCase(),
  ).length;
  rec(
    "V3 firstSeat buyer equals recipient (entry-wallet determinacy)",
    walletDiverging === 0,
    `diverging=${walletDiverging} of ${firstSeats.length}`,
  );
  const knownNumbers = new Set(allNumbers);
  const orphanAdditional = additionalSeats.filter(
    (r) => !knownNumbers.has(r.memberNumber),
  ).length;
  rec(
    "every non-firstSeat V3 event references a known member",
    orphanAdditional === 0,
    `additionalSeatEvents=${additionalSeats.length} orphans=${orphanAdditional}`,
  );
  if (input.corroboration) {
    const c = input.corroboration;
    const genCount = (g: SaleGeneration) =>
      hist.filter((m) => m.source === g).length;
    rec(
      "raw-event corroboration matches historical generation split [corroborating only]",
      c.v1DistinctBuyerCount === genCount("V1") &&
        c.v2aFirstSeatTrueCount === genCount("V2A") &&
        c.v2bFirstSeatTrueNonSentinelCount === genCount("V2B"),
      `raw=[${c.v1DistinctBuyerCount},${c.v2aFirstSeatTrueCount},${c.v2bFirstSeatTrueNonSentinelCount}] partB=[${genCount("V1")},${genCount("V2A")},${genCount("V2B")}] sentinelRowsObserved=${c.v2bSentinelRowCount} sentinelPromoted=0`,
    );
  }

  const generationTotals = records.reduce<Record<SaleGeneration, number>>(
    (acc, r) => {
      acc[r.generation] += 1;
      return acc;
    },
    { ...emptyGen },
  );

  // ---- Optional DDL-shaped projection (S3a dry-run; pure, no I/O) ----
  let ddlProjection: DdlProjection | undefined;
  if (input.ddl) {
    const d = input.ddl;
    const DECIMAL_RE = /^[0-9]+$/;

    // Chain uniformity of the extension inputs (fail closed).
    const offChainRows =
      d.v2Purchases.filter((p) => p.chainId !== freeze.chainId).length +
      d.routedRows.filter((r) => r.chainId !== freeze.chainId).length +
      d.blockTimestamps.filter((t) => t.chainId !== freeze.chainId).length;
    rec(
      "ddl inputs are chain-uniform with the freeze",
      offChainRows === 0,
      `offChainRows=${offChainRows}`,
    );

    // Protocol Time copies: one verified timestamp per block, no conflicts.
    const tsByBlock = new Map<number, number>();
    let tsConflicts = 0;
    for (const t of d.blockTimestamps) {
      const existing = tsByBlock.get(t.blockNumber);
      if (existing !== undefined && existing !== t.blockTimestampSec) {
        tsConflicts += 1;
      }
      tsByBlock.set(t.blockNumber, t.blockTimestampSec);
    }
    rec(
      "Protocol Time copies carry no conflicting block timestamps",
      tsConflicts === 0,
      `conflicts=${tsConflicts} blocksCovered=${tsByBlock.size}`,
    );

    // Fold amounts must be EXACT raw base-unit decimal strings.
    const invalidAmountRows = d.routedRows.filter(
      (r) =>
        !DECIMAL_RE.test(r.vaultAmount) ||
        !DECIMAL_RE.test(r.liquidityAmount) ||
        !DECIMAL_RE.test(r.operationsAmount),
    ).length;
    rec(
      "Routed fold amounts are raw base-unit decimal strings",
      invalidAmountRows === 0,
      `invalidRows=${invalidAmountRows} of ${d.routedRows.length}`,
    );

    // Fail-closed Routed pairing (activity-heartbeat fold rules): group by
    // tx, exactly one V2 purchase per Routed tx, at most one Routed per tx,
    // opaque-token equality on both rows, same generation. The token is a
    // pairing key ONLY — it never numbers anyone.
    const purchasesByTx = new Map<string, V2PurchaseRowInput[]>();
    for (const p of d.v2Purchases) {
      const g = purchasesByTx.get(p.transactionHash) ?? [];
      g.push(p);
      purchasesByTx.set(p.transactionHash, g);
    }
    const routedByTx = new Map<string, RoutedRowInput[]>();
    for (const r of d.routedRows) {
      const g = routedByTx.get(r.transactionHash) ?? [];
      g.push(r);
      routedByTx.set(r.transactionHash, g);
    }
    let pairingViolations = 0;
    let routedRowsPaired = 0;
    const foldByTx = new Map<
      string,
      { readonly fold: DdlRoutedFoldShape; readonly generation: string }
    >();
    for (const [tx, routedGroup] of routedByTx) {
      const purchases = purchasesByTx.get(tx) ?? [];
      if (purchases.length !== 1 || routedGroup.length !== 1) {
        pairingViolations += 1;
        continue;
      }
      const purchase = purchases[0]!;
      const routed = routedGroup[0]!;
      if (
        purchase.memberNumberToken === null ||
        routed.memberNumberToken === null ||
        purchase.memberNumberToken !== routed.memberNumberToken ||
        purchase.generation !== routed.generation
      ) {
        pairingViolations += 1;
        continue;
      }
      routedRowsPaired += 1;
      foldByTx.set(tx, {
        fold: {
          vaultAmount: routed.vaultAmount,
          liquidityAmount: routed.liquidityAmount,
          operationsAmount: routed.operationsAmount,
        },
        generation: routed.generation,
      });
    }
    rec(
      "V2 Routed pairing is fail-closed (1 purchase + ≤1 Routed per tx, token+generation equality)",
      pairingViolations === 0,
      `violations=${pairingViolations} paired=${routedRowsPaired} of ${d.routedRows.length}`,
    );

    // Shape the would-be rows (records are already sorted by memberNumber).
    let missingFoldEntries = 0;
    let foldGenerationMismatches = 0;
    let missingRawIds = 0;
    const ddlRecords: DdlRecordShape[] = [
      ...hist.map((m): DdlRecordShape => {
        let fold: DdlRoutedFoldShape | null = null;
        if (m.source === "V2A" || m.source === "V2B") {
          const entry = foldByTx.get(m.firstTransaction);
          if (!entry) {
            missingFoldEntries += 1;
          } else if (entry.generation !== m.source) {
            foldGenerationMismatches += 1;
          } else {
            fold = entry.fold;
          }
        }
        return {
          chainId: m.chainId,
          memberNumber: m.memberNumber,
          generation: m.source,
          numberingAuthority: "PART_B_FREEZE_ROOT",
          freezeBlock: m.freezeBlock,
          entryWallet: m.wallet,
          entryBlock: m.firstBlock,
          entryLogIndex: m.logIndex,
          entryTransaction: m.firstTransaction,
          entryFirstSeat: m.source === "V1" ? "unknown" : "true",
          entryBlockTimestampSec: tsByBlock.get(m.firstBlock) ?? null,
          entryRoutedFold: fold,
          saleEventRawId: null,
        };
      }),
      ...firstSeats.map((r): DdlRecordShape => {
        const rawId = r.saleEventRawId ?? null;
        if (rawId === null) missingRawIds += 1;
        return {
          chainId: r.chainId,
          memberNumber: r.memberNumber,
          generation: "V3",
          numberingAuthority: "V3_EMITTED",
          freezeBlock: null,
          entryWallet: r.recipientWallet,
          entryBlock: r.blockNumber,
          entryLogIndex: r.logIndex,
          entryTransaction: r.transactionHash,
          entryFirstSeat: "true",
          entryBlockTimestampSec: tsByBlock.get(r.blockNumber) ?? null,
          entryRoutedFold: null,
          saleEventRawId: rawId,
        };
      }),
    ].sort((a, b) => a.memberNumber - b.memberNumber);

    rec(
      "every V2A/V2B historical entry transaction folds exactly one Routed companion",
      missingFoldEntries === 0 && foldGenerationMismatches === 0,
      `missing=${missingFoldEntries} generationMismatches=${foldGenerationMismatches}`,
    );
    rec(
      "every V3 record carries sale_event_raw lineage",
      missingRawIds === 0,
      `missingRawIds=${missingRawIds} of ${firstSeats.length}`,
    );

    // DDL CHECK preflight — mirror every CHECK/unique constraint in
    // lib/db/src/schema/memberContinuity.ts before any write could exist.
    const entryEventKeys = new Set(
      ddlRecords.map(
        (r) => `${r.chainId}|${r.entryTransaction}|${r.entryLogIndex}`,
      ),
    );
    const ddlCheckViolations = ddlRecords.filter(
      (r) =>
        !(
          r.memberNumber >= 1 &&
          (r.generation === "V3") === (r.numberingAuthority === "V3_EMITTED") &&
          (r.numberingAuthority === "PART_B_FREEZE_ROOT") ===
            (r.freezeBlock !== null) &&
          (r.numberingAuthority === "V3_EMITTED") ===
            (r.saleEventRawId !== null) &&
          (r.entryFirstSeat === "true" || r.entryFirstSeat === "unknown") &&
          (r.entryRoutedFold === null ||
            r.generation === "V2A" ||
            r.generation === "V2B")
        ),
    ).length;
    const entryEventUnique = entryEventKeys.size === ddlRecords.length;
    const totalsReconcile =
      ddlRecords.length === hist.length + firstSeats.length;
    const ddlCheckPreflightPass =
      ddlCheckViolations === 0 && entryEventUnique && totalsReconcile;
    rec(
      "DDL CHECK preflight passes (constraints mirrored in-memory)",
      ddlCheckPreflightPass,
      `rowViolations=${ddlCheckViolations} entryEventUnique=${entryEventUnique} totalsReconcile=${totalsReconcile}`,
    );

    // Live on-chain reconciliation (fail closed: unavailable = would-fail).
    const onchainMatch =
      d.onchainMemberCount !== null &&
      d.onchainMemberCount === ddlRecords.length;
    rec(
      "live on-chain memberCount matches derived member total [fail-closed]",
      onchainMatch,
      `derived=${ddlRecords.length} onchain=${d.onchainMemberCount ?? "UNAVAILABLE"}`,
    );

    // Determinism hash: canonical serialization of the identity output +
    // input provenance. DELIBERATELY EXCLUDES onchainMemberCount (a live
    // read is reconciliation, not identity), builderVersion and anything
    // wall-clock — same inputs must always hash the same.
    const determinismHash = createHash("sha256")
      .update(
        canonicalJson({
          chainId: freeze.chainId,
          freezeBlock: freeze.freezeBlock,
          freezeRoot: freeze.root,
          records: ddlRecords,
          provenance: {
            inputSaleEventCount: d.inputSaleEventCount,
            inputMaxSaleEventRawId: d.inputMaxSaleEventRawId,
          },
        }),
      )
      .digest("hex");

    const foldSummary: DdlFoldSummary = {
      v2PurchaseRowsConsidered: d.v2Purchases.length,
      routedRowsConsidered: d.routedRows.length,
      routedRowsPaired,
      recordsWithFold: ddlRecords.filter((r) => r.entryRoutedFold !== null)
        .length,
      pairingViolations,
    };
    const entryBlocks = new Set(ddlRecords.map((r) => r.entryBlock));
    const timestampCoverage: DdlTimestampCoverage = {
      entryBlocksDistinct: entryBlocks.size,
      entryBlocksWithVerifiedTimestamp: [...entryBlocks].filter((b) =>
        tsByBlock.has(b),
      ).length,
      recordsWithTimestamp: ddlRecords.filter(
        (r) => r.entryBlockTimestampSec !== null,
      ).length,
      recordsTotal: ddlRecords.length,
    };

    const allChecksPass = checks.every((c) => c.pass);
    const verification: DdlVerificationSummary = {
      gatePassed: true,
      consistent: allChecksPass,
      contiguous,
      duplicateCount: dupCount,
      sentinelPromoted: 0,
      foldSummary,
      timestampCoverage,
      onchainMatch,
      ddlCheckPreflightPass,
    };
    const run: DdlRunShape = {
      chainId: freeze.chainId,
      status: "VERIFIED",
      freezeBlock: freeze.freezeBlock,
      freezeRoot: freeze.root,
      memberTotal: ddlRecords.length,
      historicalCount: hist.length,
      v3Count: firstSeats.length,
      onchainMemberCount: d.onchainMemberCount,
      determinismHash,
      inputSaleEventCount: d.inputSaleEventCount,
      inputMaxSaleEventRawId: d.inputMaxSaleEventRawId,
      builderVersion: d.builderVersion,
      verification,
    };

    const blockedReasons: string[] = [
      "S3B_NOT_APPROVED: persistence execution is a separate founder gate; no write adapter exists in S3a",
    ];
    if (!allChecksPass) {
      blockedReasons.push(
        "reconciliation checks failed (fail-closed: a non-green build persists nothing)",
      );
    }
    if (d.onchainMemberCount === null) {
      blockedReasons.push(
        "live memberCount() unavailable (NOT NULL column unwritable — fail closed)",
      );
    }
    ddlProjection = {
      records: ddlRecords,
      run,
      persistenceEligible: allChecksPass,
      blockedReasons,
      foldSummary,
      timestampCoverage,
    };
  }

  return {
    records,
    checks,
    consistent: checks.every((c) => c.pass),
    gatePassed: true,
    totals: {
      total: records.length,
      historical: hist.length,
      postFreezeV3: firstSeats.length,
      additionalSeatEventsExcluded: additionalSeats.length,
    },
    generationTotals,
    continuity: { min, max, contiguous, duplicateCount: dupCount },
    freeze: freezeSummary,
    ...(ddlProjection ? { ddl: ddlProjection } : {}),
  };
}

// ---------------------------------------------------------------------------
// Address-safe reporting (the ONLY serialization path out of the read-model).
// ---------------------------------------------------------------------------

/** 0x-prefixed 40+ hex (addresses, tx hashes) or bare 64-hex (leaves/roots). */
const HEX_IDENTITY_PATTERNS: readonly RegExp[] = [
  /0x[0-9a-fA-F]{40,}/,
  /\b[0-9a-fA-F]{64}\b/,
];

/** Fail-closed leak scan. Throws WITHOUT echoing the leaked material. */
export function assertAddressSafeJson(json: string): void {
  for (const pattern of HEX_IDENTITY_PATTERNS) {
    if (pattern.test(json)) {
      throw new Error(
        `address-safe serialization violated (pattern ${String(pattern)} matched; content withheld)`,
      );
    }
  }
}

export interface AddressSafeReport {
  readonly readModel: "MemberContinuityRecord";
  readonly layer: "OS_LAYER_4_HOLDER_INDEX_FOUNDATION";
  readonly meta: typeof MEMBER_CONTINUITY_READ_MODEL_META;
  readonly freeze: BuildResult["freeze"];
  readonly totals: BuildResult["totals"];
  readonly generationTotals: BuildResult["generationTotals"];
  readonly continuity: BuildResult["continuity"];
  readonly gatePassed: boolean;
  readonly consistent: boolean;
  readonly checks: readonly ContinuityCheck[];
}

/**
 * Whitelist projection: counts, pass/fail, shortened root, aggregates ONLY.
 * Records are structurally unreachable from this object, and the serialized
 * output is scanned fail-closed for hex identity material.
 */
export function toAddressSafeReport(result: BuildResult): AddressSafeReport {
  const report: AddressSafeReport = {
    readModel: "MemberContinuityRecord",
    layer: "OS_LAYER_4_HOLDER_INDEX_FOUNDATION",
    meta: MEMBER_CONTINUITY_READ_MODEL_META,
    freeze: result.freeze,
    totals: result.totals,
    generationTotals: result.generationTotals,
    continuity: result.continuity,
    gatePassed: result.gatePassed,
    consistent: result.consistent,
    checks: result.checks,
  };
  assertAddressSafeJson(JSON.stringify(report));
  return report;
}
