/**
 * Event Backbone — the UNATTENDED runner (M4-a, founder GO).
 * -----------------------------------------------------------
 * Makes the existing, already-proven indexer machinery run by itself inside
 * the served process: boot + interval cycles of
 *
 *   ① incremental sale-event scan (the pure engine, cursor-resumed — the
 *      SAME `runSaleEventScan` the founder-gated CLI drives; writes are
 *      idempotent, the cursor never advances past persisted rows),
 *   ② incremental Protocol Time enrichment (only never-verified blocks),
 *   ③ in-memory rebuild of the activity heartbeat read-model (pure builder;
 *      the address-safe aggregate report is kept as last-good state).
 *
 * Failure posture — the server NEVER crashes because of the backbone:
 *   - Any error fails the WHOLE cycle closed: the last-good read-model is
 *     kept, the error is redacted (URLs + hex stripped) and recorded, and
 *     the next cycle is scheduled anyway.
 *   - Cycles are single-flight by construction: the next cycle is scheduled
 *     only AFTER the current one finishes (success or failure).
 *   - Dark by default: nothing starts unless the founder set the exact
 *     opt-in literal (see backboneConfig.ts); without DATABASE_URL the
 *     backbone parks itself in "no-database" and never touches the DB.
 *
 * Wall-clock use here is OPS METADATA ONLY (cycle bookkeeping timestamps and
 * the plausibility upper bound inside enrichment) — chain truth timestamps
 * come exclusively from verified block headers, per Protocol Time doctrine.
 */

import { logger } from "../lib/logger";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
  FULL_ADDRESS_RE,
} from "../lib/protocol/rpcTransport";
import {
  expandScanUnits,
  runSaleEventScan,
  type ScanRunSummary,
} from "../lib/protocol/saleEventIndexer";
import { redactError } from "../lib/protocol/protocolTimeCore";
import {
  buildActivityHeartbeatReadModel,
  toAddressSafeActivityReport,
  type ActivityAddressSafeReport,
  type ActivityBuildResult,
} from "./activityHeartbeatReadmodel";
import type { FeedSource } from "./feedProjection";
import {
  BOOT_DELAY_MS,
  readBackboneConfig,
  type BackboneConfig,
} from "./backboneConfig";
import { enrichMissingBlockTimestamps } from "./blockTimeEnrich";
import {
  BACKBONE_EXPECTED_CHAIN_ID,
  getProtocolCursor,
  insertProtocolEvents,
  loadActivityHeartbeatInput,
  loadProtocolEventRows,
  makeSaleEventPersistence,
  upsertProtocolCursor,
} from "./backboneDb";
import { runNativeAvaxScan } from "./nativeAvaxScan";
import { curatedContractsFor, runTokenDiscoveryScan } from "./tokenDiscoveryScan";
import {
  runProtocolEventScan,
  type ProtocolScanStreamSummary,
} from "./protocolEventScan";
import {
  buildProtocolEventReadModel,
  type ProtocolEventBuildResult,
} from "./protocolEventReadmodel";
import {
  refreshIntroductionModel,
  type IntroductionRefreshSummary,
} from "./introductionRefresh";
import {
  ARCHIVE_ARTIFACTS,
  CONTRACT_TARGETS,
  FINANCIAL_TARGETS,
} from "../data/protocolTargets";
import {
  SELECTOR_GET_ARTIFACT_CORE,
  callData,
  decodeArtifactCoreRead,
  encodeUint256,
} from "../lib/protocol/archiveDecoders";
import {
  buildMilestoneReadModel,
  type MilestoneBuildResult,
} from "./milestoneReadmodel";
import { buildEraReadModel, type EraBuildResult } from "./eraReadmodel";
import {
  buildCapitalAxisReadModel,
  type CapitalBuildResult,
} from "./capitalAxisReadmodel";
import {
  buildOwnPurchaseReadModel,
  type OwnPurchaseBuildResult,
} from "./ownPurchaseReadmodel";
import { GENESIS_SEAT_BY_WALLET } from "../lib/protocol/historicalFreezeWallets";
import {
  buildSeasonReadModel,
  type SeasonBuildResult,
} from "./seasonReadmodel";
import { ethCall } from "../lib/protocol/evmRead";
import {
  decodeUint256Decimal,
  SELECTOR_TOTAL_GROSS_USDC,
} from "../lib/protocol/saleDecoders";
import {
  SELECTOR_CURRENT_ERA,
  SELECTOR_MEMBER_COUNT,
  SELECTOR_TOTAL_USDC_RAISED,
} from "../lib/protocol/financialDecoders";

// ---------------------------------------------------------------------------
// Status state (in-memory, address-free by construction).
// ---------------------------------------------------------------------------

export type BackboneState =
  | "disabled"
  | "no-database"
  | "idle"
  | "running";

interface UnitStatusLine {
  readonly contractKey: string;
  readonly eventName: string;
  readonly generation: string;
  readonly status: string;
  readonly scannedTo: number | null;
}

export interface BackboneStatusSnapshot {
  readonly module: "event-backbone";
  readonly enabled: boolean;
  readonly state: BackboneState;
  readonly intervalSec: number;
  /** partial = the serving state refreshed but a protocol stream faulted. */
  readonly cycles: {
    readonly ok: number;
    readonly partial: number;
    readonly failed: number;
  };
  readonly lastSuccess: {
    readonly finishedIso: string;
    readonly headBlock: number | null;
    readonly unitsOk: number;
    readonly unitsError: number;
    readonly eventsInserted: number;
    readonly protocolEventsInserted: number;
    readonly timestampsInserted: number;
    readonly units: readonly UnitStatusLine[];
    readonly protocolStreams: readonly {
      readonly streamKey: string;
      readonly status: string;
      readonly cursorBlock: number | null;
      readonly caughtUp: boolean;
      readonly rowsInserted: number;
    }[];
    readonly burnLedgerTotal: number;
    readonly lifecycleTotal: number;
    /** M0: the in-process introduction refresh (address-free counts only). */
    readonly introductionRefresh: {
      readonly refreshed: boolean;
      readonly skippedReason: string | null;
      readonly asOfBlock: number | null;
      readonly attributedRows: number;
      readonly distinctSources: number;
    } | null;
    readonly readModel: ActivityAddressSafeReport;
  } | null;
  readonly lastError: {
    readonly atIso: string;
    readonly message: string;
  } | null;
  readonly honesty: string;
}

const HONESTY_LINE =
  "Coverage grows from each generation's pinned deployment block to the head the last cycle saw; a failed cycle keeps the previous good state. Counts are address-safe aggregates — never proof of absence between cycles.";

interface MutableStatus {
  enabled: boolean;
  state: BackboneState;
  intervalSec: number;
  cyclesOk: number;
  cyclesPartial: number;
  cyclesFailed: number;
  lastSuccess: BackboneStatusSnapshot["lastSuccess"];
  lastError: BackboneStatusSnapshot["lastError"];
}

const status: MutableStatus = {
  enabled: false,
  state: "disabled",
  intervalSec: 0,
  cyclesOk: 0,
  cyclesPartial: 0,
  cyclesFailed: 0,
  lastSuccess: null,
  lastError: null,
};

let started = false;

/**
 * Last-good read-models (SERVER-ONLY memory; sale items carry pairing tokens,
 * burn items carry sender addresses until projected to labels). The ONLY ways
 * out are the two sanctioned projections: the aggregate report (status) and
 * the receipt-line feed (feedProjection, its own output gate).
 */
let lastGoodModel: ActivityBuildResult | null = null;
let lastGoodProtocolModel: ProtocolEventBuildResult | null = null;
/** H2-⑬: the derived milestone model (crossings + honest progress). */
let lastGoodMilestoneModel: MilestoneBuildResult | null = null;
/** H2-⑫: the derived era-transition model (witnessed page turns only). */
let lastGoodEraModel: EraBuildResult | null = null;
/** H2-⑰: the derived capital-axis model (footprint rises only). */
let lastGoodCapitalModel: CapitalBuildResult | null = null;
/** D-TRUTH D3: the own-purchase rows model (SERVER-ONLY wallet keys; the
 * auth zone serves a session's own rows only — never a lookup surface). */
let lastGoodOwnPurchaseModel: OwnPurchaseBuildResult | null = null;
/** S1 (seasons arc, 2026-07-23): the season/XP recognition model — a pure
 * projection over the same gapless lanes (SERVER-ONLY wallet index inside;
 * public standings are seat-keyed and address-free). */
let lastGoodSeasonModel: SeasonBuildResult | null = null;

// D-TRUTH D1: the Merkle-frozen genesis roster join input (lowercase wallet →
// seat #1–#8; SERVER-ONLY, never emitted) now lives beside the roster itself —
// `GENESIS_SEAT_BY_WALLET`, imported above. It was built locally here, and the
// public feed projection later grew a SECOND first-seat key space instead of
// joining on it. One map, one authority, both subsystems.
/** The protocol lane's honest coverage bounds (its cursors), for projections. */
let burnsAsOfBlock: number | null = null;
let lifecycleAsOfBlock: number | null = null;

/** Source for the public receipt-line feed (projected + gated by the route). */
export function getBackboneFeedSource(): FeedSource {
  return {
    model: lastGoodModel,
    protocolModel: lastGoodProtocolModel,
    milestoneModel: lastGoodMilestoneModel,
    eraModel: lastGoodEraModel,
    capitalModel: lastGoodCapitalModel,
    state: status.state,
    headBlock: status.lastSuccess?.headBlock ?? null,
    finishedIso: status.lastSuccess?.finishedIso ?? null,
    burnsAsOfBlock,
    lifecycleAsOfBlock,
  };
}

/** D-TRUTH D3 — the own-purchase model, for the AUTH ZONE only (own-row
 * serving; SERVER-ONLY wallet keys). Deliberately NOT part of FeedSource:
 * the public feed projection never reads it. */
export function getOwnPurchaseSource(): OwnPurchaseBuildResult | null {
  return lastGoodOwnPurchaseModel;
}

/** S1 (seasons arc) — the season/XP model source. Deliberately NOT part of
 * FeedSource (the feed never reads it); S2's surfaces + the auth zone's
 * own-row serving read it here. The wallet index inside is SERVER-ONLY —
 * any served view is seat-keyed, address-free, and output-gated by its
 * route (the D3 discipline). */
export function getSeasonSource(): SeasonBuildResult | null {
  return lastGoodSeasonModel;
}

/** Address-free snapshot for the status route (structure is already safe). */
export function getBackboneStatus(): BackboneStatusSnapshot {
  return {
    module: "event-backbone",
    enabled: status.enabled,
    state: status.state,
    intervalSec: status.intervalSec,
    cycles: {
      ok: status.cyclesOk,
      partial: status.cyclesPartial,
      failed: status.cyclesFailed,
    },
    lastSuccess: status.lastSuccess,
    lastError: status.lastError,
    honesty: HONESTY_LINE,
  };
}

// ---------------------------------------------------------------------------
// The cycle.
// ---------------------------------------------------------------------------

/** Redact anything an upstream error could carry (URLs, keys-in-URLs, hex). */
function toSafeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return redactError(raw).replace(FULL_ADDRESS_RE, "[hex-redacted]").slice(0, 300);
}

function summarizeUnits(summary: ScanRunSummary): UnitStatusLine[] {
  return summary.units.map((u) => ({
    contractKey: u.contractKey,
    eventName: u.eventName,
    generation: u.generation,
    status: u.status,
    scannedTo: u.scannedTo,
  }));
}

async function runCycle(): Promise<string | null> {
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);

  // ① Incremental scan — the same engine + adapter the founder-gated CLI
  // drives; the cursor resumes from lastScannedBlock + 1 through head.
  const persistence = await makeSaleEventPersistence();
  const summary = await runSaleEventScan({
    transport,
    persistence,
    units: expandScanUnits(),
    maxBlocksPerUnit: null, // scan through head
  });
  if (!summary.chainOk) {
    throw new Error("chain probe failed before the scan — cycle aborted");
  }
  const failedUnits = summary.units.filter((u) => u.status === "error");
  if (failedUnits.length > 0) {
    // Fail the WHOLE cycle closed. Persisted sub-ranges stay (idempotent,
    // cursor-guarded); the next cycle resumes them honestly.
    throw new Error(
      `${failedUnits.length}/${summary.units.length} scan unit(s) errored — cycle failed closed`,
    );
  }
  const eventsInserted = summary.units.reduce(
    (acc, u) => acc + u.rowsInserted,
    0,
  );

  // ①b Protocol-event lane (M4-c): burns + registry lifecycle, cursor-resumed
  // toward the SAME head the sale scan saw, within this cycle's block budget.
  // ISOLATED: a stream fault is recorded (its cursor sits at the last
  // persisted chunk) but NEVER darkens the seat lane or the serving state —
  // the persisted prefix is gapless and serves honestly with its own asOf.
  if (summary.head === null) {
    throw new Error("scan summary carries no head block — cycle aborted");
  }
  const protocolStreams: ProtocolScanStreamSummary[] =
    await runProtocolEventScan(transport, summary.head);

  // ①c THE NATIVE-AVAX LANE (2026-07-27). AVAX emits no log, so it cannot ride
  // the pass above — it reads the organ wallets' native movements from the
  // explorer's account API instead. Same convergence law, same isolation: a
  // fault lands in this summary and leaves the cursor where it was.
  const nativeAvax = await runNativeAvaxScan({
    organWallets: [
      FINANCIAL_TARGETS.vaultWallet,
      FINANCIAL_TARGETS.liquidityWallet,
      FINANCIAL_TARGETS.operationsWallet,
      FINANCIAL_TARGETS.nftSaleWallet,
    ],
    head: summary.head,
    deps: {
      getCursor: (streamKey) =>
        getProtocolCursor(BACKBONE_EXPECTED_CHAIN_ID, streamKey, "*"),
      upsertCursor: (input) =>
        upsertProtocolCursor({
          chainId: BACKBONE_EXPECTED_CHAIN_ID,
          eventName: "*",
          ...input,
        }),
      insert: insertProtocolEvents,
    },
  });

  // ①d THE TOKEN DISCOVERY LANE (2026-07-27, founder rule). Every other lane
  // pins ONE contract; this one pins OUR WALLETS and leaves the contract open,
  // so an asset nobody registered still produces a row. What makes it safe
  // without a human step is the SIGNATURE: a token the protocol bought arrives
  // in a transaction signed by one of its own keys, and nobody can forge that.
  const ORGAN_WALLETS = [
    FINANCIAL_TARGETS.vaultWallet,
    FINANCIAL_TARGETS.liquidityWallet,
    FINANCIAL_TARGETS.operationsWallet,
    FINANCIAL_TARGETS.nftSaleWallet,
  ];
  // The Founder's own keys (allocation + private wallet). Declared here rather
  // than at its old site further down, so the ONE derivation serves both the
  // signer rule below and the founder-attribution labels later in the cycle.
  const founderWalletAddresses = new Set([
    ...FINANCIAL_TARGETS.allocationWallets
      .filter((w) => w.key === "FOUNDER")
      .map((w) => w.address.toLowerCase()),
    FINANCIAL_TARGETS.founderPrivateWallet.toLowerCase(),
  ]);
  const discovery = await runTokenDiscoveryScan({
    transport,
    organWallets: ORGAN_WALLETS,
    // An organ OR the Founder may sign for an acquisition — both are keys we
    // hold. Nothing else counts, so an airdrop can never enter.
    signerWallets: [...ORGAN_WALLETS, ...founderWalletAddresses],
    // What already has a lane, from the ONE authority beside the lane itself —
    // assembling this list here privately is exactly what let the LP pair go
    // missing until the founder's question forced the measurement.
    pinnedContracts: curatedContractsFor(FINANCIAL_TARGETS),
    head: summary.head,
    deps: {
      getCursor: (streamKey) =>
        getProtocolCursor(BACKBONE_EXPECTED_CHAIN_ID, streamKey, "*"),
      upsertCursor: (input) =>
        upsertProtocolCursor({
          chainId: BACKBONE_EXPECTED_CHAIN_ID,
          eventName: "*",
          ...input,
        }),
      insert: insertProtocolEvents,
    },
  });

  const protocolEventsInserted =
    protocolStreams.reduce((acc, s) => acc + s.rowsInserted, 0) +
    nativeAvax.rowsInserted +
    discovery.rowsInserted;
  const streamFaults = [
    ...protocolStreams.filter((s) => s.status === "error"),
    ...(nativeAvax.status === "error"
      ? [nativeAvax as unknown as ProtocolScanStreamSummary]
      : []),
    ...(discovery.status === "error"
      ? [discovery as unknown as ProtocolScanStreamSummary]
      : []),
  ];

  // ② Incremental Protocol Time enrichment (new blocks only, witness-checked;
  // covers BOTH raw lanes).
  const enrich = await enrichMissingBlockTimestamps(transport);

  // ③ Rebuild the read-models in memory (pure, fail-closed, address-safe out).
  const { input, rawReceiptFacts } = await loadActivityHeartbeatInput();
  const model = buildActivityHeartbeatReadModel(input);
  if (!model.consistent) {
    throw new Error("activity read-model rebuild is not consistent — cycle failed closed");
  }
  const report = toAddressSafeActivityReport(model);

  // ③b The protocol-event read-model (burn ledger + lifecycle + liquidity +
  // archive lines — H1a, the complete heartbeat arc). The founder label set:
  // the FOUNDER allocation wallet PLUS the protocol's own routing wallets
  // (vault / liquidity / operations — infra pipes per the Visibility Law;
  // the founder's public acts flow through them). THE FOUNDER VOICE RULE
  // (founder correction 2, 2026-07-15): skin in the game is the trust engine —
  // founder acts SAY the founder. A label decision made HERE, server-side;
  // no address ever leaves the zone.
  // AW-1 (founder, 2026-07-22): the founder's PRIVATE wallet ("Founder
  // Private Wallet", his naming) joins the set — his 7 historical archive
  // mints and any future act from it say "Founder". The PURE founder-wallet
  // subset (allocation + private, organs excluded) additionally drives the
  // treasury counterpart attribution: money entering an organ FROM a founder
  // wallet is the Founder advancing money to the protocol, and the line says
  // so (the founder's funding doctrine, dossier §5).
  // (Declared ABOVE, before the discovery lane: the same set answers "whose
  // signature authorises an acquisition". One derivation, two uses.)
  const founderAddresses = new Set([
    ...founderWalletAddresses,
    FINANCIAL_TARGETS.vaultWallet.toLowerCase(),
    FINANCIAL_TARGETS.liquidityWallet.toLowerCase(),
    FINANCIAL_TARGETS.operationsWallet.toLowerCase(),
  ]);
  const protocolRows = await loadProtocolEventRows();
  // H2-⑦: the organ label map (address → public LABEL; decided ONCE here,
  // addresses never leave the zone) + the Fold Law's sale-lane tx set (a
  // treasury transfer inside a purchase transaction is routing detail).
  const organLabelByAddress = new Map<string, string>([
    [FINANCIAL_TARGETS.vaultWallet.toLowerCase(), "the vault"],
    [FINANCIAL_TARGETS.liquidityWallet.toLowerCase(), "the liquidity wallet"],
    [FINANCIAL_TARGETS.operationsWallet.toLowerCase(), "the operations wallet"],
    // Founder-named 2026-07-25. Artifact mints pay into it, so a member seeing
    // "moved into the NFT sale wallet" is reading real, checkable income.
    [FINANCIAL_TARGETS.nftSaleWallet.toLowerCase(), "the NFT sale wallet"],
  ]);
  const saleTransactionHashes = new Set(
    model.items.map((i) => i.transactionHash.toLowerCase()),
  );
  // ── WHO HOLDS A SEAT (Founder ruling 2026-07-26) ────────────────────────────
  // "dans notre système c'est un qui a acheté un seat, les autres sont
  // différents" — so an act by a seat holder must be distinguishable from an act
  // by anyone else, and the answer has to come from the chain, never from a
  // label we type.
  //
  // WHERE IT COMES FROM, and why not a new derivation: the Founder pointed at the
  // ticketing system, and he was right that the answer already lives there —
  // `ownPurchaseReadmodel.rowsByWallet` is exactly "lowercase wallet → its own
  // purchases". But that model is built LATER in this same pass (see ③, below),
  // so reading it here would be a cycle. Both it and this set descend from the
  // SAME sale lane — `model.items`, the gapless purchase record — so this reads
  // that lane one step upstream instead of inventing a second notion of
  // membership. One lane, one truth about who holds a seat.
  //
  // A null memberAddress is an early/undecodable row: it yields NO membership
  // claim rather than a guessed one, so an unclassifiable actor degrades to
  // "not a seat holder" — the honest default, since holding a seat is the thing
  // we would have to PROVE.
  const seatHolderAddresses = new Set(
    model.items
      .map((i) => i.memberAddress)
      .filter((a): a is string => a !== null)
      .map((a) => a.toLowerCase()),
  );
  const protocolModel = buildProtocolEventReadModel({
    expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
    burns: protocolRows.burns,
    lifecycle: protocolRows.lifecycle,
    lpLiquidity: protocolRows.lpLiquidity,
    lpTokenMints: protocolRows.lpTokenMints,
    archiveMints: protocolRows.archiveMints,
    archivePauses: protocolRows.archivePauses,
    treasury: protocolRows.treasury,
    blockTimestamps: input.blockTimestamps,
    founderAddresses,
    founderWalletAddresses,
    organLabelByAddress,
    seatHolderAddresses,
    saleTransactionHashes,
    // H1a-fix: the pair's immutable token0 orientation (canon pin, chain-
    // verified 2026-07-15 — token0 is USDC). Never assumed in the read-model.
    lpToken0IsSyn: FINANCIAL_TARGETS.lpPairToken0 === "SYN",
  });

  // ③b2 The milestone read-model (H2-⑬) — derived GAPLESSLY from the two
  // lanes above, no new persistence. The live memberCount + inflow reads are
  // OVERCLAIM PROTECTION only (5 eth_calls, fail-soft): unavailable reads
  // never darken the model — the builder notes the posture honestly; a
  // contradiction WITHHOLDS the contradicted milestone, fail-closed.
  let milestoneModel: MilestoneBuildResult | null = null;
  let milestoneFault: string | null = null;
  try {
    let liveMemberCount: number | null = null;
    let liveInflowAggregateRaw: string | null = null;
    try {
      const mcDec = decodeUint256Decimal(
        await ethCall(
          transport,
          FINANCIAL_TARGETS.memberCountEngine.address,
          SELECTOR_MEMBER_COUNT,
        ),
      );
      const mcNum = mcDec !== null ? Number(mcDec) : NaN;
      liveMemberCount = Number.isSafeInteger(mcNum) ? mcNum : null;

      let inflowSum = 0n;
      let inflowOk = true;
      for (const t of FINANCIAL_TARGETS.inflows) {
        const selector =
          t.view === "totalUsdcRaised"
            ? SELECTOR_TOTAL_USDC_RAISED
            : SELECTOR_TOTAL_GROSS_USDC;
        const dec = decodeUint256Decimal(
          await ethCall(transport, t.address, selector),
        );
        if (dec === null) {
          inflowOk = false;
          break;
        }
        inflowSum += BigInt(dec);
      }
      liveInflowAggregateRaw = inflowOk ? inflowSum.toString(10) : null;
    } catch {
      liveMemberCount = null;
      liveInflowAggregateRaw = null;
    }
    // AW price GO (2026-07-22): the patronage revenue read — Σ configured
    // price × minted per artifact (the /economy card's own authority).
    // Fail-soft null like the other milestone cross-checks.
    let liveArtifactRevenueRaw: string | null = null;
    try {
      const archiveAddr = CONTRACT_TARGETS.find((t) => t.key === "ARCHIVE_1155")?.address;
      if (archiveAddr) {
        let sum = 0n;
        let allOk = true;
        for (const a of ARCHIVE_ARTIFACTS) {
          const decoded = decodeArtifactCoreRead(
            await ethCall(
              transport,
              archiveAddr,
              callData(SELECTOR_GET_ARTIFACT_CORE, [encodeUint256(BigInt(a.id))]),
            ),
          );
          if (!decoded.ok) {
            allOk = false;
            break;
          }
          sum += decoded.priceUsdc * decoded.minted;
        }
        liveArtifactRevenueRaw = allOk ? sum.toString(10) : null;
      }
    } catch {
      liveArtifactRevenueRaw = null;
    }
    milestoneModel = buildMilestoneReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      archiveMintItems: protocolModel.archiveMintItems,
      // M-EVO-1 (2026-07-22): the fire / referral / liquidity families
      // derive from the SAME protocol lanes — zero new scans.
      burnItems: protocolModel.burnLedger,
      lifecycleItems: protocolModel.lifecycleItems,
      lpItems: protocolModel.lpItems,
      liveMemberCount,
      liveInflowAggregateRaw,
      liveArtifactRevenueRaw,
    });
  } catch (err) {
    milestoneFault = err instanceof Error ? err.message : String(err);
  }

  // ③b3 The era-transition read-model (H2-⑫) — the witness pattern over the
  // sale lane; LINE-ON-CROSSING ONLY (era bounds are bytecode, never framed
  // as scarcity pressure — no approaching display exists). One fail-soft
  // live currentEra() read on the ACTIVE engine as overclaim protection;
  // sealed engines' histories are frozen chain truth.
  let eraModel: EraBuildResult | null = null;
  let eraFault: string | null = null;
  try {
    let liveActiveEngineEra: number | null = null;
    try {
      const eraDec = decodeUint256Decimal(
        await ethCall(
          transport,
          FINANCIAL_TARGETS.memberCountEngine.address,
          SELECTOR_CURRENT_ERA,
        ),
      );
      const eraNum = eraDec !== null ? Number(eraDec) : NaN;
      liveActiveEngineEra = Number.isSafeInteger(eraNum) ? eraNum : null;
    } catch {
      liveActiveEngineEra = null;
    }
    eraModel = buildEraReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      liveActiveEngineEra,
      // The active engine = the memberCountEngine's generation (V3 today).
      activeEngine: "V3",
    });
  } catch (err) {
    eraFault = err instanceof Error ? err.message : String(err);
  }

  // ③b4 The capital-axis read-model (H2-⑰) — per-seat footprint rises via
  // the witness pattern over the SAME gapless lane; pure, no live reads
  // (the gapless history IS the truth; no per-seat live view exists).
  // LINE-ON-RISE ONLY — the base rung is the seat's birth state and the
  // anti-scarcity pin extends to this class (no approaching shape exists).
  let capitalModel: CapitalBuildResult | null = null;
  let capitalFault: string | null = null;
  try {
    capitalModel = buildCapitalAxisReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      // D-TRUTH D1: the frozen genesis roster joins early-era rows to their
      // seats for STANDING only — the rise record stays exactly as witnessed.
      genesisSeatByWallet: GENESIS_SEAT_BY_WALLET,
    });
  } catch (err) {
    capitalFault = err instanceof Error ? err.message : String(err);
  }

  // ③b6 The season/XP read-model (S1 of the seasons arc, 2026-07-23) — pure
  // recognition projection over the SAME gapless lanes (zero new scans, zero
  // persistence; the genesis retro-credit is the replay itself). Season = Era
  // on today's chain (§8-⑤); the witnessed transitions segment the seasons;
  // hors-concours = the founder/organ set that already labels burns and LP.
  // A fault keeps the previous good model (derived-layer discipline).
  let seasonModel: SeasonBuildResult | null = null;
  let seasonFault: string | null = null;
  try {
    seasonModel = buildSeasonReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      burnItems: protocolModel.burnLedger,
      archiveMintItems: protocolModel.archiveMintItems,
      eraTransitions: eraModel?.transitions ?? [],
      genesisSeatByWallet: GENESIS_SEAT_BY_WALLET,
      horsConcoursWallets: founderAddresses,
    });
  } catch (err) {
    seasonFault = err instanceof Error ? err.message : String(err);
  }

  // ③b5 The own-purchase read-model (D-TRUTH D3) — the member's own receipt
  // rows over the SAME gapless lane; SERVER-ONLY wallet keys, served only as
  // a session's own rows by the auth zone. A fault keeps the previous good
  // model (the derived-layer discipline).
  let ownPurchaseModel: OwnPurchaseBuildResult | null = null;
  let ownPurchaseFault: string | null = null;
  try {
    ownPurchaseModel = buildOwnPurchaseReadModel({
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents: input.rawEvents,
      blockTimestamps: input.blockTimestamps,
      // R-BIND (the binder slice): the loader's own-receipt facts + the
      // frozen genesis roster join V1 rows to their seats — STANDING only.
      rawReceiptFacts,
      genesisSeatByWallet: GENESIS_SEAT_BY_WALLET,
    });
  } catch (err) {
    ownPurchaseFault = err instanceof Error ? err.message : String(err);
  }

  // ③c The introduction read-model refresh (M0) — ISOLATED like the protocol
  // lane: a fault or an honest skip never darkens the heartbeat; the previous
  // live model (or the committed snapshot) keeps serving the standing reads.
  let introRefresh: IntroductionRefreshSummary | null = null;
  let introFault: string | null = null;
  try {
    introRefresh = await refreshIntroductionModel(transport, summary.head);
  } catch (err) {
    introFault = err instanceof Error ? err.message : String(err);
  }

  lastGoodModel = model;
  lastGoodProtocolModel = protocolModel;
  // H2-⑬/⑫: a derived-layer fault keeps the previous good model (the
  // heartbeat itself is never darkened by the derived layer).
  if (milestoneModel !== null) lastGoodMilestoneModel = milestoneModel;
  if (eraModel !== null) lastGoodEraModel = eraModel;
  if (capitalModel !== null) lastGoodCapitalModel = capitalModel;
  if (ownPurchaseModel !== null) lastGoodOwnPurchaseModel = ownPurchaseModel;
  if (seasonModel !== null) lastGoodSeasonModel = seasonModel;
  burnsAsOfBlock =
    protocolStreams.find((s) => s.streamKey === "SYN_BURN")?.cursorBlock ??
    burnsAsOfBlock;
  lifecycleAsOfBlock =
    protocolStreams.find((s) => s.streamKey === "SOURCE_LIFECYCLE")
      ?.cursorBlock ?? lifecycleAsOfBlock;

  status.lastSuccess = {
    finishedIso: new Date().toISOString(), // ops metadata, never chain truth
    headBlock: summary.head,
    unitsOk: summary.units.length,
    unitsError: 0,
    eventsInserted,
    protocolEventsInserted,
    timestampsInserted: enrich.inserted,
    units: summarizeUnits(summary),
    // THE TWO NEW MONEY LANES REPORT HERE TOO (senior review, 2026-07-27).
    // They were folded into `streamFaults` for the cycle's verdict but never
    // reached the operator's status payload, so a lane stuck for days would
    // have been invisible on the one screen built to show exactly that. A lane
    // nobody can see stalling is a lane nobody fixes.
    protocolStreams: [
      ...protocolStreams.map((s) => ({
        streamKey: s.streamKey,
        status: s.status,
        cursorBlock: s.cursorBlock,
        caughtUp: s.caughtUp,
        rowsInserted: s.rowsInserted,
      })),
      ...[nativeAvax, discovery].map((s) => ({
        streamKey: s.streamKey,
        status: s.status,
        cursorBlock: s.scannedTo,
        caughtUp: s.status === "ok" && s.scannedTo >= (summary.head ?? 0),
        rowsInserted: s.rowsInserted,
      })),
    ],
    burnLedgerTotal: protocolModel.totals.burns,
    lifecycleTotal: protocolModel.totals.lifecycle,
    introductionRefresh: introRefresh
      ? {
          refreshed: introRefresh.refreshed,
          skippedReason: introRefresh.skippedReason,
          asOfBlock: introRefresh.asOfBlock,
          attributedRows: introRefresh.attributedRows,
          distinctSources: introRefresh.distinctSources,
        }
      : null,
    readModel: report,
  };

  // A stream/refresh fault makes the cycle PARTIAL — everything above still serves.
  const partialNotes: string[] = [];
  if (streamFaults.length > 0) {
    partialNotes.push(
      `${streamFaults.length} protocol stream(s) faulted — catch-up resumes from the persisted cursor`,
    );
  }
  if (introFault !== null) {
    partialNotes.push(
      "introduction refresh faulted — the previous model keeps serving",
    );
  }
  if (milestoneFault !== null) {
    partialNotes.push(
      "milestone derivation faulted — the previous milestone model keeps serving",
    );
  }
  if (eraFault !== null) {
    partialNotes.push(
      "era derivation faulted — the previous era model keeps serving",
    );
  }
  if (capitalFault !== null) {
    partialNotes.push(
      "capital-axis derivation faulted — the previous capital model keeps serving",
    );
  }
  if (ownPurchaseFault !== null) {
    partialNotes.push(
      "own-purchase derivation faulted — the previous own-rows model keeps serving",
    );
  }
  if (seasonFault !== null) {
    partialNotes.push(
      "season derivation faulted — the previous season model keeps serving",
    );
  }
  return partialNotes.length > 0 ? partialNotes.join(" · ") : null;
}

// ---------------------------------------------------------------------------
// Scheduling (single-flight: next cycle only after this one settles).
// ---------------------------------------------------------------------------

function scheduleNext(delayMs: number, cfg: BackboneConfig): void {
  const timer = setTimeout(() => {
    void runCycleSafe(cfg);
  }, delayMs);
  // Never hold the process open for the backbone alone.
  timer.unref();
}

async function runCycleSafe(cfg: BackboneConfig): Promise<void> {
  status.state = "running";
  try {
    const partial = await runCycle();
    if (partial !== null) {
      // The serving state refreshed; a protocol stream is still catching up
      // or faulted — honest middle state, never a dark site.
      status.cyclesPartial += 1;
      status.lastError = {
        atIso: new Date().toISOString(),
        message: toSafeErrorMessage(new Error(partial)),
      };
      logger.warn(
        { backbone: { cyclesPartial: status.cyclesPartial, note: status.lastError.message } },
        "backbone cycle PARTIAL (serving state refreshed; protocol lane resumes next cycle)",
      );
    } else {
      status.cyclesOk += 1;
      logger.info(
        {
          backbone: {
            cyclesOk: status.cyclesOk,
            eventsInserted: status.lastSuccess?.eventsInserted,
            protocolEventsInserted: status.lastSuccess?.protocolEventsInserted,
            timestampsInserted: status.lastSuccess?.timestampsInserted,
            headBlock: status.lastSuccess?.headBlock,
          },
        },
        "backbone cycle OK",
      );
    }
  } catch (err) {
    status.cyclesFailed += 1;
    status.lastError = {
      atIso: new Date().toISOString(),
      message: toSafeErrorMessage(err),
    };
    logger.warn(
      { backbone: { cyclesFailed: status.cyclesFailed, error: status.lastError.message } },
      "backbone cycle FAILED (last-good state kept)",
    );
  } finally {
    status.state = "idle";
    scheduleNext(cfg.intervalSec * 1000, cfg);
  }
}

/**
 * Start the unattended backbone. Idempotent; called once after listen().
 * Dark unless the founder's exact opt-in literal is set; parks in
 * "no-database" (and never imports @workspace/db) when DATABASE_URL is absent.
 */
export function startBackbone(): void {
  if (started) return;
  started = true;

  const cfg = readBackboneConfig();
  status.enabled = cfg.enabled;
  status.intervalSec = cfg.intervalSec;

  if (!cfg.enabled) {
    status.state = "disabled";
    logger.info("backbone: disabled (opt-in flag not set) — staying dark");
    return;
  }
  if (
    process.env["DATABASE_URL"] == null ||
    process.env["DATABASE_URL"].length === 0
  ) {
    status.state = "no-database";
    logger.warn("backbone: enabled but DATABASE_URL is not provisioned — parked");
    return;
  }

  status.state = "idle";
  logger.info(
    { backbone: { intervalSec: cfg.intervalSec, bootDelayMs: BOOT_DELAY_MS } },
    "backbone: enabled — first cycle scheduled",
  );
  scheduleNext(BOOT_DELAY_MS, cfg);
}
